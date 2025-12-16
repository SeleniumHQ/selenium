// Copyright 2017 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.module('goog.delegate.DelegateRegistry');

const {ENABLE_ASSERTS, assert} = goog.require('goog.asserts');
const {binarySelect} = goog.require('goog.array');
const {freeze} = goog.require('goog.debug');


/**
 * @record
 * @template T
 */
class Registration {
  constructor() {
    /**
     * The registered delegate instance.  Exactly one of `instance` or
     * `ctor` must be provided.
     * @type {T|undefined}
     */
    this.instance;
    /**
     * The registered delegate constructor.  Exactly one of `instance` or
     * `ctor` must be provided.
     * @type {function(new: T, ...?)|undefined}
     */
    this.ctor;
    /**
     * An optional numeric priority (higher = first).
     * @type {number|undefined}
     */
    this.priority;
  }
}


/**
 * Base class for delegate registries.  Does not specify a policy for handling
 * multiple delegates.
 * @template T
 */
class DelegateRegistryBase {
  constructor() {
    /** @private @const {!Array<!Registration<T>>} */
    this.registered_ = [];
    /** @private {boolean} */
    this.allowLateRegistration_ = false;
    /** @private {boolean} */
    this.cacheInstantiation_ = false;
    /** @private {boolean} */
    this.delegatesConstructed_ = false;
  }

  /**
   * Configures this registry to allow late registration.  Normally it is an
   * error to register a delegate after calling `delegate()` or `delegates()`.
   * If late registration is allowed, then this is no longer an error.  This
   * check only ever happens in debug mode.  Returns this.
   * @return {THIS}
   * @this {THIS}
   * @template THIS
   */
  allowLateRegistration() {
    if (ENABLE_ASSERTS) {
      /** @type {!DelegateRegistryBase} */ (this).allowLateRegistration_ = true;
    }
    return /** @type {?} */ (this);
  }

  /**
   * Configures this registry to automatically cache instantiated instances,
   * rather than calling the constructor every time `delegates()` is called.
   * Returns this.
   * @return {THIS}
   * @this {THIS}
   * @template THIS
   */
  cacheInstantiation() {
    /** @type {!DelegateRegistryBase} */ (this).cacheInstantiation_ = true;
    return /** @type {?} */ (this);
  }

  /**
   * Returns the first (highest priority) registered delegate, or undefined
   * if none was registered.
   * @param {(function(function(new: T, ...?)): T)=} instantiate A function to
   *     instantiate constructors registered with `registerClass`.  By default,
   *     this just calls the constructor with no arguments.
   * @return {T|undefined}
   */
  delegate(instantiate = undefined) {
    if (ENABLE_ASSERTS) {
      this.delegatesConstructed_ = true;
    }
    return this.registered_.length ?
        this.instantiate_(this.registered_[0], instantiate) :
        undefined;
  }

  /**
   * Returns an array of all registered delegates, creating a fresh instance
   * of any registered classes.  The `instantiate` argument can be passed to
   * override how constructors are called.  The array will be frozen in debug
   * mode.
   * @param {(function(function(new: T, ...?)): T)=} instantiate A function to
   *     instantiate constructors registered with `registerClass`.  By default,
   *     this just calls the constructor with no arguments.
   * @return {!Array<T>}
   */
  delegates(instantiate = undefined) {
    if (ENABLE_ASSERTS) {
      this.delegatesConstructed_ = true;
    }
    return freeze(this.registered_.map(r => this.instantiate_(r, instantiate)));
  }

  /**
   * @param {!Registration<T>} registration
   * @param {(function(function(new: T, ...?)): T)=} instantiate
   * @return {T}
   * @private
   */
  instantiate_(registration, instantiate = (ctor) => new ctor()) {
    if (!registration.ctor) return registration.instance;
    const instance = instantiate(registration.ctor);
    if (this.cacheInstantiation_) {
      delete registration.ctor;
      registration.instance = instance;
    }
    return instance;
  }

  /**
   * Checks whether a new registration may be added.
   * @private
   */
  checkRegistration_() {
    assert(
        this.allowLateRegistration_ || !this.delegatesConstructed_,
        'Cannot register new delegates after instantiation.');
  }
}


/**
 * Delegates provide a system for hygienic modification of a delegating class's
 * behavior.  The basic idea is that, rather than monkey-patching prototype
 * methods, a class can instead provide extension points by calling out to
 * delegates.  Later code can then register delegates, and when the delegating
 * class is instantiated, any registered delegates will be instantiated and
 * returned.
 *
 * The usage has four parts:
 *  - A *delegate interface* is defined to provide specific overridable hooks.
 *    This can be a simple function `@typedef`, or an entire `@interface` or
 *    `@record`.
 *  - A *delegate registry* for this interface is instantiated, often as a
 *    static field on the interface.
 *  - One or more *delegates* are defined that implement this interface.
 *    Delegates are registered with the registry.  Different registry classes
 *    support different policies for registering more than one delegate.
 *  - After delegates are registered, the delegating class asks the registry for
 *    the *list of delegates*, which are then instantiated if necessary.
 *
 * In some circumstances (particularly if a delegate method will be called from
 * multiple places) it may make sense to provide an additional wrapper between
 * the delegate list and the delegating (sometimes called "modded") class, to
 * ensure that the delegates are used correctly.
 *
 * ## Example usage
 *
 * For example, consider a class `Foo` that wants to provide a few extension
 * points for the behaviors `zorch` and `snarf`.  We can set up the delegation
 * as follows:
 *
 * <code class="highlight highlight-source-js"><pre>
 * const DelegateRegistry = goog.require('goog.delegate.DelegateRegistry');
 * const delegates = goog.require('goog.delegate.delegates');
 * class Foo {
 *   constructor() {
 *     /** @private @const {!Array<!Foo.Delegate>} &ast;/
 *     this.delegates_ = Foo.registry.delegates();
 *   }
 *   frobnicate(x, y, z) {
 *     const w = delegates.callFirst(this.delegates_, d => d.zorch(x, y));
 *     return this.delegates_.map(d => d.snarf(z, w));
 *   }
 * }
 * /** @interface &ast;/
 * Foo.Delegate = class {
 *   zorch(a, b) {}
 *   snarf(a, b) {}
 * }
 * /** @const {!DelegateRegistry<!Foo.Delegate>} &ast;/
 * Foo.registry = new DelegateRegistry();
 * </pre></code>
 *
 * A file inserted later in the bundle can define a delegate and register itself
 * with the registry:
 *
 * <code class="highlight highlight-source-js"><pre>
 * /** @implements {Foo.Delegate} &ast;/
 * class WibblyFooDelegate {
 *   zorch(a, b) { return a + b; }
 *   snarf(a, b) { return a - b; }
 * }
 * Foo.registry.registerClass(WibbyFooDelegate);
 * </pre></code>
 *
 * In many cases, the delegates need to be initialized with an instance of the
 * modded class.  To support this, a function may be passed to the `delegates()`
 * method to override how the constructor is called.
 *
 *
 * ## Multiple Delegates
 *
 * Two different registry classes are defined, each with a different policy for
 * how to handle multiple delegates.  The simpler one, `DelegateRegistry`,
 * allows multiple delegates to be registered and returns them in the order they
 * were registered.  If only one delegate is expected,
 * `DelegateRegistry.prototype.expectAtMostOneDelegate()` performs assertions
 * (in debug mode) that at most one delegate is added, though in production
 * mode it will still register them all - The use of `delegate()` or
 * `goog.delegate.delegates.callFirst()` is recommended in this case to ensure
 * reasonable behavior.
 *
 * The more sophisticated one, `DelegateRegistry.Prioritized`, requires passing
 * a unique priority to each delegate registration (collisions are asserted in
 * debug mode, but will fall back to registration order in production).
 *
 *
 * ## Wrapped Delegator
 *
 * In some cases it makes sense to wrap the delegate list in a dedicated
 * delegator object, rather than having the modded class use it directly:
 *
 * <code class="highlight highlight-source-js"><pre>
 * /** @record &ast;/
 * class MyDelegateInterface {
 *   /** @param {number} arg &ast;/
 *   foo(arg) {}
 *   /** @return {number|undefined} &ast;/
 *   bar() {}
 *   /** @return {string} &ast;/
 *   baz() {}
 * }
 * class MyDelegator {
 *   /** @param {!Array<!MyDelegateInterface>} delegates &ast;/
 *   constructor(delegates) { this.delegates_ = delegates; }
 *   /** @param {number} &ast;/
 *   foo(arg) { this.delegates_.forEach(d => d.foo(arg)); }
 *   /** @return {number} &ast;/
 *   bar() {
 *     const result =
 *         delegates.callUntilNotNullOrUndefined(this.delegates_, d => d.bar());
 *     return result != null ? result : 42;
 *   }
 *   /** @return {!Array<string>} &ast;/
 *   baz() { return this.delegates_.map(d => d.baz()); }
 * }
 * </pre></code>
 *
 * In this example, the modded class will call into the delegates via the
 * wrapper class, ensuring that the correct calling convention is always used.
 *
 * @extends {DelegateRegistryBase<T>}
 * @template T
 */
class DelegateRegistry extends DelegateRegistryBase {
  constructor() {
    super();
    /** @private {boolean} */
    this.expectAtMostOneDelegate_ = false;
  }

  /**
   * Configures this registry to accept at most one delegate.
   * This only affects debug mode.
   * @return {!DelegateRegistry<T>}
   */
  expectAtMostOneDelegate() {
    if (ENABLE_ASSERTS) {
      this.expectAtMostOneDelegate_ = true;
    }
    return this;
  }

  /**
   * @param {function(new: T, ...?)} ctor
   */
  registerClass(ctor) {
    this.checkRegistration_();
    this.registered_.push({ctor});
  }

  /**
   * @param {T} instance
   */
  registerInstance(instance) {
    this.checkRegistration_();
    this.registered_.push({instance});
  }

  /** @override @private */
  checkRegistration_() {
    super.checkRegistration_();
    if (ENABLE_ASSERTS && this.expectAtMostOneDelegate_ &&
        this.registered_.length) {
      assert(
          false, 'delegate already registered: %s',
          this.registered_[0].ctor || this.registered_[0].instance);
    }
  }
}


/**
 * A delegate registry that allows multiple delegates, each of which must have a
 * numeric priority specified when it is registered.  Iteration will start with
 * the highest number and proceed to the lowest number.  If two delegates are
 * added with the same priority, an error will be given in debug mode.
 * @see DelegateRegistry
 *
 * @extends {DelegateRegistryBase<T>}
 * @template T
 */
DelegateRegistry.Prioritized = class extends DelegateRegistryBase {
  /**
   * @param {function(new: T)} ctor
   * @param {number} priority
   */
  registerClass(ctor, priority) {
    this.add_({ctor, priority});
  }

  /**
   * @param {T} instance
   * @param {number} priority
   */
  registerInstance(instance, priority) {
    this.add_({instance, priority});
  }

  /**
   * @param {!Registration<T>} registration
   * @private
   */
  add_(registration) {
    this.checkRegistration_();
    const priority = registration.priority;
    // Note: index will always be negative since the evaluator never returns 0.
    // This ensures that ties will be broken to the right.  Sort highest-first.
    const index =
        ~binarySelect(this.registered_, (r) => r.priority < priority ? -1 : 1);
    const previous = index > 0 ? this.registered_[index - 1] : null;
    if (ENABLE_ASSERTS && previous && previous.priority <= priority) {
      assert(
          false, 'two delegates registered with same priority (%s): %s and %s',
          priority, previous.ctor || previous.instance,
          registration.ctor || registration.instance);
    }
    this.registered_.splice(index, 0, registration);
  }
};


exports = DelegateRegistry;

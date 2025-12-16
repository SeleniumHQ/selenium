// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.labs.testing.Environment');

goog.require('goog.Thenable');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug.Console');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');


/**
 * JsUnit environments allow developers to customize the existing testing
 * lifecycle by hitching additional setUp and tearDown behaviors to tests.
 *
 * Environments will run their setUp steps in the order in which they
 * are instantiated and registered. During tearDown, the environments will
 * unwind the setUp and execute in reverse order.
 *
 * See http://go/jsunit-env for more information.
 */
goog.labs.testing.Environment = goog.defineClass(null, {
  /** @constructor */
  constructor: function() {
    var testcase = goog.labs.testing.EnvironmentTestCase_.getInstance();
    testcase.registerEnvironment_(this);

    // Record the active test case, in normal usage this is a singleton,
    // but while testing this case it is reset.
    goog.labs.testing.Environment.activeTestCase_ = testcase;

    /**
     * Mocks are not type-checkable. To reduce burden on tests that are type
     * checked, this is typed as "?" to turn off JSCompiler checking.
     * TODO(b/69851971): Enable a type-checked mocking library.
     * @type {?}
     */
    this.mockControl = null;

    /** @type {?goog.testing.MockClock} */
    this.mockClock = null;

    /** @private {boolean} */
    this.shouldMakeMockControl_ = false;

    /** @protected {boolean} */
    this.mockClockOn = false;

    /** @const {!goog.debug.Console} */
    this.console = goog.labs.testing.Environment.console_;

    /** @const {!goog.testing.PropertyReplacer} */
    this.replacer = new goog.testing.PropertyReplacer();
  },


  /**
   * Runs immediately before the setUpPage phase of JsUnit tests.
   * @return {!IThenable<*>|undefined} An optional Promise which must be
   *     resolved before the test is executed.
   */
  setUpPage: function() {
    if (this.mockClockOn && !this.hasMockClock()) {
      this.mockClock = new goog.testing.MockClock(true);
    }
  },


  /** Runs immediately after the tearDownPage phase of JsUnit tests. */
  tearDownPage: function() {
    // If we created the mockClock, we'll also dispose it.
    if (this.hasMockClock()) {
      this.mockClock.dispose();
    }
  },

  /**
   * Runs immediately before the setUp phase of JsUnit tests.
   * @return {!IThenable<*>|undefined} An optional Promise which must be
   *     resolved before the test case is executed.
   */
  setUp: goog.nullFunction,

  /**
   * Runs immediately after the tearDown phase of JsUnit tests.
   * @return {!IThenable<*>|undefined} An optional Promise which must be
   *     resolved before the next test case is executed.
   */
  tearDown: function() {
    // Make sure promises and other stuff that may still be scheduled, get a
    // chance to run (and throw errors).
    if (this.mockClock) {
      for (var i = 0; i < 100; i++) {
        this.mockClock.tick(1000);
      }
      // If we created the mockClock, we'll also reset it.
      if (this.hasMockClock()) {
        this.mockClock.reset();
      }
    }
    // Reset all changes made by the PropertyReplacer.
    this.replacer.reset();
    // Make sure the user did not forget to call $replayAll & $verifyAll in
    // their test. This is a noop if they did.
    // This is important because:
    // - Engineers thinks that not all their tests need to replay and verify.
    //   That lets tests sneak in that call mocks but never replay those calls.
    // - Then some well meaning maintenance engineer wants to update the test
    //   with some new mock, adds a replayAll and BOOM the test fails
    //   because completely unrelated mocks now get replayed.
    if (this.mockControl) {
      try {
        this.mockControl.$verifyAll();
        this.mockControl.$replayAll();
        this.mockControl.$verifyAll();
      } finally {
        this.mockControl.$resetAll();
        if (this.shouldMakeMockControl_) {
          // If we created the mockControl, we'll also tear it down.
          this.mockControl.$tearDown();
        }
      }
    }
    // Verifying the mockControl may throw, so if cleanup needs to happen,
    // add it further up in the function.
  },


  /**
   * Create a new {@see goog.testing.MockControl} accessible via
   * `env.mockControl` for each test. If your test has more than one
   * testing environment, don't call this on more than one of them.
   * @return {!goog.labs.testing.Environment} For chaining.
   */
  withMockControl: function() {
    if (!this.shouldMakeMockControl_) {
      this.shouldMakeMockControl_ = true;
      this.mockControl = new goog.testing.MockControl();
    }
    return this;
  },


  /**
   * Create a {@see goog.testing.MockClock} for each test. The clock will be
   * installed (override i.e. setTimeout) by default. It can be accessed
   * using `env.mockClock`. If your test has more than one testing
   * environment, don't call this on more than one of them.
   * @return {!goog.labs.testing.Environment} For chaining.
   */
  withMockClock: function() {
    if (!this.hasMockClock()) {
      this.mockClockOn = true;
      this.mockClock = new goog.testing.MockClock(true);
    }
    return this;
  },

  /**
   * @return {boolean}
   * @protected
   */
  hasMockClock: function() {
    return this.mockClockOn && !!this.mockClock && !this.mockClock.isDisposed();
  },

  /**
   * Creates a basic strict mock of a `toMock`. For more advanced mocking,
   * please use the MockControl directly.
   * @param {?Function|?Object} toMock
   * @return {?}
   */
  mock: function(toMock) {
    if (!this.shouldMakeMockControl_) {
      throw new Error(
          'MockControl not available on this environment. ' +
          'Call withMockControl if this environment is expected ' +
          'to contain a MockControl.');
    }
    var mock = this.mockControl.createStrictMock(toMock);
    // Mocks are not type-checkable. To reduce burden on tests that are type
    // checked, this is typed as "?" to turn off JSCompiler checking.
    // TODO(b/69851971): Enable a type-checked mocking library.
    return /** @type {?} */ (mock);
  },

  /**
   * Creates a basic loose mock of a `toMock`. For more advanced mocking, please
   * use the MockControl directly.
   * @param {?Function|?Object} toMock
   * @param {boolean=} ignoreUnexpectedCalls Defaults to false.
   * @return {?}
   */
  looseMock: function(toMock, ignoreUnexpectedCalls = false) {
    if (!this.shouldMakeMockControl_) {
      throw new Error(
          'MockControl not available on this environment. ' +
          'Call withMockControl if this environment is expected ' +
          'to contain a MockControl.');
    }
    var mock = this.mockControl.createLooseMock(toMock, ignoreUnexpectedCalls);
    // Mocks are not type-checkable. To reduce burden on tests that are type
    // checked, this is typed as "?" to turn off JSCompiler checking.
    // TODO(b/69851971): Enable a type-checked mocking library.
    return /** @type {?} */ (mock);
  },
});


/**
 * @private {?goog.testing.TestCase}
 */
goog.labs.testing.Environment.activeTestCase_ = null;


// TODO(johnlenz): make this package private when it moves out of labs.
/**
 * @return {?goog.testing.TestCase}
 */
goog.labs.testing.Environment.getTestCaseIfActive = function() {
  return goog.labs.testing.Environment.activeTestCase_;
};


/** @private @const {!goog.debug.Console} */
goog.labs.testing.Environment.console_ = new goog.debug.Console();


// Activate logging to the browser's console by default.
goog.labs.testing.Environment.console_.setCapturing(true);



/**
 * An internal TestCase used to hook environments into the JsUnit test runner.
 * Environments cannot be used in conjunction with custom TestCases for JsUnit.
 * @private @final @constructor
 * @extends {goog.testing.TestCase}
 */
goog.labs.testing.EnvironmentTestCase_ = function() {
  goog.labs.testing.EnvironmentTestCase_.base(
      this, 'constructor', document.title);

  /** @private {!Array<!goog.labs.testing.Environment>}> */
  this.environments_ = [];

  /** @private {!Object} */
  this.testobj_ = goog.global;  // default

  // Automatically install this TestCase when any environment is used in a test.
  goog.testing.TestCase.initializeTestRunner(this);
};
goog.inherits(goog.labs.testing.EnvironmentTestCase_, goog.testing.TestCase);
goog.addSingletonGetter(goog.labs.testing.EnvironmentTestCase_);


/**
 * Override setLifecycleObj to allow incoming test object to provide only
 * runTests and shouldRunTests. The other lifecycle methods are controlled by
 * this environment.
 * @override
 */
goog.labs.testing.EnvironmentTestCase_.prototype.setLifecycleObj = function(
    obj) {
  goog.asserts.assert(
      this.testobj_ == goog.global,
      'A test method object has already been provided ' +
          'and only one is supported.');

  // Store the test object so we can call lifecyle methods when needed.
  this.testobj_ = obj;

  if (this.testobj_['runTests']) {
    this.runTests = goog.bind(this.testobj_['runTests'], this.testobj_);
  }
  if (this.testobj_['shouldRunTests']) {
    this.shouldRunTests =
        goog.bind(this.testobj_['shouldRunTests'], this.testobj_);
  }
};

/**
 * @override
 */
goog.labs.testing.EnvironmentTestCase_.prototype.createTest = function(
    name, ref, scope, objChain) {
  return new goog.labs.testing.EnvironmentTest_(name, ref, scope, objChain);
};


/**
 * Adds an environment to the JsUnit test.
 * @param {!goog.labs.testing.Environment} env
 * @private
 */
goog.labs.testing.EnvironmentTestCase_.prototype.registerEnvironment_ =
    function(env) {
  this.environments_.push(env);
};


/** @override */
goog.labs.testing.EnvironmentTestCase_.prototype.setUpPage = function() {
  var setUpPageFns = goog.array.map(this.environments_, function(env) {
    return () => env.setUpPage();
  });

  // User defined setUpPage method.
  if (this.testobj_['setUpPage']) {
    setUpPageFns.push(() => this.testobj_['setUpPage']());
  }
  return this.callAndChainPromises_(setUpPageFns);
};


/** @override */
goog.labs.testing.EnvironmentTestCase_.prototype.setUp = function() {
  var setUpFns = [];
  // User defined configure method.
  if (this.testobj_['configureEnvironment']) {
    setUpFns.push(() => this.testobj_['configureEnvironment']());
  }
  var test = this.getCurrentTest();
  if (test instanceof goog.labs.testing.EnvironmentTest_) {
    goog.array.extend(setUpFns, test.configureEnvironments);
  }

  goog.array.forEach(this.environments_, function(env) {
    setUpFns.push(() => env.setUp());
  }, this);

  // User defined setUp method.
  if (this.testobj_['setUp']) {
    setUpFns.push(() => this.testobj_['setUp']());
  }
  return this.callAndChainPromises_(setUpFns);
};


/**
 * Calls a chain of methods and makes sure to properly chain them if any of the
 * methods returns a thenable.
 * @param {!Array<function()>} fns
 * @param {boolean=} ensureAllFnsCalled If true, this method calls each function
 *     even if one of them throws an Error or returns a rejected Promise. If
 *     there were any Errors thrown (or Promises rejected), the first Error will
 *     be rethrown after all of the functions are called.
 * @return {!IThenable<*>|undefined}
 * @private
 */
goog.labs.testing.EnvironmentTestCase_.prototype.callAndChainPromises_ =
    function(fns, ensureAllFnsCalled) {
  // Using await here (and making callAndChainPromises_ an async method)
  // causes many tests across google3 to start failing with errors like this:
  // "Timed out while waiting for a promise returned from setUp to resolve".

  const isThenable = (v) => goog.Thenable.isImplementedBy(v) ||
      (typeof goog.global['Promise'] === 'function' &&
       v instanceof goog.global['Promise']);

  // Record the first error that occurs so that it can be rethrown in the case
  // where ensureAllFnsCalled is set.
  let firstError;
  const recordFirstError = (e) => {
    if (!firstError) {
      firstError = e instanceof Error ? e : new Error(e);
    }
  };

  // Call the fns, chaining results that are Promises.
  let lastFnResult;
  for (const fn of fns) {
    if (isThenable(lastFnResult)) {
      // The previous fn was async, so chain the next fn.
      const rejectedHandler = ensureAllFnsCalled ? (e) => {
        recordFirstError(e);
        return fn();
      } : undefined;
      lastFnResult = lastFnResult.then(() => fn(), rejectedHandler);
    } else {
      // The previous fn was not async, so simply call the next fn.
      try {
        lastFnResult = fn();
      } catch (e) {
        if (!ensureAllFnsCalled) {
          throw e;
        }
        recordFirstError(e);
      }
    }
  }

  // After all of the fns have been called, either throw the first error if
  // there was one, or otherwise return the result of the last fn.
  const resultFn = () => {
    if (firstError) {
      throw firstError;
    }
    return lastFnResult;
  };
  return isThenable(lastFnResult) ? lastFnResult.then(resultFn, resultFn) :
                                    resultFn();
};


/** @override */
goog.labs.testing.EnvironmentTestCase_.prototype.tearDown = function() {
  var tearDownFns = [];
  // User defined tearDown method.
  if (this.testobj_['tearDown']) {
    tearDownFns.push(() => this.testobj_['tearDown']());
  }

  // Execute the tearDown methods for the environment in the reverse order
  // in which they were registered to "unfold" the setUp.
  goog.array.forEachRight(this.environments_, function(env) {
    tearDownFns.push(() => env.tearDown());
  });
  // For tearDowns between tests make sure they run as much as possible to avoid
  // interference between tests.
  return this.callAndChainPromises_(
      tearDownFns, /* ensureAllFnsCalled= */ true);
};


/** @override */
goog.labs.testing.EnvironmentTestCase_.prototype.tearDownPage = function() {
  // User defined tearDownPage method.
  if (this.testobj_['tearDownPage']) {
    this.testobj_['tearDownPage']();
  }

  goog.array.forEachRight(
      this.environments_, function(env) { env.tearDownPage(); });
};

/**
 * An internal Test used to hook environments into the JsUnit test runner.
 * @param {string} name The test name.
 * @param {function()} ref Reference to the test function or test object.
 * @param {?Object=} scope Optional scope that the test function should be
 *     called in.
 * @param {!Array<!Object>=} objChain A chain of objects used to populate setUps
 *     and tearDowns.
 * @private
 * @final
 * @constructor
 * @extends {goog.testing.TestCase.Test}
 */
goog.labs.testing.EnvironmentTest_ = function(name, ref, scope, objChain) {
  goog.labs.testing.EnvironmentTest_.base(
      this, 'constructor', name, ref, scope, objChain);

  /**
   * @type {!Array<function()>}
   */
  this.configureEnvironments = goog.array.map(
      goog.array.filter(
          objChain || [],
          function(obj) {
            return goog.isFunction(obj.configureEnvironment);
          }), /**
               * @param  {{configureEnvironment: function()}} obj
               * @return {function()}
               */
      function(obj) {
        return goog.bind(obj.configureEnvironment, obj);
      });
};
goog.inherits(goog.labs.testing.EnvironmentTest_, goog.testing.TestCase.Test);

/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Implements the disposable interface.
 */

goog.provide('goog.Disposable');

goog.require('goog.disposable.IDisposable');
goog.require('goog.dispose');
/**
 * TODO(user): Remove this require.
 * @suppress {extraRequire}
 */
goog.require('goog.disposeAll');

goog.require('goog.utils');

/**
 * Class that provides the basic implementation for disposable objects. If your
 * class holds references or resources that can't be collected by standard GC,
 * it should extend this class or implement the disposable interface (defined
 * in goog.disposable.IDisposable). See description of
 * goog.disposable.IDisposable for examples of cleanup.
 * @constructor
 * @implements {goog.disposable.IDisposable}
 */
goog.Disposable = function() {
  'use strict';
  /**
   * If monitoring the goog.Disposable instances is enabled, stores the creation
   * stack trace of the Disposable instance.
   * @type {string|undefined}
   */
  this.creationStack;

  if (goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
    if (goog.Disposable.INCLUDE_STACK_ON_CREATION) {
      this.creationStack = new Error().stack;
    }
    goog.Disposable.instances_[goog.utils.getUid(this)] = this;
  }
  // Support sealing
  this.disposed_ = this.disposed_;
  this.onDisposeCallbacks_ = this.onDisposeCallbacks_;
};


/**
 * @enum {number} Different monitoring modes for Disposable.
 */
goog.Disposable.MonitoringMode = {
  /**
   * No monitoring.
   */
  OFF: 0,
  /**
   * Creating and disposing the goog.Disposable instances is monitored. All
   * disposable objects need to call the `goog.Disposable` base
   * constructor. The PERMANENT mode must be switched on before creating any
   * goog.Disposable instances.
   */
  PERMANENT: 1,
  /**
   * INTERACTIVE mode can be switched on and off on the fly without producing
   * errors. It also doesn't warn if the disposable objects don't call the
   * `goog.Disposable` base constructor.
   */
  INTERACTIVE: 2
};


/**
 * @define {number} The monitoring mode of the goog.Disposable
 *     instances. Default is OFF. Switching on the monitoring is only
 *     recommended for debugging because it has a significant impact on
 *     performance and memory usage. If switched off, the monitoring code
 *     compiles down to 0 bytes.
 */
goog.Disposable.MONITORING_MODE =
    goog.define('goog.Disposable.MONITORING_MODE', 0);


/**
 * @define {boolean} Whether to attach creation stack to each created disposable
 *     instance; This is only relevant for when MonitoringMode != OFF.
 */
goog.Disposable.INCLUDE_STACK_ON_CREATION =
    goog.define('goog.Disposable.INCLUDE_STACK_ON_CREATION', true);


/**
 * Maps the unique ID of every undisposed `goog.Disposable` object to
 * the object itself.
 * @type {!Object<number, !goog.Disposable>}
 * @private
 */
goog.Disposable.instances_ = {};


/**
 * @return {!Array<!goog.Disposable>} All `goog.Disposable` objects that
 *     haven't been disposed of.
 */
goog.Disposable.getUndisposedObjects = function() {
  'use strict';
  var ret = [];
  for (var id in goog.Disposable.instances_) {
    if (goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)]);
    }
  }
  return ret;
};


/**
 * Clears the registry of undisposed objects but doesn't dispose of them.
 */
goog.Disposable.clearUndisposedObjects = function() {
  'use strict';
  goog.Disposable.instances_ = {};
};


/**
 * Whether the object has been disposed of.
 * @type {boolean}
 * @private
 */
goog.Disposable.prototype.disposed_ = false;


/**
 * Callbacks to invoke when this object is disposed.
 * @type {Array<!Function>}
 * @private
 */
goog.Disposable.prototype.onDisposeCallbacks_;


/**
 * @return {boolean} Whether the object has been disposed of.
 * @override
 */
goog.Disposable.prototype.isDisposed = function() {
  'use strict';
  return this.disposed_;
};


/**
 * @return {boolean} Whether the object has been disposed of.
 * @deprecated Use {@link #isDisposed} instead.
 */
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;


/**
 * Disposes of the object. If the object hasn't already been disposed of, calls
 * {@link #disposeInternal}. Classes that extend `goog.Disposable` should
 * override {@link #disposeInternal} in order to cleanup references, resources
 * and other disposable objects. Reentrant.
 *
 * @return {void} Nothing.
 * @override
 */
goog.Disposable.prototype.dispose = function() {
  'use strict';
  if (!this.disposed_) {
    // Set disposed_ to true first, in case during the chain of disposal this
    // gets disposed recursively.
    this.disposed_ = true;
    this.disposeInternal();
    if (goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
      var uid = goog.utils.getUid(this);
      if (goog.Disposable.MONITORING_MODE ==
              goog.Disposable.MonitoringMode.PERMANENT &&
          !goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw new Error(
            this + ' did not call the goog.Disposable base ' +
            'constructor or was disposed of after a clearUndisposedObjects ' +
            'call');
      }
      if (goog.Disposable.MONITORING_MODE !=
              goog.Disposable.MonitoringMode.OFF &&
          this.onDisposeCallbacks_ && this.onDisposeCallbacks_.length > 0) {
        throw new Error(
            this + ' did not empty its onDisposeCallbacks queue. This ' +
            'probably means it overrode dispose() or disposeInternal() ' +
            'without calling the superclass\' method.');
      }
      delete goog.Disposable.instances_[uid];
    }
  }
};


/**
 * Associates a disposable object with this object so that they will be disposed
 * together.
 * @param {goog.disposable.IDisposable} disposable that will be disposed when
 *     this object is disposed.
 */
goog.Disposable.prototype.registerDisposable = function(disposable) {
  'use strict';
  this.addOnDisposeCallback(goog.utils.partial(goog.dispose, disposable));
};


/**
 * Invokes a callback function when this object is disposed. Callbacks are
 * invoked in the order in which they were added. If a callback is added to
 * an already disposed Disposable, it will be called immediately.
 * @param {function(this:T):?} callback The callback function.
 * @param {T=} opt_scope An optional scope to call the callback in.
 * @template T
 */
goog.Disposable.prototype.addOnDisposeCallback = function(callback, opt_scope) {
  'use strict';
  if (this.disposed_) {
    opt_scope !== undefined ? callback.call(opt_scope) : callback();
    return;
  }
  if (!this.onDisposeCallbacks_) {
    this.onDisposeCallbacks_ = [];
  }

  this.onDisposeCallbacks_.push(
      opt_scope !== undefined ? goog.utils.bind(callback, opt_scope) : callback);
};


/**
 * Performs appropriate cleanup. See description of goog.disposable.IDisposable
 * for examples. Classes that extend `goog.Disposable` should override this
 * method. Not reentrant. To avoid calling it twice, it must only be called from
 * the subclass' `disposeInternal` method. Everywhere else the public `dispose`
 * method must be used. For example:
 *
 * <pre>
 * mypackage.MyClass = function() {
 * mypackage.MyClass.base(this, 'constructor');
 *     // Constructor logic specific to MyClass.
 *     ...
 *   };
 *   goog.inherits(mypackage.MyClass, goog.Disposable);
 *
 *   mypackage.MyClass.prototype.disposeInternal = function() {
 *     // Dispose logic specific to MyClass.
 *     ...
 *     // Call superclass's disposeInternal at the end of the subclass's, like
 *     // in C++, to avoid hard-to-catch issues.
 *     mypackage.MyClass.base(this, 'disposeInternal');
 *   };
 * </pre>
 *
 * @protected
 */
goog.Disposable.prototype.disposeInternal = function() {
  'use strict';
  if (this.onDisposeCallbacks_) {
    while (this.onDisposeCallbacks_.length) {
      this.onDisposeCallbacks_.shift()();
    }
  }
};


/**
 * Returns True if we can verify the object is disposed.
 * Calls `isDisposed` on the argument if it supports it.  If obj
 * is not an object with an isDisposed() method, return false.
 * @param {*} obj The object to investigate.
 * @return {boolean} True if we can verify the object is disposed.
 */
goog.Disposable.isDisposed = function(obj) {
  'use strict';
  if (obj && typeof obj.isDisposed == 'function') {
    return obj.isDisposed();
  }
  return false;
};

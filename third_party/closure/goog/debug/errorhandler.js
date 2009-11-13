// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved.

/**
 * @fileoverview Error handling utilities.
 *
 */

goog.provide('goog.debug.ErrorHandler');

goog.require('goog.debug');
goog.require('goog.debug.Trace');

/**
 * The ErrorHandler can be used to to wrap functions with a try/catch
 * statement. If an exception is thrown, the given error handler function will
 * be called.
 *
 * @constructor
 * @param {Function} handler Handler for exceptions.
 */
goog.debug.ErrorHandler = function(handler) {
  /**
   * Handler for exceptions, which can do logging, reporting, etc.
   * @type {Function}
   * @private
   */
  this.errorHandlerFn_ = handler;
};


/**
 * Private helper function to return a span that can be clicked on to display
 * an alert with the current stack trace. Newlines are replaced with a
 * placeholder so that they will not be html-escaped.
 * @param {string} stackTrace The stack trace to create a span for.
 * @return {string} A span which can be clicked on to show the stack trace.
 * @private
 */
goog.debug.ErrorHandler.prototype.getStackTraceHolder_ = function(stackTrace) {
  var buffer = [];
  buffer.push('##PE_STACK_START##');
  buffer.push(stackTrace.replace(/(\r\n|\r|\n)/g, '##STACK_BR##'));
  buffer.push('##PE_STACK_END##');
  return buffer.join('');
};


/**
 * Installs exception protection for an entry point function. When an exception
 * is thrown from a protected function, a handler will be invoked to handle it.
 *
 * @param {Function} fn An entry point function to be protected.
 * @param {boolean} opt_tracers Whether to install tracers around the fn.
 * @return {!Function} A protected wrapper function that calls the entry point
 *     function.
 */
goog.debug.ErrorHandler.prototype.protectEntryPoint = function(fn,
                                                               opt_tracers) {
  var tracers = !!opt_tracers;
  var protectedFnName =
      '__protected_' + goog.getHashCode(this) + '_' + tracers + '__';
  if (!fn[protectedFnName]) {
    fn[protectedFnName] = this.getProtectedFunction(fn, tracers);
  }
  return fn[protectedFnName];
};


/**
 * Helps {@link #protectEntryPoint} by actually creating the protected
 * wrapper function, after {@link #protectEntryPoint} determines that one does
 * not already exist for the given function.  Can be overriden by subclasses
 * that may want to implement different error handling, or add additional
 * entry point hooks.
 * @param {Function} fn An entry point function to be protected.
 * @param {boolean} tracers Whether to install tracers around fn.
 * @return {!Function} protected wrapper function.
 * @protected
 */
goog.debug.ErrorHandler.prototype.getProtectedFunction = function(fn, tracers) {
  var that = this;
  if (tracers) {
    var stackTrace = goog.debug.getStacktraceSimple(15);
  }
  return function() {
    if (tracers) {
      var tracer = goog.debug.Trace.startTracer('protectedEntryPoint: ' +
        that.getStackTraceHolder_(stackTrace));
    }
    try {
      return fn.apply(this, arguments);
    } catch (e) {
      that.errorHandlerFn_(e);
      throw e;  // Re-throw it since this may be expected by the caller.
    } finally {
      if (tracers) {
        goog.debug.Trace.stopTracer(tracer);
      }
    }
  };
};


/**
 * Installs exception protection for window.setTimeout to handle exceptions.
 * @param {boolean} opt_tracers Whether to install tracers around the fn.
 */
goog.debug.ErrorHandler.prototype.protectWindowSetTimeout =
    function(opt_tracers) {
  var win = goog.getObjectByName('window');
  var originalSetTimeout = win.setTimeout;
  var that = this;
  win.setTimeout = function(fn, time) {
    // IE doesn't support .call for setTimeout, but it also doesn't care
    // what "this" is, so we can just call the original function directly
    fn = that.protectEntryPoint(fn, opt_tracers);
    if (originalSetTimeout.call) {
      return originalSetTimeout.call(this, fn, time);
    } else {
      return originalSetTimeout(fn, time);
    }
  };
};


/**
 * Install exception protection for window.setInterval to handle exceptions.
 * @param {boolean} opt_tracers Whether to install tracers around the fn.
 */
goog.debug.ErrorHandler.prototype.protectWindowSetInterval =
    function(opt_tracers) {
  var win = goog.getObjectByName('window');
  var originalSetInterval = win.setInterval;
  var that = this;
  win.setInterval = function(fn, time) {
    // IE doesn't support .call for setInterval, but it also doesn't care
    // what "this" is, so we can just call the original function directly
    fn = that.protectEntryPoint(fn, opt_tracers);
    if (originalSetInterval.call) {
      return originalSetInterval.call(this, fn, time);
    } else {
      return originalSetInterval(fn, time);
    }
  };
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

/**
 * @fileoverview Logging and debugging utilities.
 *
 * @see ../demos/debug.html
 */

goog.provide('goog.debug');

goog.require('goog.array');
goog.require('goog.debug.errorcontext');
goog.require('goog.userAgent');


/** @define {boolean} Whether logging should be enabled. */
goog.debug.LOGGING_ENABLED =
    goog.define('goog.debug.LOGGING_ENABLED', goog.DEBUG);


/** @define {boolean} Whether to force "sloppy" stack building. */
goog.debug.FORCE_SLOPPY_STACKS =
    goog.define('goog.debug.FORCE_SLOPPY_STACKS', false);


/**
 * Catches onerror events fired by windows and similar objects.
 * @param {function(Object)} logFunc The function to call with the error
 *    information.
 * @param {boolean=} opt_cancel Whether to stop the error from reaching the
 *    browser.
 * @param {Object=} opt_target Object that fires onerror events.
 * @suppress {strictMissingProperties} onerror is not defined as a property
 *    on Object.
 */
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) {
  var target = opt_target || goog.global;
  var oldErrorHandler = target.onerror;
  var retVal = !!opt_cancel;

  // Chrome interprets onerror return value backwards (http://crbug.com/92062)
  // until it was fixed in webkit revision r94061 (Webkit 535.3). This
  // workaround still needs to be skipped in Safari after the webkit change
  // gets pushed out in Safari.
  // See https://bugs.webkit.org/show_bug.cgi?id=67119
  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('535.3')) {
    retVal = !retVal;
  }

  /**
   * New onerror handler for this target. This onerror handler follows the spec
   * according to
   * http://www.whatwg.org/specs/web-apps/current-work/#runtime-script-errors
   * The spec was changed in August 2013 to support receiving column information
   * and an error object for all scripts on the same origin or cross origin
   * scripts with the proper headers. See
   * https://mikewest.org/2013/08/debugging-runtime-errors-with-window-onerror
   *
   * @param {string} message The error message. For cross-origin errors, this
   *     will be scrubbed to just "Script error.". For new browsers that have
   *     updated to follow the latest spec, errors that come from origins that
   *     have proper cross origin headers will not be scrubbed.
   * @param {string} url The URL of the script that caused the error. The URL
   *     will be scrubbed to "" for cross origin scripts unless the script has
   *     proper cross origin headers and the browser has updated to the latest
   *     spec.
   * @param {number} line The line number in the script that the error
   *     occurred on.
   * @param {number=} opt_col The optional column number that the error
   *     occurred on. Only browsers that have updated to the latest spec will
   *     include this.
   * @param {Error=} opt_error The optional actual error object for this
   *     error that should include the stack. Only browsers that have updated
   *     to the latest spec will inlude this parameter.
   * @return {boolean} Whether to prevent the error from reaching the browser.
   */
  target.onerror = function(message, url, line, opt_col, opt_error) {
    if (oldErrorHandler) {
      oldErrorHandler(message, url, line, opt_col, opt_error);
    }
    logFunc({
      message: message,
      fileName: url,
      line: line,
      lineNumber: line,
      col: opt_col,
      error: opt_error
    });
    return retVal;
  };
};


/**
 * Creates a string representing an object and all its properties.
 * @param {Object|null|undefined} obj Object to expose.
 * @param {boolean=} opt_showFn Show the functions as well as the properties,
 *     default is false.
 * @return {string} The string representation of `obj`.
 */
goog.debug.expose = function(obj, opt_showFn) {
  if (typeof obj == 'undefined') {
    return 'undefined';
  }
  if (obj == null) {
    return 'NULL';
  }
  var str = [];

  for (var x in obj) {
    if (!opt_showFn && goog.isFunction(obj[x])) {
      continue;
    }
    var s = x + ' = ';

    try {
      s += obj[x];
    } catch (e) {
      s += '*** ' + e + ' ***';
    }
    str.push(s);
  }
  return str.join('\n');
};


/**
 * Creates a string representing a given primitive or object, and for an
 * object, all its properties and nested objects. NOTE: The output will include
 * Uids on all objects that were exposed. Any added Uids will be removed before
 * returning.
 * @param {*} obj Object to expose.
 * @param {boolean=} opt_showFn Also show properties that are functions (by
 *     default, functions are omitted).
 * @return {string} A string representation of `obj`.
 */
goog.debug.deepExpose = function(obj, opt_showFn) {
  var str = [];

  // Track any objects where deepExpose added a Uid, so they can be cleaned up
  // before return. We do this globally, rather than only on ancestors so that
  // if the same object appears in the output, you can see it.
  var uidsToCleanup = [];
  var ancestorUids = {};

  var helper = function(obj, space) {
    var nestspace = space + '  ';

    var indentMultiline = function(str) {
      return str.replace(/\n/g, '\n' + space);
    };


    try {
      if (obj === undefined) {
        str.push('undefined');
      } else if (obj === null) {
        str.push('NULL');
      } else if (typeof obj === 'string') {
        str.push('"' + indentMultiline(obj) + '"');
      } else if (goog.isFunction(obj)) {
        str.push(indentMultiline(String(obj)));
      } else if (goog.isObject(obj)) {
        // Add a Uid if needed. The struct calls implicitly adds them.
        if (!goog.hasUid(obj)) {
          uidsToCleanup.push(obj);
        }
        var uid = goog.getUid(obj);
        if (ancestorUids[uid]) {
          str.push('*** reference loop detected (id=' + uid + ') ***');
        } else {
          ancestorUids[uid] = true;
          str.push('{');
          for (var x in obj) {
            if (!opt_showFn && goog.isFunction(obj[x])) {
              continue;
            }
            str.push('\n');
            str.push(nestspace);
            str.push(x + ' = ');
            helper(obj[x], nestspace);
          }
          str.push('\n' + space + '}');
          delete ancestorUids[uid];
        }
      } else {
        str.push(obj);
      }
    } catch (e) {
      str.push('*** ' + e + ' ***');
    }
  };

  helper(obj, '');

  // Cleanup any Uids that were added by the deepExpose.
  for (var i = 0; i < uidsToCleanup.length; i++) {
    goog.removeUid(uidsToCleanup[i]);
  }

  return str.join('');
};


/**
 * Recursively outputs a nested array as a string.
 * @param {Array<?>} arr The array.
 * @return {string} String representing nested array.
 */
goog.debug.exposeArray = function(arr) {
  var str = [];
  for (var i = 0; i < arr.length; i++) {
    if (goog.isArray(arr[i])) {
      str.push(goog.debug.exposeArray(arr[i]));
    } else {
      str.push(arr[i]);
    }
  }
  return '[ ' + str.join(', ') + ' ]';
};


/**
 * Normalizes the error/exception object between browsers.
 * @param {*} err Raw error object.
 * @return {{
 *    message: (?|undefined),
 *    name: (?|undefined),
 *    lineNumber: (?|undefined),
 *    fileName: (?|undefined),
 *    stack: (?|undefined)
 * }} Normalized error object.
 * @suppress {strictMissingProperties} properties not defined on err
 */
goog.debug.normalizeErrorObject = function(err) {
  var href = goog.getObjectByName('window.location.href');
  if (err == null) {
    err = 'Unknown Error of type "null/undefined"';
  }
  if (typeof err === 'string') {
    return {
      'message': err,
      'name': 'Unknown error',
      'lineNumber': 'Not available',
      'fileName': href,
      'stack': 'Not available'
    };
  }

  var lineNumber, fileName;
  var threwError = false;

  try {
    lineNumber = err.lineNumber || err.line || 'Not available';
  } catch (e) {
    // Firefox 2 sometimes throws an error when accessing 'lineNumber':
    // Message: Permission denied to get property UnnamedClass.lineNumber
    lineNumber = 'Not available';
    threwError = true;
  }

  try {
    fileName = err.fileName || err.filename || err.sourceURL ||
        // $googDebugFname may be set before a call to eval to set the filename
        // that the eval is supposed to present.
        goog.global['$googDebugFname'] || href;
  } catch (e) {
    // Firefox 2 may also throw an error when accessing 'filename'.
    fileName = 'Not available';
    threwError = true;
  }

  // The IE Error object contains only the name and the message.
  // The Safari Error object uses the line and sourceURL fields.
  if (threwError || !err.lineNumber || !err.fileName || !err.stack ||
      !err.message || !err.name) {
    var message = err.message;
    if (message == null) {
      if (err.constructor && err.constructor instanceof Function) {
        var ctorName = err.constructor.name ?
            err.constructor.name :
            goog.debug.getFunctionName(err.constructor);
        message = 'Unknown Error of type "' + ctorName + '"';
      } else {
        message = 'Unknown Error of unknown type';
      }
    }
    return {
      'message': message,
      'name': err.name || 'UnknownError',
      'lineNumber': lineNumber,
      'fileName': fileName,
      'stack': err.stack || 'Not available'
    };
  }

  // Standards error object
  // Typed !Object. Should be a subtype of the return type, but it's not.
  return /** @type {?} */ (err);
};


/**
 * Converts an object to an Error using the object's toString if it's not
 * already an Error, adds a stacktrace if there isn't one, and optionally adds
 * an extra message.
 * @param {*} err The original thrown error, object, or string.
 * @param {string=} opt_message  optional additional message to add to the
 *     error.
 * @return {!Error} If err is an Error, it is enhanced and returned. Otherwise,
 *     it is converted to an Error which is enhanced and returned.
 */
goog.debug.enhanceError = function(err, opt_message) {
  var error;
  if (!(err instanceof Error)) {
    error = Error(err);
    if (Error.captureStackTrace) {
      // Trim this function off the call stack, if we can.
      Error.captureStackTrace(error, goog.debug.enhanceError);
    }
  } else {
    error = err;
  }

  if (!error.stack) {
    error.stack = goog.debug.getStacktrace(goog.debug.enhanceError);
  }
  if (opt_message) {
    // find the first unoccupied 'messageX' property
    var x = 0;
    while (error['message' + x]) {
      ++x;
    }
    error['message' + x] = String(opt_message);
  }
  return error;
};


/**
 * Converts an object to an Error using the object's toString if it's not
 * already an Error, adds a stacktrace if there isn't one, and optionally adds
 * context to the Error, which is reported by the closure error reporter.
 * @param {*} err The original thrown error, object, or string.
 * @param {!Object<string, string>=} opt_context Key-value context to add to the
 *     Error.
 * @return {!Error} If err is an Error, it is enhanced and returned. Otherwise,
 *     it is converted to an Error which is enhanced and returned.
 */
goog.debug.enhanceErrorWithContext = function(err, opt_context) {
  var error = goog.debug.enhanceError(err);
  if (opt_context) {
    for (var key in opt_context) {
      goog.debug.errorcontext.addErrorContext(error, key, opt_context[key]);
    }
  }
  return error;
};


/**
 * Gets the current stack trace. Simple and iterative - doesn't worry about
 * catching circular references or getting the args.
 * @param {number=} opt_depth Optional maximum depth to trace back to.
 * @return {string} A string with the function names of all functions in the
 *     stack, separated by \n.
 * @suppress {es5Strict}
 */
goog.debug.getStacktraceSimple = function(opt_depth) {
  if (!goog.debug.FORCE_SLOPPY_STACKS) {
    var stack = goog.debug.getNativeStackTrace_(goog.debug.getStacktraceSimple);
    if (stack) {
      return stack;
    }
    // NOTE: browsers that have strict mode support also have native "stack"
    // properties.  Fall-through for legacy browser support.
  }

  var sb = [];
  var fn = arguments.callee.caller;
  var depth = 0;

  while (fn && (!opt_depth || depth < opt_depth)) {
    sb.push(goog.debug.getFunctionName(fn));
    sb.push('()\n');

    try {
      fn = fn.caller;
    } catch (e) {
      sb.push('[exception trying to get caller]\n');
      break;
    }
    depth++;
    if (depth >= goog.debug.MAX_STACK_DEPTH) {
      sb.push('[...long stack...]');
      break;
    }
  }
  if (opt_depth && depth >= opt_depth) {
    sb.push('[...reached max depth limit...]');
  } else {
    sb.push('[end]');
  }

  return sb.join('');
};


/**
 * Max length of stack to try and output
 * @type {number}
 */
goog.debug.MAX_STACK_DEPTH = 50;


/**
 * @param {Function} fn The function to start getting the trace from.
 * @return {?string}
 * @private
 */
goog.debug.getNativeStackTrace_ = function(fn) {
  var tempErr = new Error();
  if (Error.captureStackTrace) {
    Error.captureStackTrace(tempErr, fn);
    return String(tempErr.stack);
  } else {
    // IE10, only adds stack traces when an exception is thrown.
    try {
      throw tempErr;
    } catch (e) {
      tempErr = e;
    }
    var stack = tempErr.stack;
    if (stack) {
      return String(stack);
    }
  }
  return null;
};


/**
 * Gets the current stack trace, either starting from the caller or starting
 * from a specified function that's currently on the call stack.
 * @param {?Function=} fn If provided, when collecting the stack trace all
 *     frames above the topmost call to this function, including that call,
 *     will be left out of the stack trace.
 * @return {string} Stack trace.
 * @suppress {es5Strict}
 */
goog.debug.getStacktrace = function(fn) {
  var stack;
  if (!goog.debug.FORCE_SLOPPY_STACKS) {
    // Try to get the stack trace from the environment if it is available.
    var contextFn = fn || goog.debug.getStacktrace;
    stack = goog.debug.getNativeStackTrace_(contextFn);
  }
  if (!stack) {
    // NOTE: browsers that have strict mode support also have native "stack"
    // properties. This function will throw in strict mode.
    stack = goog.debug.getStacktraceHelper_(fn || arguments.callee.caller, []);
  }
  return stack;
};


/**
 * Private helper for getStacktrace().
 * @param {?Function} fn If provided, when collecting the stack trace all
 *     frames above the topmost call to this function, including that call,
 *     will be left out of the stack trace.
 * @param {Array<!Function>} visited List of functions visited so far.
 * @return {string} Stack trace starting from function fn.
 * @suppress {es5Strict}
 * @private
 */
goog.debug.getStacktraceHelper_ = function(fn, visited) {
  var sb = [];

  // Circular reference, certain functions like bind seem to cause a recursive
  // loop so we need to catch circular references
  if (goog.array.contains(visited, fn)) {
    sb.push('[...circular reference...]');

    // Traverse the call stack until function not found or max depth is reached
  } else if (fn && visited.length < goog.debug.MAX_STACK_DEPTH) {
    sb.push(goog.debug.getFunctionName(fn) + '(');
    var args = fn.arguments;
    // Args may be null for some special functions such as host objects or eval.
    for (var i = 0; args && i < args.length; i++) {
      if (i > 0) {
        sb.push(', ');
      }
      var argDesc;
      var arg = args[i];
      switch (typeof arg) {
        case 'object':
          argDesc = arg ? 'object' : 'null';
          break;

        case 'string':
          argDesc = arg;
          break;

        case 'number':
          argDesc = String(arg);
          break;

        case 'boolean':
          argDesc = arg ? 'true' : 'false';
          break;

        case 'function':
          argDesc = goog.debug.getFunctionName(arg);
          argDesc = argDesc ? argDesc : '[fn]';
          break;

        case 'undefined':
        default:
          argDesc = typeof arg;
          break;
      }

      if (argDesc.length > 40) {
        argDesc = argDesc.substr(0, 40) + '...';
      }
      sb.push(argDesc);
    }
    visited.push(fn);
    sb.push(')\n');

    try {
      sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited));
    } catch (e) {
      sb.push('[exception trying to get caller]\n');
    }

  } else if (fn) {
    sb.push('[...long stack...]');
  } else {
    sb.push('[end]');
  }
  return sb.join('');
};


/**
 * Gets a function name
 * @param {Function} fn Function to get name of.
 * @return {string} Function's name.
 */
goog.debug.getFunctionName = function(fn) {
  if (goog.debug.fnNameCache_[fn]) {
    return goog.debug.fnNameCache_[fn];
  }

  // Heuristically determine function name based on code.
  var functionSource = String(fn);
  if (!goog.debug.fnNameCache_[functionSource]) {
    var matches = /function\s+([^\(]+)/m.exec(functionSource);
    if (matches) {
      var method = matches[1];
      goog.debug.fnNameCache_[functionSource] = method;
    } else {
      goog.debug.fnNameCache_[functionSource] = '[Anonymous]';
    }
  }

  return goog.debug.fnNameCache_[functionSource];
};


/**
 * Makes whitespace visible by replacing it with printable characters.
 * This is useful in finding diffrences between the expected and the actual
 * output strings of a testcase.
 * @param {string} string whose whitespace needs to be made visible.
 * @return {string} string whose whitespace is made visible.
 */
goog.debug.makeWhitespaceVisible = function(string) {
  return string.replace(/ /g, '[_]')
      .replace(/\f/g, '[f]')
      .replace(/\n/g, '[n]\n')
      .replace(/\r/g, '[r]')
      .replace(/\t/g, '[t]');
};


/**
 * Returns the type of a value. If a constructor is passed, and a suitable
 * string cannot be found, 'unknown type name' will be returned.
 *
 * <p>Forked rather than moved from {@link goog.asserts.getType_}
 * to avoid adding a dependency to goog.asserts.
 * @param {*} value A constructor, object, or primitive.
 * @return {string} The best display name for the value, or 'unknown type name'.
 */
goog.debug.runtimeType = function(value) {
  if (value instanceof Function) {
    return value.displayName || value.name || 'unknown type name';
  } else if (value instanceof Object) {
    return /** @type {string} */ (value.constructor.displayName) ||
        value.constructor.name || Object.prototype.toString.call(value);
  } else {
    return value === null ? 'null' : typeof value;
  }
};


/**
 * Hash map for storing function names that have already been looked up.
 * @type {Object}
 * @private
 */
goog.debug.fnNameCache_ = {};


/**
 * Private internal function to support goog.debug.freeze.
 * @param {T} arg
 * @return {T}
 * @template T
 * @private
 */
goog.debug.freezeInternal_ = goog.DEBUG && Object.freeze || function(arg) {
  return arg;
};


/**
 * Freezes the given object, but only in debug mode (and in browsers that
 * support it).  Note that this is a shallow freeze, so for deeply nested
 * objects it must be called at every level to ensure deep immutability.
 * @param {T} arg
 * @return {T}
 * @template T
 */
goog.debug.freeze = function(arg) {
  // NOTE: this compiles to nothing, but hides the possible side effect of
  // freezeInternal_ from the compiler so that the entire call can be
  // removed if the result is not used.
  return {
    valueOf: function() {
      return goog.debug.freezeInternal_(arg);
    }
  }.valueOf();
};

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
// Copyright 2012 Selenium comitters
// Copyright 2012 Software Freedom Conservancy
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
 * @fileoverview Tools for parsing and pretty printing error stack traces. This
 * file is based on goog.testing.stacktrace.
 */

goog.provide('webdriver.stacktrace');
goog.provide('webdriver.stacktrace.Snapshot');

goog.require('goog.array');
goog.require('goog.string');



/**
 * Stores a snapshot of the stack trace at the time this instance was created.
 * The stack trace will always be adjusted to exclude this function call.
 * @param {number=} opt_slice The number of frames to remove from the top of
 *     the generated stack trace.
 * @constructor
 */
webdriver.stacktrace.Snapshot = function(opt_slice) {

  /**
   * @type {number}
   * @private
   */
  this.slice_ = opt_slice || 0;

  /**
   * @type {!Error}
   * @private
   */
  this.error_ = Error();

  if (webdriver.stacktrace.CAN_CAPTURE_STACK_TRACE_) {
    Error.captureStackTrace(this.error_, webdriver.stacktrace.Snapshot);
  } else {
    // Opera and Firefox do not generate a stack frame for calls to Error(),
    // so just remove 1 extra for the call to this constructor.
    this.slice_ += 1;
  }

  /**
   * The error's stacktrace.  This must be accessed immediately to ensure Opera
   * computes the context correctly.
   * @type {string}
   * @private
   */
  this.stack_ = this.error_.stack;
};


/**
 * Whether the current environment supports the Error.captureStackTrace
 * function (as of 10/17/2012, only V8).
 * @type {boolean}
 * @const
 * @private
 */
webdriver.stacktrace.CAN_CAPTURE_STACK_TRACE_ =
    goog.isFunction(Error.captureStackTrace);


/**
 * The parsed stack trace. This list is lazily generated the first time it is
 * accessed.
 * @type {?string}
 * @private
 */
webdriver.stacktrace.Snapshot.prototype.parsedStack_ = null;


/**
 * @return {string} The parsed stack trace.
 */
webdriver.stacktrace.Snapshot.prototype.getStacktrace = function() {
  if (goog.isNull(this.parsedStack_)) {
    var stack = webdriver.stacktrace.parse(this.error_);
    if (this.slice_) {
      stack = goog.array.slice(stack, this.slice_);
    }
    this.parsedStack_ = stack.join('\n');
    delete this.error_;
    delete this.slice_;
    delete this.stack_;
  }
  return this.parsedStack_;
};



/**
 * Class representing one stack frame.
 * @param {(string|undefined)} context Context object, empty in case of global
 *     functions or if the browser doesn't provide this information.
 * @param {(string|undefined)} name Function name, empty in case of anonymous
 *     functions.
 * @param {(string|undefined)} alias Alias of the function if available. For
 *     example the function name will be 'c' and the alias will be 'b' if the
 *     function is defined as <code>a.b = function c() {};</code>.
 * @param {(string|undefined)} path File path or URL including line number and
 *     optionally column number separated by colons.
 * @constructor
 * @private
 */
webdriver.stacktrace.Frame_ = function(context, name, alias, path) {

  /**
   * @type {string}
   * @private
   */
  this.context_ = context || '';

  /**
   * @type {string}
   * @private
   */
  this.name_ = name || '';

  /**
   * @type {string}
   * @private
   */
  this.alias_ = alias || '';

  /**
   * @type {string}
   * @private
   */
  this.path_ = path || '';
};


/**
 * Constant for an anonymous frame.
 * @type {!webdriver.stacktrace.Frame_}
 * @const
 * @private
 */
webdriver.stacktrace.ANONYMOUS_FRAME_ =
    new webdriver.stacktrace.Frame_('', '', '', '');


/**
 * @return {string} The function name or empty string if the function is
 *     anonymous and the object field which it's assigned to is unknown.
 */
webdriver.stacktrace.Frame_.prototype.getName = function() {
  return this.name_;
};


/**
 * @return {boolean} Whether the stack frame contains an anonymous function.
 */
webdriver.stacktrace.Frame_.prototype.isAnonymous = function() {
  return !this.name_ || this.context_ == '[object Object]';
};


/**
 * Converts this frame to its string representation using V8's stack trace
 * format: http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
 * @return {string} The string representation of this frame.
 * @override
 */
webdriver.stacktrace.Frame_.prototype.toString = function() {
  var context = this.context_;
  if (context && context !== 'new ') {
    context += '.';
  }
  context += this.name_;
  context += this.alias_ ? ' [as ' + this.alias_ + ']' : '';

  var path = this.path_ || '<anonymous>';
  return '    at ' + (context ? context + ' (' + path + ')' : path);
};


/**
 * Maximum length of a string that can be matched with a RegExp on
 * Firefox 3x. Exceeding this approximate length will cause string.match
 * to exceed Firefox's stack quota. This situation can be encountered
 * when goog.globalEval is invoked with a long argument; such as
 * when loading a module.
 * @type {number}
 * @const
 * @private
 */
webdriver.stacktrace.MAX_FIREFOX_FRAMESTRING_LENGTH_ = 500000;


/**
 * RegExp pattern for JavaScript identifiers. We don't support Unicode
 * identifiers defined in ECMAScript v3.
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.IDENTIFIER_PATTERN_ = '[a-zA-Z_$][\\w$]*';


/**
 * Pattern for a matching the type on a fully-qualified name. Forms an
 * optional sub-match on the type. For example, in "foo.bar.baz", will match on
 * "foo.bar".
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.CONTEXT_PATTERN_ =
    '(' + webdriver.stacktrace.IDENTIFIER_PATTERN_ +
    '(?:\\.' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + ')*)\\.';


/**
 * Pattern for matching a fully qualified name. Will create two sub-matches:
 * the type (optional), and the name. For example, in "foo.bar.baz", will
 * match on ["foo.bar", "baz"].
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.QUALIFIED_NAME_PATTERN_ =
    '(?:' + webdriver.stacktrace.CONTEXT_PATTERN_ + ')?' +
    '(' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + ')';


/**
 * RegExp pattern for function name alias in the V8 stack trace.
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.V8_ALIAS_PATTERN_ =
    '(?: \\[as (' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + ')\\])?';


/**
 * RegExp pattern for function names and constructor calls in the V8 stack
 * trace.
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.V8_FUNCTION_NAME_PATTERN_ =
    '(?:' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + '|<anonymous>)';


/**
 * RegExp pattern for the context of a function call in V8. Creates two
 * submatches, only one of which will ever match: either the namespace
 * identifier (with optional "new" keyword in the case of a constructor call),
 * or just the "new " phrase for a top level constructor call.
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.V8_CONTEXT_PATTERN_ =
    '(?:((?:new )?(?:\\[object Object\\]|' +
    webdriver.stacktrace.IDENTIFIER_PATTERN_ +
    '(?:\\.' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + ')*)' +
    ')\\.|(new ))';


/**
 * RegExp pattern for function call in the V8 stack trace.
 * Creates 3 submatches with context object (optional), function name and
 * function alias (optional).
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.V8_FUNCTION_CALL_PATTERN_ =
    ' (?:' + webdriver.stacktrace.V8_CONTEXT_PATTERN_ + ')?' +
    '(' + webdriver.stacktrace.V8_FUNCTION_NAME_PATTERN_ + ')' +
    webdriver.stacktrace.V8_ALIAS_PATTERN_;


/**
 * RegExp pattern for an URL + position inside the file.
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.URL_PATTERN_ =
    '((?:http|https|file)://[^\\s)]+|javascript:.*)';


/**
 * RegExp pattern for a location string in a V8 stack frame. Creates two
 * submatches for the location, one for enclosed in parentheticals and on
 * where the location appears alone (which will only occur if the location is
 * the only information in the frame).
 * @type {string}
 * @const
 * @private
 * @see http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
 */
webdriver.stacktrace.V8_LOCATION_PATTERN_ = ' (?:\\((.*)\\)|(.*))';


/**
 * Regular expression for parsing one stack frame in V8.
 * @type {!RegExp}
 * @const
 * @private
 */
webdriver.stacktrace.V8_STACK_FRAME_REGEXP_ = new RegExp('^    at' +
    '(?:' + webdriver.stacktrace.V8_FUNCTION_CALL_PATTERN_ + ')?' +
    webdriver.stacktrace.V8_LOCATION_PATTERN_ + '$');


/**
 * RegExp pattern for function call in the Firefox stack trace.
 * Creates a submatch for the function name.
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.FIREFOX_FUNCTION_CALL_PATTERN_ =
    '(' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + ')?' +
    '(?:\\(.*\\))?@';


/**
 * Regular expression for parsing one stack frame in Firefox.
 * @type {!RegExp}
 * @const
 * @private
 */
webdriver.stacktrace.FIREFOX_STACK_FRAME_REGEXP_ = new RegExp('^' +
    webdriver.stacktrace.FIREFOX_FUNCTION_CALL_PATTERN_ +
    '(?::0|' + webdriver.stacktrace.URL_PATTERN_ + ')$');


/**
 * RegExp pattern for an anonymous function call in an Opera stack frame.
 * Creates 2 (optional) submatches: the context object and function name.
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.OPERA_ANONYMOUS_FUNCTION_NAME_PATTERN_ =
    '<anonymous function(?:\\: ' +
    webdriver.stacktrace.QUALIFIED_NAME_PATTERN_ + ')?>';


/**
 * RegExp pattern for a function call in an Opera stack frame.
 * Creates 3 (optional) submatches: the function name (if not anonymous),
 * the aliased context object and the function name (if anonymous).
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.OPERA_FUNCTION_CALL_PATTERN_ =
    '(?:(?:(' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + ')|' +
    webdriver.stacktrace.OPERA_ANONYMOUS_FUNCTION_NAME_PATTERN_ +
    ')(?:\\(.*\\)))?@';


/**
 * Regular expression for parsing on stack frame in Opera 11.68+
 * @type {!RegExp}
 * @const
 * @private
 */
webdriver.stacktrace.OPERA_STACK_FRAME_REGEXP_ = new RegExp('^' +
    webdriver.stacktrace.OPERA_FUNCTION_CALL_PATTERN_ +
    webdriver.stacktrace.URL_PATTERN_ + '?$');


/**
 * Placeholder for an unparsable frame in a stack trace generated by
 * {@link goog.testing.stacktrace}.
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.UNKNOWN_CLOSURE_FRAME_ = '> (unknown)';


/**
 * Representation of an anonymous frame in a stack trace generated by
 * {@link goog.testing.stacktrace}.
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.ANONYMOUS_CLOSURE_FRAME_ = '> anonymous';


/**
 * Pattern for a function call in a Closure stack trace. Creates three optional
 * submatches: the context, function name, and alias.
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.CLOSURE_FUNCTION_CALL_PATTERN_ =
    webdriver.stacktrace.QUALIFIED_NAME_PATTERN_ +
    '(?:\\(.*\\))?' +  // Ignore arguments if present.
    webdriver.stacktrace.V8_ALIAS_PATTERN_;


/**
 * Regular expression for parsing a stack frame generated by Closure's
 * {@link goog.testing.stacktrace}.
 * @type {!RegExp}
 * @const
 * @private
 */
webdriver.stacktrace.CLOSURE_STACK_FRAME_REGEXP_ = new RegExp('^> ' +
    '(?:' + webdriver.stacktrace.CLOSURE_FUNCTION_CALL_PATTERN_ +
    '(?: at )?)?' +
    '(?:(.*:\\d+:\\d+)|' + webdriver.stacktrace.URL_PATTERN_ + ')?$');


/**
 * Parses one stack frame.
 * @param {string} frameStr The stack frame as string.
 * @return {webdriver.stacktrace.Frame_} Stack frame object or null if the
 *     parsing failed.
 * @private
 */
webdriver.stacktrace.parseStackFrame_ = function(frameStr) {
  var m = frameStr.match(webdriver.stacktrace.V8_STACK_FRAME_REGEXP_);
  if (m) {
    return new webdriver.stacktrace.Frame_(
        m[1] || m[2], m[3], m[4], m[5] || m[6]);
  }

  if (frameStr.length >
      webdriver.stacktrace.MAX_FIREFOX_FRAMESTRING_LENGTH_) {
    return webdriver.stacktrace.parseLongFirefoxFrame_(frameStr);
  }

  m = frameStr.match(webdriver.stacktrace.FIREFOX_STACK_FRAME_REGEXP_);
  if (m) {
    return new webdriver.stacktrace.Frame_('', m[1], '', m[2]);
  }

  m = frameStr.match(webdriver.stacktrace.OPERA_STACK_FRAME_REGEXP_);
  if (m) {
    return new webdriver.stacktrace.Frame_(m[2], m[1] || m[3], '', m[4]);
  }

  if (frameStr == webdriver.stacktrace.UNKNOWN_CLOSURE_FRAME_ ||
      frameStr == webdriver.stacktrace.ANONYMOUS_CLOSURE_FRAME_) {
    return webdriver.stacktrace.ANONYMOUS_FRAME_;
  }

  m = frameStr.match(webdriver.stacktrace.CLOSURE_STACK_FRAME_REGEXP_);
  if (m) {
    return new webdriver.stacktrace.Frame_(m[1], m[2], m[3], m[4] || m[5]);
  }

  return null;
};


/**
 * Parses a long firefox stack frame.
 * @param {string} frameStr The stack frame as string.
 * @return {!webdriver.stacktrace.Frame_} Stack frame object.
 * @private
 */
webdriver.stacktrace.parseLongFirefoxFrame_ = function(frameStr) {
  var firstParen = frameStr.indexOf('(');
  var lastAmpersand = frameStr.lastIndexOf('@');
  var lastColon = frameStr.lastIndexOf(':');
  var functionName = '';
  if ((firstParen >= 0) && (firstParen < lastAmpersand)) {
    functionName = frameStr.substring(0, firstParen);
  }
  var loc = '';
  if ((lastAmpersand >= 0) && (lastAmpersand + 1 < lastColon)) {
    loc = frameStr.substring(lastAmpersand + 1);
  }
  return new webdriver.stacktrace.Frame_('', functionName, '', loc);
};


/**
 * Formats an error's stack trace.
 * @param {!(Error|goog.testing.JsUnitException)} error The error to format.
 * @return {!(Error|goog.testing.JsUnitException)} The formatted error.
 */
webdriver.stacktrace.format = function(error) {
  var stack = webdriver.stacktrace.parse(error).join('\n');

  // Ensure the error is in the V8 style with the error's string representation
  // prepended to the stack.
  error.stack = error.toString() + '\n' + stack;
  return error;
};


/**
 * Parses an Error object's stack trace.
 * @param {!(Error|goog.testing.JsUnitException)} error The error.
 * @return {!Array.<webdriver.stacktrace.Frame_>} Stack frames. The
 *     unrecognized frames will be nulled out.
 * @private
 */
webdriver.stacktrace.parse = function(error) {
  var stack = error.stack || error.stackTrace;
  if (!stack) {
    return [];
  }

  // V8 prepends the string representation of an error to its stack trace.
  // Remove this so the stack trace is parsed consistently with the other JS
  // engines.
  var errorStr = error + '\n';

  if (goog.string.startsWith(stack, errorStr)) {
    stack = stack.substring(errorStr.length);
  }

  var lines = stack.
      replace(/\s*$/, '').
      split('\n');
  var frames = [];
  for (var i = 0; i < lines.length; i++) {
    var frame = webdriver.stacktrace.parseStackFrame_(lines[i]);
    frames.push(frame || webdriver.stacktrace.ANONYMOUS_FRAME_);
  }
  return frames;
};


/**
 * Gets the native stack trace if available otherwise follows the call chain.
 * The generated trace will exclude all frames up to and including the call to
 * this function.
 * @return {string} The stack trace in canonical format.
 */
webdriver.stacktrace.get = function() {
  return new webdriver.stacktrace.Snapshot(1).getStacktrace();
};

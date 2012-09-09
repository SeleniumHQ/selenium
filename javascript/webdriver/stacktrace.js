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
goog.provide('webdriver.stacktrace.Frame');
goog.provide('webdriver.stacktrace.Snapshot');

goog.require('goog.array');



/**
 * Stores a snapshot of the stack trace at the time this instance was created.
 * @param {number=} opt_slice The number of frames to remove from the top of
 *     the generate stack trace.
 * @constructor
 */
webdriver.stacktrace.Snapshot = function(opt_slice) {

  /**
   * @type {number}
   * @private
   */
  this.slice_ = opt_slice || 0;

  /**
   * @type {string}
   * @private
   */
  this.stack_ = Error().stack;
};


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
    var stack = this.stack_ ? webdriver.stacktrace.parse_(this.stack_) : [];
    if (this.slice_) {
      stack = goog.array.slice(stack, this.slice_);
    }
    this.parsedStack_ = stack.join('\n');
    delete this.stack_;
    delete this.slice_;
  }
  return this.parsedStack_;
};



/**
 * Class representing one stack frame.
 * @param {string} context Context object, empty in case of global functions or
 *     if the browser doesn't provide this information.
 * @param {string} name Function name, empty in case of anonymous functions.
 * @param {string} alias Alias of the function if available. For example the
 *     function name will be 'c' and the alias will be 'b' if the function is
 *     defined as <code>a.b = function c() {};</code>.
 * @param {string} args Arguments of the function in parentheses if available.
 * @param {string} path File path or URL including line number and optionally
 *     column number separated by colons.
 * @constructor
 */
webdriver.stacktrace.Frame = function(context, name, alias, args, path) {
  this.context_ = context;
  this.name_ = name;
  this.alias_ = alias;
  this.args_ = args;
  this.path_ = path;
};


/**
 * @return {string} The function name or empty string if the function is
 *     anonymous and the object field which it's assigned to is unknown.
 */
webdriver.stacktrace.Frame.prototype.getName = function() {
  return this.name_;
};


/**
 * @return {boolean} Whether the stack frame contains an anonymous function.
 */
webdriver.stacktrace.Frame.prototype.isAnonymous = function() {
  return !this.name_ || this.context_ == '[object Object]';
};


/** @override */
webdriver.stacktrace.Frame.prototype.toString = function() {
  return [
    this.context_ ? this.context_ + '.' : '',
    this.name_ || 'anonymous',
    // For the time being, we don't care about args. If we ever do, replace
    // this with: this.args_
    '()',
    this.alias_ ? ' [as ' + this.alias_ + ']' : '',
    this.path_ ? ' at ' + this.path_ : ''
  ].join('');
};


/**
 * Maximum number of steps while the call chain is followed.
 * @type {number}
 * @private
 */
webdriver.stacktrace.MAX_DEPTH_ = 20;


/**
 * Maximum length of a string that can be matched with a RegExp on
 * Firefox 3x. Exceeding this approximate length will cause string.match
 * to exceed Firefox's stack quota. This situation can be encountered
 * when goog.globalEval is invoked with a long argument; such as
 * when loading a module.
 * @type {number}
 * @private
 */
webdriver.stacktrace.MAX_FIREFOX_FRAMESTRING_LENGTH_ = 500000;


/**
 * RegExp pattern for JavaScript identifiers. We don't support Unicode
 * identifiers defined in ECMAScript v3.
 * @type {string}
 * @private
 */
webdriver.stacktrace.IDENTIFIER_PATTERN_ = '[a-zA-Z_$][\\w$]*';


/**
 * RegExp pattern for function name alias in the V8 stack trace.
 * @type {string}
 * @private
 */
webdriver.stacktrace.V8_ALIAS_PATTERN_ =
    '(?: \\[as (' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + ')\\])?';


/**
 * RegExp pattern for function names and constructor calls in the V8 stack
 * trace.
 * @type {string}
 * @private
 */
webdriver.stacktrace.V8_FUNCTION_NAME_PATTERN_ =
    '(?:new )?(?:' + webdriver.stacktrace.IDENTIFIER_PATTERN_ +
    '|<anonymous>)';


/**
 * RegExp pattern for function call in the V8 stack trace.
 * Creates 3 submatches with context object (optional), function name and
 * function alias (optional).
 * @type {string}
 * @private
 */
webdriver.stacktrace.V8_FUNCTION_CALL_PATTERN_ =
    ' (?:(.*?)\\.)?(' + webdriver.stacktrace.V8_FUNCTION_NAME_PATTERN_ +
    ')' + webdriver.stacktrace.V8_ALIAS_PATTERN_;


/**
 * RegExp pattern for an URL + position inside the file.
 * @type {string}
 * @private
 */
webdriver.stacktrace.URL_PATTERN_ =
    '((?:http|https|file)://[^\\s)]+|javascript:.*)';


/**
 * RegExp pattern for an URL + line number + column number in V8.
 * The URL is either in submatch 1 or submatch 2.
 * @type {string}
 * @private
 */
webdriver.stacktrace.V8_URL_PATTERN_ = ' (?:' +
    '\\(unknown source\\)' + '|' +
    '\\(native\\)' + '|' +
    '\\((?:eval at )?' + webdriver.stacktrace.URL_PATTERN_ + '\\)' + '|' +
    '\\((?:eval at <anonymous> \\(unknown source\\))?\\)' + '|' +
    '\\(?(.*:\\d+:\\d+)\\)?' + '|' +
    webdriver.stacktrace.URL_PATTERN_ + ')';


/**
 * Regular expression for parsing one stack frame in V8.
 * @type {!RegExp}
 * @private
 */
webdriver.stacktrace.V8_STACK_FRAME_REGEXP_ = new RegExp('^    at' +
    '(?:' + webdriver.stacktrace.V8_FUNCTION_CALL_PATTERN_ + ')?' +
    webdriver.stacktrace.V8_URL_PATTERN_ + '$');


/**
 * RegExp pattern for function call in the Firefox stack trace.
 * Creates 2 submatches with function name (optional) and arguments.
 * @type {string}
 * @private
 */
webdriver.stacktrace.FIREFOX_FUNCTION_CALL_PATTERN_ =
    '(' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + ')?' +
    '(\\(.*\\))?@';


/**
 * Regular expression for parsing one stack frame in Firefox.
 * @type {!RegExp}
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
    '(?:(' + webdriver.stacktrace.IDENTIFIER_PATTERN_ +
    '(?:\\.' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + ')*)\\.)?' +
    '(' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + '))?>';


/**
 * RegExp pattern for a function call in an Opera stack frame.
 * Creates 4 (optional) submatches: the function name (if not anonymous),
 * the aliased context object and function name (if anonymous), and the
 * function call arguments.
 * @type {string}
 * @const
 * @private
 */
webdriver.stacktrace.OPERA_FUNCTION_CALL_PATTERN_ =
    '(?:(?:(' + webdriver.stacktrace.IDENTIFIER_PATTERN_ + ')|' +
    webdriver.stacktrace.OPERA_ANONYMOUS_FUNCTION_NAME_PATTERN_ +
    ')(\\(.*\\)))?@';


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
 * Parses one stack frame.
 * @param {string} frameStr The stack frame as string.
 * @return {webdriver.stacktrace.Frame} Stack frame object or null if the
 *     parsing failed.
 * @private
 */
webdriver.stacktrace.parseStackFrame_ = function(frameStr) {
  var m = frameStr.match(webdriver.stacktrace.V8_STACK_FRAME_REGEXP_);
  if (m) {
    return new webdriver.stacktrace.Frame(m[1] || '', m[2] || '', m[3] || '',
        '', m[4] || m[5] || '');
  }

  if (frameStr.length >
      webdriver.stacktrace.MAX_FIREFOX_FRAMESTRING_LENGTH_) {
    return webdriver.stacktrace.parseLongFirefoxFrame_(frameStr);
  }

  m = frameStr.match(webdriver.stacktrace.FIREFOX_STACK_FRAME_REGEXP_);
  if (m) {
    return new webdriver.stacktrace.Frame('', m[1] || '', '', m[2] || '',
        m[3] || '');
  }

  m = frameStr.match(webdriver.stacktrace.OPERA_STACK_FRAME_REGEXP_);
  if (m) {
    return new webdriver.stacktrace.Frame(m[2] || '', m[1] || m[3] || '',
        '', m[4] || '', m[5] || '');
  }

  return null;
};


/**
 * Parses a long firefox stack frame.
 * @param {string} frameStr The stack frame as string.
 * @return {!webdriver.stacktrace.Frame} Stack frame object.
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
  var args = '';
  if ((firstParen >= 0 && lastAmpersand > 0) &&
      (firstParen < lastAmpersand)) {
    args = frameStr.substring(firstParen, lastAmpersand);
  }
  return new webdriver.stacktrace.Frame('', functionName, '', args, loc);
};


/**
 * Parses the browser's native stack trace.
 * @param {string} stack Stack trace.
 * @return {!Array.<webdriver.stacktrace.Frame>} Stack frames. The
 *     unrecognized frames will be nulled out.
 * @private
 */
webdriver.stacktrace.parse_ = function(stack) {
  var lines = stack.
      // V8 appends a header line with the error name and message. Remove this
      // so the stacktrace is parsed consistently with the other JS engines.
      replace(/^Error\n/, '').
      replace(/\s*$/, '').
      split('\n');
  var frames = [];
  for (var i = 0; i < lines.length; i++) {
    var frame = webdriver.stacktrace.parseStackFrame_(lines[i]);
    frames.push(frame || '(unknown)');
  }
  return frames;
};


/**
 * Gets the native stack trace if available otherwise follows the call chain.
 * @param {number=} opt_slice The number of frames to remove from the top of
 *     the generated stack trace.
 * @return {string} The stack trace in canonical format.
 */
webdriver.stacktrace.get = function(opt_slice) {
  return new webdriver.stacktrace.Snapshot(opt_slice).getStacktrace();
};

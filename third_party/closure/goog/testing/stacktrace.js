/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tools for parsing and pretty printing error stack traces.
 */

goog.setTestOnly('goog.testing.stacktrace');
goog.provide('goog.testing.stacktrace');
goog.provide('goog.testing.stacktrace.Frame');



/**
 * Class representing one stack frame.
 * @final
 * @unrestricted
 */
goog.testing.stacktrace.Frame = class {
  /**
   * @param {string} context Context object, empty in case of global functions
   *     or if the browser doesn't provide this information.
   * @param {string} name Function name, empty in case of anonymous functions.
   * @param {string} alias Alias of the function if available. For example the
   *     function name will be 'c' and the alias will be 'b' if the function is
   *     defined as <code>a.b = function c() {};</code>.
   * @param {string} path File path or URL including line number and optionally
   *     column number separated by colons.
   */
  constructor(context, name, alias, path) {
    'use strict';
    this.context_ = context;
    this.name_ = name;
    this.alias_ = alias;
    this.path_ = path;
  }

  /**
   * @return {string} The function name or empty string if the function is
   *     anonymous and the object field which it's assigned to is unknown.
   */
  getName() {
    'use strict';
    return this.name_;
  }

  /**
   * @return {boolean} Whether the stack frame contains an anonymous function.
   */
  isAnonymous() {
    'use strict';
    return !this.name_ || this.context_ == '[object Object]';
  }

  /**
   * Brings one frame of the stack trace into a common format across browsers.
   * @return {string} Pretty printed stack frame.
   */
  toCanonicalString() {
    'use strict';
    const htmlEscape = goog.testing.stacktrace.htmlEscape_;
    const deobfuscate = goog.testing.stacktrace.maybeDeobfuscateFunctionName_;

    const canonical = [
      this.context_ ? htmlEscape(this.context_) + '.' : '',
      this.name_ ? htmlEscape(deobfuscate(this.name_)) : 'anonymous',
      this.alias_ ? ' [as ' + htmlEscape(deobfuscate(this.alias_)) + ']' : ''
    ];

    if (this.path_) {
      canonical.push(' at ');
      canonical.push(htmlEscape(this.path_));
    }
    return canonical.join('');
  }
};



/**
 * Maximum number of steps while the call chain is followed.
 * @private {number}
 * @const
 */
goog.testing.stacktrace.MAX_DEPTH_ = 20;


/**
 * Maximum length of a string that can be matched with a RegExp on
 * Firefox 3x. Exceeding this approximate length will cause string.match
 * to exceed Firefox's stack quota. This situation can be encountered
 * when goog.globalEval is invoked with a long argument; such as
 * when loading a module.
 * @private {number}
 * @const
 */
goog.testing.stacktrace.MAX_FIREFOX_FRAMESTRING_LENGTH_ = 500000;


/**
 * RegExp pattern for JavaScript identifiers. We don't support Unicode
 * identifiers defined in ECMAScript v3.
 * @private {string}
 * @const
 */
goog.testing.stacktrace.IDENTIFIER_PATTERN_ = '[a-zA-Z_$][\\w$]*';


/**
 * RegExp pattern for function name alias in the V8 stack trace.
 * @private {string}
 * @const
 */
goog.testing.stacktrace.V8_ALIAS_PATTERN_ =
    '(?: \\[as (' + goog.testing.stacktrace.IDENTIFIER_PATTERN_ + ')\\])?';


/**
 * RegExp pattern for the context of a function call in a V8 stack trace.
 * Creates an optional submatch for the namespace identifier including the
 * "new" keyword for constructor calls (e.g. "new foo.Bar").
 * @private {string}
 * @const
 */
goog.testing.stacktrace.V8_CONTEXT_PATTERN_ =
    '(?:((?:new )?(?:\\[object Object\\]|' +
    goog.testing.stacktrace.IDENTIFIER_PATTERN_ + '(?:\\.' +
    goog.testing.stacktrace.IDENTIFIER_PATTERN_ + ')*))\\.)?';


/**
 * RegExp pattern for function names and constructor calls in the V8 stack
 * trace.
 * @private {string}
 * @const
 */
goog.testing.stacktrace.V8_FUNCTION_NAME_PATTERN_ =
    '(?:new )?(?:' + goog.testing.stacktrace.IDENTIFIER_PATTERN_ +
    '|<anonymous>)';


/**
 * RegExp pattern for function call in the V8 stack trace. Creates 3 submatches
 * with context object (optional), function name and function alias (optional).
 * @private {string}
 * @const
 */
goog.testing.stacktrace.V8_FUNCTION_CALL_PATTERN_ = ' ' +
    goog.testing.stacktrace.V8_CONTEXT_PATTERN_ + '(' +
    goog.testing.stacktrace.V8_FUNCTION_NAME_PATTERN_ + ')' +
    goog.testing.stacktrace.V8_ALIAS_PATTERN_;


/**
 * RegExp pattern for an URL + position inside the file.
 * @private {string}
 * @const
 */
goog.testing.stacktrace.URL_PATTERN_ =
    '((?:http|https|file)://[^\\s)]+|javascript:.*)';


/**
 * RegExp pattern for an URL + line number + column number in V8.
 * The URL is either in submatch 1 or submatch 2.
 * @private {string}
 * @const
 */
goog.testing.stacktrace.CHROME_URL_PATTERN_ = ' (?:' +
    '\\(unknown source\\)' +
    '|' +
    '\\(native\\)' +
    '|' +
    '\\((.+)\\)|(.+))';


/**
 * Regular expression for parsing one stack frame in V8. For more information
 * on V8 stack frame formats, see
 * https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi.
 * @private {!RegExp}
 * @const
 */
goog.testing.stacktrace.V8_STACK_FRAME_REGEXP_ = new RegExp(
    '^    at' +
    '(?:' + goog.testing.stacktrace.V8_FUNCTION_CALL_PATTERN_ + ')?' +
    goog.testing.stacktrace.CHROME_URL_PATTERN_ + '$');


/**
 * RegExp pattern for function call in the Firefox stack trace.
 * Creates 2 submatches with function name (optional) and arguments.
 *
 * Modern FF produces stack traces like:
 *    foo@url:1:2
 *    a.b.foo@url:3:4
 *
 * @private {string}
 * @const
 */
goog.testing.stacktrace.FIREFOX_FUNCTION_CALL_PATTERN_ = '(' +
    goog.testing.stacktrace.IDENTIFIER_PATTERN_ + '(?:\\.' +
    goog.testing.stacktrace.IDENTIFIER_PATTERN_ + ')*' +
    ')?' +
    '(\\(.*\\))?@';


/**
 * Regular expression for parsing one stack frame in Firefox.
 * @private {!RegExp}
 * @const
 */
goog.testing.stacktrace.FIREFOX_STACK_FRAME_REGEXP_ = new RegExp(
    '^' + goog.testing.stacktrace.FIREFOX_FUNCTION_CALL_PATTERN_ + '(?::0|' +
    goog.testing.stacktrace.URL_PATTERN_ + ')$');


/**
 * RegExp pattern for an anonymous function call in an Opera stack frame.
 * Creates 2 (optional) submatches: the context object and function name.
 * @private {string}
 * @const
 */
goog.testing.stacktrace.OPERA_ANONYMOUS_FUNCTION_NAME_PATTERN_ =
    '<anonymous function(?:\\: ' +
    '(?:(' + goog.testing.stacktrace.IDENTIFIER_PATTERN_ + '(?:\\.' +
    goog.testing.stacktrace.IDENTIFIER_PATTERN_ + ')*)\\.)?' +
    '(' + goog.testing.stacktrace.IDENTIFIER_PATTERN_ + '))?>';


/**
 * RegExp pattern for a function call in an Opera stack frame.
 * Creates 4 (optional) submatches: the function name (if not anonymous),
 * the aliased context object and function name (if anonymous), and the
 * function call arguments.
 * @private {string}
 * @const
 */
goog.testing.stacktrace.OPERA_FUNCTION_CALL_PATTERN_ = '(?:(?:(' +
    goog.testing.stacktrace.IDENTIFIER_PATTERN_ + ')|' +
    goog.testing.stacktrace.OPERA_ANONYMOUS_FUNCTION_NAME_PATTERN_ +
    ')(\\(.*\\)))?@';


/**
 * Regular expression for parsing on stack frame in Opera 11.68 - 12.17.
 * Newer versions of Opera use V8 and stack frames should match against
 * goog.testing.stacktrace.V8_STACK_FRAME_REGEXP_.
 * @private {!RegExp}
 * @const
 */
goog.testing.stacktrace.OPERA_STACK_FRAME_REGEXP_ = new RegExp(
    '^' + goog.testing.stacktrace.OPERA_FUNCTION_CALL_PATTERN_ +
    goog.testing.stacktrace.URL_PATTERN_ + '?$');


/**
 * Regular expression for finding the function name in its source.
 * @private {!RegExp}
 * @const
 */
goog.testing.stacktrace.FUNCTION_SOURCE_REGEXP_ = new RegExp(
    '^function (' + goog.testing.stacktrace.IDENTIFIER_PATTERN_ + ')');


/**
 * RegExp pattern for function call in a IE stack trace. This expression allows
 * for identifiers like 'Anonymous function', 'eval code', and 'Global code'.
 * @private {string}
 * @const
 */
goog.testing.stacktrace.IE_FUNCTION_CALL_PATTERN_ = '(' +
    goog.testing.stacktrace.IDENTIFIER_PATTERN_ + '(?:\\.' +
    goog.testing.stacktrace.IDENTIFIER_PATTERN_ + ')*' +
    '(?:\\s+\\w+)*)';


/**
 * Regular expression for parsing a stack frame in IE.
 * @private {!RegExp}
 * @const
 */
goog.testing.stacktrace.IE_STACK_FRAME_REGEXP_ = new RegExp(
    '^   at ' + goog.testing.stacktrace.IE_FUNCTION_CALL_PATTERN_ + '\\s*\\(' +
    '(' +
    'eval code:[^)]*' +
    '|' +
    'Unknown script code:[^)]*' +
    '|' + goog.testing.stacktrace.URL_PATTERN_ + ')\\)?$');


/**
 * Creates a stack trace by following the call chain. Based on
 * {@link goog.debug.getStacktrace}.
 * @return {!Array<!goog.testing.stacktrace.Frame>} Stack frames.
 * @private
 * @suppress {es5Strict}
 */
goog.testing.stacktrace.followCallChain_ = function() {
  'use strict';
  const frames = [];
  let fn = arguments.callee.caller;
  let depth = 0;

  while (fn && depth < goog.testing.stacktrace.MAX_DEPTH_) {
    const fnString = Function.prototype.toString.call(fn);
    const match =
        fnString.match(goog.testing.stacktrace.FUNCTION_SOURCE_REGEXP_);
    const functionName = match ? match[1] : '';

    frames.push(new goog.testing.stacktrace.Frame('', functionName, '', ''));


    try {
      fn = fn.caller;
    } catch (e) {
      break;
    }
    depth++;
  }

  return frames;
};


/**
 * Parses one stack frame.
 * @param {string} frameStr The stack frame as string.
 * @return {goog.testing.stacktrace.Frame} Stack frame object or null if the
 *     parsing failed.
 * @private
 */
goog.testing.stacktrace.parseStackFrame_ = function(frameStr) {
  'use strict';
  // This match includes newer versions of Opera (15+).
  let m = frameStr.match(goog.testing.stacktrace.V8_STACK_FRAME_REGEXP_);
  if (m) {
    return new goog.testing.stacktrace.Frame(
        m[1] || '', m[2] || '', m[3] || '', m[4] || m[5] || m[6] || '');
  }

  // TODO(johnlenz): remove this.  It seems like if this was useful it would
  // need to be before the V8 check.
  if (frameStr.length >
      goog.testing.stacktrace.MAX_FIREFOX_FRAMESTRING_LENGTH_) {
    return null;
  }

  m = frameStr.match(goog.testing.stacktrace.FIREFOX_STACK_FRAME_REGEXP_);
  if (m) {
    return new goog.testing.stacktrace.Frame('', m[1] || '', '', m[3] || '');
  }

  // Match against Presto Opera 11.68 - 12.17.
  m = frameStr.match(goog.testing.stacktrace.OPERA_STACK_FRAME_REGEXP_);
  if (m) {
    return new goog.testing.stacktrace.Frame(
        m[2] || '', m[1] || m[3] || '', '', m[5] || '');
  }

  m = frameStr.match(goog.testing.stacktrace.IE_STACK_FRAME_REGEXP_);
  if (m) {
    return new goog.testing.stacktrace.Frame('', m[1] || '', '', m[2] || '');
  }

  return null;
};


/**
 * Function to deobfuscate function names.
 * @type {function(string): string}
 * @private
 */
goog.testing.stacktrace.deobfuscateFunctionName_;


/**
 * Sets function to deobfuscate function names.
 * @param {function(string): string} fn function to deobfuscate function names.
 */
goog.testing.stacktrace.setDeobfuscateFunctionName = function(fn) {
  'use strict';
  goog.testing.stacktrace.deobfuscateFunctionName_ = fn;
};


/**
 * Deobfuscates a compiled function name with the function passed to
 * {@link #setDeobfuscateFunctionName}. Returns the original function name if
 * the deobfuscator hasn't been set.
 * @param {string} name The function name to deobfuscate.
 * @return {string} The deobfuscated function name.
 * @private
 */
goog.testing.stacktrace.maybeDeobfuscateFunctionName_ = function(name) {
  'use strict';
  return goog.testing.stacktrace.deobfuscateFunctionName_ ?
      goog.testing.stacktrace.deobfuscateFunctionName_(name) :
      name;
};


/**
 * Escapes the special character in HTML.
 * @param {string} text Plain text.
 * @return {string} Escaped text.
 * @private
 */
goog.testing.stacktrace.htmlEscape_ = function(text) {
  'use strict';
  return text.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
};


/**
 * Converts the stack frames into canonical format. Chops the beginning and the
 * end of it which come from the testing environment, not from the test itself.
 * @param {!Array<goog.testing.stacktrace.Frame>} frames The frames.
 * @return {string} Canonical, pretty printed stack trace.
 * @private
 */
goog.testing.stacktrace.framesToString_ = function(frames) {
  'use strict';
  // Removes the anonymous calls from the end of the stack trace (they come
  // from testrunner.js, testcase.js and asserts.js), so the stack trace will
  // end with the test... method.
  let lastIndex = frames.length - 1;
  while (frames[lastIndex] && frames[lastIndex].isAnonymous()) {
    lastIndex--;
  }

  // Removes the beginning of the stack trace until the call of the private
  // _assert function (inclusive), so the stack trace will begin with a public
  // asserter. Does nothing if _assert is not present in the stack trace.
  let privateAssertIndex = -1;
  for (let i = 0; i < frames.length; i++) {
    if (frames[i] && frames[i].getName() == '_assert') {
      privateAssertIndex = i;
      break;
    }
  }

  const canonical = [];
  for (let i = privateAssertIndex + 1; i <= lastIndex; i++) {
    canonical.push('> ');
    if (frames[i]) {
      canonical.push(frames[i].toCanonicalString());
    } else {
      canonical.push('(unknown)');
    }
    canonical.push('\n');
  }
  return canonical.join('');
};


/**
 * Parses the browser's native stack trace.
 * @param {string} stack Stack trace.
 * @return {!Array<goog.testing.stacktrace.Frame>} Stack frames. The
 *     unrecognized frames will be nulled out.
 * @private
 */
goog.testing.stacktrace.parse_ = function(stack) {
  'use strict';
  const lines = stack.replace(/\s*$/, '').split('\n');
  const frames = [];
  for (let i = 0; i < lines.length; i++) {
    frames.push(goog.testing.stacktrace.parseStackFrame_(lines[i]));
  }
  return frames;
};


/**
 * Brings the stack trace into a common format across browsers.
 * @param {string} stack Browser-specific stack trace.
 * @return {string} Same stack trace in common format.
 */
goog.testing.stacktrace.canonicalize = function(stack) {
  'use strict';
  const frames = goog.testing.stacktrace.parse_(stack);
  return goog.testing.stacktrace.framesToString_(frames);
};


/**
 * Returns the native stack trace.
 * @return {string|!Array<!CallSite>}
 * @private
 */
goog.testing.stacktrace.getNativeStack_ = function() {
  'use strict';
  const tmpError = new Error();
  if (tmpError.stack) {
    return tmpError.stack;
  }

  // IE10 will only create a stack trace when the Error is thrown.
  // We use null.x() to throw an exception because the closure compiler may
  // replace "throw" with a function call in an attempt to minimize the binary
  // size, which in turn has the side effect of adding an unwanted stack frame.
  try {
    null.x();
  } catch (e) {
    return e.stack;
  }
  return '';
};


/**
 * Gets the native stack trace if available otherwise follows the call chain.
 * @return {string} The stack trace in canonical format.
 */
goog.testing.stacktrace.get = function() {
  'use strict';
  const stack = goog.testing.stacktrace.getNativeStack_();
  let frames;
  if (!stack) {
    frames = goog.testing.stacktrace.followCallChain_();
  } else if (Array.isArray(stack)) {
    frames = goog.testing.stacktrace.callSitesToFrames_(stack);
  } else {
    frames = goog.testing.stacktrace.parse_(stack);
  }
  return goog.testing.stacktrace.framesToString_(frames);
};


/**
 * Converts an array of CallSite (elements of a stack trace in V8) to an array
 * of Frames.
 * @param {!Array<!CallSite>} stack The stack as an array of CallSites.
 * @return {!Array<!goog.testing.stacktrace.Frame>} The stack as an array of
 *     Frames.
 * @private
 */
goog.testing.stacktrace.callSitesToFrames_ = function(stack) {
  'use strict';
  const frames = [];
  for (let i = 0; i < stack.length; i++) {
    const callSite = stack[i];
    const functionName = callSite.getFunctionName() || 'unknown';
    const fileName = callSite.getFileName();
    const path = fileName ? fileName + ':' + callSite.getLineNumber() + ':' +
            callSite.getColumnNumber() :
                            'unknown';
    frames.push(new goog.testing.stacktrace.Frame('', functionName, '', path));
  }
  return frames;
};


goog.exportSymbol(
    'setDeobfuscateFunctionName',
    goog.testing.stacktrace.setDeobfuscateFunctionName);

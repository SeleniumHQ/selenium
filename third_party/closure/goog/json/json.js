/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JSON utility functions.
 */


goog.provide('goog.json');
goog.provide('goog.json.Replacer');
goog.provide('goog.json.Reviver');
goog.provide('goog.json.Serializer');


/**
 * @define {boolean} If true, use the native JSON parsing API.
 * NOTE: The default `goog.json.parse` implementation is able to handle
 * invalid JSON. JSPB used to produce invalid JSON which is not the case
 * anymore so this is safe to enable for parsing JSPB. Using native JSON is
 * faster and safer than the default implementation using `eval`.
 */
goog.json.USE_NATIVE_JSON = goog.define('goog.json.USE_NATIVE_JSON', false);


/**
 * Tests if a string is an invalid JSON string. This only ensures that we are
 * not using any invalid characters
 * @param {string} s The string to test.
 * @return {boolean} True if the input is a valid JSON string.
 */
goog.json.isValid = function(s) {
  'use strict';
  // All empty whitespace is not valid.
  if (/^\s*$/.test(s)) {
    return false;
  }

  // This is taken from http://www.json.org/json2.js which is released to the
  // public domain.
  // Changes: We dissallow \u2028 Line separator and \u2029 Paragraph separator
  // inside strings.  We also treat \u2028 and \u2029 as whitespace which they
  // are in the RFC but IE and Safari does not match \s to these so we need to
  // include them in the reg exps in all places where whitespace is allowed.
  // We allowed \x7f inside strings because some tools don't escape it,
  // e.g. http://www.json.org/java/org/json/JSONObject.java

  // Parsing happens in three stages. In the first stage, we run the text
  // against regular expressions that look for non-JSON patterns. We are
  // especially concerned with '()' and 'new' because they can cause invocation,
  // and '=' because it can cause mutation. But just to be safe, we want to
  // reject all unexpected forms.

  // We split the first stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace all backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters, but only when followed
  // by a colon, comma, closing bracket or end of string. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

  // Don't make these static since they have the global flag.
  const backslashesRe = /\\["\\\/bfnrtu]/g;
  const simpleValuesRe =
      /(?:"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)[\s\u2028\u2029]*(?=:|,|]|}|$)/g;
  const openBracketsRe = /(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g;
  const remainderRe = /^[\],:{}\s\u2028\u2029]*$/;

  return remainderRe.test(
      s.replace(backslashesRe, '@')
          .replace(simpleValuesRe, ']')
          .replace(openBracketsRe, ''));
};

/**
 * Logs a parsing error in `JSON.parse` solvable by using `eval`.
 * @private {function(string, !Error)} The first parameter is the error message,
 *     the second is the exception thrown by `JSON.parse`.
 */
goog.json.errorLogger_ = () => {};


/**
 * Sets an error logger to use if there's a recoverable parsing error.
 * @param {function(string, !Error)} errorLogger The first parameter is the
 *     error message, the second is the exception thrown by `JSON.parse`.
 */
goog.json.setErrorLogger = function(errorLogger) {
  'use strict';
  goog.json.errorLogger_ = errorLogger;
};


/**
 * Parses a JSON string and returns the result. This throws an exception if
 * the string is an invalid JSON string.
 *
 * Note that this is very slow on large strings. Use JSON.parse if possible.
 *
 * @param {*} s The JSON string to parse.
 * @throws Error if s is invalid JSON.
 * @return {Object} The object generated from the JSON string, or null.
 * @deprecated Use JSON.parse.
 */
goog.json.parse = goog.json.USE_NATIVE_JSON ?
    /** @type {function(*):Object} */ (goog.global['JSON']['parse']) :
    function(s) {
      'use strict';
      let error;
      try {
        return goog.global['JSON']['parse'](s);
      } catch (ex) {
        error = ex;
      }
      const o = String(s);
      if (goog.json.isValid(o)) {

        try {
          const result = /** @type {?Object} */ (eval('(' + o + ')'));
          if (error) {
            goog.json.errorLogger_('Invalid JSON: ' + o, error);
          }
          return result;
        } catch (ex) {
        }
      }
      throw new Error('Invalid JSON string: ' + o);
    };


/**
 * JSON replacer, as defined in Section 15.12.3 of the ES5 spec.
 * @see http://ecma-international.org/ecma-262/5.1/#sec-15.12.3
 *
 * TODO(nicksantos): Array should also be a valid replacer.
 *
 * @typedef {function(this:Object, string, *): *}
 */
goog.json.Replacer;


/**
 * JSON reviver, as defined in Section 15.12.2 of the ES5 spec.
 * @see http://ecma-international.org/ecma-262/5.1/#sec-15.12.3
 *
 * @typedef {function(this:Object, string, *): *}
 */
goog.json.Reviver;


/**
 * Serializes an object or a value to a JSON string.
 *
 * @param {*} object The object to serialize.
 * @param {?goog.json.Replacer=} opt_replacer A replacer function
 *     called for each (key, value) pair that determines how the value
 *     should be serialized. By defult, this just returns the value
 *     and allows default serialization to kick in.
 * @throws Error if there are loops in the object graph.
 * @return {string} A JSON string representation of the input.
 */
goog.json.serialize = goog.json.USE_NATIVE_JSON ?
    /** @type {function(*, ?goog.json.Replacer=):string} */
    (goog.global['JSON']['stringify']) :
    function(object, opt_replacer) {
      'use strict';
      // NOTE(nicksantos): Currently, we never use JSON.stringify.
      //
      // The last time I evaluated this, JSON.stringify had subtle bugs and
      // behavior differences on all browsers, and the performance win was not
      // large enough to justify all the issues. This may change in the future
      // as browser implementations get better.
      //
      // assertSerialize in json_test contains if branches for the cases
      // that fail.
      return new goog.json.Serializer(opt_replacer).serialize(object);
    };



/**
 * Class that is used to serialize JSON objects to a string.
 * @param {?goog.json.Replacer=} opt_replacer Replacer.
 * @constructor
 */
goog.json.Serializer = function(opt_replacer) {
  'use strict';
  /**
   * @type {goog.json.Replacer|null|undefined}
   * @private
   */
  this.replacer_ = opt_replacer;
};


/**
 * Serializes an object or a value to a JSON string.
 *
 * @param {*} object The object to serialize.
 * @throws Error if there are loops in the object graph.
 * @return {string} A JSON string representation of the input.
 */
goog.json.Serializer.prototype.serialize = function(object) {
  'use strict';
  const sb = [];
  this.serializeInternal(object, sb);
  return sb.join('');
};


/**
 * Serializes a generic value to a JSON string
 * @protected
 * @param {*} object The object to serialize.
 * @param {Array<string>} sb Array used as a string builder.
 * @throws Error if there are loops in the object graph.
 */
goog.json.Serializer.prototype.serializeInternal = function(object, sb) {
  'use strict';
  if (object == null) {
    // undefined == null so this branch covers undefined as well as null
    sb.push('null');
    return;
  }

  if (typeof object == 'object') {
    if (Array.isArray(object)) {
      this.serializeArray(object, sb);
      return;
    } else if (
        object instanceof String || object instanceof Number ||
        object instanceof Boolean) {
      object = object.valueOf();
      // Fall through to switch below.
    } else {
      this.serializeObject_(/** @type {!Object} */ (object), sb);
      return;
    }
  }

  switch (typeof object) {
    case 'string':
      this.serializeString_(object, sb);
      break;
    case 'number':
      this.serializeNumber_(object, sb);
      break;
    case 'boolean':
      sb.push(String(object));
      break;
    case 'function':
      sb.push('null');
      break;
    default:
      throw new Error('Unknown type: ' + typeof object);
  }
};


/**
 * Character mappings used internally for goog.string.quote
 * @private
 * @type {!Object}
 */
goog.json.Serializer.charToJsonCharCache_ = {
  '\"': '\\"',
  '\\': '\\\\',
  '/': '\\/',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',

  '\x0B': '\\u000b'  // '\v' is not supported in JScript
};


/**
 * Regular expression used to match characters that need to be replaced.
 * The S60 browser has a bug where unicode characters are not matched by
 * regular expressions. The condition below detects such behaviour and
 * adjusts the regular expression accordingly.
 * @private
 * @type {!RegExp}
 */
goog.json.Serializer.charsToReplace_ = /\uffff/.test('\uffff') ?
    /[\\\"\x00-\x1f\x7f-\uffff]/g :
    /[\\\"\x00-\x1f\x7f-\xff]/g;


/**
 * Serializes a string to a JSON string
 * @private
 * @param {string} s The string to serialize.
 * @param {Array<string>} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeString_ = function(s, sb) {
  'use strict';
  // The official JSON implementation does not work with international
  // characters.
  sb.push('"', s.replace(goog.json.Serializer.charsToReplace_, function(c) {
    'use strict';
    // caching the result improves performance by a factor 2-3
    let rv = goog.json.Serializer.charToJsonCharCache_[c];
    if (!rv) {
      rv = '\\u' + (c.charCodeAt(0) | 0x10000).toString(16).slice(1);
      goog.json.Serializer.charToJsonCharCache_[c] = rv;
    }
    return rv;
  }), '"');
};


/**
 * Serializes a number to a JSON string
 * @private
 * @param {number} n The number to serialize.
 * @param {Array<string>} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeNumber_ = function(n, sb) {
  'use strict';
  sb.push(isFinite(n) && !isNaN(n) ? String(n) : 'null');
};


/**
 * Serializes an array to a JSON string
 * @param {Array<string>} arr The array to serialize.
 * @param {Array<string>} sb Array used as a string builder.
 * @protected
 */
goog.json.Serializer.prototype.serializeArray = function(arr, sb) {
  'use strict';
  const l = arr.length;
  sb.push('[');
  let sep = '';
  for (let i = 0; i < l; i++) {
    sb.push(sep);

    const value = arr[i];
    this.serializeInternal(
        this.replacer_ ? this.replacer_.call(arr, String(i), value) : value,
        sb);

    sep = ',';
  }
  sb.push(']');
};


/**
 * Serializes an object to a JSON string
 * @private
 * @param {!Object} obj The object to serialize.
 * @param {Array<string>} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeObject_ = function(obj, sb) {
  'use strict';
  sb.push('{');
  let sep = '';
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Skip functions.
      if (typeof value != 'function') {
        sb.push(sep);
        this.serializeString_(key, sb);
        sb.push(':');

        this.serializeInternal(
            this.replacer_ ? this.replacer_.call(obj, key, value) : value, sb);

        sep = ',';
      }
    }
  }
  sb.push('}');
};

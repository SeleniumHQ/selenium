// Copyright 2006 Google Inc.
// All Rights Reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview JSON utility functions
 */



goog.provide('goog.json');
goog.provide('goog.json.Serializer');


/**
 * Tests if a string is an invalid JSON string. This only ensures that we are
 * not using any invalid characters
 * @param {string} s The string to test.
 * @return {boolean} True if the input is a valid JSON string.
 * @private
 */
goog.json.isValid_ = function(s) {
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

  // Parsing happens in three stages. In the first stage, we run the text
  // against regular expressions that look for non-JSON patterns. We are
  // especially concerned with '()' and 'new' because they can cause invocation,
  // and '=' because it can cause mutation. But just to be safe, we want to
  // reject all unexpected forms.

  // We split the first stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace all backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

  // Don't make these static since they have the global flag.
  var backslashesRe = /\\["\\\/bfnrtu]/g;
  var simpleValuesRe =
      /"[^"\\\n\r\u2028\u2029\x00-\x1f\x7f-\x9f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var openBracketsRe = /(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g;
  var remainderRe = /^[\],:{}\s\u2028\u2029]*$/;

  return remainderRe.test(s.replace(backslashesRe, '@').
      replace(simpleValuesRe, ']').
      replace(openBracketsRe, ''));
};


/**
 * Parses a JSON string and returns the result. This throws an exception if
 * the string is an invalid JSON string.
 *
 * If the user agent has built in support for parsing JSON (using
 * <code>String.prototype.parseJSON</code>) that will be used.
 *
 * Note that this is very slow on large strings. If you trust the source of
 * the string then you should use unsafeParse instead.
 *
 * @param {string} s The JSON string to parse.
 * @return {Object} The object generated from the JSON string.
 */
goog.json.parse = function(s) {
  s = String(s);
  if (typeof s.parseJSON == 'function') {
    return s.parseJSON();
  }
  if (goog.json.isValid_(s)) {
    /** @preserveTry */
    try {
      return eval('(' + s + ')');
    } catch (ex) {
    }
  }
  throw Error('Invalid JSON string: ' + s);
};


/**
 * Parses a JSON string and returns the result. This uses eval so it is open
 * to security issues and it should only be used if you trust the source.
 *
 * @param {string} s The JSON string to parse.
 * @return {Object} The object generated from the JSON string.
 */
goog.json.unsafeParse = function(s) {
  return eval('(' + s + ')');
};


/**
 * Instance of the serializer object.
 * @type {goog.json.Serializer}
 * @private
 */
goog.json.serializer_ = null;


/**
 * Serializes an object or a value to a JSON string.
 *
 * If the user agent has built in support for serializing JSON (using
 * <code>Object.prototype.toJSONString</code>) that will be used.
 *
 * @param {Object} object The object to serialize.
 * @throws Error if there are loops in the object graph.
 * @return {string} A JSON string representation of the input.
 */
goog.json.serialize = function(object) {
  if (!goog.json.serializer_) {
    goog.json.serializer_ = new goog.json.Serializer;
  }
  return goog.json.serializer_.serialize(object);
};



/**
 * Class that is used to serialize JSON objects to a string.
 * @constructor
 */
goog.json.Serializer = function() {
};


/**
 * Serializes an object or a value to a JSON string.
 *
 * If the user agent has built in support for serializing JSON (using
 * <code>Object.prototype.toJSONString</code>) that will be used.
 *
 * @param {Object?} object The object to serialize.
 * @throws Error if there are loops in the object graph.
 * @return {string} A JSON string representation of the input.
 */
goog.json.Serializer.prototype.serialize = function(object) {
  // null and undefined cannot have properties. (null == undefined)
  if (object != null && typeof object.toJSONString == 'function') {
    return object.toJSONString();
  }
  var sb = [];
  this.serialize_(object, sb);
  return sb.join('');
};


/**
 * Serializes a generic value to a JSON string
 * @private
 * @param {Object?} object The object to serialize.
 * @param {Array} sb Array used as a string builder.
 * @throws Error if there are loops in the object graph.
 */
goog.json.Serializer.prototype.serialize_ = function(object, sb) {
  switch (typeof object) {
    case 'string':
      this.serializeString_(object, sb);
      break;
    case 'number':
      this.serializeNumber_(object, sb);
      break;
    case 'boolean':
      sb.push(object);
      break;
    case 'undefined':
      sb.push('null');
      break;
    case 'object':
      if (object == null) {
        sb.push('null');
        break;
      }
      if (goog.isArray(object)) {
        this.serializeArray_(object, sb);
        break;
      }
      // should we allow new String, new Number and new Boolean to be treated
      // as string, number and boolean? Most implementations do not and the
      // need is not very big
      this.serializeObject_(object, sb);
      break;
    default:
      throw Error('Unknown type: ' + typeof object);
  }
};


/**
 * Character mappings used internally for goog.string.quote
 * @private
 * @type {Object}
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

  '\x0B': '\\u000b' // '\v' is not supported in JScript
};


/**
 * Serializes a string to a JSON string
 * @private
 * @param {string} s The string to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeString_ = function(s, sb) {
  // The official JSON implementation does not work with international
  // characters.
  sb.push('"', s.replace(/[\\\"\x00-\x1f\x80-\uffff]/g, function(c) {
    // caching the result improves performance by a factor 2-3
    if (c in goog.json.Serializer.charToJsonCharCache_) {
      return goog.json.Serializer.charToJsonCharCache_[c];
    }

    var cc = c.charCodeAt(0);
    var rv = '\\u';
    if (cc < 16) {
      rv += '000';
    } else if (cc < 256) {
      rv += '00';
    } else if (cc < 4096) { // \u1000
      rv += '0';
    }
    return goog.json.Serializer.charToJsonCharCache_[c] = rv + cc.toString(16);
  }), '"');
};


/**
 * Serializes a number to a JSON string
 * @private
 * @param {number} n The number to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeNumber_ = function(n, sb) {
  sb.push(isFinite(n) && !isNaN(n) ? n : 'null');
};


/**
 * Serializes an array to a JSON string
 * @private
 * @param {Array} arr The array to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeArray_ = function(arr, sb) {
  var l = arr.length;
  sb.push('[');
  var sep = '';
  for (var i = 0; i < l; i++) {
    sb.push(sep)
    this.serialize_(arr[i], sb);
    sep = ',';
  }
  sb.push(']');
};


/**
 * Serializes an object to a JSON string
 * @private
 * @param {Object} obj The object to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeObject_ = function(obj, sb) {
  sb.push('{');
  var sep = '';
  for (var key in obj) {
    sb.push(sep);
    this.serializeString_(key, sb);
    sb.push(':');
    this.serialize_(obj[key], sb);
    sep = ',';
  }
  sb.push('}');
};

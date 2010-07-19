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
 * @fileoverview Utility for fast string concatenation.
*
 */

goog.provide('goog.string.StringBuffer');

goog.require('goog.userAgent.jscript');

/**
 * Utility class to facilitate much faster string concatenation in IE,
 * using Array.join() rather than the '+' operator.  For other browsers
 * we simply use the '+' operator.
 *
 * @param {Object|number|string|boolean=} opt_a1 Optional first initial item
 *     to append.
 * @param {...Object|number|string|boolean} var_args Other initial items to
 *     append, e.g., new goog.string.StringBuffer('foo', 'bar').
 * @constructor
 */
goog.string.StringBuffer = function(opt_a1, var_args) {
  /**
   * Internal buffer for the string to be concatenated.
   * @type {string|Array}
   * @private
   */
  this.buffer_ = goog.userAgent.jscript.HAS_JSCRIPT ? [] : '';

  if (opt_a1 != null) {
    this.append.apply(this, arguments);
  }
};


/**
 * Sets the contents of the string buffer object, replacing what's currently
 * there.
 *
 * @param {string} s String to set.
 */
goog.string.StringBuffer.prototype.set = function(s) {
  this.clear();
  this.append(s);
};


if (goog.userAgent.jscript.HAS_JSCRIPT) {
  /**
   * Length of internal buffer (faster than calling buffer_.length).
   * Only used if buffer_ is an array.
   * @type {number}
   * @private
   */
  goog.string.StringBuffer.prototype.bufferLength_ = 0;

  /**
   * Appends one or more items to the buffer.
   *
   * Calling this with null, undefined, or empty arguments is an error.
   *
   * @param {Object|number|string|boolean} a1 Required first string.
   * @param {Object|number|string|boolean=} opt_a2 Optional second string.
   * @param {...Object|number|string|boolean} var_args Other items to append,
   *     e.g., sb.append('foo', 'bar', 'baz').
   * @return {goog.string.StringBuffer} This same StringBuffer object.
   */
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    // IE version.

    if (opt_a2 == null) { // second argument is undefined (null == undefined)
      // Array assignment is 2x faster than Array push.  Also, use a1
      // directly to avoid arguments instantiation, another 2x improvement.
      this.buffer_[this.bufferLength_++] = a1;
    } else {
      this.buffer_.push.apply(/** @type {Array} */ (this.buffer_), arguments);
      this.bufferLength_ = this.buffer_.length;
    }
    return this;
  };
} else {

  /**
   * Appends one or more items to the buffer.
   *
   * Calling this with null, undefined, or empty arguments is an error.
   *
   * @param {Object|number|string|boolean} a1 Required first string.
   * @param {Object|number|string|boolean=} opt_a2 Optional second string.
   * @param {...Object|number|string|boolean} var_args Other items to append,
   *     e.g., sb.append('foo', 'bar', 'baz').
   * @return {goog.string.StringBuffer} This same StringBuffer object.
   * @suppress {duplicate}
   */
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    // W3 version.

    // Use a1 directly to avoid arguments instantiation for single-arg case.
    this.buffer_ += a1;
    if (opt_a2 != null) { // second argument is undefined (null == undefined)
      for (var i = 1; i < arguments.length; i++) {
        this.buffer_ += arguments[i];
      }
    }
    return this;
  };
}


/**
 * Clears the internal buffer.
 */
goog.string.StringBuffer.prototype.clear = function() {
  if (goog.userAgent.jscript.HAS_JSCRIPT) {
     this.buffer_.length = 0;  // Reuse the array to avoid creating new object.
     this.bufferLength_ = 0;
   } else {
     this.buffer_ = '';
   }
};


/**
 * Returns the length of the current contents of the buffer.  In IE, this is
 * O(n) where n = number of appends, so to avoid quadratic behavior, do not call
 * this after every append.
 *
 * @return {number} the length of the current contents of the buffer.
 */
goog.string.StringBuffer.prototype.getLength = function() {
   return this.toString().length;
};


/**
 * Returns the concatenated string.
 *
 * @return {string} The concatenated string.
 */
goog.string.StringBuffer.prototype.toString = function() {
  if (goog.userAgent.jscript.HAS_JSCRIPT) {
    var str = this.buffer_.join('');
    // Given a string with the entire contents, simplify the StringBuffer by
    // setting its contents to only be this string, rather than many fragments.
    this.clear();
    if (str) {
      this.append(str);
    }
    return str;
  } else {
    return /** @type {string} */ (this.buffer_);
  }
};

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview The decompressor for Base88 compressed character lists.
 *
 * The compression is by base 88 encoding the delta between two adjacent
 * characters in ths list. The deltas can be positive or negative. Also, there
 * would be character ranges. These three types of values
 * are given enum values 0, 1 and 2 respectively. Initial 3 bits are used for
 * encoding the type and total length of the encoded value. Length enums 0, 1
 * and 2 represents lengths 1, 2 and 4. So (value * 8 + type * 3 + length enum)
 * is encoded in base 88 by following characters for numbers from 0 to 87:
 * 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ (continued in next line)
 * abcdefghijklmnopqrstuvwxyz!#$%()*+,-.:;<=>?@[]^_`{|}~
 *
 * Value uses 0 based counting. That is value for the range [a, b] is 0 and
 * that of [a, c] is 1. Simillarly, the delta of "ab" is 0.
 *
 * Following python script can be used to compress character lists taken
 * standard input: http://go/charlistcompressor.py
 *
 */

goog.provide('goog.i18n.CharListDecompressor');

goog.require('goog.array');
goog.require('goog.i18n.uChar');



/**
 * Class to decompress base88 compressed character list.
 * @constructor
 * @final
 */
goog.i18n.CharListDecompressor = function() {
  this.buildCharMap_('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr' +
      'stuvwxyz!#$%()*+,-.:;<=>?@[]^_`{|}~');
};


/**
 * 1-1 mapping from ascii characters used in encoding to an integer in the
 * range 0 to 87.
 * @type {Object}
 * @private
 */
goog.i18n.CharListDecompressor.prototype.charMap_ = null;


/**
 * Builds the map from ascii characters used for the base88 scheme to number
 * each character represents.
 * @param {string} str The string of characters used in base88 scheme.
 * @private
 */
goog.i18n.CharListDecompressor.prototype.buildCharMap_ = function(str) {
  if (!this.charMap_) {
    this.charMap_ = {};
    for (var i = 0; i < str.length; i++) {
      this.charMap_[str.charAt(i)] = i;
    }
  }
};


/**
 * Gets the number encoded in base88 scheme by a substring of given length
 * and placed at the a given position of the string.
 * @param {string} str String containing sequence of characters encoding a
 *     number in base 88 scheme.
 * @param {number} start Starting position of substring encoding the number.
 * @param {number} leng Length of the substring encoding the number.
 * @return {number} The encoded number.
 * @private
 */
goog.i18n.CharListDecompressor.prototype.getCodeAt_ = function(str, start,
    leng) {
  var result = 0;
  for (var i = 0; i < leng; i++) {
    var c = this.charMap_[str.charAt(start + i)];
    result += c * Math.pow(88, i);
  }
  return result;
};


/**
 * Add character(s) specified by the value and type to given list and return
 * the next character in the sequence.
 * @param {Array<string>} list The list of characters to which the specified
 *     characters are appended.
 * @param {number} lastcode The last codepoint that was added to the list.
 * @param {number} value The value component that representing the delta or
 *      range.
 * @param {number} type The type component that representing whether the value
 *      is a positive or negative delta or range.
 * @return {number} Last codepoint that is added to the list.
 * @private
 */
goog.i18n.CharListDecompressor.prototype.addChars_ = function(list, lastcode,
    value, type) {
   if (type == 0) {
     lastcode += value + 1;
     goog.array.extend(list, goog.i18n.uChar.fromCharCode(lastcode));
   } else if (type == 1) {
     lastcode -= value + 1;
     goog.array.extend(list, goog.i18n.uChar.fromCharCode(lastcode));
   } else if (type == 2) {
     for (var i = 0; i <= value; i++) {
       lastcode++;
       goog.array.extend(list, goog.i18n.uChar.fromCharCode(lastcode));
     }
   }
  return lastcode;
};


/**
 * Gets the list of characters specified in the given string by base 88 scheme.
 * @param {string} str The string encoding character list.
 * @return {!Array<string>} The list of characters specified by the given
 *     string in base 88 scheme.
 */
goog.i18n.CharListDecompressor.prototype.toCharList = function(str) {
  var metasize = 8;
  var result = [];
  var lastcode = 0;
  var i = 0;
  while (i < str.length) {
    var c = this.charMap_[str.charAt(i)];
    var meta = c % metasize;
    var type = Math.floor(meta / 3);
    var leng = (meta % 3) + 1;
    if (leng == 3) {
      leng++;
    }
    var code = this.getCodeAt_(str, i, leng);
    var value = Math.floor(code / metasize);
    lastcode = this.addChars_(result, lastcode, value, type);

    i += leng;
  }
  return result;
};


// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Functions for encoding strings according to MIME
 * standards, especially RFC 1522.
 */
goog.provide('goog.i18n.mime');
goog.provide('goog.i18n.mime.encode');

goog.require('goog.array');


/**
 * Regular expression for matching those characters that are outside the
 * range that can be used in the quoted-printable encoding of RFC 1522:
 * anything outside the 7-bit ASCII encoding, plus ?, =, _ or space.
 * @type {RegExp}
 * @private
 */
goog.i18n.mime.NONASCII_ = /[^!-<>@-^`-~]/g;


/**
 * Like goog.i18n.NONASCII_ but also omits double-quotes.
 * @type {RegExp}
 * @private
 */
goog.i18n.mime.NONASCII_NOQUOTE_ = /[^!#-<>@-^`-~]/g;


/**
 * Encodes a string for inclusion in a MIME header. The string is encoded
 * in UTF-8 according to RFC 1522, using quoted-printable form.
 * @param {string} str The string to encode.
 * @param {boolean=} opt_noquote Whether double-quote characters should also
 *     be escaped (should be true if the result will be placed inside a
 *     quoted string for a parameter value in a MIME header).
 * @return {string} The encoded string.
 */
goog.i18n.mime.encode = function(str, opt_noquote) {
  var nonascii =
      opt_noquote ? goog.i18n.mime.NONASCII_NOQUOTE_ : goog.i18n.mime.NONASCII_;

  if (str.search(nonascii) >= 0) {
    str = '=?UTF-8?Q?' +
        str.replace(
            nonascii,
            /**
             * @param {string} c The matched char.
             * @return {string} The quoted-printable form of utf-8 encoding.
             */
            function(c) {
              var i = c.charCodeAt(0);
              if (i == 32) {
                // Special case for space, which can be encoded as _ not =20
                return '_';
              }
              var a = goog.array.concat('', goog.i18n.mime.getHexCharArray(c));
              return a.join('=');
            }) +
        '?=';
  }
  return str;
};


/**
 * Get an array of UTF-8 hex codes for a given character.
 * @param {string} c The matched character.
 * @return {!Array<string>} A hex array representing the character.
 */
goog.i18n.mime.getHexCharArray = function(c) {
  var i = c.charCodeAt(0);
  var a = [];
  // First convert the UCS-2 character into its UTF-8 bytes
  if (i < 128) {
    a.push(i);
  } else if (i <= 0x7ff) {
    a.push(0xc0 + ((i >> 6) & 0x3f), 0x80 + (i & 0x3f));
  } else if (i <= 0xffff) {
    a.push(
        0xe0 + ((i >> 12) & 0x3f), 0x80 + ((i >> 6) & 0x3f), 0x80 + (i & 0x3f));
  } else {
    // (This is defensive programming, since ecmascript isn't supposed
    // to handle code points that take more than 16 bits.)
    a.push(
        0xf0 + ((i >> 18) & 0x3f), 0x80 + ((i >> 12) & 0x3f),
        0x80 + ((i >> 6) & 0x3f), 0x80 + (i & 0x3f));
  }
  // Now convert those bytes into hex strings (don't do anything with
  // a[0] as that's got the empty string that lets us use join())
  for (i = a.length - 1; i >= 0; --i) {
    a[i] = a[i].toString(16);
  }
  return a;
};

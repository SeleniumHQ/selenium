// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview ARC4 streamcipher implementation.  A description of the
 * algorithm can be found at:
 * http://www.mozilla.org/projects/security/pki/nss/draft-kaukonen-cipher-arcfour-03.txt.
 *
 * Usage:
 * <code>
 *   var arc4 = new goog.crypt.Arc4();
 *   arc4.setKey(key);
 *   arc4.discard(1536);
 *   arc4.crypt(bytes);
 * </code>
 *
 * Note: For converting between strings and byte arrays, goog.crypt.base64 may
 * be useful.
 *
 */

goog.provide('goog.crypt.Arc4');

goog.require('goog.asserts');



/**
 * ARC4 streamcipher implementation.
 * @constructor
 */
goog.crypt.Arc4 = function() {
  /**
   * A permutation of all 256 possible bytes.
   * @type {Array.<number>}
   * @private
   */
  this.state_ = [];

  /**
   * 8 bit index pointer into this.state_.
   * @type {number}
   * @private
   */
  this.index1_ = 0;

  /**
   * 8 bit index pointer into this.state_.
   * @type {number}
   * @private
   */
  this.index2_ = 0;
};


/**
 * Initialize the cipher for use with new key.
 * @param {Array.<number>} key A byte array containing the key.
 * @param {number=} opt_length Indicates # of bytes to take from the key.
 */
goog.crypt.Arc4.prototype.setKey = function(key, opt_length) {
  goog.asserts.assertArray(key, 'Key parameter must be a byte array');

  if (!opt_length) {
    opt_length = key.length;
  }

  var state = this.state_;

  for (var i = 0; i < 256; ++i) {
    state[i] = i;
  }

  var j = 0;
  for (var i = 0; i < 256; ++i) {
    j = (j + state[i] + key[i % opt_length]) & 255;

    var tmp = state[i];
    state[i] = state[j];
    state[j] = tmp;
  }

  this.index1_ = 0;
  this.index2_ = 0;
};


/**
 * Discards n bytes of the keystream.
 * These days 1536 is considered a decent amount to drop to get the key state
 * warmed-up enough for secure usage. This is not done in the constructor to
 * preserve efficiency for use cases that do not need this.
 * NOTE: Discard is identical to crypt without actually xoring any data. It's
 * unfortunate to have this code duplicated, but this was done for performance
 * reasons. Alternatives which were attempted:
 * 1. Create a temp array of the correct length and pass it to crypt. This
 *    works but needlessly allocates an array. But more importantly this
 *    requires choosing an array type (Array or Uint8Array) in discard, and
 *    choosing a different type than will be passed to crypt by the client
 *    code hurts the javascript engines ability to optimize crypt (7x hit in
 *    v8).
 * 2. Make data option in crypt so discard can pass null, this has a huge
 *    perf hit for crypt.
 * @param {number} length Number of bytes to disregard from the stream.
 */
goog.crypt.Arc4.prototype.discard = function(length) {
  var i = this.index1_;
  var j = this.index2_;
  var state = this.state_;

  for (var n = 0; n < length; ++n) {
    i = (i + 1) & 255;
    j = (j + state[i]) & 255;

    var tmp = state[i];
    state[i] = state[j];
    state[j] = tmp;
  }

  this.index1_ = i;
  this.index2_ = j;
};


/**
 * En- or decrypt (same operation for streamciphers like ARC4)
 * @param {Array.<number>|Uint8Array} data The data to be xor-ed in place.
 * @param {number=} opt_length The number of bytes to crypt.
 */
goog.crypt.Arc4.prototype.crypt = function(data, opt_length) {
  if (!opt_length) {
    opt_length = data.length;
  }
  var i = this.index1_;
  var j = this.index2_;
  var state = this.state_;

  for (var n = 0; n < opt_length; ++n) {
    i = (i + 1) & 255;
    j = (j + state[i]) & 255;

    var tmp = state[i];
    state[i] = state[j];
    state[j] = tmp;

    data[n] ^= state[(state[i] + state[j]) & 255];
  }

  this.index1_ = i;
  this.index2_ = j;
};

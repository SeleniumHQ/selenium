// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Implementation of HMAC in JavaScript.
 *
 * Usage:
 *   var hmac = new goog.crypt.Hmac(new goog.crypt.sha1(), key, 64);
 *   var digest = hmac.getHmac(bytes);
 *
 */


goog.provide('goog.crypt.Hmac');

goog.require('goog.crypt.Hash');



/**
 * @constructor
 * @param {!goog.crypt.Hash} hasher An object to serve as a hash function.
 * @param {Array.<number>} key The secret key to use to calculate the hmac.
 *     Should be an array of not more than {@code blockSize} integers in
       {0, 255}.
 * @param {number=} opt_blockSize Optional. The block size {@code hasher} uses.
 *     If not specified, uses the block size from the hasher, or 16 if it is
 *     not specified.
 * @extends {goog.crypt.Hash}
 * @final
 * @struct
 */
goog.crypt.Hmac = function(hasher, key, opt_blockSize) {
  goog.crypt.Hmac.base(this, 'constructor');

  /**
   * The underlying hasher to calculate hash.
   *
   * @type {!goog.crypt.Hash}
   * @private
   */
  this.hasher_ = hasher;

  this.blockSize = opt_blockSize || hasher.blockSize || 16;

  /**
   * The outer padding array of hmac
   *
   * @type {!Array.<number>}
   * @private
   */
  this.keyO_ = new Array(this.blockSize);

  /**
   * The inner padding array of hmac
   *
   * @type {!Array.<number>}
   * @private
   */
  this.keyI_ = new Array(this.blockSize);

  this.initialize_(key);
};
goog.inherits(goog.crypt.Hmac, goog.crypt.Hash);


/**
 * Outer padding byte of HMAC algorith, per http://en.wikipedia.org/wiki/HMAC
 *
 * @type {number}
 * @private
 */
goog.crypt.Hmac.OPAD_ = 0x5c;


/**
 * Inner padding byte of HMAC algorith, per http://en.wikipedia.org/wiki/HMAC
 *
 * @type {number}
 * @private
 */
goog.crypt.Hmac.IPAD_ = 0x36;


/**
 * Initializes Hmac by precalculating the inner and outer paddings.
 *
 * @param {Array.<number>} key The secret key to use to calculate the hmac.
 *     Should be an array of not more than {@code blockSize} integers in
       {0, 255}.
 * @private
 */
goog.crypt.Hmac.prototype.initialize_ = function(key) {
  if (key.length > this.blockSize) {
    this.hasher_.update(key);
    key = this.hasher_.digest();
    this.hasher_.reset();
  }
  // Precalculate padded and xor'd keys.
  var keyByte;
  for (var i = 0; i < this.blockSize; i++) {
    if (i < key.length) {
      keyByte = key[i];
    } else {
      keyByte = 0;
    }
    this.keyO_[i] = keyByte ^ goog.crypt.Hmac.OPAD_;
    this.keyI_[i] = keyByte ^ goog.crypt.Hmac.IPAD_;
  }
  // Be ready for an immediate update.
  this.hasher_.update(this.keyI_);
};


/** @override */
goog.crypt.Hmac.prototype.reset = function() {
  this.hasher_.reset();
  this.hasher_.update(this.keyI_);
};


/** @override */
goog.crypt.Hmac.prototype.update = function(bytes, opt_length) {
  this.hasher_.update(bytes, opt_length);
};


/** @override */
goog.crypt.Hmac.prototype.digest = function() {
  var temp = this.hasher_.digest();
  this.hasher_.reset();
  this.hasher_.update(this.keyO_);
  this.hasher_.update(temp);
  return this.hasher_.digest();
};


/**
 * Calculates an HMAC for a given message.
 *
 * @param {Array.<number>} message  An array of integers in {0, 255}.
 * @return {!Array.<number>} the digest of the given message.
 */
goog.crypt.Hmac.prototype.getHmac = function(message) {
  this.reset();
  this.update(message);
  return this.digest();
};

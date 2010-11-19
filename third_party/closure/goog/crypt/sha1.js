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
 * @fileoverview SHA-1 cryptographic hash.
 * Variable names follow the notation in FIPS PUB 180-3:
 * http://csrc.nist.gov/publications/fips/fips180-3/fips180-3_final.pdf.
 *
 * Usage:
 *   var sha1 = new goog.crypt.sha1();
 *   sha1.update(bytes);
 *   var hash = sha1.digest();
 *
 */

goog.provide('goog.crypt.Sha1');



/**
 * SHA-1 cryptographic hash constructor.
 *
 * The properties declared here are discussed in the above algorithm document.
 * @constructor
 */
goog.crypt.Sha1 = function() {
  /**
   * Holds the previous values of accumulated variables a-e in the compress_
   * function.
   * @type {Array.<number>}
   * @private
   */
  this.chain_ = [];

  /**
   * A buffer holding the partially computed hash result.
   * @type {Array.<number>}
   * @private
   */
  this.buf_ = [];

  /**
   * An array of 80 bytes, each a part of the message to be hashed.  Referred to
   * as the message schedule in the docs.
   * @type {Array.<number>}
   * @private
   */
  this.W_ = [];

  /**
   * Contains data needed to pad messages less than 64 bytes.
   * @type {Array.<number>}
   * @private
   */
  this.pad_ = [];

  this.pad_[0] = 128;
  for (var i = 1; i < 64; ++i) {
    this.pad_[i] = 0;
  }

  this.reset();
};


/**
 * Resets the internal accumulator.
 */
goog.crypt.Sha1.prototype.reset = function() {
  this.chain_[0] = 0x67452301;
  this.chain_[1] = 0xefcdab89;
  this.chain_[2] = 0x98badcfe;
  this.chain_[3] = 0x10325476;
  this.chain_[4] = 0xc3d2e1f0;

  this.inbuf_ = 0;
  this.total_ = 0;
};


/**
 * Internal helper performing 32 bit left rotate.
 * @param {number} w 32-bit integer to rotate.
 * @param {number} r Bits to rotate left by.
 * @return {number} w rotated left by r bits.
 * @private
 */
goog.crypt.Sha1.prototype.rotl_ = function(w, r) {
  return ((w << r) | (w >>> (32 - r))) & 0xffffffff;
};


/**
 * Internal compress helper function.
 * @param {Array} buf containing block to compress.
 * @private
 */
goog.crypt.Sha1.prototype.compress_ = function(buf) {
  var W = this.W_;

  // get 16 big endian words
  for (var i = 0; i < 64; i += 4) {
    var w = (buf[i] << 24) |
            (buf[i + 1] << 16) |
            (buf[i + 2] << 8) |
            (buf[i + 3]);
    W[i / 4] = w;
  }

  // expand to 80 words
  for (var i = 16; i < 80; i++) {
    W[i] = this.rotl_(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
  }

  var a = this.chain_[0];
  var b = this.chain_[1];
  var c = this.chain_[2];
  var d = this.chain_[3];
  var e = this.chain_[4];
  var f, k;

  for (var i = 0; i < 80; i++) {
    if (i < 40) {
      if (i < 20) {
        f = d ^ (b & (c ^ d));
        k = 0x5a827999;
      } else {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      }
    } else {
      if (i < 60) {
        f = (b & c) | (d & (b | c));
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
    }

    var t = (this.rotl_(a, 5) + f + e + k + W[i]) & 0xffffffff;
    e = d;
    d = c;
    c = this.rotl_(b, 30);
    b = a;
    a = t;
  }

  this.chain_[0] = (this.chain_[0] + a) & 0xffffffff;
  this.chain_[1] = (this.chain_[1] + b) & 0xffffffff;
  this.chain_[2] = (this.chain_[2] + c) & 0xffffffff;
  this.chain_[3] = (this.chain_[3] + d) & 0xffffffff;
  this.chain_[4] = (this.chain_[4] + e) & 0xffffffff;
};


/**
 * Adds a byte array to internal accumulator.
 * @param {Array.<number>} bytes to add to digest.
 * @param {number=} opt_length is # of bytes to compress.
 */
goog.crypt.Sha1.prototype.update = function(bytes, opt_length) {
  if (!opt_length) {
    opt_length = bytes.length;
  }

  var n = 0;

  // Optimize for 64 byte chunks at 64 byte boundaries.
  if (this.inbuf_ == 0) {
    while (n + 64 < opt_length) {
      this.compress_(bytes.slice(n, n + 64));
      n += 64;
      this.total_ += 64;
    }
  }

  while (n < opt_length) {
    this.buf_[this.inbuf_++] = bytes[n++];
    this.total_++;

    if (this.inbuf_ == 64) {
      this.inbuf_ = 0;
      this.compress_(this.buf_);

      // Pick up 64 byte chunks.
      while (n + 64 < opt_length) {
        this.compress_(bytes.slice(n, n + 64));
        n += 64;
        this.total_ += 64;
      }
    }
  }
};


/**
 * @return {Array} byte[20] containing finalized hash.
 */
goog.crypt.Sha1.prototype.digest = function() {
  var digest = [];
  var totalBits = this.total_ * 8;

  // Add pad 0x80 0x00*.
  if (this.inbuf_ < 56) {
    this.update(this.pad_, 56 - this.inbuf_);
  } else {
    this.update(this.pad_, 64 - (this.inbuf_ - 56));
  }

  // Add # bits.
  for (var i = 63; i >= 56; i--) {
    this.buf_[i] = totalBits & 255;
    totalBits >>>= 8;
  }

  this.compress_(this.buf_);

  var n = 0;
  for (var i = 0; i < 5; i++) {
    for (var j = 24; j >= 0; j -= 8) {
      digest[n++] = (this.chain_[i] >> j) & 255;
    }
  }

  return digest;
};

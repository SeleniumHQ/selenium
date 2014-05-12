// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Base class for SHA-2 cryptographic hash.
 *
 * Variable names follow the notation in FIPS PUB 180-3:
 * http://csrc.nist.gov/publications/fips/fips180-3/fips180-3_final.pdf.
 *
 * To implement specific SHA-2 such as SHA-256, create a sub-class with
 * overridded reset(). See sha256.js for an example.
 *
 * TODO(user): SHA-512/384 are not currently implemented. Could be added
 * if needed.
 *
 * Some code similar to SHA1 are borrowed from sha1.js written by mschilder@.
 *
 */

goog.provide('goog.crypt.Sha2');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.crypt.Hash');



/**
 * SHA-2 cryptographic hash constructor.
 * This constructor should not be used directly to create the object. Rather,
 * one should use the constructor of the sub-classes.
 * @constructor
 * @extends {goog.crypt.Hash}
 */
goog.crypt.Sha2 = function() {
  goog.base(this);

  /**
   * A chunk holding the currently processed message bytes. Once the chunk has
   * 64 bytes, we feed it into computeChunk_ function and reset this.chunk_.
   * Sub-class needs to reset it when overriding reset().
   * @type {!Array.<number>}
   * @protected
   */
  this.chunk = [];

  /**
   * Current number of bytes in this.chunk_.
   * Sub-class needs to reset it when overriding reset().
   * @type {number}
   * @protected
   */
  this.inChunk = 0;

  /**
   * Total number of bytes in currently processed message.
   * Sub-class needs to reset it when overriding reset().
   * @type {number}
   * @protected
   */
  this.total = 0;

  /**
   * Contains data needed to pad messages less than 64 bytes.
   * @type {!Array.<number>}
   * @private
   */
  this.pad_ = goog.array.repeat(0, 64);
  this.pad_[0] = 128;

  /**
   * Holds the previous values of accumulated hash a-h in the computeChunk_
   * function.
   * It is a subclass-dependent value. Sub-class needs to explicitly set it
   * when overriding reset().
   * @type {!Array.<number>}
   * @protected
   */
  this.hash = [];

  /**
   * The number of output hash blocks (each block is 4 bytes long).
   * It is a subclass-dependent value. Sub-class needs to explicitly set it
   * when overriding reset().
   * @type {number}
   * @protected
   */
  this.numHashBlocks = 0;

  this.reset();
};
goog.inherits(goog.crypt.Sha2, goog.crypt.Hash);


/** @override */
goog.crypt.Sha2.prototype.reset = goog.abstractMethod;


/**
 * Helper function to compute the hashes for a given 512-bit message chunk.
 * @param {!Array.<number>} chunk A 512-bit message chunk to be processed.
 * @private
 */
goog.crypt.Sha2.prototype.computeChunk_ = function(chunk) {
  goog.asserts.assert(chunk.length == 64);

  // Divide the chunk into 16 32-bit-words.
  var w = [];
  var index = 0;
  var offset = 0;
  while (offset < chunk.length) {
    w[index++] = (chunk[offset] << 24) |
                 (chunk[offset + 1] << 16) |
                 (chunk[offset + 2] << 8) |
                 (chunk[offset + 3]);
    offset = index * 4;
  }

  // Expand to 64 32-bit-words
  for (var i = 16; i < 64; i++) {
    var s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^
             ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^
             (w[i - 15] >>> 3);
    var s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^
             ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^
             (w[i - 2] >>> 10);
    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) & 0xffffffff;
  }

  var a = this.hash[0];
  var b = this.hash[1];
  var c = this.hash[2];
  var d = this.hash[3];
  var e = this.hash[4];
  var f = this.hash[5];
  var g = this.hash[6];
  var h = this.hash[7];

  for (var i = 0; i < 64; i++) {
    var S0 = ((a >>> 2) | (a << 30)) ^
             ((a >>> 13) | (a << 19)) ^
             ((a >>> 22) | (a << 10));
    var maj = ((a & b) ^ (a & c) ^ (b & c));
    var t2 = (S0 + maj) & 0xffffffff;
    var S1 = ((e >>> 6) | (e << 26)) ^
             ((e >>> 11) | (e << 21)) ^
             ((e >>> 25) | (e << 7));
    var ch = ((e & f) ^ ((~ e) & g));
    var t1 = (h + S1 + ch + this.K_[i] + w[i]) & 0xffffffff;

    h = g;
    g = f;
    f = e;
    e = (d + t1) & 0xffffffff;
    d = c;
    c = b;
    b = a;
    a = (t1 + t2) & 0xffffffff;
  }

  this.hash[0] = (this.hash[0] + a) & 0xffffffff;
  this.hash[1] = (this.hash[1] + b) & 0xffffffff;
  this.hash[2] = (this.hash[2] + c) & 0xffffffff;
  this.hash[3] = (this.hash[3] + d) & 0xffffffff;
  this.hash[4] = (this.hash[4] + e) & 0xffffffff;
  this.hash[5] = (this.hash[5] + f) & 0xffffffff;
  this.hash[6] = (this.hash[6] + g) & 0xffffffff;
  this.hash[7] = (this.hash[7] + h) & 0xffffffff;
};


/** @override */
goog.crypt.Sha2.prototype.update = function(message, opt_length) {
  if (!goog.isDef(opt_length)) {
    opt_length = message.length;
  }
  // Process the message from left to right up to |opt_length| bytes.
  // When we get a 512-bit chunk, compute the hash of it and reset
  // this.chunk_. The message might not be multiple of 512 bits so we
  // might end up with a chunk that is less than 512 bits. We store
  // such partial chunk in this.chunk_ and it will be filled up later
  // in digest().
  var n = 0;
  var inChunk = this.inChunk;

  // The input message could be either byte array of string.
  if (goog.isString(message)) {
    while (n < opt_length) {
      this.chunk[inChunk++] = message.charCodeAt(n++);
      if (inChunk == 64) {
        this.computeChunk_(this.chunk);
        inChunk = 0;
      }
    }
  } else {
    while (n < opt_length) {
      this.chunk[inChunk++] = message[n++];
      if (inChunk == 64) {
        this.computeChunk_(this.chunk);
        inChunk = 0;
      }
    }
  }

  // Record the current bytes in chunk to support partial update.
  this.inChunk = inChunk;

  // Record total message bytes we have processed so far.
  this.total += opt_length;
};


/** @override */
goog.crypt.Sha2.prototype.digest = function() {
  var digest = [];
  var totalBits = this.total * 8;

  // Append pad 0x80 0x00*.
  if (this.inChunk < 56) {
    this.update(this.pad_, 56 - this.inChunk);
  } else {
    this.update(this.pad_, 64 - (this.inChunk - 56));
  }

  // Append # bits in the 64-bit big-endian format.
  for (var i = 63; i >= 56; i--) {
    this.chunk[i] = totalBits & 255;
    totalBits /= 256; // Don't use bit-shifting here!
  }
  this.computeChunk_(this.chunk);

  // Finally, output the result digest.
  var n = 0;
  for (var i = 0; i < this.numHashBlocks; i++) {
    for (var j = 24; j >= 0; j -= 8) {
      digest[n++] = ((this.hash[i] >> j) & 255);
    }
  }
  return digest;
};


/**
 * Constants used in SHA-2.
 * @const
 * @private
 */
goog.crypt.Sha2.prototype.K_ = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

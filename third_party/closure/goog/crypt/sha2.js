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
 * @param {number} numHashBlocks The size of output in 16-byte blocks.
 * @param {!Array<number>} initHashBlocks The hash-specific initialization
 * @constructor
 * @extends {goog.crypt.Hash}
 * @struct
 */
goog.crypt.Sha2 = function(numHashBlocks, initHashBlocks) {
  goog.crypt.Sha2.base(this, 'constructor');

  this.blockSize = goog.crypt.Sha2.BLOCKSIZE_;

  /**
   * A chunk holding the currently processed message bytes. Once the chunk has
   * 64 bytes, we feed it into computeChunk_ function and reset this.chunk_.
   * @private {!Array<number>|!Uint8Array}
   */
  this.chunk_ = goog.global['Uint8Array'] ?
      new Uint8Array(this.blockSize) : new Array(this.blockSize);

  /**
   * Current number of bytes in this.chunk_.
   * @private {number}
   */
  this.inChunk_ = 0;

  /**
   * Total number of bytes in currently processed message.
   * @private {number}
   */
  this.total_ = 0;


  /**
   * Holds the previous values of accumulated hash a-h in the computeChunk_
   * function.
   * @private {!Array<number>|!Int32Array}
   */
  this.hash_ = [];

  /**
   * The number of output hash blocks (each block is 4 bytes long).
   * @private {number}
   */
  this.numHashBlocks_ = numHashBlocks;

  /**
   * @private {!Array<number>} initHashBlocks
   */
  this.initHashBlocks_ = initHashBlocks;

  /**
   * Temporary array used in chunk computation.  Allocate here as a
   * member rather than as a local within computeChunk_() as a
   * performance optimization to reduce the number of allocations and
   * reduce garbage collection.
   * @private {!Int32Array|!Array<number>}
   */
  this.w_ = goog.global['Int32Array'] ? new Int32Array(64) : new Array(64);

  if (!goog.isDef(goog.crypt.Sha2.Kx_)) {
    // This is the first time this constructor has been called.
    if (goog.global['Int32Array']) {
      // Typed arrays exist
      goog.crypt.Sha2.Kx_ = new Int32Array(goog.crypt.Sha2.K_);
    } else {
      // Typed arrays do not exist
      goog.crypt.Sha2.Kx_ = goog.crypt.Sha2.K_;
    }
  }

  this.reset();
};
goog.inherits(goog.crypt.Sha2, goog.crypt.Hash);


/**
 * The block size
 * @private {number}
 */
goog.crypt.Sha2.BLOCKSIZE_ = 512 / 8;


/**
 * Contains data needed to pad messages less than BLOCK_SIZE_ bytes.
 * @private {!Array<number>}
 */
goog.crypt.Sha2.PADDING_ = goog.array.concat(128,
    goog.array.repeat(0, goog.crypt.Sha2.BLOCKSIZE_ - 1));


/** @override */
goog.crypt.Sha2.prototype.reset = function() {
  this.inChunk_ = 0;
  this.total_ = 0;
  this.hash_ = goog.global['Int32Array'] ?
      new Int32Array(this.initHashBlocks_) :
      goog.array.clone(this.initHashBlocks_);
};


/**
 * Helper function to compute the hashes for a given 512-bit message chunk.
 * @private
 */
goog.crypt.Sha2.prototype.computeChunk_ = function() {
  var chunk = this.chunk_;
  goog.asserts.assert(chunk.length == this.blockSize);
  var rounds = 64;

  // Divide the chunk into 16 32-bit-words.
  var w = this.w_;
  var index = 0;
  var offset = 0;
  while (offset < chunk.length) {
    w[index++] = (chunk[offset] << 24) |
                 (chunk[offset + 1] << 16) |
                 (chunk[offset + 2] << 8) |
                 (chunk[offset + 3]);
    offset = index * 4;
  }

  // Extend the w[] array to be the number of rounds.
  for (var i = 16; i < rounds; i++) {
    var w_15 = w[i - 15] | 0;
    var s0 = ((w_15 >>> 7) | (w_15 << 25)) ^
             ((w_15 >>> 18) | (w_15 << 14)) ^
             (w_15 >>> 3);
    var w_2 = w[i - 2] | 0;
    var s1 = ((w_2 >>> 17) | (w_2 << 15)) ^
             ((w_2 >>> 19) | (w_2 << 13)) ^
             (w_2 >>> 10);

    // As a performance optimization, construct the sum a pair at a time
    // with casting to integer (bitwise OR) to eliminate unnecessary
    // double<->integer conversions.
    var partialSum1 = ((w[i - 16] | 0) + s0) | 0;
    var partialSum2 = ((w[i - 7] | 0) + s1) | 0;
    w[i] = (partialSum1 + partialSum2) | 0;
  }

  var a = this.hash_[0] | 0;
  var b = this.hash_[1] | 0;
  var c = this.hash_[2] | 0;
  var d = this.hash_[3] | 0;
  var e = this.hash_[4] | 0;
  var f = this.hash_[5] | 0;
  var g = this.hash_[6] | 0;
  var h = this.hash_[7] | 0;
  for (var i = 0; i < rounds; i++) {
    var S0 = ((a >>> 2) | (a << 30)) ^
             ((a >>> 13) | (a << 19)) ^
             ((a >>> 22) | (a << 10));
    var maj = ((a & b) ^ (a & c) ^ (b & c));
    var t2 = (S0 + maj) | 0;
    var S1 = ((e >>> 6) | (e << 26)) ^
             ((e >>> 11) | (e << 21)) ^
             ((e >>> 25) | (e << 7));
    var ch = ((e & f) ^ ((~ e) & g));

    // As a performance optimization, construct the sum a pair at a time
    // with casting to integer (bitwise OR) to eliminate unnecessary
    // double<->integer conversions.
    var partialSum1 = (h + S1) | 0;
    var partialSum2 = (ch + (goog.crypt.Sha2.Kx_[i] | 0)) | 0;
    var partialSum3 = (partialSum2 + (w[i] | 0)) | 0;
    var t1 = (partialSum1 + partialSum3) | 0;

    h = g;
    g = f;
    f = e;
    e = (d + t1) | 0;
    d = c;
    c = b;
    b = a;
    a = (t1 + t2) | 0;
  }

  this.hash_[0] = (this.hash_[0] + a) | 0;
  this.hash_[1] = (this.hash_[1] + b) | 0;
  this.hash_[2] = (this.hash_[2] + c) | 0;
  this.hash_[3] = (this.hash_[3] + d) | 0;
  this.hash_[4] = (this.hash_[4] + e) | 0;
  this.hash_[5] = (this.hash_[5] + f) | 0;
  this.hash_[6] = (this.hash_[6] + g) | 0;
  this.hash_[7] = (this.hash_[7] + h) | 0;
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
  var inChunk = this.inChunk_;

  // The input message could be either byte array of string.
  if (goog.isString(message)) {
    while (n < opt_length) {
      this.chunk_[inChunk++] = message.charCodeAt(n++);
      if (inChunk == this.blockSize) {
        this.computeChunk_();
        inChunk = 0;
      }
    }
  } else if (goog.isArray(message)) {
    while (n < opt_length) {
      var b = message[n++];
      if (!('number' == typeof b && 0 <= b && 255 >= b && b == (b | 0))) {
        throw Error('message must be a byte array');
      }
      this.chunk_[inChunk++] = b;
      if (inChunk == this.blockSize) {
        this.computeChunk_();
        inChunk = 0;
      }
    }
  } else {
    throw Error('message must be string or array');
  }

  // Record the current bytes in chunk to support partial update.
  this.inChunk_ = inChunk;

  // Record total message bytes we have processed so far.
  this.total_ += opt_length;
};


/** @override */
goog.crypt.Sha2.prototype.digest = function() {
  var digest = [];
  var totalBits = this.total_ * 8;

  // Append pad 0x80 0x00*.
  if (this.inChunk_ < 56) {
    this.update(goog.crypt.Sha2.PADDING_, 56 - this.inChunk_);
  } else {
    this.update(goog.crypt.Sha2.PADDING_,
        this.blockSize - (this.inChunk_ - 56));
  }

  // Append # bits in the 64-bit big-endian format.
  for (var i = 63; i >= 56; i--) {
    this.chunk_[i] = totalBits & 255;
    totalBits /= 256; // Don't use bit-shifting here!
  }
  this.computeChunk_();

  // Finally, output the result digest.
  var n = 0;
  for (var i = 0; i < this.numHashBlocks_; i++) {
    for (var j = 24; j >= 0; j -= 8) {
      digest[n++] = ((this.hash_[i] >> j) & 255);
    }
  }
  return digest;
};


/**
 * Constants used in SHA-2.
 * @const
 * @private {!Array<number>}
 */
goog.crypt.Sha2.K_ = [
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
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];


/**
 * Sha2.K as an Int32Array if this JS supports typed arrays; otherwise,
 * the same array as Sha2.K.
 *
 * The compiler cannot remove an Int32Array, even if it is not needed
 * (There are certain cases where creating an Int32Array is not
 * side-effect free).  Instead, the first time we construct a Sha2
 * instance, we convert or assign Sha2.K as appropriate.
 * @private {undefined|!Array<number>|!Int32Array}
 */
goog.crypt.Sha2.Kx_;

// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Base class for the 64-bit SHA-2 cryptographic hashes.
 *
 * Variable names follow the notation in FIPS PUB 180-3:
 * http://csrc.nist.gov/publications/fips/fips180-3/fips180-3_final.pdf.
 *
 * This code borrows heavily from the 32-bit SHA2 implementation written by
 * Yue Zhang (zysxqn@)
 *
 */

goog.provide('goog.crypt.Sha2_64bit');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.crypt.Hash');
goog.require('goog.math.Long');



/**
 * Constructs a SHA-2 64-bit cryptographic hash.
 * This constructor should not be used directly to create the object. Rather,
 * one should use the constructor of one of its subclasses.
 * @constructor
 * @param {number} numHashBlocks The size of the output in 16-byte blocks
 * @param {!Array.<number>} initHashBlocks The hash-specific initialization
 *     vector, as a sequence of 32-bit numbers.
 * @extends {goog.crypt.Hash}
 * @struct
 */
goog.crypt.Sha2_64bit = function(numHashBlocks, initHashBlocks) {
  goog.crypt.Sha2_64bit.base(this, 'constructor');

  /**
   * The number of bytes that are digested in each pass of this hasher.
   * @type {number}
   */
  this.blockSize = 1024 / 8;

  /**
   * A chunk holding the currently processed message bytes. Once the chunk has
   * {@code this.blocksize} bytes, we feed it into [@code computeChunk_}
   * and reset {@code this.chunk_}.
   * @private {!Array.<number>}
   */
  this.chunk_ = [];

  /**
   * Current number of bytes in {@code this.chunk_}.
   * @private {number}
   */
  this.inChunk_ = 0;

  /**
   * Total number of bytes in currently processed message.
   * @private {number}
   */
  this.total_ = 0;

  /**
   * Contains data needed to pad messages less than {@code blocksize} bytes.
   * @private {!Array.<number>}
   */
  this.pad_ = goog.array.repeat(0, this.blockSize);
  this.pad_[0] = 128;

  /**
   * Holds the previous values of accumulated hash a-h in the
   * {@code computeChunk_} function.
   * @private {!Array.<!goog.math.Long>}
   */
  this.hash_ = [];

  /**
   * The number of blocks of output produced by this hash function, where each
   * block is eight bytes long.
   * @private {number}
   */
  this.numHashBlocks_ = numHashBlocks;

  /**
   * Temporary array used in chunk computation.  Allocate here as a
   * member rather than as a local within computeChunk_() as a
   * performance optimization to reduce the number of allocations and
   * reduce garbage collection.
   * @type {!Array.<!goog.math.Long>}
   * @private
   */
  this.w_ = [];

  /**
   * The value to which {@code this.hash_} should be reset when this
   * Hasher is reset.
   * @private {!Array.<!goog.math.Long>}
   * @const
   */
  this.initHashBlocks_ = [];
  for (var i = 0; i < initHashBlocks.length; i += 2) {
    this.initHashBlocks_.push(new goog.math.Long(
        // NIST constants are in big-endian order.  Long is little-endian
        initHashBlocks[i + 1], initHashBlocks[i]));
  }

  this.reset();
};
goog.inherits(goog.crypt.Sha2_64bit, goog.crypt.Hash);


/**
 * Resets this hash function.
 */
goog.crypt.Sha2_64bit.prototype.reset = function() {
  this.chunk_ = [];
  this.inChunk_ = 0;
  this.total_ = 0;
  this.hash_ = goog.array.clone(this.initHashBlocks_);
};


/**
 * Updates this hash by processing a given 1024-bit message chunk.
 * @param {!Array.<number>} chunk A 1024-bit message chunk to be processed.
 * @private
 */
goog.crypt.Sha2_64bit.prototype.computeChunk_ = function(chunk) {
  goog.asserts.assert(chunk.length == this.blockSize);
  var rounds = 80;
  var k = goog.crypt.Sha2_64bit.K_;

  // Divide the chunk into 16 64-bit-words.
  var w = this.w_;
  var index = 0;
  var offset = 0;
  while (offset < chunk.length) {
    w[index++] = new goog.math.Long(
        (chunk[offset + 4] << 24) | (chunk[offset + 5] << 16) |
            (chunk[offset + 6] << 8) | (chunk[offset + 7]),
        (chunk[offset] << 24) | (chunk[offset + 1] << 16) |
            (chunk[offset + 2] << 8) | (chunk[offset + 3]));
    offset = index * 8;
  }

  // Extend the w[] array to be the number of rounds.
  for (var i = 16; i < rounds; i++) {
    var s0 = this.sigma0_(w[i - 15]);
    var s1 = this.sigma1_(w[i - 2]);
    w[i] = this.sum_(w[i - 16], w[i - 7], s0, s1);
  }

  var a = this.hash_[0];
  var b = this.hash_[1];
  var c = this.hash_[2];
  var d = this.hash_[3];
  var e = this.hash_[4];
  var f = this.hash_[5];
  var g = this.hash_[6];
  var h = this.hash_[7];
  for (var i = 0; i < rounds; i++) {
    var S0 = this.Sigma0_(a);
    var maj = this.majority_(a, b, c);
    var t2 = S0.add(maj);
    var S1 = this.Sigma1_(e);
    var ch = this.choose_(e, f, g);
    var t1 = this.sum_(h, S1, ch, k[i], w[i]);
    h = g;
    g = f;
    f = e;
    e = d.add(t1);
    d = c;
    c = b;
    b = a;
    a = t1.add(t2);
  }

  this.hash_[0] = this.hash_[0].add(a);
  this.hash_[1] = this.hash_[1].add(b);
  this.hash_[2] = this.hash_[2].add(c);
  this.hash_[3] = this.hash_[3].add(d);
  this.hash_[4] = this.hash_[4].add(e);
  this.hash_[5] = this.hash_[5].add(f);
  this.hash_[6] = this.hash_[6].add(g);
  this.hash_[7] = this.hash_[7].add(h);
};


/** @override */
goog.crypt.Sha2_64bit.prototype.update = function(message, opt_length) {
  if (!goog.isDef(opt_length)) {
    opt_length = message.length;
  }
  // Process the message from left to right up to |opt_length| bytes.
  // When we get a 512-bit chunk, compute the hash of it and reset
  // this.chunk_. The message might not be multiple of 512 bits so we
  // might end up with a chunk that is less than 512 bits. We store
  // such partial chunk in chunk_ and it will be filled up later
  // in digest().
  var n = 0;
  var inChunk = this.inChunk_;

  // The input message could be either byte array of string.
  if (goog.isString(message)) {
    while (n < opt_length) {
      this.chunk_[inChunk++] = message.charCodeAt(n++);
      if (inChunk == this.blockSize) {
        this.computeChunk_(this.chunk_);
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
        this.computeChunk_(this.chunk_);
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
goog.crypt.Sha2_64bit.prototype.digest = function() {
  var digest = [];
  var totalBits = this.total_ * 8;

  // Append pad 0x80 0x00*.
  if (this.inChunk_ < 112) {
    this.update(this.pad_, 112 - this.inChunk_);
  } else {
    this.update(this.pad_, this.blockSize - (this.inChunk_ - 112));
  }

  // Append # bits in the 64-bit big-endian format.
  for (var i = 127; i >= 112; i--) {
    this.chunk_[i] = totalBits & 255;
    totalBits /= 256; // Don't use bit-shifting here!
  }
  this.computeChunk_(this.chunk_);

  // Finally, output the result digest.
  var n = 0;
  for (var i = 0; i < this.numHashBlocks_; i++) {
    var block = this.hash_[i];
    var high = block.getHighBits();
    var low = block.getLowBits();
    for (var j = 24; j >= 0; j -= 8) {
      digest[n++] = ((high >> j) & 255);
    }
    for (var j = 24; j >= 0; j -= 8) {
      digest[n++] = ((low >> j) & 255);
    }
  }
  return digest;
};



// I do not know why the authors of SHA2 chose to name their functions
// Σ and σ, i.e. the Greek letter sigma in uppercase and lowercase.
// The methods here are named sigma0, sigma1, Sigma0, and Sigma1 to be
// consistent with the NIST specification.  Uggh.


/**
 * Calculates the SHA2 64-bit sigma0 function.
 * rotateRight(value, 1) ^ rotateRight(value, 8) ^ (value >>> 7)
 * @private
 *
 * @param {!goog.math.Long} value
 * @return {!goog.math.Long}
 */
goog.crypt.Sha2_64bit.prototype.sigma0_ = function(value) {
  var valueLow = value.getLowBits();
  var valueHigh = value.getHighBits();
  var low = (valueLow >>> 1) ^ (valueHigh << 31) ^
            (valueLow >>> 8) ^ (valueHigh << 24) ^
            (valueLow >>> 7) ^ (valueHigh << 25);
  var high = (valueHigh >>> 1) ^ (valueLow << 31) ^
             (valueHigh >>> 8) ^ (valueLow << 24) ^
             (valueHigh >>> 7);
  return new goog.math.Long(low, high);
};


/**
 * Calculates the SHA2 64-bit sigma1 function.
 * rotateRight(value, 19) ^ rotateRight(value, 61) ^ (value >>> 6)
 * @private
 *
 * @param {!goog.math.Long} value
 * @return {!goog.math.Long}
 */
goog.crypt.Sha2_64bit.prototype.sigma1_ = function(value) {
  var valueLow = value.getLowBits();
  var valueHigh = value.getHighBits();
  var low = (valueLow >>> 19) ^ (valueHigh << 13) ^
            (valueHigh >>> 29) ^ (valueLow << 3) ^
            (valueLow >>> 6) ^ (valueHigh << 26);
  var high = (valueHigh >>> 19) ^ (valueLow << 13) ^
             (valueLow >>> 29) ^ (valueHigh << 3) ^
             (valueHigh >>> 6);
  return new goog.math.Long(low, high);
};


/**
 * Calculates the SHA2 64-bit Sigma0 function.
 * rotateRight(value, 28) ^ rotateRight(value, 34) ^ rotateRight(value, 39)
 * @private
 *
 * @param {!goog.math.Long} value
 * @return {!goog.math.Long}
 */
goog.crypt.Sha2_64bit.prototype.Sigma0_ = function(value) {
  var valueLow = value.getLowBits();
  var valueHigh = value.getHighBits();
  var low = (valueLow >>> 28) ^ (valueHigh << 4) ^
            (valueHigh >>> 2) ^ (valueLow << 30) ^
            (valueHigh >>> 7) ^ (valueLow << 25);
  var high = (valueHigh >>> 28) ^ (valueLow << 4) ^
             (valueLow >>> 2) ^ (valueHigh << 30) ^
             (valueLow >>> 7) ^ (valueHigh << 25);
  return new goog.math.Long(low, high);
};


/**
 * Calculates the SHA2 64-bit Sigma1 function.
 * rotateRight(value, 14) ^ rotateRight(value, 18) ^ rotateRight(value, 41)
 * @private
 *
 * @param {!goog.math.Long} value
 * @return {!goog.math.Long}
 */
goog.crypt.Sha2_64bit.prototype.Sigma1_ = function(value) {
  var valueLow = value.getLowBits();
  var valueHigh = value.getHighBits();
  var low = (valueLow >>> 14) ^ (valueHigh << 18) ^
            (valueLow >>> 18) ^ (valueHigh << 14) ^
            (valueHigh >>> 9) ^ (valueLow << 23);
  var high = (valueHigh >>> 14) ^ (valueLow << 18) ^
             (valueHigh >>> 18) ^ (valueLow << 14) ^
             (valueLow >>> 9) ^ (valueHigh << 23);
  return new goog.math.Long(low, high);
};


/**
 * Calculates the SHA-2 64-bit choose function.
 * This function uses the first argument ("value") as a mask to choose bits
 * from either the second ("one") arugment if the bit is set or the third
 * argument ("two") if the bit is not set.
 * @private
 *
 * @param {!goog.math.Long} value
 * @param {!goog.math.Long} one
 * @param {!goog.math.Long} two
 * @return {!goog.math.Long}
 */
goog.crypt.Sha2_64bit.prototype.choose_ = function(value, one, two) {
  var valueLow = value.getLowBits();
  var valueHigh = value.getHighBits();
  return new goog.math.Long(
      (valueLow & one.getLowBits()) | (~valueLow & two.getLowBits()),
      (valueHigh & one.getHighBits()) | (~valueHigh & two.getHighBits()));
};


/**
 * Calculates the SHA-2 64-bit majority function.
 * This function returns, for each bit position, the bit held by the majority
 * of its three arguments.
 * @private
 *
 * @param {!goog.math.Long} one a voter
 * @param {!goog.math.Long} two another voter
 * @param {!goog.math.Long} three another voter
 * @return {!goog.math.Long}
 */
goog.crypt.Sha2_64bit.prototype.majority_ = function(one, two, three) {
  return new goog.math.Long(
      (one.getLowBits() & two.getLowBits()) |
          (two.getLowBits() & three.getLowBits()) |
          (one.getLowBits() & three.getLowBits()),
      (one.getHighBits() & two.getHighBits()) |
          (two.getHighBits() & three.getHighBits()) |
          (one.getHighBits() & three.getHighBits()));
};


/**
 * Adds two or more goog.math.Long values.
 * @private
 *
 * @param {!goog.math.Long} one first summand
 * @param {!goog.math.Long} two second summand
 * @param {...goog.math.Long} var_args more arguments to sum
 * @return {!goog.math.Long} The resulting sum.
 */
goog.crypt.Sha2_64bit.prototype.sum_ = function(one, two, var_args) {
  // The low bits may be signed, but they represent a 32-bit unsigned quantity.
  // We must be careful to normalize them.
  // This doesn't matter for the high bits.
  var low = (one.getLowBits() ^ 0x80000000) + (two.getLowBits() ^ 0x80000000);
  var high = one.getHighBits() + two.getHighBits();
  for (var i = arguments.length - 1; i >= 2; --i) {
    low += (arguments[i].getLowBits() ^ 0x80000000);
    high += arguments[i].getHighBits();
  }
  // Because of the ^0x80000000, each value we added is 0x80000000 too small
  // Add arguments.length * 0x80000000 to the current sum
  if (arguments.length & 1) {
    low += 0x80000000;
  }
  high += (arguments.length >> 1);
  high += Math.floor(low / 0x100000000);
  return new goog.math.Long(low, high);
};


/**
 * Constants used in SHA-512 variants
 * @const
 * @private {!Array.<!goog.math.Long>}
 */
goog.crypt.Sha2_64bit.K_ = (function() {
  var int64 = function(a, b) {
    // NIST constants are big-endian.  Need to reverse endianness.
    return new goog.math.Long(b, a);
  };
  return [
    int64(0x428a2f98, 0xd728ae22), int64(0x71374491, 0x23ef65cd),
    int64(0xb5c0fbcf, 0xec4d3b2f), int64(0xe9b5dba5, 0x8189dbbc),
    int64(0x3956c25b, 0xf348b538), int64(0x59f111f1, 0xb605d019),
    int64(0x923f82a4, 0xaf194f9b), int64(0xab1c5ed5, 0xda6d8118),
    int64(0xd807aa98, 0xa3030242), int64(0x12835b01, 0x45706fbe),
    int64(0x243185be, 0x4ee4b28c), int64(0x550c7dc3, 0xd5ffb4e2),
    int64(0x72be5d74, 0xf27b896f), int64(0x80deb1fe, 0x3b1696b1),
    int64(0x9bdc06a7, 0x25c71235), int64(0xc19bf174, 0xcf692694),
    int64(0xe49b69c1, 0x9ef14ad2), int64(0xefbe4786, 0x384f25e3),
    int64(0x0fc19dc6, 0x8b8cd5b5), int64(0x240ca1cc, 0x77ac9c65),
    int64(0x2de92c6f, 0x592b0275), int64(0x4a7484aa, 0x6ea6e483),
    int64(0x5cb0a9dc, 0xbd41fbd4), int64(0x76f988da, 0x831153b5),
    int64(0x983e5152, 0xee66dfab), int64(0xa831c66d, 0x2db43210),
    int64(0xb00327c8, 0x98fb213f), int64(0xbf597fc7, 0xbeef0ee4),
    int64(0xc6e00bf3, 0x3da88fc2), int64(0xd5a79147, 0x930aa725),
    int64(0x06ca6351, 0xe003826f), int64(0x14292967, 0x0a0e6e70),
    int64(0x27b70a85, 0x46d22ffc), int64(0x2e1b2138, 0x5c26c926),
    int64(0x4d2c6dfc, 0x5ac42aed), int64(0x53380d13, 0x9d95b3df),
    int64(0x650a7354, 0x8baf63de), int64(0x766a0abb, 0x3c77b2a8),
    int64(0x81c2c92e, 0x47edaee6), int64(0x92722c85, 0x1482353b),
    int64(0xa2bfe8a1, 0x4cf10364), int64(0xa81a664b, 0xbc423001),
    int64(0xc24b8b70, 0xd0f89791), int64(0xc76c51a3, 0x0654be30),
    int64(0xd192e819, 0xd6ef5218), int64(0xd6990624, 0x5565a910),
    int64(0xf40e3585, 0x5771202a), int64(0x106aa070, 0x32bbd1b8),
    int64(0x19a4c116, 0xb8d2d0c8), int64(0x1e376c08, 0x5141ab53),
    int64(0x2748774c, 0xdf8eeb99), int64(0x34b0bcb5, 0xe19b48a8),
    int64(0x391c0cb3, 0xc5c95a63), int64(0x4ed8aa4a, 0xe3418acb),
    int64(0x5b9cca4f, 0x7763e373), int64(0x682e6ff3, 0xd6b2b8a3),
    int64(0x748f82ee, 0x5defb2fc), int64(0x78a5636f, 0x43172f60),
    int64(0x84c87814, 0xa1f0ab72), int64(0x8cc70208, 0x1a6439ec),
    int64(0x90befffa, 0x23631e28), int64(0xa4506ceb, 0xde82bde9),
    int64(0xbef9a3f7, 0xb2c67915), int64(0xc67178f2, 0xe372532b),
    int64(0xca273ece, 0xea26619c), int64(0xd186b8c7, 0x21c0c207),
    int64(0xeada7dd6, 0xcde0eb1e), int64(0xf57d4f7f, 0xee6ed178),
    int64(0x06f067aa, 0x72176fba), int64(0x0a637dc5, 0xa2c898a6),
    int64(0x113f9804, 0xbef90dae), int64(0x1b710b35, 0x131c471b),
    int64(0x28db77f5, 0x23047d84), int64(0x32caab7b, 0x40c72493),
    int64(0x3c9ebe0a, 0x15c9bebc), int64(0x431d67c4, 0x9c100d4c),
    int64(0x4cc5d4be, 0xcb3e42b6), int64(0x597f299c, 0xfc657e2a),
    int64(0x5fcb6fab, 0x3ad6faec), int64(0x6c44198c, 0x4a475817)
  ];
})();

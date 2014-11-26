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
 * Yue Zhang (zysxqn@).
 *
 * @author fy@google.com (Frank Yellin)
 */

goog.provide('goog.crypt.Sha2_64bit');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.crypt.Hash');
goog.require('goog.math.Long');



/**
 * Constructs a SHA-2 64-bit cryptographic hash.
 * This class should not be used. Rather, one should use one of its
 * subclasses.
 * @constructor
 * @param {number} numHashBlocks The size of the output in 16-byte blocks
 * @param {!Array<number>} initHashBlocks The hash-specific initialization
 *     vector, as a sequence of sixteen 32-bit numbers.
 * @extends {goog.crypt.Hash}
 * @struct
 */
goog.crypt.Sha2_64bit = function(numHashBlocks, initHashBlocks) {
  goog.crypt.Sha2_64bit.base(this, 'constructor');

  /**
   * The number of bytes that are digested in each pass of this hasher.
   * @const {number}
   */
  this.blockSize = goog.crypt.Sha2_64bit.BLOCK_SIZE_;

  /**
   * A chunk holding the currently processed message bytes. Once the chunk has
   * {@code this.blocksize} bytes, we feed it into [@code computeChunk_}.
   * @private {!Uint8Array|!Array<number>}
   */
  this.chunk_ = goog.isDef(goog.global.Uint8Array) ?
      new Uint8Array(goog.crypt.Sha2_64bit.BLOCK_SIZE_) :
      new Array(goog.crypt.Sha2_64bit.BLOCK_SIZE_);

  /**
   * Current number of bytes in {@code this.chunk_}.
   * @private {number}
   */
  this.chunkBytes_ = 0;

  /**
   * Total number of bytes in currently processed message.
   * @private {number}
   */
  this.total_ = 0;

  /**
   * Holds the previous values of accumulated hash a-h in the
   * {@code computeChunk_} function.
   * @private {!Array<!goog.math.Long>}
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
   * @type {!Array<!goog.math.Long>}
   * @private
   */
  this.w_ = [];

  /**
   * The value to which {@code this.hash_} should be reset when this
   * Hasher is reset.
   * @private @const {!Array<!goog.math.Long>}
   */
  this.initHashBlocks_ = goog.crypt.Sha2_64bit.toLongArray_(initHashBlocks);

  /**
   * If true, we have taken the digest from this hasher, but we have not
   * yet reset it.
   *
   * @private {boolean}
   */
  this.needsReset_ = false;

  this.reset();
};
goog.inherits(goog.crypt.Sha2_64bit, goog.crypt.Hash);


/**
 * The number of bytes that are digested in each pass of this hasher.
 * @private @const {number}
 */
goog.crypt.Sha2_64bit.BLOCK_SIZE_ = 1024 / 8;


/**
 * Contains data needed to pad messages less than {@code blocksize} bytes.
 * @private {!Array<number>}
 */
goog.crypt.Sha2_64bit.PADDING_ = goog.array.concat(
    [0x80], goog.array.repeat(0, goog.crypt.Sha2_64bit.BLOCK_SIZE_ - 1));


/**
 * Resets this hash function.
 * @override
 */
goog.crypt.Sha2_64bit.prototype.reset = function() {
  this.chunkBytes_ = 0;
  this.total_ = 0;
  this.hash_ = goog.array.clone(this.initHashBlocks_);
  this.needsReset_ = false;
};


/** @override */
goog.crypt.Sha2_64bit.prototype.update = function(message, opt_length) {
  var length = goog.isDef(opt_length) ? opt_length : message.length;

  // Make sure this hasher is usable.
  if (this.needsReset_) {
    throw Error('this hasher needs to be reset');
  }
  // Process the message from left to right up to |length| bytes.
  // When we get a 512-bit chunk, compute the hash of it and reset
  // this.chunk_. The message might not be multiple of 512 bits so we
  // might end up with a chunk that is less than 512 bits. We store
  // such partial chunk in chunk_ and it will be filled up later
  // in digest().
  var n = 0;
  var chunkBytes = this.chunkBytes_;

  // The input message could be either byte array or string.
  if (goog.isString(message)) {
    for (var i = 0; i < length; i++) {
      var b = message.charCodeAt(i);
      if (b > 255) {
        throw Error('Characters must be in range [0,255]');
      }
      this.chunk_[chunkBytes++] = b;
      if (chunkBytes == this.blockSize) {
        this.computeChunk_();
        chunkBytes = 0;
      }
    }
  } else if (goog.isArray(message)) {
    for (var i = 0; i < length; i++) {
      var b = message[i];
      // Hack:  b|0 coerces b to an integer, so the last part confirms that
      // b has no fractional part.
      if (!goog.isNumber(b) || b < 0 || b > 255 || b != (b | 0)) {
        throw Error('message must be a byte array');
      }
      this.chunk_[chunkBytes++] = b;
      if (chunkBytes == this.blockSize) {
        this.computeChunk_();
        chunkBytes = 0;
      }
    }
  } else {
    throw Error('message must be string or array');
  }

  // Record the current bytes in chunk to support partial update.
  this.chunkBytes_ = chunkBytes;

  // Record total message bytes we have processed so far.
  this.total_ += length;
};


/** @override */
goog.crypt.Sha2_64bit.prototype.digest = function() {
  if (this.needsReset_) {
    throw Error('this hasher needs to be reset');
  }
  var totalBits = this.total_ * 8;

  // Append pad 0x80 0x00* until this.chunkBytes_ == 112
  if (this.chunkBytes_ < 112) {
    this.update(goog.crypt.Sha2_64bit.PADDING_, 112 - this.chunkBytes_);
  } else {
    // the rest of this block, plus 112 bytes of next block
    this.update(goog.crypt.Sha2_64bit.PADDING_,
        this.blockSize - this.chunkBytes_ + 112);
  }

  // Append # bits in the 64-bit big-endian format.
  for (var i = 127; i >= 112; i--) {
    this.chunk_[i] = totalBits & 255;
    totalBits /= 256; // Don't use bit-shifting here!
  }
  this.computeChunk_();

  // Finally, output the result digest.
  var n = 0;
  var digest = new Array(8 * this.numHashBlocks_);
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

  // The next call to this hasher must be a reset
  this.needsReset_ = true;
  return digest;
};


/**
 * Updates this hash by processing the 1024-bit message chunk in this.chunk_.
 * @private
 */
goog.crypt.Sha2_64bit.prototype.computeChunk_ = function() {
  var chunk = this.chunk_;
  var K_ = goog.crypt.Sha2_64bit.K_;

  // Divide the chunk into 16 64-bit-words.
  var w = this.w_;
  for (var i = 0; i < 16; i++) {
    var offset = i * 8;
    w[i] = new goog.math.Long(
        (chunk[offset + 4] << 24) | (chunk[offset + 5] << 16) |
            (chunk[offset + 6] << 8) | (chunk[offset + 7]),
        (chunk[offset] << 24) | (chunk[offset + 1] << 16) |
            (chunk[offset + 2] << 8) | (chunk[offset + 3]));

  }

  // Extend the w[] array to be the number of rounds.
  for (var i = 16; i < 80; i++) {
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
  for (var i = 0; i < 80; i++) {
    var S0 = this.Sigma0_(a);
    var maj = this.majority_(a, b, c);
    var t2 = S0.add(maj);
    var S1 = this.Sigma1_(e);
    var ch = this.choose_(e, f, g);
    var t1 = this.sum_(h, S1, ch, K_[i], w[i]);
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


/**
 * Calculates the SHA2 64-bit sigma0 function.
 * rotateRight(value, 1) ^ rotateRight(value, 8) ^ (value >>> 7)
 *
 * @private
 * @param {!goog.math.Long} value
 * @return {!goog.math.Long}
 */
goog.crypt.Sha2_64bit.prototype.sigma0_ = function(value) {
  var valueLow = value.getLowBits();
  var valueHigh = value.getHighBits();
  // Implementation note: We purposely do not use the shift operations defined
  // in goog.math.Long.  Inlining the code for specific values of shifting and
  // not generating the intermediate results doubles the speed of this code.
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
 *
 * @private
 * @param {!goog.math.Long} value
 * @return {!goog.math.Long}
 */
goog.crypt.Sha2_64bit.prototype.sigma1_ = function(value) {
  var valueLow = value.getLowBits();
  var valueHigh = value.getHighBits();
  // Implementation note:  See _sigma0() above
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
 *
 * @private
 * @param {!goog.math.Long} value
 * @return {!goog.math.Long}
 */
goog.crypt.Sha2_64bit.prototype.Sigma0_ = function(value) {
  var valueLow = value.getLowBits();
  var valueHigh = value.getHighBits();
  // Implementation note:  See _sigma0() above
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
 *
 * @private
 * @param {!goog.math.Long} value
 * @return {!goog.math.Long}
 */
goog.crypt.Sha2_64bit.prototype.Sigma1_ = function(value) {
  var valueLow = value.getLowBits();
  var valueHigh = value.getHighBits();
  // Implementation note:  See _sigma0() above
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
 *
 * This function uses {@code value} as a mask to choose bits from either
 * {@code one} if the bit is set or {@code two} if the bit is not set.
 *
 * @private
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
 *
 * @private
 * @param {!goog.math.Long} one
 * @param {!goog.math.Long} two
 * @param {!goog.math.Long} three
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
 *
 * @private
 * @param {!goog.math.Long} one first summand
 * @param {!goog.math.Long} two second summand
 * @param {...goog.math.Long} var_args more arguments to sum
 * @return {!goog.math.Long} The resulting sum.
 */
goog.crypt.Sha2_64bit.prototype.sum_ = function(one, two, var_args) {
  // The low bits may be signed, but they represent a 32-bit unsigned quantity.
  // We must be careful to normalize them.
  // This doesn't matter for the high bits.
  // Implementation note:  Performance testing shows that this method runs
  // fastest when the first two arguments are pulled out of the loop.
  var low = (one.getLowBits() ^ 0x80000000) + (two.getLowBits() ^ 0x80000000);
  var high = one.getHighBits() + two.getHighBits();
  for (var i = arguments.length - 1; i >= 2; --i) {
    low += arguments[i].getLowBits() ^ 0x80000000;
    high += arguments[i].getHighBits();
  }
  // Because of the ^0x80000000, each value we added is 0x80000000 too small.
  // Add arguments.length * 0x80000000 to the current sum.  We can do this
  // quickly by adding 0x80000000 to low when the number of arguments is
  // odd, and adding (number of arguments) >> 1 to high.
  if (arguments.length & 1) {
    low += 0x80000000;
  }
  high += arguments.length >> 1;

  // If low is outside the range [0, 0xFFFFFFFF], its overflow or underflow
  // should be added to high.  We don't actually need to modify low or
  // normalize high because the goog.math.Long constructor already does that.
  high += Math.floor(low / 0x100000000);
  return new goog.math.Long(low, high);
};


/**
 * Converts an array of 32-bit integers into an array of goog.math.Long
 * elements.
 *
 * @private
 * @param {!Array<number>} values An array of 32-bit numbers.  Its length
 *     must be even.  Each pair of numbers represents a 64-bit integer
 *     in big-endian order
 * @return {!Array<!goog.math.Long>}
 */
goog.crypt.Sha2_64bit.toLongArray_ = function(values) {
  goog.asserts.assert(values.length % 2 == 0);
  var result = [];
  for (var i = 0; i < values.length; i += 2) {
    result.push(new goog.math.Long(values[i + 1], values[i]));
  }
  return result;
};


/**
 * Fixed constants used in SHA-512 variants.
 *
 * These values are from Section 4.2.3 of
 * http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * @const
 * @private {!Array<!goog.math.Long>}
 */
goog.crypt.Sha2_64bit.K_ = goog.crypt.Sha2_64bit.toLongArray_([
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
]);

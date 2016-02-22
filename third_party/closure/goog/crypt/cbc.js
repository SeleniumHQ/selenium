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
 * @fileoverview Implementation of CBC mode for block ciphers.  See
 *     http://en.wikipedia.org/wiki/Block_cipher_modes_of_operation
 *     #Cipher-block_chaining_.28CBC.29. for description.
 *
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.crypt.Cbc');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.crypt');



/**
 * Implements the CBC mode for block ciphers. See
 * http://en.wikipedia.org/wiki/Block_cipher_modes_of_operation
 * #Cipher-block_chaining_.28CBC.29
 *
 * @param {!goog.crypt.BlockCipher} cipher The block cipher to use.
 * @param {number=} opt_blockSize The block size of the cipher in bytes.
 *     Defaults to 16 bytes.
 * @constructor
 * @final
 * @struct
 */
goog.crypt.Cbc = function(cipher, opt_blockSize) {

  /**
   * Block cipher.
   * @type {!goog.crypt.BlockCipher}
   * @private
   */
  this.cipher_ = cipher;

  /**
   * Block size in bytes.
   * @type {number}
   * @private
   */
  this.blockSize_ = opt_blockSize || 16;
};


/**
 * Encrypt a message.
 *
 * @param {!Array<number>} plainText Message to encrypt. An array of bytes.
 *     The length should be a multiple of the block size.
 * @param {!Array<number>} initialVector Initial vector for the CBC mode.
 *     An array of bytes with the same length as the block size.
 * @return {!Array<number>} Encrypted message.
 */
goog.crypt.Cbc.prototype.encrypt = function(plainText, initialVector) {

  goog.asserts.assert(
      plainText.length % this.blockSize_ == 0,
      'Data\'s length must be multiple of block size.');

  goog.asserts.assert(
      initialVector.length == this.blockSize_,
      'Initial vector must be size of one block.');

  // Implementation of
  // http://en.wikipedia.org/wiki/File:Cbc_encryption.png

  var cipherText = [];
  var vector = initialVector;

  // Generate each block of the encrypted cypher text.
  for (var blockStartIndex = 0;
       blockStartIndex < plainText.length;
       blockStartIndex += this.blockSize_) {

    // Takes one block from the input message.
    var plainTextBlock = goog.array.slice(
        plainText,
        blockStartIndex,
        blockStartIndex + this.blockSize_);

    var input = goog.crypt.xorByteArray(plainTextBlock, vector);
    var resultBlock = this.cipher_.encrypt(input);

    goog.array.extend(cipherText, resultBlock);
    vector = resultBlock;
  }

  return cipherText;
};


/**
 * Decrypt a message.
 *
 * @param {!Array<number>} cipherText Message to decrypt. An array of bytes.
 *     The length should be a multiple of the block size.
 * @param {!Array<number>} initialVector Initial vector for the CBC mode.
 *     An array of bytes with the same length as the block size.
 * @return {!Array<number>} Decrypted message.
 */
goog.crypt.Cbc.prototype.decrypt = function(cipherText, initialVector) {

  goog.asserts.assert(
      cipherText.length % this.blockSize_ == 0,
      'Data\'s length must be multiple of block size.');

  goog.asserts.assert(
      initialVector.length == this.blockSize_,
      'Initial vector must be size of one block.');

  // Implementation of
  // http://en.wikipedia.org/wiki/File:Cbc_decryption.png

  var plainText = [];
  var blockStartIndex = 0;
  var vector = initialVector;

  // Generate each block of the decrypted plain text.
  while (blockStartIndex < cipherText.length) {

    // Takes one block.
    var cipherTextBlock = goog.array.slice(
        cipherText,
        blockStartIndex,
        blockStartIndex + this.blockSize_);

    var resultBlock = this.cipher_.decrypt(cipherTextBlock);
    var plainTextBlock = goog.crypt.xorByteArray(vector, resultBlock);

    goog.array.extend(plainText, plainTextBlock);
    vector = cipherTextBlock;

    blockStartIndex += this.blockSize_;
  }

  return plainText;
};

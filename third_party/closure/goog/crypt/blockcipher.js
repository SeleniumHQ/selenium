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
 * @fileoverview Interface definition of a block cipher. A block cipher is a
 * pair of algorithms that implement encryption and decryption of input bytes.
 *
 * @see http://en.wikipedia.org/wiki/Block_cipher
 *
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.crypt.BlockCipher');



/**
 * Interface definition for a block cipher.
 * @interface
 */
goog.crypt.BlockCipher = function() {};


/**
 * Encrypt a plaintext block.  The implementation may expect (and assert)
 * a particular block length.
 * @param {!Array.<number>} input Plaintext array of input bytes.
 * @return {!Array.<number>} Encrypted ciphertext array of bytes.  Should be the
 *     same length as input.
 */
goog.crypt.BlockCipher.prototype.encrypt;


/**
 * Decrypt a plaintext block.  The implementation may expect (and assert)
 * a particular block length.
 * @param {!Array.<number>} input Ciphertext. Array of input bytes.
 * @return {!Array.<number>} Decrypted plaintext array of bytes.  Should be the
 *     same length as input.
 */
goog.crypt.BlockCipher.prototype.decrypt;

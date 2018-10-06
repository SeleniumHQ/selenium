// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2016 Tankred Hase
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

/**
 * Implementation of the Symmetrically Encrypted Authenticated Encryption with Additional Data (AEAD) Protected Data Packet
 * {@link https://tools.ietf.org/html/draft-ford-openpgp-format-00#section-2.1}: AEAD Protected Data Packet
 */

'use strict';

import util from '../util.js';
import crypto from '../crypto';
import enums from '../enums.js';

const VERSION = 1; // A one-octet version number of the data packet.
const IV_LEN = crypto.gcm.ivLength; // currently only AES-GCM is supported

/**
 * @constructor
 */
export default function SymEncryptedAEADProtected() {
  this.tag = enums.packet.symEncryptedAEADProtected;
  this.version = VERSION;
  this.iv = null;
  this.encrypted = null;
  this.packets =  null;
}

/**
 * Parse an encrypted payload of bytes in the order: version, IV, ciphertext (see specification)
 */
SymEncryptedAEADProtected.prototype.read = function (bytes) {
  let offset = 0;
  if (bytes[offset] !== VERSION) { // The only currently defined value is 1.
    throw new Error('Invalid packet version.');
  }
  offset++;
  this.iv = bytes.subarray(offset, IV_LEN + offset);
  offset += IV_LEN;
  this.encrypted = bytes.subarray(offset, bytes.length);
};

/**
 * Write the encrypted payload of bytes in the order: version, IV, ciphertext (see specification)
 * @return {Uint8Array} The encrypted payload
 */
SymEncryptedAEADProtected.prototype.write = function () {
  return util.concatUint8Array([new Uint8Array([this.version]), this.iv, this.encrypted]);
};

/**
 * Decrypt the encrypted payload.
 * @param  {String} sessionKeyAlgorithm   The session key's cipher algorithm e.g. 'aes128'
 * @param  {Uint8Array} key               The session key used to encrypt the payload
 * @return {Promise<undefined>}           Nothing is returned
 */
SymEncryptedAEADProtected.prototype.decrypt = function (sessionKeyAlgorithm, key) {
  return crypto.gcm.decrypt(sessionKeyAlgorithm, this.encrypted, key, this.iv).then(decrypted => {
    this.packets.read(decrypted);
  });
};

/**
 * Encrypt the packet list payload.
 * @param  {String} sessionKeyAlgorithm   The session key's cipher algorithm e.g. 'aes128'
 * @param  {Uint8Array} key               The session key used to encrypt the payload
 * @return {Promise<undefined>}           Nothing is returned
 */
SymEncryptedAEADProtected.prototype.encrypt = function (sessionKeyAlgorithm, key) {
  this.iv = crypto.random.getRandomValues(new Uint8Array(IV_LEN)); // generate new random IV
  return crypto.gcm.encrypt(sessionKeyAlgorithm, this.packets.write(), key, this.iv).then(encrypted => {
    this.encrypted = encrypted;
  });
};
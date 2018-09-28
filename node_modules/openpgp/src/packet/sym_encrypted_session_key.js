// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
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
 * Public-Key Encrypted Session Key Packets (Tag 1)<br/>
 * <br/>
 * {@link http://tools.ietf.org/html/rfc4880#section-5.1|RFC4880 5.1}: A Public-Key Encrypted Session Key packet holds the session key
 * used to encrypt a message. Zero or more Public-Key Encrypted Session Key
 * packets and/or Symmetric-Key Encrypted Session Key packets may precede a
 * Symmetrically Encrypted Data Packet, which holds an encrypted message. The
 * message is encrypted with the session key, and the session key is itself
 * encrypted and stored in the Encrypted Session Key packet(s). The
 * Symmetrically Encrypted Data Packet is preceded by one Public-Key Encrypted
 * Session Key packet for each OpenPGP key to which the message is encrypted.
 * The recipient of the message finds a session key that is encrypted to their
 * public key, decrypts the session key, and then uses the session key to
 * decrypt the message.
 * @requires util
 * @requires crypto
 * @requires enums
 * @requires type/s2k
 * @module packet/sym_encrypted_session_key
 */

'use strict';

import util from '../util.js';
import type_s2k from '../type/s2k.js';
import enums from '../enums.js';
import crypto from '../crypto';

/**
 * @constructor
 */
export default function SymEncryptedSessionKey() {
  this.tag = enums.packet.symEncryptedSessionKey;
  this.version = 4;
  this.sessionKey = null;
  this.sessionKeyEncryptionAlgorithm = null;
  this.sessionKeyAlgorithm = 'aes256';
  this.encrypted = null;
  this.s2k = new type_s2k();
}

/**
 * Parsing function for a symmetric encrypted session key packet (tag 3).
 *
 * @param {Uint8Array} input Payload of a tag 1 packet
 * @param {Integer} position Position to start reading from the input string
 * @param {Integer} len
 *            Length of the packet or the remaining length of
 *            input at position
 * @return {module:packet/sym_encrypted_session_key} Object representation
 */
SymEncryptedSessionKey.prototype.read = function(bytes) {
  // A one-octet version number. The only currently defined version is 4.
  this.version = bytes[0];

  // A one-octet number describing the symmetric algorithm used.
  var algo = enums.read(enums.symmetric, bytes[1]);

  // A string-to-key (S2K) specifier, length as defined above.
  var s2klength = this.s2k.read(bytes.subarray(2, bytes.length));

  // Optionally, the encrypted session key itself, which is decrypted
  // with the string-to-key object.
  var done = s2klength + 2;

  if (done < bytes.length) {
    this.encrypted = bytes.subarray(done, bytes.length);
    this.sessionKeyEncryptionAlgorithm = algo;
  } else {
    this.sessionKeyAlgorithm = algo;
  }
};

SymEncryptedSessionKey.prototype.write = function() {
  var algo = this.encrypted === null ?
    this.sessionKeyAlgorithm :
    this.sessionKeyEncryptionAlgorithm;

  var bytes = util.concatUint8Array([new Uint8Array([this.version, enums.write(enums.symmetric, algo)]), this.s2k.write()]);

  if (this.encrypted !== null) {
    bytes = util.concatUint8Array([bytes, this.encrypted]);
  }
  return bytes;
};

/**
 * Decrypts the session key (only for public key encrypted session key
 * packets (tag 1)
 *
 * @return {Uint8Array} The unencrypted session key
 */
SymEncryptedSessionKey.prototype.decrypt = function(passphrase) {
  var algo = this.sessionKeyEncryptionAlgorithm !== null ?
    this.sessionKeyEncryptionAlgorithm :
    this.sessionKeyAlgorithm;

  var length = crypto.cipher[algo].keySize;
  var key = this.s2k.produce_key(passphrase, length);

  if (this.encrypted === null) {
    this.sessionKey = key;

  } else {
    var decrypted = crypto.cfb.normalDecrypt(
      algo, key, this.encrypted, null);

    this.sessionKeyAlgorithm = enums.read(enums.symmetric,
      decrypted[0]);

    this.sessionKey = decrypted.subarray(1,decrypted.length);
  }
};

SymEncryptedSessionKey.prototype.encrypt = function(passphrase) {
  var algo = this.sessionKeyEncryptionAlgorithm !== null ?
    this.sessionKeyEncryptionAlgorithm :
    this.sessionKeyAlgorithm;

  this.sessionKeyEncryptionAlgorithm = algo;

  var length = crypto.cipher[algo].keySize;
  var key = this.s2k.produce_key(passphrase, length);

  var algo_enum = new Uint8Array([
    enums.write(enums.symmetric, this.sessionKeyAlgorithm)]);

  var private_key;
  if(this.sessionKey === null) {
    this.sessionKey = crypto.getRandomBytes(crypto.cipher[this.sessionKeyAlgorithm].keySize);
  }
  private_key = util.concatUint8Array([algo_enum, this.sessionKey]);

  this.encrypted = crypto.cfb.normalEncrypt(
    algo, key, private_key, null);
};

/**
 * Fix custom types after cloning
 */
SymEncryptedSessionKey.prototype.postCloneTypeFix = function() {
  this.s2k = type_s2k.fromClone(this.s2k);
};

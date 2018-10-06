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
 * Implementation of the Sym. Encrypted Integrity Protected Data
 * Packet (Tag 18)<br/>
 * <br/>
 * {@link http://tools.ietf.org/html/rfc4880#section-5.13|RFC4880 5.13}:
 * The Symmetrically Encrypted Integrity Protected Data packet is
 * a variant of the Symmetrically Encrypted Data packet. It is a new feature
 * created for OpenPGP that addresses the problem of detecting a modification to
 * encrypted data. It is used in combination with a Modification Detection Code
 * packet.
 * @requires crypto
 * @requires util
 * @requires enums
 * @requires config
 * @module packet/sym_encrypted_integrity_protected
 */

'use strict';

import util from '../util.js';
import crypto from '../crypto';
import enums from '../enums.js';
import asmCrypto from 'asmcrypto-lite';
const nodeCrypto = util.getNodeCrypto();
const Buffer = util.getNodeBuffer();

const VERSION = 1; // A one-octet version number of the data packet.

/**
 * @constructor
 */
export default function SymEncryptedIntegrityProtected() {
  this.tag = enums.packet.symEncryptedIntegrityProtected;
  this.version = VERSION;
  /** The encrypted payload. */
  this.encrypted = null; // string
  /**
   * If after decrypting the packet this is set to true,
   * a modification has been detected and thus the contents
   * should be discarded.
   * @type {Boolean}
   */
  this.modification = false;
  this.packets = null;
}

SymEncryptedIntegrityProtected.prototype.read = function (bytes) {
  // - A one-octet version number. The only currently defined value is 1.
  if (bytes[0] !== VERSION) {
    throw new Error('Invalid packet version.');
  }

  // - Encrypted data, the output of the selected symmetric-key cipher
  //   operating in Cipher Feedback mode with shift amount equal to the
  //   block size of the cipher (CFB-n where n is the block size).
  this.encrypted = bytes.subarray(1, bytes.length);
};

SymEncryptedIntegrityProtected.prototype.write = function () {
  return util.concatUint8Array([new Uint8Array([VERSION]), this.encrypted]);
};

/**
 * Encrypt the payload in the packet.
 * @param  {String} sessionKeyAlgorithm   The selected symmetric encryption algorithm to be used e.g. 'aes128'
 * @param  {Uint8Array} key               The key of cipher blocksize length to be used
 * @return {Promise}
 */
SymEncryptedIntegrityProtected.prototype.encrypt = function (sessionKeyAlgorithm, key) {
  const bytes = this.packets.write();
  const prefixrandom = crypto.getPrefixRandom(sessionKeyAlgorithm);
  const repeat = new Uint8Array([prefixrandom[prefixrandom.length - 2], prefixrandom[prefixrandom.length - 1]]);
  const prefix = util.concatUint8Array([prefixrandom, repeat]);
  const mdc = new Uint8Array([0xD3, 0x14]); // modification detection code packet

  let tohash = util.concatUint8Array([bytes, mdc]);
  const hash = crypto.hash.sha1(util.concatUint8Array([prefix, tohash]));
  tohash = util.concatUint8Array([tohash, hash]);

  if(sessionKeyAlgorithm.substr(0,3) === 'aes') { // AES optimizations. Native code for node, asmCrypto for browser.
    this.encrypted = aesEncrypt(sessionKeyAlgorithm, prefix, tohash, key);
  } else {
    this.encrypted = crypto.cfb.encrypt(prefixrandom, sessionKeyAlgorithm, tohash, key, false);
    this.encrypted = this.encrypted.subarray(0, prefix.length + tohash.length);
  }

  return Promise.resolve();
};

/**
 * Decrypts the encrypted data contained in the packet.
 * @param  {String} sessionKeyAlgorithm   The selected symmetric encryption algorithm to be used e.g. 'aes128'
 * @param  {Uint8Array} key               The key of cipher blocksize length to be used
 * @return {Promise}
 */
SymEncryptedIntegrityProtected.prototype.decrypt = function (sessionKeyAlgorithm, key) {
  let decrypted;
  if(sessionKeyAlgorithm.substr(0,3) === 'aes') {  // AES optimizations. Native code for node, asmCrypto for browser.
    decrypted = aesDecrypt(sessionKeyAlgorithm, this.encrypted, key);
  } else {
    decrypted = crypto.cfb.decrypt(sessionKeyAlgorithm, key, this.encrypted, false);
  }

  // there must be a modification detection code packet as the
  // last packet and everything gets hashed except the hash itself
  const prefix = crypto.cfb.mdc(sessionKeyAlgorithm, key, this.encrypted);
  const bytes = decrypted.subarray(0, decrypted.length - 20);
  const tohash = util.concatUint8Array([prefix, bytes]);
  this.hash = util.Uint8Array2str(crypto.hash.sha1(tohash));
  const mdc = util.Uint8Array2str(decrypted.subarray(decrypted.length - 20, decrypted.length));

  if (this.hash !== mdc) {
    throw new Error('Modification detected.');
  } else {
    this.packets.read(decrypted.subarray(0, decrypted.length - 22));
  }

  return Promise.resolve();
};


//////////////////////////
//                      //
//   Helper functions   //
//                      //
//////////////////////////


function aesEncrypt(algo, prefix, pt, key) {
  if(nodeCrypto) { // Node crypto library.
    return nodeEncrypt(algo, prefix, pt, key);
  } else { // asm.js fallback
    return asmCrypto.AES_CFB.encrypt(util.concatUint8Array([prefix, pt]), key);
  }
}

function aesDecrypt(algo, ct, key) {
  let pt;
  if(nodeCrypto) { // Node crypto library.
    pt = nodeDecrypt(algo, ct, key);
  } else { // asm.js fallback
    pt = asmCrypto.AES_CFB.decrypt(ct, key);
  }
  return pt.subarray(crypto.cipher[algo].blockSize + 2, pt.length); // Remove random prefix
}

function nodeEncrypt(algo, prefix, pt, key) {
  key = new Buffer(key);
  const iv = new Buffer(new Uint8Array(crypto.cipher[algo].blockSize));
  const cipherObj = new nodeCrypto.createCipheriv('aes-' + algo.substr(3,3) + '-cfb', key, iv);
  const ct = cipherObj.update(new Buffer(util.concatUint8Array([prefix, pt])));
  return new Uint8Array(ct);
}

function nodeDecrypt(algo, ct, key) {
  ct = new Buffer(ct);
  key = new Buffer(key);
  const iv = new Buffer(new Uint8Array(crypto.cipher[algo].blockSize));
  const decipherObj = new nodeCrypto.createDecipheriv('aes-' + algo.substr(3,3) + '-cfb', key, iv);
  const pt = decipherObj.update(ct);
  return new Uint8Array(pt);
}
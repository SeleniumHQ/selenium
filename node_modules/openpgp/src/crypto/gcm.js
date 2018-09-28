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
 * @fileoverview This module wraps native AES-GCM en/decryption for both
 * the WebCrypto api as well as node.js' crypto api.
 */

'use strict';

import util from '../util.js';
import config from '../config';
import asmCrypto from 'asmcrypto-lite';
const webCrypto = util.getWebCrypto(); // no GCM support in IE11, Safari 9
const nodeCrypto = util.getNodeCrypto();
const Buffer = util.getNodeBuffer();

export const ivLength = 12; // size of the IV in bytes
const TAG_LEN = 16; // size of the tag in bytes
const ALGO = 'AES-GCM';

/**
 * Encrypt plaintext input.
 * @param  {String}     cipher      The symmetric cipher algorithm to use e.g. 'aes128'
 * @param  {Uint8Array} plaintext   The cleartext input to be encrypted
 * @param  {Uint8Array} key         The encryption key
 * @param  {Uint8Array} iv          The initialization vector (12 bytes)
 * @return {Promise<Uint8Array>}    The ciphertext output
 */
export function encrypt(cipher, plaintext, key, iv) {
  if (cipher.substr(0,3) !== 'aes') {
    return Promise.reject(new Error('GCM mode supports only AES cipher'));
  }

  if (webCrypto && config.use_native && key.length !== 24) { // WebCrypto (no 192 bit support) see: https://www.chromium.org/blink/webcrypto#TOC-AES-support
    return webEncrypt(plaintext, key, iv);
  } else if (nodeCrypto && config.use_native) { // Node crypto library
    return nodeEncrypt(plaintext, key, iv) ;
  } else { // asm.js fallback
    return Promise.resolve(asmCrypto.AES_GCM.encrypt(plaintext, key, iv));
  }
}

/**
 * Decrypt ciphertext input.
 * @param  {String}     cipher       The symmetric cipher algorithm to use e.g. 'aes128'
 * @param  {Uint8Array} ciphertext   The ciphertext input to be decrypted
 * @param  {Uint8Array} key          The encryption key
 * @param  {Uint8Array} iv           The initialization vector (12 bytes)
 * @return {Promise<Uint8Array>}     The plaintext output
 */
export function decrypt(cipher, ciphertext, key, iv) {
  if (cipher.substr(0,3) !== 'aes') {
    return Promise.reject(new Error('GCM mode supports only AES cipher'));
  }

  if (webCrypto && config.use_native && key.length !== 24) { // WebCrypto (no 192 bit support) see: https://www.chromium.org/blink/webcrypto#TOC-AES-support
    return webDecrypt(ciphertext, key, iv);
  } else if (nodeCrypto && config.use_native) { // Node crypto library
    return nodeDecrypt(ciphertext, key, iv);
  } else { // asm.js fallback
    return Promise.resolve(asmCrypto.AES_GCM.decrypt(ciphertext, key, iv));
  }
}


//////////////////////////
//                      //
//   Helper functions   //
//                      //
//////////////////////////


function webEncrypt(pt, key, iv) {
  return webCrypto.importKey('raw', key, { name: ALGO }, false, ['encrypt'])
    .then(keyObj => webCrypto.encrypt({ name: ALGO, iv }, keyObj, pt))
    .then(ct => new Uint8Array(ct));
}

function webDecrypt(ct, key, iv) {
  return webCrypto.importKey('raw', key, { name: ALGO }, false, ['decrypt'])
    .then(keyObj => webCrypto.decrypt({ name: ALGO, iv }, keyObj, ct))
    .then(pt => new Uint8Array(pt));
}

function nodeEncrypt(pt, key, iv) {
  pt = new Buffer(pt);
  key = new Buffer(key);
  iv = new Buffer(iv);
  const en = new nodeCrypto.createCipheriv('aes-' + (key.length * 8) + '-gcm', key, iv);
  const ct = Buffer.concat([en.update(pt), en.final(), en.getAuthTag()]); // append auth tag to ciphertext
  return Promise.resolve(new Uint8Array(ct));
}

function nodeDecrypt(ct, key, iv) {
  ct = new Buffer(ct);
  key = new Buffer(key);
  iv = new Buffer(iv);
  const de = new nodeCrypto.createDecipheriv('aes-' + (key.length * 8) + '-gcm', key, iv);
  de.setAuthTag(ct.slice(ct.length - TAG_LEN, ct.length)); // read auth tag at end of ciphertext
  const pt = Buffer.concat([de.update(ct.slice(0, ct.length - TAG_LEN)), de.final()]);
  return Promise.resolve(new Uint8Array(pt));
}
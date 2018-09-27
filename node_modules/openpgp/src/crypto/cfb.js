// Modified by ProtonTech AG

// Modified by Recurity Labs GmbH

// modified version of http://www.hanewin.net/encrypt/PGdecode.js:

/* OpenPGP encryption using RSA/AES
 * Copyright 2005-2006 Herbert Hanewinkel, www.haneWIN.de
 * version 2.0, check www.haneWIN.de for the latest version

 * This software is provided as-is, without express or implied warranty.
 * Permission to use, copy, modify, distribute or sell this software, with or
 * without fee, for any purpose and by any individual or organization, is hereby
 * granted, provided that the above copyright notice and this paragraph appear
 * in all copies. Distribution as a part of an application or binary must
 * include the above copyright notice in the documentation and/or other
 * materials provided with the application or distribution.
 */

/**
 * @requires crypto/cipher
 * @module crypto/cfb
 */

'use strict';

import cipher from './cipher';

export default {

  /**
   * This function encrypts a given with the specified prefixrandom
   * using the specified blockcipher to encrypt a message
   * @param {Uint8Array} prefixrandom random bytes of block_size length
   *  to be used in prefixing the data
   * @param {String} cipherfn the algorithm cipher class to encrypt
   *  data in one block_size encryption, {@link module:crypto/cipher}.
   * @param {Uint8Array} plaintext data to be encrypted
   * @param {Uint8Array} key key to be used to encrypt the plaintext.
   * This will be passed to the cipherfn
   * @param {Boolean} resync a boolean value specifying if a resync of the
   *  IV should be used or not. The encrypteddatapacket uses the
   *  "old" style with a resync. Encryption within an
   *  encryptedintegrityprotecteddata packet is not resyncing the IV.
   * @return {Uint8Array} encrypted data
   */
  encrypt: function(prefixrandom, cipherfn, plaintext, key, resync) {
    cipherfn = new cipher[cipherfn](key);
    var block_size = cipherfn.blockSize;

    var FR = new Uint8Array(block_size);
    var FRE = new Uint8Array(block_size);

    var new_prefix = new Uint8Array(prefixrandom.length + 2);
    new_prefix.set(prefixrandom);
    new_prefix[prefixrandom.length] = prefixrandom[block_size-2];
    new_prefix[prefixrandom.length+1] = prefixrandom[block_size-1];
    prefixrandom = new_prefix;

    var ciphertext = new Uint8Array(plaintext.length + 2 + block_size * 2);
    var i, n, begin;
    var offset = resync ? 0 : 2;

    // 1.  The feedback register (FR) is set to the IV, which is all zeros.
    for (i = 0; i < block_size; i++) {
      FR[i] = 0;
    }

    // 2.  FR is encrypted to produce FRE (FR Encrypted).  This is the
    //     encryption of an all-zero value.
    FRE = cipherfn.encrypt(FR);
    // 3.  FRE is xored with the first BS octets of random data prefixed to
    //     the plaintext to produce C[1] through C[BS], the first BS octets
    //     of ciphertext.
    for (i = 0; i < block_size; i++) {
      ciphertext[i] = FRE[i] ^ prefixrandom[i];
    }

    // 4.  FR is loaded with C[1] through C[BS].
    FR.set(ciphertext.subarray(0, block_size));

    // 5.  FR is encrypted to produce FRE, the encryption of the first BS
    //     octets of ciphertext.
    FRE = cipherfn.encrypt(FR);

    // 6.  The left two octets of FRE get xored with the next two octets of
    //     data that were prefixed to the plaintext.  This produces C[BS+1]
    //     and C[BS+2], the next two octets of ciphertext.
    ciphertext[block_size] = FRE[0] ^ prefixrandom[block_size];
    ciphertext[block_size + 1] = FRE[1] ^ prefixrandom[block_size + 1];

    if (resync) {
      // 7.  (The resync step) FR is loaded with C[3] through C[BS+2].
      FR.set(ciphertext.subarray(2, block_size + 2));
    } else {
      FR.set(ciphertext.subarray(0, block_size));
    }
    // 8.  FR is encrypted to produce FRE.
    FRE = cipherfn.encrypt(FR);

    // 9.  FRE is xored with the first BS octets of the given plaintext, now
    //     that we have finished encrypting the BS+2 octets of prefixed
    //     data.  This produces C[BS+3] through C[BS+(BS+2)], the next BS
    //     octets of ciphertext.
    for (i = 0; i < block_size; i++) {
      ciphertext[block_size + 2 + i] = FRE[i + offset] ^ plaintext[i];
    }
    for (n = block_size; n < plaintext.length + offset; n += block_size) {
      // 10. FR is loaded with C[BS+3] to C[BS + (BS+2)] (which is C11-C18 for
      // an 8-octet block).
      begin = n + 2 - offset;
      FR.set(ciphertext.subarray(begin, begin + block_size));

      // 11. FR is encrypted to produce FRE.
      FRE = cipherfn.encrypt(FR);

      // 12. FRE is xored with the next BS octets of plaintext, to produce
      // the next BS octets of ciphertext.  These are loaded into FR, and
      // the process is repeated until the plaintext is used up.
      for (i = 0; i < block_size; i++) {
        ciphertext[block_size + begin + i] = FRE[i] ^ plaintext[n + i - offset];
      }
    }

    ciphertext = ciphertext.subarray(0, plaintext.length + 2 + block_size);
    return ciphertext;
  },

  /**
   * Decrypts the prefixed data for the Modification Detection Code (MDC) computation
   * @param {String} cipherfn.encrypt Cipher function to use,
   *  @see module:crypto/cipher.
   * @param {Uint8Array} key Uint8Array representation of key to be used to check the mdc
   * This will be passed to the cipherfn
   * @param {Uint8Array} ciphertext The encrypted data
   * @return {Uint8Array} plaintext Data of D(ciphertext) with blocksize length +2
   */
  mdc: function(cipherfn, key, ciphertext) {
    cipherfn = new cipher[cipherfn](key);
    var block_size = cipherfn.blockSize;

    var iblock = new Uint8Array(block_size);
    var ablock = new Uint8Array(block_size);
    var i;


    // initialisation vector
    for (i = 0; i < block_size; i++) {
      iblock[i] = 0;
    }

    iblock = cipherfn.encrypt(iblock);
    for (i = 0; i < block_size; i++) {
      ablock[i] = ciphertext[i];
      iblock[i] ^= ablock[i];
    }

    ablock = cipherfn.encrypt(ablock);

    var result = new Uint8Array(iblock.length + 2);
    result.set(iblock);
    result[iblock.length] = ablock[0] ^ ciphertext[block_size];
    result[iblock.length + 1] = ablock[1] ^ ciphertext[block_size + 1];
    return result;
  },
  /**
   * This function decrypts a given plaintext using the specified
   * blockcipher to decrypt a message
   * @param {String} cipherfn the algorithm cipher class to decrypt
   *  data in one block_size encryption, {@link module:crypto/cipher}.
   * @param {Uint8Array} key Uint8Array representation of key to be used to decrypt the ciphertext.
   * This will be passed to the cipherfn
   * @param {Uint8Array} ciphertext to be decrypted
   * @param {Boolean} resync a boolean value specifying if a resync of the
   *  IV should be used or not. The encrypteddatapacket uses the
   *  "old" style with a resync. Decryption within an
   *  encryptedintegrityprotecteddata packet is not resyncing the IV.
   * @return {Uint8Array} the plaintext data
   */

  decrypt: function(cipherfn, key, ciphertext, resync) {
    cipherfn = new cipher[cipherfn](key);
    var block_size = cipherfn.blockSize;

    var iblock = new Uint8Array(block_size);
    var ablock = new Uint8Array(block_size);

    var i, j, n;
    var text = new Uint8Array(ciphertext.length - block_size);

    // initialisation vector
    for (i = 0; i < block_size; i++) {
      iblock[i] = 0;
    }

    iblock = cipherfn.encrypt(iblock);
    for (i = 0; i < block_size; i++) {
      ablock[i] = ciphertext[i];
      iblock[i] ^= ablock[i];
    }

    ablock = cipherfn.encrypt(ablock);

    // test check octets
    if (iblock[block_size - 2] !== (ablock[0] ^ ciphertext[block_size]) ||
        iblock[block_size - 1] !== (ablock[1] ^ ciphertext[block_size + 1])) {
      throw new Error('CFB decrypt: invalid key');
    }

    /*  RFC4880: Tag 18 and Resync:
     *  [...] Unlike the Symmetrically Encrypted Data Packet, no
     *  special CFB resynchronization is done after encrypting this prefix
     *  data.  See "OpenPGP CFB Mode" below for more details.

     */

    j = 0;
    if (resync) {
      for (i = 0; i < block_size; i++) {
        iblock[i] = ciphertext[i + 2];
      }
      for (n = block_size + 2; n < ciphertext.length; n += block_size) {
        ablock = cipherfn.encrypt(iblock);

        for (i = 0; i < block_size && i + n < ciphertext.length; i++) {
          iblock[i] = ciphertext[n + i];
          if(j < text.length) {
            text[j] = ablock[i] ^ iblock[i];
            j++;
          }
        }
      }
    } else {
      for (i = 0; i < block_size; i++) {
        iblock[i] = ciphertext[i];
      }
      for (n = block_size; n < ciphertext.length; n += block_size) {
        ablock = cipherfn.encrypt(iblock);
        for (i = 0; i < block_size && i + n < ciphertext.length; i++) {
          iblock[i] = ciphertext[n + i];
          if(j < text.length) {
            text[j] = ablock[i] ^ iblock[i];
            j++;
          }
        }
      }
    }

    n = resync ? 0 : 2;

    text = text.subarray(n, ciphertext.length - block_size - 2 + n);

    return text;
  },

  normalEncrypt: function(cipherfn, key, plaintext, iv) {
    cipherfn = new cipher[cipherfn](key);
    var block_size = cipherfn.blockSize;

    var blocki = new Uint8Array(block_size);
    var blockc = new Uint8Array(block_size);
    var pos = 0;
    var cyphertext = new Uint8Array(plaintext.length);
    var i, j = 0;

    if (iv === null) {
      for (i = 0; i < block_size; i++) {
        blockc[i] = 0;
      }
    }
    else {
      for (i = 0; i < block_size; i++) {
        blockc[i] = iv[i];
      }
    }
    while (plaintext.length > block_size * pos) {
      var encblock = cipherfn.encrypt(blockc);
      blocki = plaintext.subarray((pos * block_size), (pos * block_size) + block_size);
      for (i = 0; i < blocki.length; i++) {
        blockc[i] = blocki[i] ^ encblock[i];
        cyphertext[j++] = blockc[i];
      }
      pos++;
    }
    return cyphertext;
  },

  normalDecrypt: function(cipherfn, key, ciphertext, iv) {
    cipherfn = new cipher[cipherfn](key);
    var block_size = cipherfn.blockSize;

    var blockp;
    var pos = 0;
    var plaintext = new Uint8Array(ciphertext.length);
    var offset = 0;
    var i, j = 0;

    if (iv === null) {
      blockp = new Uint8Array(block_size);
      for (i = 0; i < block_size; i++) {
        blockp[i] = 0;
      }
    }
    else {
      blockp = iv.subarray(0, block_size);
    }
    while (ciphertext.length > (block_size * pos)) {
      var decblock = cipherfn.encrypt(blockp);
      blockp = ciphertext.subarray((pos * (block_size)) + offset, (pos * (block_size)) + (block_size) + offset);
      for (i = 0; i < blockp.length; i++) {
        plaintext[j++] = blockp[i] ^ decblock[i];
      }
      pos++;
    }

    return plaintext;
  }
};

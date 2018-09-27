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
 * This object contains utility functions
 * @requires config
 * @module util
 */

'use strict';

import config from './config';

export default {

  isString: function(data) {
    return typeof data === 'string' || String.prototype.isPrototypeOf(data);
  },

  isArray: function(data) {
    return Array.prototype.isPrototypeOf(data);
  },

  isUint8Array: function(data) {
    return Uint8Array.prototype.isPrototypeOf(data);
  },

  isEmailAddress: function(data) {
    if (!this.isString(data)) {
      return false;
    }
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(data);
  },

  isUserId: function(data) {
    if (!this.isString(data)) {
      return false;
    }
    return /</.test(data) && />$/.test(data);
  },

  /**
   * Get transferable objects to pass buffers with zero copy (similar to "pass by reference" in C++)
   *   See: https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage
   * @param  {Object} obj           the options object to be passed to the web worker
   * @return {Array<ArrayBuffer>}   an array of binary data to be passed
   */
  getTransferables: function(obj) {
    if (config.zero_copy && Object.prototype.isPrototypeOf(obj)) {
      const transferables = [];
      this.collectBuffers(obj, transferables);
      return transferables.length ? transferables : undefined;
    }
  },

  collectBuffers: function(obj, collection) {
    if (!obj) {
      return;
    }
    if (this.isUint8Array(obj) && collection.indexOf(obj.buffer) === -1) {
      collection.push(obj.buffer);
      return;
    }
    if (Object.prototype.isPrototypeOf(obj)) {
      for (let key in obj) { // recursively search all children
        this.collectBuffers(obj[key], collection);
      }
    }
  },

  readNumber: function (bytes) {
    var n = 0;
    for (var i = 0; i < bytes.length; i++) {
      n += Math.pow(256, i) * bytes[bytes.length - 1 - i];
    }
    return n;
  },

  writeNumber: function (n, bytes) {
    var b = new Uint8Array(bytes);
    for (var i = 0; i < bytes; i++) {
      b[i] = (n >> (8 * (bytes - i - 1))) & 0xFF;
    }

    return b;
  },

  readDate: function (bytes) {
    var n = this.readNumber(bytes);
    var d = new Date();
    d.setTime(n * 1000);
    return d;
  },

  writeDate: function (time) {
    var numeric = Math.round(time.getTime() / 1000);

    return this.writeNumber(numeric, 4);
  },

  hexdump: function (str) {
    var r = [];
    var e = str.length;
    var c = 0;
    var h;
    var i = 0;
    while (c < e) {
      h = str.charCodeAt(c++).toString(16);
      while (h.length < 2) {
        h = "0" + h;
      }
      r.push(" " + h);
      i++;
      if (i % 32 === 0) {
        r.push("\n           ");
      }
    }
    return r.join('');
  },

  /**
   * Create hexstring from a binary
   * @param {String} str String to convert
   * @return {String} String containing the hexadecimal values
   */
  hexstrdump: function (str) {
    if (str === null) {
      return "";
    }
    var r = [];
    var e = str.length;
    var c = 0;
    var h;
    while (c < e) {
      h = str.charCodeAt(c++).toString(16);
      while (h.length < 2) {
        h = "0" + h;
      }
      r.push("" + h);
    }
    return r.join('');
  },

  /**
   * Create binary string from a hex encoded string
   * @param {String} str Hex string to convert
   * @return {String} String containing the binary values
   */
  hex2bin: function (hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  },

  /**
   * Creating a hex string from an binary array of integers (0..255)
   * @param {String} str Array of bytes to convert
   * @return {String} Hexadecimal representation of the array
   */
  hexidump: function (str) {
    var r = [];
    var e = str.length;
    var c = 0;
    var h;
    while (c < e) {
      h = str[c++].toString(16);
      while (h.length < 2) {
        h = "0" + h;
      }
      r.push("" + h);
    }
    return r.join('');
  },


  /**
   * Convert a native javascript string to a string of utf8 bytes
   * @param {String} str The string to convert
   * @return {String} A valid squence of utf8 bytes
   */
  encode_utf8: function (str) {
    return unescape(encodeURIComponent(str));
  },

  /**
   * Convert a string of utf8 bytes to a native javascript string
   * @param {String} utf8 A valid squence of utf8 bytes
   * @return {String} A native javascript string
   */
  decode_utf8: function (utf8) {
    if (typeof utf8 !== 'string') {
      throw new Error('Parameter "utf8" is not of type string');
    }
    try {
      return decodeURIComponent(escape(utf8));
    } catch (e) {
      return utf8;
    }
  },

  /**
   * Convert an array of integers(0.255) to a string
   * @param {Array<Integer>} bin An array of (binary) integers to convert
   * @return {String} The string representation of the array
   */
  bin2str: function (bin) {
    var result = [];
    for (var i = 0; i < bin.length; i++) {
      result[i] = String.fromCharCode(bin[i]);
    }
    return result.join('');
  },

  /**
   * Convert a string to an array of integers(0.255)
   * @param {String} str String to convert
   * @return {Array<Integer>} An array of (binary) integers
   */
  str2bin: function (str) {
    var result = [];
    for (var i = 0; i < str.length; i++) {
      result[i] = str.charCodeAt(i);
    }
    return result;
  },


  /**
   * Convert a string to a Uint8Array
   * @param {String} str String to convert
   * @return {Uint8Array} The array of (binary) integers
   */
  str2Uint8Array: function (str) {
    if(typeof str !== 'string' && !String.prototype.isPrototypeOf(str)) {
      throw new Error('str2Uint8Array: Data must be in the form of a string');
    }

    var result = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
      result[i] = str.charCodeAt(i);
    }
    return result;
  },

  /**
   * Convert a Uint8Array to a string. This currently functions
   * the same as bin2str.
   * @function module:util.Uint8Array2str
   * @param {Uint8Array} bin An array of (binary) integers to convert
   * @return {String} String representation of the array
   */
  Uint8Array2str: function (bin) {
    if(!Uint8Array.prototype.isPrototypeOf(bin)) {
      throw new Error('Uint8Array2str: Data must be in the form of a Uint8Array');
    }

    var result = [],
      bs = 16384,
      j = bin.length;

    for (var i = 0; i < j; i += bs) {
      result.push(String.fromCharCode.apply(String, bin.subarray(i, i+bs < j ? i+bs : j)));
    }
    return result.join('');
  },

  /**
   * Concat Uint8arrays
   * @function module:util.concatUint8Array
   * @param {Array<Uint8array>} Array of Uint8Arrays to concatenate
   * @return {Uint8array} Concatenated array
   */
  concatUint8Array: function (arrays) {
    var totalLength = 0;
    arrays.forEach(function (element) {
      if(!Uint8Array.prototype.isPrototypeOf(element)) {
        throw new Error('concatUint8Array: Data must be in the form of a Uint8Array');
      }

      totalLength += element.length;
    });

    var result = new Uint8Array(totalLength);
    var pos = 0;
    arrays.forEach(function (element) {
      result.set(element,pos);
      pos += element.length;
    });

    return result;
  },

  /**
   * Deep copy Uint8Array
   * @function module:util.copyUint8Array
   * @param {Uint8Array} Array to copy
   * @return {Uint8Array} new Uint8Array
   */
  copyUint8Array: function (array) {
    if(!Uint8Array.prototype.isPrototypeOf(array)) {
      throw new Error('Data must be in the form of a Uint8Array');
    }

    var copy = new Uint8Array(array.length);
    copy.set(array);
    return copy;
  },

  /**
   * Check Uint8Array equality
   * @function module:util.equalsUint8Array
   * @param {Uint8Array} first array
   * @param {Uint8Array} second array
   * @return {Boolean} equality
   */
  equalsUint8Array: function (array1, array2) {
    if(!Uint8Array.prototype.isPrototypeOf(array1) || !Uint8Array.prototype.isPrototypeOf(array2)) {
      throw new Error('Data must be in the form of a Uint8Array');
    }

    if(array1.length !== array2.length) {
      return false;
    }

    for(var i = 0; i < array1.length; i++) {
      if(array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  },

  /**
   * Calculates a 16bit sum of a Uint8Array by adding each character
   * codes modulus 65535
   * @param {Uint8Array} Uint8Array to create a sum of
   * @return {Integer} An integer containing the sum of all character
   * codes % 65535
   */
  calc_checksum: function (text) {
    var checksum = {
      s: 0,
      add: function (sadd) {
        this.s = (this.s + sadd) % 65536;
      }
    };
    for (var i = 0; i < text.length; i++) {
      checksum.add(text[i]);
    }
    return checksum.s;
  },

  /**
   * Helper function to print a debug message. Debug
   * messages are only printed if
   * @link module:config/config.debug is set to true.
   * @param {String} str String of the debug message
   */
  print_debug: function (str) {
    if (config.debug) {
      console.log(str);
    }
  },

  /**
   * Helper function to print a debug message. Debug
   * messages are only printed if
   * @link module:config/config.debug is set to true.
   * Different than print_debug because will call hexstrdump iff necessary.
   * @param {String} str String of the debug message
   */
  print_debug_hexstr_dump: function (str, strToHex) {
    if (config.debug) {
      str = str + this.hexstrdump(strToHex);
      console.log(str);
    }
  },

  getLeftNBits: function (string, bitcount) {
    var rest = bitcount % 8;
    if (rest === 0) {
      return string.substring(0, bitcount / 8);
    }
    var bytes = (bitcount - rest) / 8 + 1;
    var result = string.substring(0, bytes);
    return this.shiftRight(result, 8 - rest); // +String.fromCharCode(string.charCodeAt(bytes -1) << (8-rest) & 0xFF);
  },

  /**
   * Shifting a string to n bits right
   * @param {String} value The string to shift
   * @param {Integer} bitcount Amount of bits to shift (MUST be smaller
   * than 9)
   * @return {String} Resulting string.
   */
  shiftRight: function (value, bitcount) {
    var temp = this.str2bin(value);
    if (bitcount % 8 !== 0) {
      for (var i = temp.length - 1; i >= 0; i--) {
        temp[i] >>= bitcount % 8;
        if (i > 0) {
          temp[i] |= (temp[i - 1] << (8 - (bitcount % 8))) & 0xFF;
        }
      }
    } else {
      return value;
    }
    return this.bin2str(temp);
  },

  /**
   * Return the algorithm type as string
   * @return {String} String representing the message type
   */
  get_hashAlgorithmString: function (algo) {
    switch (algo) {
      case 1:
        return "MD5";
      case 2:
        return "SHA1";
      case 3:
        return "RIPEMD160";
      case 8:
        return "SHA256";
      case 9:
        return "SHA384";
      case 10:
        return "SHA512";
      case 11:
        return "SHA224";
    }
    return "unknown";
  },

  /**
   * Get native Web Cryptography api, only the current version of the spec.
   * The default configuration is to use the api when available. But it can
   * be deactivated with config.use_native
   * @return {Object}   The SubtleCrypto api or 'undefined'
   */
  getWebCrypto: function() {
    if (!config.use_native) {
      return;
    }

    return typeof window !== 'undefined' && window.crypto && window.crypto.subtle;
  },

  /**
   * Get native Web Cryptography api for all browsers, including legacy
   * implementations of the spec e.g IE11 and Safari 8/9. The default
   * configuration is to use the api when available. But it can be deactivated
   * with config.use_native
   * @return {Object}   The SubtleCrypto api or 'undefined'
   */
  getWebCryptoAll: function() {
    if (!config.use_native) {
      return;
    }

    if (typeof window !== 'undefined') {
      if (window.crypto) {
        return window.crypto.subtle || window.crypto.webkitSubtle;
      }
      if (window.msCrypto) {
        return window.msCrypto.subtle;
      }
    }
  },

  /**
   * Wraps a generic synchronous function in an ES6 Promise.
   * @param  {Function} fn  The function to be wrapped
   * @return {Function}     The function wrapped in a Promise
   */
  promisify: function(fn) {
    return function() {
      var args = arguments;
      return new Promise(function(resolve) {
        var result = fn.apply(null, args);
        resolve(result);
      });
    };
  },

  /**
   * Converts an IE11 web crypro api result to a promise.
   *   This is required since IE11 implements an old version of the
   *   Web Crypto specification that does not use promises.
   * @param  {Object} cryptoOp The return value of an IE11 web cryptro api call
   * @param  {String} errmsg   An error message for a specific operation
   * @return {Promise}         The resulting Promise
   */
  promisifyIE11Op: function(cryptoOp, errmsg) {
    return new Promise(function(resolve, reject) {
      cryptoOp.onerror = function () {
        reject(new Error(errmsg));
      };
      cryptoOp.oncomplete = function (e) {
        resolve(e.target.result);
      };
    });
  },

  /**
   * Detect Node.js runtime.
   */
  detectNode: function() {
    return typeof window === 'undefined';
  },

  /**
   * Get native Node.js crypto api. The default configuration is to use
   * the api when available. But it can also be deactivated with config.use_native
   * @return {Object}   The crypto module or 'undefined'
   */
  getNodeCrypto: function() {
    if (!this.detectNode() || !config.use_native) {
      return;
    }

    return require('crypto');
  },

  /**
   * Get native Node.js Buffer constructor. This should be used since
   * Buffer is not available under browserify.
   * @return {Function}   The Buffer constructor or 'undefined'
   */
  getNodeBuffer: function() {
    if (!this.detectNode()) {
      return;
    }

    return require('buffer').Buffer;
  }

};

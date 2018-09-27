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

// The GPG4Browsers crypto interface

/**
 * @requires type/mpi
 * @requires util
 * @module crypto/random
 */

'use strict';

import type_mpi from '../type/mpi.js';
import util from '../util.js';
const nodeCrypto = util.detectNode() && require('crypto');

export default {
  /**
   * Retrieve secure random byte array of the specified length
   * @param {Integer} length Length in bytes to generate
   * @return {Uint8Array} Random byte array
   */
  getRandomBytes: function(length) {
    var result = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      result[i] = this.getSecureRandomOctet();
    }
    return result;
  },

  /**
   * Return a secure random number in the specified range
   * @param {Integer} from Min of the random number
   * @param {Integer} to Max of the random number (max 32bit)
   * @return {Integer} A secure random number
   */
  getSecureRandom: function(from, to) {
    var randUint = this.getSecureRandomUint();
    var bits = ((to - from)).toString(2).length;
    while ((randUint & (Math.pow(2, bits) - 1)) > (to - from)) {
      randUint = this.getSecureRandomUint();
    }
    return from + (Math.abs(randUint & (Math.pow(2, bits) - 1)));
  },

  getSecureRandomOctet: function() {
    var buf = new Uint8Array(1);
    this.getRandomValues(buf);
    return buf[0];
  },

  getSecureRandomUint: function() {
    var buf = new Uint8Array(4);
    var dv = new DataView(buf.buffer);
    this.getRandomValues(buf);
    return dv.getUint32(0);
  },

  /**
   * Helper routine which calls platform specific crypto random generator
   * @param {Uint8Array} buf
   */
  getRandomValues: function(buf) {
    if (!(buf instanceof Uint8Array)) {
      throw new Error('Invalid type: buf not an Uint8Array');
    }
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(buf);
    } else if (typeof window !== 'undefined' && typeof window.msCrypto === 'object' && typeof window.msCrypto.getRandomValues === 'function') {
      window.msCrypto.getRandomValues(buf);
    } else if (nodeCrypto) {
      var bytes = nodeCrypto.randomBytes(buf.length);
      buf.set(bytes);
    } else if (this.randomBuffer.buffer) {
      this.randomBuffer.get(buf);
    } else {
      throw new Error('No secure random number generator available.');
    }
    return buf;
  },

  /**
   * Create a secure random big integer of bits length
   * @param {Integer} bits Bit length of the MPI to create
   * @return {BigInteger} Resulting big integer
   */
  getRandomBigInteger: function(bits) {
    if (bits < 1) {
      throw new Error('Illegal parameter value: bits < 1');
    }
    var numBytes = Math.floor((bits + 7) / 8);

    var randomBits = util.Uint8Array2str(this.getRandomBytes(numBytes));
    if (bits % 8 > 0) {

      randomBits = String.fromCharCode(
      (Math.pow(2, bits % 8) - 1) &
        randomBits.charCodeAt(0)) +
        randomBits.substring(1);
    }
    var mpi = new type_mpi();
    mpi.fromBytes(randomBits);
    return mpi.toBigInteger();
  },

  getRandomBigIntegerInRange: function(min, max) {
    if (max.compareTo(min) <= 0) {
      throw new Error('Illegal parameter value: max <= min');
    }

    var range = max.subtract(min);
    var r = this.getRandomBigInteger(range.bitLength());
    while (r.compareTo(range) > 0) {
      r = this.getRandomBigInteger(range.bitLength());
    }
    return min.add(r);
  },

  randomBuffer: new RandomBuffer()

};

/**
 * Buffer for secure random numbers
 */
function RandomBuffer() {
  this.buffer = null;
  this.size = null;
}

/**
 * Initialize buffer
 * @param  {Integer} size size of buffer
 */
RandomBuffer.prototype.init = function(size) {
  this.buffer = new Uint8Array(size);
  this.size = 0;
};

/**
 * Concat array of secure random numbers to buffer
 * @param {Uint8Array} buf
 */
RandomBuffer.prototype.set = function(buf) {
  if (!this.buffer) {
    throw new Error('RandomBuffer is not initialized');
  }
  if (!(buf instanceof Uint8Array)) {
    throw new Error('Invalid type: buf not an Uint8Array');
  }
  var freeSpace = this.buffer.length - this.size;
  if (buf.length > freeSpace) {
    buf = buf.subarray(0, freeSpace);
  }
  // set buf with offset old size of buffer
  this.buffer.set(buf, this.size);
  this.size += buf.length;
};

/**
 * Take numbers out of buffer and copy to array
 * @param {Uint8Array} buf the destination array
 */
RandomBuffer.prototype.get = function(buf) {
  if (!this.buffer) {
    throw new Error('RandomBuffer is not initialized');
  }
  if (!(buf instanceof Uint8Array)) {
    throw new Error('Invalid type: buf not an Uint8Array');
  }
  if (this.size < buf.length) {
    throw new Error('Random number buffer depleted');
  }
  for (var i = 0; i < buf.length; i++) {
    buf[i] = this.buffer[--this.size];
    // clear buffer value
    this.buffer[this.size] = 0;
  }
};

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

// Hint: We hold our MPIs as an array of octets in big endian format preceeding a two
// octet scalar: MPI: [a,b,c,d,e,f]
// - MPI size: (a << 8) | b
// - MPI = c | d << 8 | e << ((MPI.length -2)*8) | f ((MPI.length -2)*8)

/**
 * Implementation of type MPI ({@link http://tools.ietf.org/html/rfc4880#section-3.2|RFC4880 3.2})<br/>
 * <br/>
 * Multiprecision integers (also called MPIs) are unsigned integers used
 * to hold large integers such as the ones used in cryptographic
 * calculations.
 * An MPI consists of two pieces: a two-octet scalar that is the length
 * of the MPI in bits followed by a string of octets that contain the
 * actual integer.
 * @requires crypto/public_key/jsbn
 * @requires util
 * @module type/mpi
 */

'use strict';

import BigInteger from '../crypto/public_key/jsbn.js';
import util from '../util.js';

/**
 * @constructor
 */
export default function MPI() {
  /** An implementation dependent integer */
  this.data = null;
}

/**
 * Parsing function for a mpi ({@link http://tools.ietf.org/html/rfc4880#section3.2|RFC 4880 3.2}).
 * @param {String} input Payload of mpi data
 * @return {Integer} Length of data read
 */
MPI.prototype.read = function (bytes) {

  if(typeof bytes === 'string' || String.prototype.isPrototypeOf(bytes)) {
    bytes = util.str2Uint8Array(bytes);
  }

  var bits = (bytes[0] << 8) | bytes[1];

  // Additional rules:
  //
  //    The size of an MPI is ((MPI.length + 7) / 8) + 2 octets.
  //
  //    The length field of an MPI describes the length starting from its
  //    most significant non-zero bit.  Thus, the MPI [00 02 01] is not
  //    formed correctly.  It should be [00 01 01].

  // TODO: Verification of this size method! This size calculation as
  //      specified above is not applicable in JavaScript
  var bytelen = Math.ceil(bits / 8);

  var raw = util.Uint8Array2str(bytes.subarray(2, 2 + bytelen));
  this.fromBytes(raw);

  return 2 + bytelen;
};

MPI.prototype.fromBytes = function (bytes) {
  this.data = new BigInteger(util.hexstrdump(bytes), 16);
};

MPI.prototype.toBytes = function () {
  var bytes = util.Uint8Array2str(this.write());
  return bytes.substr(2);
};

MPI.prototype.byteLength = function () {
  return this.toBytes().length;
};

/**
 * Converts the mpi object to a bytes as specified in {@link http://tools.ietf.org/html/rfc4880#section-3.2|RFC4880 3.2}
 * @return {Uint8Aray} mpi Byte representation
 */
MPI.prototype.write = function () {
  return util.str2Uint8Array(this.data.toMPI());
};

MPI.prototype.toBigInteger = function () {
  return this.data.clone();
};

MPI.prototype.fromBigInteger = function (bn) {
  this.data = bn.clone();
};

MPI.fromClone = function (clone) {
  clone.data.copyTo = BigInteger.prototype.copyTo;
  var bn = new BigInteger();
  clone.data.copyTo(bn);
  var mpi = new MPI();
  mpi.data = bn;
  return mpi;
};

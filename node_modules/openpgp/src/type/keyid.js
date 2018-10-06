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
 * Implementation of type key id ({@link http://tools.ietf.org/html/rfc4880#section-3.3|RFC4880 3.3})<br/>
 * <br/>
 * A Key ID is an eight-octet scalar that identifies a key.
 * Implementations SHOULD NOT assume that Key IDs are unique.  The
 * section "Enhanced Key Formats" below describes how Key IDs are
 * formed.
 * @requires util
 * @module type/keyid
 */

'use strict';

import util from '../util.js';

/**
 * @constructor
 */
export default function Keyid() {
  this.bytes = '';
}

/**
 * Parsing method for a key id
 * @param {Uint8Array} input Input to read the key id from
 */
Keyid.prototype.read = function(bytes) {
  this.bytes = util.Uint8Array2str(bytes.subarray(0, 8));
};

Keyid.prototype.write = function() {
  return util.str2Uint8Array(this.bytes);
};

Keyid.prototype.toHex = function() {
  return util.hexstrdump(this.bytes);
};

Keyid.prototype.equals = function(keyid) {
  return this.bytes === keyid.bytes;
};

Keyid.prototype.isNull = function() {
  return this.bytes === '';
};

Keyid.mapToHex = function (keyId) {
  return keyId.toHex();
};

Keyid.fromClone = function (clone) {
  var keyid = new Keyid();
  keyid.bytes = clone.bytes;
  return keyid;
};

Keyid.fromId = function (hex) {
  var keyid = new Keyid();
  keyid.read(util.str2Uint8Array(util.hex2bin(hex)));
  return keyid;
};

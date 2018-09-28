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
 * @requires config
 * @requires crypto
 * @requires encoding/armor
 * @requires enums
 * @requires packet
 * @module signature
 */

'use strict';

import packet from './packet';
import enums from './enums.js';
import armor from './encoding/armor.js';

/**
 * @class
 * @classdesc Class that represents an OpenPGP signature.
 * @param  {module:packet/packetlist} packetlist The signature packets
 */

export function Signature(packetlist) {
  if (!(this instanceof Signature)) {
    return new Signature(packetlist);
  }
  this.packets = packetlist || new packet.List();
}


/**
 * Returns ASCII armored text of signature
 * @return {String} ASCII armor
 */
Signature.prototype.armor = function() {
  return armor.encode(enums.armor.signature, this.packets.write());
};

/**
 * reads an OpenPGP armored signature and returns a signature object
 * @param {String} armoredText text to be parsed
 * @return {Signature} new signature object
 * @static
 */
export function readArmored(armoredText) {
  var input = armor.decode(armoredText).data;
  return read(input);
}

/**
 * reads an OpenPGP signature as byte array and returns a signature object
 * @param {Uint8Array} input   binary signature
 * @return {Signature}         new signature object
 * @static
 */
export function read(input) {
  var packetlist = new packet.List();
  packetlist.read(input);
  return new Signature(packetlist);
}

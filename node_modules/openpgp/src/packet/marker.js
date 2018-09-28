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
 * Implementation of the strange "Marker packet" (Tag 10)<br/>
 * <br/>
 * {@link http://tools.ietf.org/html/rfc4880#section-5.8|RFC4880 5.8}: An experimental version of PGP used this packet as the Literal
 * packet, but no released version of PGP generated Literal packets with this
 * tag. With PGP 5.x, this packet has been reassigned and is reserved for use as
 * the Marker packet.<br/>
 * <br/>
 * Such a packet MUST be ignored when received.
 * @requires enums
 * @module packet/marker
 */

'use strict';

import enums from '../enums.js';

/**
 * @constructor
 */
export default function Marker() {
  this.tag = enums.packet.marker;
}

/**
 * Parsing function for a literal data packet (tag 10).
 *
 * @param {String} input Payload of a tag 10 packet
 * @param {Integer} position
 *            Position to start reading from the input string
 * @param {Integer} len
 *            Length of the packet or the remaining length of
 *            input at position
 * @return {module:packet/marker} Object representation
 */
Marker.prototype.read = function (bytes) {
  if (bytes[0] === 0x50 && // P
      bytes[1] === 0x47 && // G
      bytes[2] === 0x50) { // P
    return true;
  }
  // marker packet does not contain "PGP"
  return false;
};

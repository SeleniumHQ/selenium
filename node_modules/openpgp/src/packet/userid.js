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
 * Implementation of the User ID Packet (Tag 13)<br/>
 * <br/>
 * A User ID packet consists of UTF-8 text that is intended to represent
 * the name and email address of the key holder.  By convention, it
 * includes an RFC 2822 [RFC2822] mail name-addr, but there are no
 * restrictions on its content.  The packet length in the header
 * specifies the length of the User ID.
 * @requires util
 * @requires enums
 * @module packet/userid
 */

'use strict';

import util from '../util.js';
import enums from '../enums.js';

/**
 * @constructor
 */
export default function Userid() {
  this.tag = enums.packet.userid;
  /** A string containing the user id. Usually in the form
   * John Doe <john@example.com>
   * @type {String}
   */
  this.userid = '';
}

/**
 * Parsing function for a user id packet (tag 13).
 * @param {Uint8Array} input payload of a tag 13 packet
 */
Userid.prototype.read = function (bytes) {
  this.userid = util.decode_utf8(util.Uint8Array2str(bytes));
};

/**
 * Creates a binary representation of the user id packet
 * @return {Uint8Array} binary representation
 */
Userid.prototype.write = function () {
  return util.str2Uint8Array(util.encode_utf8(this.userid));
};

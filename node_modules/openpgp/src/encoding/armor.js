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
 * @requires encoding/base64
 * @requires enums
 * @requires config
 * @module encoding/armor
 */

'use strict';

import base64 from './base64.js';
import enums from '../enums.js';
import config from '../config';

/**
 * Finds out which Ascii Armoring type is used. Throws error if unknown type.
 * @private
 * @param {String} text [String] ascii armored text
 * @returns {Integer} 0 = MESSAGE PART n of m
 *         1 = MESSAGE PART n
 *         2 = SIGNED MESSAGE
 *         3 = PGP MESSAGE
 *         4 = PUBLIC KEY BLOCK
 *         5 = PRIVATE KEY BLOCK
 *         6 = SIGNATURE
 */
function getType(text) {
  var reHeader = /^-----BEGIN PGP (MESSAGE, PART \d+\/\d+|MESSAGE, PART \d+|SIGNED MESSAGE|MESSAGE|PUBLIC KEY BLOCK|PRIVATE KEY BLOCK|SIGNATURE)-----$\n/m;

  var header = text.match(reHeader);

  if (!header) {
    throw new Error('Unknown ASCII armor type');
  }

  // BEGIN PGP MESSAGE, PART X/Y
  // Used for multi-part messages, where the armor is split amongst Y
  // parts, and this is the Xth part out of Y.
  if (/MESSAGE, PART \d+\/\d+/.test(header[1])) {
    return enums.armor.multipart_section;
  } else
  // BEGIN PGP MESSAGE, PART X
  // Used for multi-part messages, where this is the Xth part of an
  // unspecified number of parts. Requires the MESSAGE-ID Armor
  // Header to be used.
  if (/MESSAGE, PART \d+/.test(header[1])) {
    return enums.armor.multipart_last;

  } else
  // BEGIN PGP SIGNED MESSAGE
  if (/SIGNED MESSAGE/.test(header[1])) {
    return enums.armor.signed;

  } else
  // BEGIN PGP MESSAGE
  // Used for signed, encrypted, or compressed files.
  if (/MESSAGE/.test(header[1])) {
    return enums.armor.message;

  } else
  // BEGIN PGP PUBLIC KEY BLOCK
  // Used for armoring public keys.
  if (/PUBLIC KEY BLOCK/.test(header[1])) {
    return enums.armor.public_key;

  } else
  // BEGIN PGP PRIVATE KEY BLOCK
  // Used for armoring private keys.
  if (/PRIVATE KEY BLOCK/.test(header[1])) {
    return enums.armor.private_key;

  } else
  // BEGIN PGP SIGNATURE
  // Used for detached signatures, OpenPGP/MIME signatures, and
  // cleartext signatures. Note that PGP 2.x uses BEGIN PGP MESSAGE
  // for detached signatures.
  if (/SIGNATURE/.test(header[1])) {
    return enums.armor.signature;
  }
}

/**
 * Add additional information to the armor version of an OpenPGP binary
 * packet block.
 * @author  Alex
 * @version 2011-12-16
 * @returns {String} The header information
 */
function addheader() {
  var result = "";
  if (config.show_version) {
    result += "Version: " + config.versionstring + '\r\n';
  }
  if (config.show_comment) {
    result += "Comment: " + config.commentstring + '\r\n';
  }
  result += '\r\n';
  return result;
}



/**
 * Calculates a checksum over the given data and returns it base64 encoded
 * @param {String} data Data to create a CRC-24 checksum for
 * @return {String} Base64 encoded checksum
 */
function getCheckSum(data) {
  var c = createcrc24(data);
  var bytes = new Uint8Array([c >> 16, (c >> 8) & 0xFF, c & 0xFF]);
  return base64.encode(bytes);
}

/**
 * Calculates the checksum over the given data and compares it with the
 * given base64 encoded checksum
 * @param {String} data Data to create a CRC-24 checksum for
 * @param {String} checksum Base64 encoded checksum
 * @return {Boolean} True if the given checksum is correct; otherwise false
 */
function verifyCheckSum(data, checksum) {
  var c = getCheckSum(data);
  var d = checksum;
  return c[0] === d[0] && c[1] === d[1] && c[2] === d[2] && c[3] === d[3];
}
/**
 * Internal function to calculate a CRC-24 checksum over a given string (data)
 * @param {String} data Data to create a CRC-24 checksum for
 * @return {Integer} The CRC-24 checksum as number
 */
var crc_table = [
    0x00000000, 0x00864cfb, 0x018ad50d, 0x010c99f6, 0x0393e6e1, 0x0315aa1a, 0x021933ec, 0x029f7f17, 0x07a18139,
    0x0727cdc2, 0x062b5434, 0x06ad18cf, 0x043267d8, 0x04b42b23, 0x05b8b2d5, 0x053efe2e, 0x0fc54e89, 0x0f430272,
    0x0e4f9b84, 0x0ec9d77f, 0x0c56a868, 0x0cd0e493, 0x0ddc7d65, 0x0d5a319e, 0x0864cfb0, 0x08e2834b, 0x09ee1abd,
    0x09685646, 0x0bf72951, 0x0b7165aa, 0x0a7dfc5c, 0x0afbb0a7, 0x1f0cd1e9, 0x1f8a9d12, 0x1e8604e4, 0x1e00481f,
    0x1c9f3708, 0x1c197bf3, 0x1d15e205, 0x1d93aefe, 0x18ad50d0, 0x182b1c2b, 0x192785dd, 0x19a1c926, 0x1b3eb631,
    0x1bb8faca, 0x1ab4633c, 0x1a322fc7, 0x10c99f60, 0x104fd39b, 0x11434a6d, 0x11c50696, 0x135a7981, 0x13dc357a,
    0x12d0ac8c, 0x1256e077, 0x17681e59, 0x17ee52a2, 0x16e2cb54, 0x166487af, 0x14fbf8b8, 0x147db443, 0x15712db5,
    0x15f7614e, 0x3e19a3d2, 0x3e9fef29, 0x3f9376df, 0x3f153a24, 0x3d8a4533, 0x3d0c09c8, 0x3c00903e, 0x3c86dcc5,
    0x39b822eb, 0x393e6e10, 0x3832f7e6, 0x38b4bb1d, 0x3a2bc40a, 0x3aad88f1, 0x3ba11107, 0x3b275dfc, 0x31dced5b,
    0x315aa1a0,
    0x30563856, 0x30d074ad, 0x324f0bba, 0x32c94741, 0x33c5deb7, 0x3343924c, 0x367d6c62, 0x36fb2099, 0x37f7b96f,
    0x3771f594, 0x35ee8a83, 0x3568c678, 0x34645f8e, 0x34e21375, 0x2115723b, 0x21933ec0, 0x209fa736, 0x2019ebcd,
    0x228694da, 0x2200d821, 0x230c41d7, 0x238a0d2c, 0x26b4f302, 0x2632bff9, 0x273e260f, 0x27b86af4, 0x252715e3,
    0x25a15918, 0x24adc0ee, 0x242b8c15, 0x2ed03cb2, 0x2e567049, 0x2f5ae9bf, 0x2fdca544, 0x2d43da53, 0x2dc596a8,
    0x2cc90f5e, 0x2c4f43a5, 0x2971bd8b, 0x29f7f170, 0x28fb6886, 0x287d247d, 0x2ae25b6a, 0x2a641791, 0x2b688e67,
    0x2beec29c, 0x7c3347a4, 0x7cb50b5f, 0x7db992a9, 0x7d3fde52, 0x7fa0a145, 0x7f26edbe, 0x7e2a7448, 0x7eac38b3,
    0x7b92c69d, 0x7b148a66, 0x7a181390, 0x7a9e5f6b, 0x7801207c, 0x78876c87, 0x798bf571, 0x790db98a, 0x73f6092d,
    0x737045d6, 0x727cdc20, 0x72fa90db, 0x7065efcc, 0x70e3a337, 0x71ef3ac1, 0x7169763a, 0x74578814, 0x74d1c4ef,
    0x75dd5d19, 0x755b11e2, 0x77c46ef5, 0x7742220e, 0x764ebbf8, 0x76c8f703, 0x633f964d, 0x63b9dab6, 0x62b54340,
    0x62330fbb,
    0x60ac70ac, 0x602a3c57, 0x6126a5a1, 0x61a0e95a, 0x649e1774, 0x64185b8f, 0x6514c279, 0x65928e82, 0x670df195,
    0x678bbd6e, 0x66872498, 0x66016863, 0x6cfad8c4, 0x6c7c943f, 0x6d700dc9, 0x6df64132, 0x6f693e25, 0x6fef72de,
    0x6ee3eb28, 0x6e65a7d3, 0x6b5b59fd, 0x6bdd1506, 0x6ad18cf0, 0x6a57c00b, 0x68c8bf1c, 0x684ef3e7, 0x69426a11,
    0x69c426ea, 0x422ae476, 0x42aca88d, 0x43a0317b, 0x43267d80, 0x41b90297, 0x413f4e6c, 0x4033d79a, 0x40b59b61,
    0x458b654f, 0x450d29b4, 0x4401b042, 0x4487fcb9, 0x461883ae, 0x469ecf55, 0x479256a3, 0x47141a58, 0x4defaaff,
    0x4d69e604, 0x4c657ff2, 0x4ce33309, 0x4e7c4c1e, 0x4efa00e5, 0x4ff69913, 0x4f70d5e8, 0x4a4e2bc6, 0x4ac8673d,
    0x4bc4fecb, 0x4b42b230, 0x49ddcd27, 0x495b81dc, 0x4857182a, 0x48d154d1, 0x5d26359f, 0x5da07964, 0x5cace092,
    0x5c2aac69, 0x5eb5d37e, 0x5e339f85, 0x5f3f0673, 0x5fb94a88, 0x5a87b4a6, 0x5a01f85d, 0x5b0d61ab, 0x5b8b2d50,
    0x59145247, 0x59921ebc, 0x589e874a, 0x5818cbb1, 0x52e37b16, 0x526537ed, 0x5369ae1b, 0x53efe2e0, 0x51709df7,
    0x51f6d10c,
    0x50fa48fa, 0x507c0401, 0x5542fa2f, 0x55c4b6d4, 0x54c82f22, 0x544e63d9, 0x56d11cce, 0x56575035, 0x575bc9c3,
    0x57dd8538
];

function createcrc24(input) {
  var crc = 0xB704CE;

  for (var index = 0; index < input.length; index++) {
    crc = (crc << 8) ^ crc_table[((crc >> 16) ^ input[index]) & 0xff];
  }
  return crc & 0xffffff;
}

/**
 * Splits a message into two parts, the headers and the body. This is an internal function
 * @param {String} text OpenPGP armored message part
 * @returns {Object} An object with attribute "headers" containing the headers
 * and an attribute "body" containing the body.
 */
function splitHeaders(text) {
  // empty line with whitespace characters
  var reEmptyLine = /^[ \f\r\t\u00a0\u2000-\u200a\u202f\u205f\u3000]*\n/m;
  var headers = '';
  var body = text;

  var matchResult = reEmptyLine.exec(text);

  if (matchResult !== null) {
    headers = text.slice(0, matchResult.index);
    body = text.slice(matchResult.index + matchResult[0].length);
  } else {
    throw new Error('Mandatory blank line missing between armor headers and armor data');
  }

  headers = headers.split('\n');
  // remove empty entry
  headers.pop();

  return { headers: headers, body: body };
}

/**
 * Verify armored headers. RFC4880, section 6.3: "OpenPGP should consider improperly formatted
 * Armor Headers to be corruption of the ASCII Armor."
 * @private
 * @param  {Array<String>} headers Armor headers
 */
function verifyHeaders(headers) {
  for (var i = 0; i < headers.length; i++) {
    if (!/^([^\s:]|[^\s:][^:]*[^\s:]): .+$/.test(headers[i])) {
      throw new Error('Improperly formatted armor header: ' + headers[i]);
    }
    if (config.debug && !/^(Version|Comment|MessageID|Hash|Charset): .+$/.test(headers[i])) {
      console.log('Unknown header: ' + headers[i]);
    }
  }
}

/**
 * Splits a message into two parts, the body and the checksum. This is an internal function
 * @param {String} text OpenPGP armored message part
 * @returns {Object} An object with attribute "body" containing the body
 * and an attribute "checksum" containing the checksum.
 */
function splitChecksum(text) {
  text = text.trim();
  var body = text;
  var checksum = "";

  var lastEquals = text.lastIndexOf("=");

  if (lastEquals >= 0 && lastEquals !== text.length - 1) { // '=' as the last char means no checksum
    body = text.slice(0, lastEquals);
    checksum = text.slice(lastEquals + 1).substr(0, 4);
  }

  return { body: body, checksum: checksum };
}

/**
 * DeArmor an OpenPGP armored message; verify the checksum and return
 * the encoded bytes
 * @param {String} text OpenPGP armored message
 * @returns {Object} An object with attribute "text" containing the message text,
 * an attribute "data" containing the bytes and "type" for the ASCII armor type
 * @static
 */
function dearmor(text) {
  var reSplit = /^-----[^-]+-----$\n/m;

  // remove trailing whitespace at end of line
  text = text.replace(/[\t\r ]+\n/g, '\n');

  var type = getType(text);

  text = text.trim() + "\n";
  var splittext = text.split(reSplit);

  // IE has a bug in split with a re. If the pattern matches the beginning of the
  // string it doesn't create an empty array element 0. So we need to detect this
  // so we know the index of the data we are interested in.
  var indexBase = 1;

  var result, checksum, msg;

  if (text.search(reSplit) !== splittext[0].length) {
    indexBase = 0;
  }

  if (type !== 2) {
    msg = splitHeaders(splittext[indexBase]);
    var msg_sum = splitChecksum(msg.body);

    result = {
      data: base64.decode(msg_sum.body),
      headers: msg.headers,
      type: type
    };

    checksum = msg_sum.checksum;
  } else {
    // Reverse dash-escaping for msg
    msg = splitHeaders(splittext[indexBase].replace(/^- /mg, ''));
    var sig = splitHeaders(splittext[indexBase + 1].replace(/^- /mg, ''));
    verifyHeaders(sig.headers);
    var sig_sum = splitChecksum(sig.body);

    result = {
      text: msg.body.replace(/\n$/, '').replace(/\n/g, "\r\n"),
      data: base64.decode(sig_sum.body),
      headers: msg.headers,
      type: type
    };

    checksum = sig_sum.checksum;
  }

  if (!verifyCheckSum(result.data, checksum) && (checksum || config.checksum_required)) {
    // will NOT throw error if checksum is empty AND checksum is not required (GPG compatibility)
    throw new Error("Ascii armor integrity check on message failed: '" + checksum + "' should be '" +
      getCheckSum(result.data) + "'");
  }

  verifyHeaders(result.headers);

  return result;
}


/**
 * Armor an OpenPGP binary packet block
 * @param {Integer} messagetype type of the message
 * @param body
 * @param {Integer} partindex
 * @param {Integer} parttotal
 * @returns {String} Armored text
 * @static
 */
function armor(messagetype, body, partindex, parttotal) {
  var result = [];
  switch (messagetype) {
    case enums.armor.multipart_section:
      result.push("-----BEGIN PGP MESSAGE, PART " + partindex + "/" + parttotal + "-----\r\n");
      result.push(addheader());
      result.push(base64.encode(body));
      result.push("\r\n=" + getCheckSum(body) + "\r\n");
      result.push("-----END PGP MESSAGE, PART " + partindex + "/" + parttotal + "-----\r\n");
      break;
    case enums.armor.multipart_last:
      result.push("-----BEGIN PGP MESSAGE, PART " + partindex + "-----\r\n");
      result.push(addheader());
      result.push(base64.encode(body));
      result.push("\r\n=" + getCheckSum(body) + "\r\n");
      result.push("-----END PGP MESSAGE, PART " + partindex + "-----\r\n");
      break;
    case enums.armor.signed:
      result.push("\r\n-----BEGIN PGP SIGNED MESSAGE-----\r\n");
      result.push("Hash: " + body.hash + "\r\n\r\n");
      result.push(body.text.replace(/\n-/g, "\n- -"));
      result.push("\r\n-----BEGIN PGP SIGNATURE-----\r\n");
      result.push(addheader());
      result.push(base64.encode(body.data));
      result.push("\r\n=" + getCheckSum(body.data) + "\r\n");
      result.push("-----END PGP SIGNATURE-----\r\n");
      break;
    case enums.armor.message:
      result.push("-----BEGIN PGP MESSAGE-----\r\n");
      result.push(addheader());
      result.push(base64.encode(body));
      result.push("\r\n=" + getCheckSum(body) + "\r\n");
      result.push("-----END PGP MESSAGE-----\r\n");
      break;
    case enums.armor.public_key:
      result.push("-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n");
      result.push(addheader());
      result.push(base64.encode(body));
      result.push("\r\n=" + getCheckSum(body) + "\r\n");
      result.push("-----END PGP PUBLIC KEY BLOCK-----\r\n\r\n");
      break;
    case enums.armor.private_key:
      result.push("-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n");
      result.push(addheader());
      result.push(base64.encode(body));
      result.push("\r\n=" + getCheckSum(body) + "\r\n");
      result.push("-----END PGP PRIVATE KEY BLOCK-----\r\n");
      break;
    case enums.armor.signature:
      result.push("-----BEGIN PGP SIGNATURE-----\r\n");
      result.push(addheader());
      result.push(base64.encode(body));
      result.push("\r\n=" + getCheckSum(body) + "\r\n");
      result.push("-----END PGP SIGNATURE-----\r\n");
      break;
  }

  return result.join('');
}

export default {
  encode: armor,
  decode: dearmor
};

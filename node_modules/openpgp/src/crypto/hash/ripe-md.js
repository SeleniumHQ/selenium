/*
 * CryptoMX Tools
 * Copyright (C) 2004 - 2006 Derek Buitenhuis
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */

/* Modified by Recurity Labs GmbH
 */

/* Modified by ProtonTech AG
 */

/**
 * @requires util
 * @module crypto/hash/ripe-md
 */

import util from '../../util.js';

var RMDsize = 160;
var X = [];

function ROL(x, n) {
  return new Number((x << n) | (x >>> (32 - n)));
}

function F(x, y, z) {
  return new Number(x ^ y ^ z);
}

function G(x, y, z) {
  return new Number((x & y) | (~x & z));
}

function H(x, y, z) {
  return new Number((x | ~y) ^ z);
}

function I(x, y, z) {
  return new Number((x & z) | (y & ~z));
}

function J(x, y, z) {
  return new Number(x ^ (y | ~z));
}

function mixOneRound(a, b, c, d, e, x, s, roundNumber) {
  switch (roundNumber) {
    case 0:
      a += F(b, c, d) + x + 0x00000000;
      break;
    case 1:
      a += G(b, c, d) + x + 0x5a827999;
      break;
    case 2:
      a += H(b, c, d) + x + 0x6ed9eba1;
      break;
    case 3:
      a += I(b, c, d) + x + 0x8f1bbcdc;
      break;
    case 4:
      a += J(b, c, d) + x + 0xa953fd4e;
      break;
    case 5:
      a += J(b, c, d) + x + 0x50a28be6;
      break;
    case 6:
      a += I(b, c, d) + x + 0x5c4dd124;
      break;
    case 7:
      a += H(b, c, d) + x + 0x6d703ef3;
      break;
    case 8:
      a += G(b, c, d) + x + 0x7a6d76e9;
      break;
    case 9:
      a += F(b, c, d) + x + 0x00000000;
      break;

    default:
      throw new Error("Bogus round number");
      break;
  }

  a = ROL(a, s) + e;
  c = ROL(c, 10);

  a &= 0xffffffff;
  b &= 0xffffffff;
  c &= 0xffffffff;
  d &= 0xffffffff;
  e &= 0xffffffff;

  var retBlock = [];
  retBlock[0] = a;
  retBlock[1] = b;
  retBlock[2] = c;
  retBlock[3] = d;
  retBlock[4] = e;
  retBlock[5] = x;
  retBlock[6] = s;

  return retBlock;
}

function MDinit(MDbuf) {
  MDbuf[0] = 0x67452301;
  MDbuf[1] = 0xefcdab89;
  MDbuf[2] = 0x98badcfe;
  MDbuf[3] = 0x10325476;
  MDbuf[4] = 0xc3d2e1f0;
}

var ROLs = [
  [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
  [7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12],
  [11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5],
  [11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12],
  [9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6],
  [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6],
  [9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11],
  [9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5],
  [15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8],
  [8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11]
];

var indexes = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8],
  [3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12],
  [1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2],
  [4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13],
  [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12],
  [6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2],
  [15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13],
  [8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14],
  [12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11]
];

function compress(MDbuf, X) {
  var blockA = [];
  var blockB = [];

  var retBlock;

  var i, j;

  for (i = 0; i < 5; i++) {
    blockA[i] = new Number(MDbuf[i]);
    blockB[i] = new Number(MDbuf[i]);
  }

  var step = 0;
  for (j = 0; j < 5; j++) {
    for (i = 0; i < 16; i++) {
      retBlock = mixOneRound(
        blockA[(step + 0) % 5],
        blockA[(step + 1) % 5],
        blockA[(step + 2) % 5],
        blockA[(step + 3) % 5],
        blockA[(step + 4) % 5],
        X[indexes[j][i]],
        ROLs[j][i],
        j);

      blockA[(step + 0) % 5] = retBlock[0];
      blockA[(step + 1) % 5] = retBlock[1];
      blockA[(step + 2) % 5] = retBlock[2];
      blockA[(step + 3) % 5] = retBlock[3];
      blockA[(step + 4) % 5] = retBlock[4];

      step += 4;
    }
  }

  step = 0;
  for (j = 5; j < 10; j++) {
    for (i = 0; i < 16; i++) {
      retBlock = mixOneRound(
        blockB[(step + 0) % 5],
        blockB[(step + 1) % 5],
        blockB[(step + 2) % 5],
        blockB[(step + 3) % 5],
        blockB[(step + 4) % 5],
        X[indexes[j][i]],
        ROLs[j][i],
        j);

      blockB[(step + 0) % 5] = retBlock[0];
      blockB[(step + 1) % 5] = retBlock[1];
      blockB[(step + 2) % 5] = retBlock[2];
      blockB[(step + 3) % 5] = retBlock[3];
      blockB[(step + 4) % 5] = retBlock[4];

      step += 4;
    }
  }

  blockB[3] += blockA[2] + MDbuf[1];
  MDbuf[1] = MDbuf[2] + blockA[3] + blockB[4];
  MDbuf[2] = MDbuf[3] + blockA[4] + blockB[0];
  MDbuf[3] = MDbuf[4] + blockA[0] + blockB[1];
  MDbuf[4] = MDbuf[0] + blockA[1] + blockB[2];
  MDbuf[0] = blockB[3];
}

function zeroX(X) {
  for (var i = 0; i < 16; i++) {
    X[i] = 0;
  }
}

function MDfinish(MDbuf, strptr, lswlen, mswlen) {
  var X = new Array(16);
  zeroX(X);

  var j = 0;
  for (var i = 0; i < (lswlen & 63); i++) {
    X[i >>> 2] ^= (strptr.charCodeAt(j++) & 255) << (8 * (i & 3));
  }

  X[(lswlen >>> 2) & 15] ^= 1 << (8 * (lswlen & 3) + 7);

  if ((lswlen & 63) > 55) {
    compress(MDbuf, X);
    X = new Array(16);
    zeroX(X);
  }

  X[14] = lswlen << 3;
  X[15] = (lswlen >>> 29) | (mswlen << 3);

  compress(MDbuf, X);
}

function BYTES_TO_DWORD(fourChars) {
  var tmp = (fourChars.charCodeAt(3) & 255) << 24;
  tmp |= (fourChars.charCodeAt(2) & 255) << 16;
  tmp |= (fourChars.charCodeAt(1) & 255) << 8;
  tmp |= (fourChars.charCodeAt(0) & 255);

  return tmp;
}

function RMD(message) {
  var MDbuf = new Array(RMDsize / 32);
  var hashcode = new Array(RMDsize / 8);
  var length;
  var nbytes;

  MDinit(MDbuf);
  length = message.length;

  var X = new Array(16);
  zeroX(X);

  var i, j = 0;
  for (nbytes = length; nbytes > 63; nbytes -= 64) {
    for (i = 0; i < 16; i++) {
      X[i] = BYTES_TO_DWORD(message.substr(j, 4));
      j += 4;
    }
    compress(MDbuf, X);
  }

  MDfinish(MDbuf, message.substr(j), length, 0);

  for (i = 0; i < RMDsize / 8; i += 4) {
    hashcode[i] = MDbuf[i >>> 2] & 255;
    hashcode[i + 1] = (MDbuf[i >>> 2] >>> 8) & 255;
    hashcode[i + 2] = (MDbuf[i >>> 2] >>> 16) & 255;
    hashcode[i + 3] = (MDbuf[i >>> 2] >>> 24) & 255;
  }

  return hashcode;
}


export default function RMDstring(message) {
  var hashcode = RMD(util.Uint8Array2str(message));
  var retString = "";

  for (var i = 0; i < RMDsize / 8; i++) {
    retString += String.fromCharCode(hashcode[i]);
  }

  return util.str2Uint8Array(retString);
}

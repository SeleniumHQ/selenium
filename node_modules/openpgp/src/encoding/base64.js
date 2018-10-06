/* OpenPGP radix-64/base64 string encoding/decoding
 * Copyright 2005 Herbert Hanewinkel, www.haneWIN.de
 * version 1.0, check www.haneWIN.de for the latest version
 *
 * This software is provided as-is, without express or implied warranty.
 * Permission to use, copy, modify, distribute or sell this software, with or
 * without fee, for any purpose and by any individual or organization, is hereby
 * granted, provided that the above copyright notice and this paragraph appear
 * in all copies. Distribution as a part of an application or binary must
 * include the above copyright notice in the documentation and/or other materials
 * provided with the application or distribution.
 */

/**
 * @module encoding/base64
 */

'use strict';

var b64s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Convert binary array to radix-64
 * @param {Uint8Array} t Uint8Array to convert
 * @returns {string} radix-64 version of input string
 * @static
 */
function s2r(t, o) {
  // TODO check btoa alternative
  var a, c, n;
  var r = o ? o : [],
      l = 0,
      s = 0;
  var tl = t.length;

  for (n = 0; n < tl; n++) {
    c = t[n];
    if (s === 0) {
      r.push(b64s.charAt((c >> 2) & 63));
      a = (c & 3) << 4;
    } else if (s === 1) {
      r.push(b64s.charAt((a | (c >> 4) & 15)));
      a = (c & 15) << 2;
    } else if (s === 2) {
      r.push(b64s.charAt(a | ((c >> 6) & 3)));
      l += 1;
      if ((l % 60) === 0) {
        r.push("\n");
      }
      r.push(b64s.charAt(c & 63));
    }
    l += 1;
    if ((l % 60) === 0) {
      r.push("\n");
    }

    s += 1;
    if (s === 3) {
      s = 0;
    }
  }
  if (s > 0) {
    r.push(b64s.charAt(a));
    l += 1;
    if ((l % 60) === 0) {
      r.push("\n");
    }
    r.push('=');
    l += 1;
  }
  if (s === 1) {
    if ((l % 60) === 0) {
      r.push("\n");
    }
    r.push('=');
  }
  if (o)
  {
    return;
  }
  return r.join('');
}

/**
 * Convert radix-64 to binary array
 * @param {String} t radix-64 string to convert
 * @returns {Uint8Array} binary array version of input string
 * @static
 */
function r2s(t) {
  // TODO check atob alternative
  var c, n;
  var r = [],
    s = 0,
    a = 0;
  var tl = t.length;

  for (n = 0; n < tl; n++) {
    c = b64s.indexOf(t.charAt(n));
    if (c >= 0) {
      if (s) {
        r.push(a | (c >> (6 - s)) & 255);
      }
      s = (s + 2) & 7;
      a = (c << s) & 255;
    }
  }
  return new Uint8Array(r);
}

export default {
  encode: s2r,
  decode: r2s
};

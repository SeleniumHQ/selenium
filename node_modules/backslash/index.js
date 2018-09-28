'use strict';

var punycode = require('punycode');

function BackslashError(offset, err) {
  this.__proto__ = new Error(err);
  this.__proto__.name = 'BackslashError';
  this.offset = offset;
}

function isOctalDigit(c) {
  return c >= '0' && c <= '7';
}

function isHexDigit(c) {
  return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
}

function parseHex(u) {
  u = parseInt(u, 16);
  // http://stackoverflow.com/a/9109467/510036
  return punycode.ucs2.encode([u]);
}

function process(arr, pos, stopChar) {
  var escaped = false;
  var ret = [];

  function assertHexDigit(pos) {
    var c = arr[pos];
    if (!isHexDigit(c)) {
      throw new BackslashError(pos, 'Unexpected token ILLEGAL');
    }
    return c;
  }

  while (pos < arr.length) {
    var c = arr[pos];
    pos++;
    if (escaped) {
      escaped = false;
      switch (c) {
        case 'n':
          ret.push('\n');
          continue;
        case 'r':
          ret.push('\r');
          continue;
        case 'f':
          ret.push('\f');
          continue;
        case 'b':
          ret.push('\b');
          continue;
        case 't':
          ret.push('\t');
          continue;
        case 'v':
          ret.push('\v');
          continue;
        case '\\':
          ret.push('\\') ;
          continue;
      }
      if (c === 'x') {
        ret.push(parseHex(assertHexDigit(pos) + assertHexDigit(pos + 1)));
        pos += 2;
        continue;
      }
      if (c === 'u') {
        ret.push(parseHex(assertHexDigit(pos) + assertHexDigit(pos + 1) + assertHexDigit(pos + 2) + assertHexDigit(pos + 3)));
        pos += 4;
        continue;
      }
      if (isOctalDigit(c)) {
        var o;
        if (isOctalDigit(o = arr[pos])) {
          pos++;
          c += o;
          if (isOctalDigit(o = arr[pos]) && (c[0] <= '3')) {
            pos++;
            c += o;
          }
        }
        ret.push(punycode.ucs2.encode([parseInt(c, 8)]));
        continue;
      }
      ret.push(c);
    } else if (c === '\\') {
      escaped = true;
    } else if (c === stopChar) {
      pos--;
      break;
    } else {
      ret.push(c);
    }
  }
  return arguments.length === 3 ? {end: pos, value: ret.join('')} : ret.join('');
}

module.exports = function backslash(str) {
  return process(str, 0);
};

module.exports.parseUntil = function parseUntil(str, pos, stopChar) {
  return process(str, pos, stopChar);
};

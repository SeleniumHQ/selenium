(function () {
  "use strict";

  // TODO break these down into escaped strings with meaningful comments and create using new RegExp()
  //               |optional 'v'
  //               | | 3 segment version
  //               | |                    |optional release prefixed by '-'
  //               | |                    |                                        |optional build prefixed by '+'
  var reSemver = /^v?((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?(?:\+([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?$/
    //, reSemverRange = /\s*((\|\||\-)|(([<>~]?=?)\s*(v)?([0-9]+)(\.(x|[0-9]+))?(\.(x|[0-9]+))?(([\-+])([a-zA-Z0-9\.]+))?))\s*/g
    , reSemverRange = /\s*((\|\||\-)|(([<>~^]?=?)\s*(v)?([0-9]+)(\.(x|\*|[0-9]+))?(\.(x|\*|[0-9]+))?(([\-+])([a-zA-Z0-9\.-]+))?))\s*/g
    ;

  // Returns a new object with all of the undefined properties removed from the given object
  function pruned(obj) {
    var o = {};
    for(var key in obj) {
      if ('undefined' !== typeof obj[key]) {
        o[key] = obj[key];
      }
    }
    return o;
  }

  function stringifySemver(obj) {
    var str = ''
      ;

    str += obj.major || '0';
    str += '.';
    str += obj.minor || '0';
    str += '.';
    str += obj.patch || '0';
    if (obj.release) {
      str += '-' + obj.release;
    }
    if (obj.build) {
      str += '+' + obj.build;
    }
    return str;
  }

  function stringifySemverRange(arr) {
    var str = ''
      ;

    function stringify(ver) {
      if (ver.operator) {
        str += ver.operator + ' ';
      }
      if (ver.major) {
        str += ver.toString() + ' ';
      }
    }

    arr.forEach(stringify);

    return str.trim();
  }

  function SemVer(obj) {
    if (!obj) {
      return;
    }

    var me = this
      ;

    Object.keys(obj).forEach(function (key) {
      me[key] = obj[key];
    });
  }
  SemVer.prototype.toString = function () {
    return stringifySemver(this);
  };

  /*
  function SemVerRange(obj) {
    if (!obj) {
      return;
    }

    var me = this
      ;

    Object.keys(obj).forEach(function (key) {
      me[key] = obj[key];
    });
  }
  SemVerRange.prototype = [];
  SemVerRange.prototype.toString = stringifySemverRange;
  */

  function parseSemver(version) {
    // semver, major, minor, patch
    // https://github.com/mojombo/semver/issues/32
    // https://github.com/isaacs/node-semver/issues/10
    // optional v
    var m = reSemver.exec(version) || []
      , ver = new SemVer(pruned({
            semver: m[0]
          , version: m[1]
          , major: m[2]
          , minor: m[3]
          , patch: m[4]
          , release: m[5]
          , build: m[6]
        }))
      ;

    if (0 === m.length) {
      ver = null;
    }

    return ver;
  }

  function parseSemverRange(str) {
    var m
      , arr = []
      , obj
      ;


    while (m = reSemverRange.exec(str)) {
      obj = {
          semver: m[3]
        , operator: m[4] || m[2]
        , major: m[6]
        , minor: m[8]
        , patch: m[10]
      };
      if ('+' === m[12]) {
        obj.build = m[13];
      }
      if ('-' === m[12]) {
        obj.release = m[13];
      }
      arr.push(new SemVer(pruned(obj)));
      //console.log(m);
    }

    //return new SemVerRange(arr);
    return arr;
  }

  module.exports.parse = parseSemver;
  module.exports.stringify = stringifySemver;
  module.exports.parseRange = parseSemverRange;
  module.exports.stringifyRange = stringifySemverRange;
}());

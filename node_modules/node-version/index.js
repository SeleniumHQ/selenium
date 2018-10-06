/*!
 * node-version
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

module.exports = (function() {
  var version = process.versions.node;

  var split = version.split('.');

  return {
    original: 'v' + version,
    short: split[0] + '.' + split[1],
    long: version,
    major: split[0],
    minor: split[1],
    build: split[2]
  };
})();

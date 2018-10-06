'use strict';

var openpgp = typeof window != 'undefined' && window.openpgp ? window.openpgp : require('../../../dist/openpgp');

var util = openpgp.util,
  RMDstring = openpgp.crypto.hash.ripemd,
  chai = require('chai'),
  expect = chai.expect;

it("RIPE-MD 160 bits with test vectors from http://homes.esat.kuleuven.be/~bosselae/ripemd160.html", function(done) {
  expect(util.hexstrdump(util.Uint8Array2str(RMDstring(util.str2Uint8Array(''))), 'RMDstring("") = 9c1185a5c5e9fc54612808977ee8f548b2258d31')).to.equal('9c1185a5c5e9fc54612808977ee8f548b2258d31');
  expect(util.hexstrdump(util.Uint8Array2str(RMDstring(util.str2Uint8Array('a'))), 'RMDstring("a") = 0bdc9d2d256b3ee9daae347be6f4dc835a467ffe')).to.equal('0bdc9d2d256b3ee9daae347be6f4dc835a467ffe');
  expect(util.hexstrdump(util.Uint8Array2str(RMDstring(util.str2Uint8Array('abc'))), 'RMDstring("abc") = 8eb208f7e05d987a9b044a8e98c6b087f15a0bfc')).to.equal('8eb208f7e05d987a9b044a8e98c6b087f15a0bfc');
  expect(util.hexstrdump(util.Uint8Array2str(RMDstring(util.str2Uint8Array('message digest'))), 'RMDstring("message digest") = 5d0689ef49d2fae572b881b123a85ffa21595f36')).to.equal('5d0689ef49d2fae572b881b123a85ffa21595f36');
  done();
});

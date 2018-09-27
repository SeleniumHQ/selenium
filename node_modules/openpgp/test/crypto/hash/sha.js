'use strict';

var openpgp = typeof window != 'undefined' && window.openpgp ? window.openpgp : require('../../../dist/openpgp');

var util = openpgp.util,
  hash = openpgp.crypto.hash,
  chai = require('chai'),
  expect = chai.expect;

it('SHA* with test vectors from NIST FIPS 180-2', function(done) {
	expect(util.hexstrdump(util.Uint8Array2str(hash.sha1(util.str2Uint8Array('abc'))), 'hash.sha1("abc") = a9993e364706816aba3e25717850c26c9cd0d89d')).to.equal('a9993e364706816aba3e25717850c26c9cd0d89d');
  expect(util.hexstrdump(util.Uint8Array2str(hash.sha1(util.str2Uint8Array('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))), 'hash.sha1("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq") = 84983e441c3bd26ebaae4aa1f95129e5e54670f1')).to.equal('84983e441c3bd26ebaae4aa1f95129e5e54670f1');
  expect(util.hexstrdump(util.Uint8Array2str(hash.sha224(util.str2Uint8Array('abc'))), 'hash.sha224("abc") = 23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7')).to.equal('23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7');
  expect(util.hexstrdump(util.Uint8Array2str(hash.sha224(util.str2Uint8Array('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))), 'hash.sha224("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq") = 75388b16512776cc5dba5da1fd890150b0c6455cb4f58b1952522525')).to.equal('75388b16512776cc5dba5da1fd890150b0c6455cb4f58b1952522525');
  expect(util.hexstrdump(util.Uint8Array2str(hash.sha256(util.str2Uint8Array('abc'))), 'hash.sha256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')).to.equal('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  expect(util.hexstrdump(util.Uint8Array2str(hash.sha256(util.str2Uint8Array('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))), 'hash.sha256("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq") = 248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1')).to.equal('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
  expect(util.hexstrdump(util.Uint8Array2str(hash.sha384(util.str2Uint8Array('abc'))), 'hash.sha384("abc") = cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7')).to.equal('cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7');
  expect(util.hexstrdump(util.Uint8Array2str(hash.sha384(util.str2Uint8Array('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))), 'hash.sha384("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq") = 3391fdddfc8dc7393707a65b1b4709397cf8b1d162af05abfe8f450de5f36bc6b0455a8520bc4e6f5fe95b1fe3c8452b')).to.equal('3391fdddfc8dc7393707a65b1b4709397cf8b1d162af05abfe8f450de5f36bc6b0455a8520bc4e6f5fe95b1fe3c8452b');
  expect(util.hexstrdump(util.Uint8Array2str(hash.sha512(util.str2Uint8Array('abc'))), 'hash.sha512("abc") = ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f')).to.equal('ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
  expect(util.hexstrdump(util.Uint8Array2str(hash.sha512(util.str2Uint8Array('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))), 'hash.sha512("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq") = 204a8fc6dda82f0a0ced7beb8e08a41657c16ef468b228a8279be331a703c33596fd15c13b1b07f9aa1d3bea57789ca031ad85c7a71dd70354ec631238ca3445')).to.equal('204a8fc6dda82f0a0ced7beb8e08a41657c16ef468b228a8279be331a703c33596fd15c13b1b07f9aa1d3bea57789ca031ad85c7a71dd70354ec631238ca3445');
	done();
});

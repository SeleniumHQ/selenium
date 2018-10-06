'use strict';

var openpgp = typeof window !== 'undefined' && window.openpgp ? window.openpgp : require('../../dist/openpgp');

var chai = require('chai'),
  expect = chai.expect;

describe('HKP unit tests', function() {
  this.timeout(60000);

  var hkp;

  var pub_key = '-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n' +
      'Version: SKS 1.1.5\r\n' +
      'Comment: Hostname: keyserver.ubuntu.com\r\n' +
      '\r\n' +
      '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\r\n' +
      'uw9LVuvHh8RGCH2NZY48zdfB\r\n' +
      '=5obP\r\n' +
      '-----END PGP PUBLIC KEY BLOCK-----';

  beforeEach(function() {
    hkp = new openpgp.HKP(openpgp.config.keyserver);
  });

  afterEach(function() {});

  describe('lookup', function() {
    it('by email address should work', function() {
      return hkp.lookup({
        query: 'safewithme.testuser@gmail.com'
      }).then(function(key) {
        expect(key).to.exist;
      });
    });

    it('by email address should not find a key', function() {
      return hkp.lookup({
        query: 'safewithme.testuse@gmail.com'
      }).then(function(key) {
        expect(key).to.be.undefined;
      });
    });

    it('by key id should work', function() {
      return hkp.lookup({
        keyId: 'D7FB93FCDFBFC23C'
      }).then(function(key) {
        expect(key).to.exist;
      });
    });
  });

  describe('upload', function() {
    it('should work', function() {
      return hkp.upload(pub_key);
    });
  });

});

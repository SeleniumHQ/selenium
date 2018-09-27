var assert = require('assert');
var elliptic = require('../');
var hash = require('hash.js');

describe('ECDH', function() {
  function test(name) {
    it('should work with ' + name + ' curve', function() {
      var ecdh = new elliptic.ec(name);
      var s1 = ecdh.genKeyPair();
      var s2 = ecdh.genKeyPair();
      var sh1 = s1.derive(s2.getPublic());
      var sh2 = s2.derive(s1.getPublic());

      assert.equal(sh1.toString(16), sh2.toString(16));

      var sh1 = s1.derive(ecdh.keyFromPublic(s2.getPublic('hex'), 'hex')
                              .getPublic());
      var sh2 = s2.derive(ecdh.keyFromPublic(s1.getPublic('hex'), 'hex')
                              .getPublic());
      assert.equal(sh1.toString(16), sh2.toString(16));
    });
  }

  test('curve25519');
  test('ed25519');
  test('secp256k1');
});

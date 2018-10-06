var assert = require('assert');
var elliptic = require('../');

describe('EC API', function() {
  it('should instantiate with valid curve (secp256k1)', function() {
    var ec = new elliptic.ec('secp256k1');

    assert(ec);
    assert(typeof ec === 'object');
  });

  it('should throw error with invalid curve', function() {
    assert.throws(function() {
      var ec = new elliptic.ec('nonexistent-curve');
    }, Error);
  });
});

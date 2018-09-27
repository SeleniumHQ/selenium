var assert = require('chai').assert;

// we need to define our own deepEqual function that ignores properties that are not hasOwnProperty. Not supported in chai.assert.deepEqual as of v3.0.0.
function deepOwnEqual(a, b) {

  // if arrays of objects, recurse down to the objects
  if(Array.isArray(a) && Array.isArray(b)) {
    assert.deepEqual(a.length, b.length, 'Arrays have different lengths')
    for(var i=0; i<a.length; i++) {
      deepOwnEqual(a[i], b[i])
    }
  }
  // compare all the object properties
  else {
    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);

    assert.deepEqual(aKeys, bKeys, 'Objects have different keys');

    aKeys.forEach(function(key) {
      assert.deepEqual(a[key], b[key], 'Expected values of "' + key + '" property to be equal in each object')
    });
  }
}

module.exports = deepOwnEqual
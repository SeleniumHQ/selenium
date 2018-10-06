'use strict';

var stable = exports;

var semver = require('semver');
var util = require('util');


stable.maxSatisfying = function(versions, range) {
  if (!util.isArray(versions)) {
    return null;
  }

  versions = desc(versions);
  return first(versions, function(version) {
    if (stable.is(version)) {
      if (semver.satisfies(version, range)) {
        return true;
      }
    }
  });;
};


stable.is = function(version) {
  var semver_obj = semver.parse(version);
  return semver_obj === null ? false : !semver_obj.prerelease.length;
};


stable.max = function (versions) {
  versions = desc(versions);
  return first(versions, stable.is);
};


// Sort by DESC
function desc (array) {
  // Simply clone
  array = [].concat(array);
  // Ordered by version DESC 
  array.sort(semver.rcompare);
  return array;
}

// Returns the first matched array item
function first (array, filter) {
  var i = 0;
  var length = array.length;
  var item;
  for (; i < length; i ++) {
    item = array[i];
    if (filter(item)) {
      return item;
    }
  }

  return null;
}

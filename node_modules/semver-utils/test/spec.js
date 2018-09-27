var assert = require('chai').assert;
var semverutils = require('../semver-utils');
var deepOwnEqual = require('./deepOwnEqual');

describe('parse', function() {

  it('should parse a simple 3-part version', function() {
    deepOwnEqual(semverutils.parse('1.0.0'), {
      semver: '1.0.0',
      version: '1.0.0',
      major: '1',
      minor: '0',
      patch: '0'
    });
  });

  it('should parse pre-release versions', function() {
    deepOwnEqual(semverutils.parse('1.0.0-alpha1'), {
      semver: '1.0.0-alpha1',
      version: '1.0.0',
      major: '1',
      minor: '0',
      patch: '0',
      release: 'alpha1'
    });
  });

  it('should parse build numbers', function() {
    deepOwnEqual(semverutils.parse('1.0.0+build-123'), {
      semver: '1.0.0+build-123',
      version: '1.0.0',
      major: '1',
      minor: '0',
      patch: '0',
      build: 'build-123'
    });
  });

  it('should not parse invalid versions', function() {
    assert.equal(semverutils.parse('a.b.c'), null);
    assert.equal(semverutils.parse('1'), null);
    assert.equal(semverutils.parse('1.0'), null);
    assert.equal(semverutils.parse('1.0.0b'), null);
    assert.equal(semverutils.parse('1.0.0+build-abc.'), null, 'trailing period');
  });

});

describe('parseRange', function() {

  it('should parse an exact version as a range', function() {

    deepOwnEqual(semverutils.parseRange('1.0.0'), [{
      semver: '1.0.0',
      major: '1',
      minor: '0',
      patch: '0'
    }]);
  });

  it('should ignore the v- prefix', function() {

    deepOwnEqual(semverutils.parseRange('v1.0.0'), [{
      semver: 'v1.0.0',
      major: '1',
      minor: '0',
      patch: '0'
    }]);
  });

  it('should parse a comparison operator', function() {
    deepOwnEqual(semverutils.parseRange('< v2.0.0'), [{
      semver: '< v2.0.0',
      operator: '<',
      major: '2',
      minor: '0',
      patch: '0'
    }]);
  });

  it('should parse tilde', function() {
    deepOwnEqual(semverutils.parseRange('~1.0.0'), [{
      semver: '~1.0.0',
      operator: '~',
      major: '1',
      minor: '0',
      patch: '0'
    }]);
  });

  it('should parse caret', function() {
    deepOwnEqual(semverutils.parseRange('^1.0.0'), [{
      semver: '^1.0.0',
      operator: '^',
      major: '1',
      minor: '0',
      patch: '0'
    }]);
  });

  it('should parse tilde and v- prefix', function() {
    deepOwnEqual(semverutils.parseRange('~v1.0.0'), [{
      semver: '~v1.0.0',
      operator: '~',
      major: '1',
      minor: '0',
      patch: '0'
    }]);
  });

  it('should parse ||', function() {
    deepOwnEqual(semverutils.parseRange('~1.0.0 || ~2.0.0'), [{
      semver: '~1.0.0',
      operator: '~',
      major: '1',
      minor: '0',
      patch: '0'
    }, {
      operator: '||'
    }, {
      semver: '~2.0.0',
      operator: '~',
      major: '2',
      minor: '0',
      patch: '0'
    }]);
  });

  it('should parse build numbers', function() {
    deepOwnEqual(semverutils.parseRange('2.0.0+build.1848'), [{
      semver: '2.0.0+build.1848',
      major: '2',
      minor: '0',
      patch: '0',
      build: 'build.1848'
    }]);
  });

  it('should parse pre-release versions', function() {
    deepOwnEqual(semverutils.parseRange('1.0.0-rc1'), [{
      semver: '1.0.0-rc1',
      major: '1',
      minor: '0',
      patch: '0',
      release: 'rc1'
    }]);
  });

  it('should parse pre-release versions with hyphens', function() {

    deepOwnEqual(semverutils.parseRange('1.0.0-rc-2'), [{
      semver: '1.0.0-rc-2',
      major: '1',
      minor: '0',
      patch: '0',
      release: 'rc-2'
    }]);
  });

  it('should parse hyphen ranges', function() {
    deepOwnEqual(semverutils.parseRange('1.0.0 - 1.0.x'), [{
      semver: '1.0.0',
      major: '1',
      minor: '0',
      patch: '0'
    }, {
      operator: '-'
    }, {
      semver: '1.0.x',
      major: '1',
      minor: '0',
      patch: 'x'
    }]);
  });

  it('should parse constrained * ranges', function() {
    deepOwnEqual(semverutils.parseRange('1.*'), [{
      semver: '1.*',
      major: '1',
      minor: '*',
    }]);
  });

  it('should parse constrained .x', function() {
    deepOwnEqual(semverutils.parseRange('1.x'), [{
      semver: '1.x',
      major: '1',
      minor: 'x',
    }]);
  });

});
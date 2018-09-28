'use strict';

var expect = require('chai').expect;
var stable = require('../');

describe("stable.is(version)", function(){
  [
    ['1.2.3-stable', false],
    ['1.2.4-alpha', false],
    ['1.3.5', true],
    ['0.3.9', true],
    ['xxyy', false]
  ].forEach(function (c) {
    var version = c[0];
    var result = c[1];
    it(version + ': ' + result, function(done){
      expect(stable.is(version)).to.equal(result);
      done();
    });
  })
});


describe("stable.maxSatisfying(range, versions)", function(){
  var origin = [
    '1.2.2', 
    '1.3.3',
    '1.1.2',
    '1.2.3-beta', 
    '1.2.1',
  ];

  var versions = [].concat(origin);
  var latest = stable.maxSatisfying(versions, '*');
  var version_122 = stable.maxSatisfying(versions, '~1.2.2')

  it("normal", function(done){
    expect(latest).to.equal('1.3.3');
    expect(version_122).to.equal('1.2.2');
    done();
  });

  it("versions should not be changed", function(done){
    expect(versions).to.deep.equal(origin);
    done();
  });
});

describe("stable.max(versions)", function(){
  var origin = [
    '1.2.2', 
    '1.3.3-alpha',
    '1.1.2',
    '1.2.3-beta', 
    '1.2.1',
  ];
  var versions = [].concat(origin);
  var max = stable.max(versions);

  it("returns the max stable version", function(done){
    expect(max).to.equal('1.2.2');
    done();
  });

  it("versions should not be changed", function(done){
    expect(versions).to.deep.equal(origin);
    done();
  });
});

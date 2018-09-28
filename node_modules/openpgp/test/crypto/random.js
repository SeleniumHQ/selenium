'use strict';

var openpgp = typeof window !== 'undefined' && window.openpgp ? window.openpgp : require('../../dist/openpgp');

var chai = require('chai'),
  expect = chai.expect;

describe('Random Buffer', function() {
  var randomBuffer;

  before(function() {
    randomBuffer = new openpgp.crypto.random.randomBuffer.constructor();
    expect(randomBuffer).to.exist;
  });

  it('Throw error if not initialized', function () {
    expect(randomBuffer.set.bind(randomBuffer)).to.throw('RandomBuffer is not initialized');
    expect(randomBuffer.get.bind(randomBuffer)).to.throw('RandomBuffer is not initialized');
  });

  it('Initialization', function () {
    randomBuffer.init(5);
    expect(randomBuffer.buffer).to.exist;
    expect(randomBuffer.buffer).to.have.length(5);
    expect(randomBuffer.size).to.equal(0);
  });

  function equal(buf, arr) {
    for (var i = 0; i < buf.length; i++) {
      if (buf[i] !== arr[i]) {
        return false;
      }
    }
    return true;
  }

  it('Set Method', function () {
    randomBuffer.init(5);
    var buf = new Uint32Array(2);
    expect(randomBuffer.set.bind(randomBuffer, buf)).to.throw('Invalid type: buf not an Uint8Array');
    buf = new Uint8Array(2);
    buf[0] = 1; buf[1] = 2;
    randomBuffer.set(buf);
    expect(equal(randomBuffer.buffer, [1,2,0,0,0])).to.be.true;
    expect(randomBuffer.size).to.equal(2);
    randomBuffer.set(buf);
    expect(equal(randomBuffer.buffer, [1,2,1,2,0])).to.be.true;
    expect(randomBuffer.size).to.equal(4);
    randomBuffer.set(buf);
    expect(equal(randomBuffer.buffer, [1,2,1,2,1])).to.be.true;
    expect(randomBuffer.size).to.equal(5);
    randomBuffer.init(1);
    buf = new Uint8Array(2);
    buf[0] = 1; buf[1] = 2;
    randomBuffer.set(buf);
    expect(buf).to.to.have.property('0', 1);
    expect(randomBuffer.size).to.equal(1);
  });

  it('Get Method', function () {
    randomBuffer.init(5);
    var buf = new Uint8Array(5);
    buf[0] = 1; buf[1] = 2; buf[2] = 5; buf[3] = 7; buf[4] = 8;
    randomBuffer.set(buf);
    buf = new Uint32Array(2);
    expect(randomBuffer.get.bind(randomBuffer, buf)).to.throw('Invalid type: buf not an Uint8Array');
    buf = new Uint8Array(2);
    randomBuffer.get(buf);
    expect(equal(randomBuffer.buffer, [1,2,5,0,0])).to.be.true;
    expect(randomBuffer.size).to.equal(3);
    expect(buf).to.to.have.property('0', 8);
    expect(buf).to.to.have.property('1', 7);
    randomBuffer.get(buf);
    expect(buf).to.to.have.property('0', 5);
    expect(buf).to.to.have.property('1', 2);
    expect(equal(randomBuffer.buffer, [1,0,0,0,0])).to.be.true;
    expect(randomBuffer.size).to.equal(1);
    expect(function() { randomBuffer.get(buf); }).to.throw('Random number buffer depleted');
  });
});

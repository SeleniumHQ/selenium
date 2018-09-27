'use strict';

var openpgp = typeof window !== 'undefined' && window.openpgp ? window.openpgp : require('../../dist/openpgp');

var chai = require('chai'),
  expect = chai.expect;

describe('Util unit tests', function() {

  describe('isString', function() {
    it('should return true for type "string"', function() {
      var data = 'foo';
      expect(openpgp.util.isString(data)).to.be.true;
    });
    it('should return true for type String', function() {
      var data = String('foo');
      expect(openpgp.util.isString(data)).to.be.true;
    });
    it('should return true for inherited type of String', function() {
      function MyString() {}
      MyString.prototype = Object.create(String.prototype);
      var data = new MyString();
      expect(openpgp.util.isString(data)).to.be.true;
    });
    it('should return true for empty string', function() {
      var data = '';
      expect(openpgp.util.isString(data)).to.be.true;
    });
    it('should return false for undefined', function() {
      var data;
      expect(openpgp.util.isString(data)).to.be.false;
    });
    it('should return false for Object', function() {
      var data = {};
      expect(openpgp.util.isString(data)).to.be.false;
    });
  });

  describe('isArray', function() {
    it('should return true for []', function() {
      var data = [];
      expect(openpgp.util.isArray(data)).to.be.true;
    });
    it('should return true for type Array', function() {
      var data = Array();
      expect(openpgp.util.isArray(data)).to.be.true;
    });
    it('should return true for inherited type of Array', function() {
      function MyArray() {}
      MyArray.prototype = Object.create(Array.prototype);
      var data = new MyArray();
      expect(openpgp.util.isArray(data)).to.be.true;
    });
    it('should return false for undefined', function() {
      var data;
      expect(openpgp.util.isArray(data)).to.be.false;
    });
    it('should return false for Object', function() {
      var data = {};
      expect(openpgp.util.isArray(data)).to.be.false;
    });
  });

  describe('isUint8Array', function() {
    it('should return true for type Uint8Array', function() {
      var data = new Uint8Array();
      expect(openpgp.util.isUint8Array(data)).to.be.true;
    });
    it('should return true for inherited type of Uint8Array', function() {
      function MyUint8Array() {}
      MyUint8Array.prototype = new Uint8Array();
      var data = new MyUint8Array();
      expect(openpgp.util.isUint8Array(data)).to.be.true;
    });
    it('should return false for undefined', function() {
      var data;
      expect(openpgp.util.isUint8Array(data)).to.be.false;
    });
    it('should return false for Object', function() {
      var data = {};
      expect(openpgp.util.isUint8Array(data)).to.be.false;
    });
  });

  describe('isEmailAddress', function() {
    it('should return true for valid email address', function() {
      var data = 'test@example.com';
      expect(openpgp.util.isEmailAddress(data)).to.be.true;
    });
    it('should return false for invalid email address', function() {
      var data = 'Test User <test@example.com>';
      expect(openpgp.util.isEmailAddress(data)).to.be.false;
    });
    it('should return false for invalid email address', function() {
      var data = 'test@examplecom';
      expect(openpgp.util.isEmailAddress(data)).to.be.false;
    });
    it('should return false for invalid email address', function() {
      var data = 'testexamplecom';
      expect(openpgp.util.isEmailAddress(data)).to.be.false;
    });
    it('should return false for empty string', function() {
      var data = '';
      expect(openpgp.util.isEmailAddress(data)).to.be.false;
    });
    it('should return false for undefined', function() {
      var data;
      expect(openpgp.util.isEmailAddress(data)).to.be.false;
    });
    it('should return false for Object', function() {
      var data = {};
      expect(openpgp.util.isEmailAddress(data)).to.be.false;
    });
  });

  describe('isUserId', function() {
    it('should return true for valid user id', function() {
      var data = 'Test User <test@example.com>';
      expect(openpgp.util.isUserId(data)).to.be.true;
    });
    it('should return false for invalid user id', function() {
      var data = 'Test User test@example.com>';
      expect(openpgp.util.isUserId(data)).to.be.false;
    });
    it('should return false for invalid user id', function() {
      var data = 'Test User <test@example.com';
      expect(openpgp.util.isUserId(data)).to.be.false;
    });
    it('should return false for invalid user id', function() {
      var data = 'Test User test@example.com';
      expect(openpgp.util.isUserId(data)).to.be.false;
    });
    it('should return false for empty string', function() {
      var data = '';
      expect(openpgp.util.isUserId(data)).to.be.false;
    });
    it('should return false for undefined', function() {
      var data;
      expect(openpgp.util.isUserId(data)).to.be.false;
    });
    it('should return false for Object', function() {
      var data = {};
      expect(openpgp.util.isUserId(data)).to.be.false;
    });
  });

  describe('getTransferables', function() {
    var zero_copyVal,
      buf1 = new Uint8Array(1),
      buf2 = new Uint8Array(1),
      obj = {
        data1: buf1,
        data2: buf1,
        data3: {
          data4: buf2
        }
      };

    beforeEach(function() {
      zero_copyVal = openpgp.config.zero_copy;
      openpgp.config.zero_copy = true;
    });

    afterEach(function() {
      openpgp.config.zero_copy = zero_copyVal;
    });

    it('should return undefined when zero_copy is false', function() {
      openpgp.config.zero_copy = false;
      expect(openpgp.util.getTransferables(obj)).to.be.undefined;
    });
    it('should return undefined for no input', function() {
      expect(openpgp.util.getTransferables()).to.be.undefined;
    });
    it('should return undefined for an empty oject', function() {
      expect(openpgp.util.getTransferables({})).to.be.undefined;
    });
    it('should return two buffers', function() {
      expect(openpgp.util.getTransferables(obj)).to.deep.equal([buf1.buffer, buf2.buffer]);
    });
  });

  describe("Misc.", function() {
    it('util.decode_utf8 throws error if invalid parameter type', function () {
      var test = openpgp.util.decode_utf8.bind(null, {chameleon: true});
      expect(test).to.throw(Error, /Parameter "utf8" is not of type string/);
    });
    it('util.readNumber should not overflow until full range of uint32', function () {
      var ints = [Math.pow(2, 20), Math.pow(2, 25), Math.pow(2, 30), Math.pow(2, 32) - 1];
      for(var i = 0; i < ints.length; i++) {
        expect(openpgp.util.readNumber(openpgp.util.writeNumber(ints[i], 4))).to.equal(ints[i]);
      }
    });
  });

});

var Promise = require('../promise');
var sinon = require('sinon');
var assert = require('assert');
var adapter = require('./adapter');
describe("Promises/A+ Tests", function () {
  require("promises-aplus-tests").mocha(adapter);
});
describe('Promise', function () {
  describe('Promise._setImmediateFn', function () {
    afterEach(function() {
      Promise._setImmediateFn((typeof setImmediate === 'function' && function (fn) {
            setImmediate(fn);
          }) ||
      function (fn) {
        setTimeout(fn, 1);
      });
    });
    it('changes immediate fn', function () {
      var spy = sinon.spy();

      function immediateFn(fn) {
        spy();
        fn();
      }
      Promise._setImmediateFn(immediateFn);
      var done = false;
      new Promise(function (resolve) {
        resolve();
      }).then(function () {
        done = true;
      });
      assert(spy.calledOnce);
      assert(done);
    });
    it('changes immediate fn multiple', function () {
      var spy1 = sinon.spy();

      function immediateFn1(fn) {
        spy1();
        fn();
      }

      var spy2 = sinon.spy();

      function immediateFn2(fn) {
        spy2();
        fn();
      }

      Promise._setImmediateFn(immediateFn1);
      var done = false;
      new Promise(function (resolve) {
        resolve();
      }).then(function () {
      });
      Promise._setImmediateFn(immediateFn2);
      new Promise(function (resolve) {
        resolve();
      }).then(function () {
        done = true;
      });
      assert(spy2.called);
      assert(spy1.calledOnce);
      assert(done);
    });
  });
  describe('Promise._onUnhandledRejection', function () {
    var stub, sandbox;
    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      stub = sandbox.stub(console, 'warn');
    });
    afterEach(function() {
      sandbox.restore();
    });
    it('no error on resolve', function (done) {
      Promise.resolve(true).then(function(result) {
        return result;
      }).then(function(result) {
        return result;
      });

      setTimeout(function() {
        assert(!stub.called);
        done();
      }, 50);
    });
    it('error single Promise', function (done) {
      new Promise(function(resolve, reject) {
        abc.abc = 1;
      });
      setTimeout(function() {
        assert(stub.calledOnce);
        done();
      }, 50);
    });
    it('multi promise error', function (done) {
      new Promise(function(resolve, reject) {
        abc.abc = 1;
      }).then(function(result) {
        return result;
      });
      setTimeout(function() {
        assert(stub.calledOnce);
        done();
      }, 50);
    });
    it('promise catch no error', function (done) {
      new Promise(function(resolve, reject) {
        abc.abc = 1;
      }).catch(function(result) {
        return result;
      });
      setTimeout(function() {
        assert(!stub.called);
        done();
      }, 50);
    });
    it('promise catch no error', function (done) {
      new Promise(function(resolve, reject) {
        abc.abc = 1;
      }).then(function(result) {
        return result;
      }).catch(function(result) {
        return result;
      });
      setTimeout(function() {
        assert(!stub.called);
        done();
      }, 50);
    });
    it('promise reject error', function (done) {
      Promise.reject('hello');
      setTimeout(function() {
        assert(stub.calledOnce);
        done();
      }, 50);
    });
    it('promise reject error late', function (done) {
      var prom = Promise.reject('hello');
      prom.catch(function() {

      });
      setTimeout(function() {
        assert(!stub.called);
        done();
      }, 50);
    });
    it('promise reject error late', function (done) {
      Promise.reject('hello');
      setTimeout(function() {
        assert.equal(stub.args[0][1], 'hello');
        done();
      }, 50);
    });
  });
  describe('Promise.prototype.then', function() {
    var spy,
        SubClass;
    beforeEach(function() {
      spy = sinon.spy();
      SubClass = function() {
        spy();
        Promise.apply(this, arguments);
      };

      function __() { this.constructor = SubClass; }
      __.prototype = Promise.prototype;
      SubClass.prototype = new __();

      SubClass.prototype.then = function() {
        return Promise.prototype.then.apply(this, arguments);
      };
    });
    it('subclassed Promise resolves to subclass', function() {
      var prom = new SubClass(function(resolve) {
        resolve();
      }).then(function() {}, function() {});
      assert(spy.calledTwice);
      assert(prom instanceof SubClass);
    });
    it('subclassed Promise rejects to subclass', function() {
      var prom = new SubClass(function(_, reject) {
        reject();
      }).then(function() {}, function() {});
      assert(spy.calledTwice);
      assert(prom instanceof SubClass);
    });
  });
  describe('Promise.all', function() {
    it('throws on implicit undefined', function () {
      return Promise.all().then(function () {
        assert.fail();
      }, function (error) {
        assert.ok(error instanceof Error);
      });
    });
    it('throws on explicit undefined', function () {
      return Promise.all(undefined).then(function () {
        assert.fail();
      }, function (error) {
        assert.ok(error instanceof Error);
      });
    });
    it('throws on null', function () {
      return Promise.all(null).then(function () {
        assert.fail();
      }, function (error) {
        assert.ok(error instanceof Error);
      });
    });
    it('throws on 0', function () {
      return Promise.all(0).then(function () {
        assert.fail();
      }, function (error) {
        assert.ok(error instanceof Error);
      });
    });
    it('throws on false', function () {
      return Promise.all(false).then(function () {
        assert.fail();
      }, function (error) {
        assert.ok(error instanceof Error);
      });
    });
    it('throws on a number', function () {
      return Promise.all().then(function () {
        assert.fail(20);
      }, function (error) {
        assert.ok(error instanceof Error);
      });
    });
    it('throws on a boolean', function () {
      return Promise.all(true).then(function () {
        assert.fail();
      }, function (error) {
        assert.ok(error instanceof Error);
      });
    });
    it('throws on an object', function () {
      return Promise.all({ test: 'object' }).then(function () {
        assert.fail();
      }, function (error) {
        assert.ok(error instanceof Error);
      });
    });
  });
}); 

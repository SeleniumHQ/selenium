// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var assert = require('assert');
var promise = require('../..').promise;

var test = require('../../testing');

describe('Mocha Integration', function() {

  describe('beforeEach properly binds "this"', function() {
    beforeEach(function() { this.x = 1; });
    test.beforeEach(function() { this.x = 2; });
    it('', function() { assert.equal(this.x, 2); });
  });

  describe('afterEach properly binds "this"', function() {
    it('', function() { this.x = 1; });
    test.afterEach(function() { this.x = 2; });
    afterEach(function() { assert.equal(this.x, 2); });
  });

  describe('it properly binds "this"', function() {
    beforeEach(function() { this.x = 1; });
    test.it('', function() { this.x = 2; });
    afterEach(function() { assert.equal(this.x, 2); });
  });

  describe('timeout handling', function() {
    describe('it does not reset the control flow on a non-timeout', function() {
      var flowReset = false;

      beforeEach(function() {
        flowReset = false;
        promise.controlFlow().once(
            promise.ControlFlow.EventType.RESET, onreset);
      });

      test.it('', function() {
        this.timeout(100);
        return promise.delayed(50);
      });

      afterEach(function() {
        assert.ok(!flowReset);
        promise.controlFlow().removeListener(
            promise.ControlFlow.EventType.RESET, onreset);
      });

      function onreset() {
        flowReset = true;
      }
    });

    describe('it resets the control flow after a timeout' ,function() {
      var timeoutErr, flowReset;

      beforeEach(function() {
        flowReset = false;
        promise.controlFlow().once(
            promise.ControlFlow.EventType.RESET, onreset);
      });

      test.it('', function() {
        var callback = this.runnable().callback;
        var test = this;
        this.runnable().callback = function(err) {
          timeoutErr = err;
          // Reset our timeout to 0 so Mocha does not fail the test.
          test.timeout(0);
          // When we invoke the real callback, do not pass along the error so
          // Mocha does not fail the test.
          return callback.call(this);
        };

        test.timeout(50);
        return promise.defer().promise;
      });

      afterEach(function() {
        promise.controlFlow().removeListener(
            promise.ControlFlow.EventType.RESET, onreset);
        assert.ok(flowReset, 'control flow was not reset after a timeout');
        assert.ok(timeoutErr instanceof Error);
        assert.equal(timeoutErr.message, 'timeout of 50ms exceeded');
      });

      function onreset() {
        flowReset = true;
      }
    });
  });
});

describe('Mocha async "done" support', function() {
   this.timeout(2*1000);

   var waited = false;
   var DELAY = 100; // ms enough to notice

   // --- First, vanilla mocha "it" should support the "done" callback correctly.

   // This it blocks until 'done' is invoked
   it('vanilla delayed', function it_vanillaDelayed(done) {
      setTimeout(function delayed_vanillaTimeout() {
         waited = true;
         done();
      }, DELAY);
   });

   it('vanilla must have waited', function it_vanillaMustHaveWaited() {
      assert.strictEqual(waited, true);
      waited = false;
   });

   // --- Now with the webdriver wrappers for 'it' should support the "done" callback:

   test.it('delayed', function it_delayed(done) {
      assert(done);
      assert.strictEqual(typeof done, 'function');
      //console.log(done.name);
      //console.log(done.toString());
      setTimeout(function delayed_timeoutCallback() {
         waited = true;
         done();
      }, DELAY);
   });

   test.it('must have waited', function it_mustHaveWaited() {
      assert.strictEqual(waited, true);
      waited = false;
   });

   // --- And test that the webdriver wrapper for 'it' works with a returned promise, too:

   test.it('delayed by promise', function it_delayedByAPromise() {
      var defer = promise.defer();
      setTimeout(function delayed_promiseCallback() {
         waited = true;
         defer.fulfill('ignored');
      });
      return defer.promise;
   });

   test.it('must have waited (again)', function it_mustHaveWaitedAgain() {
      assert.strictEqual(waited, true);
      waited = false;
   });
});
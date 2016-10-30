// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

'use strict';

const promise = require('../../lib/promise');
const {enablePromiseManager} = require('../../lib/test/promise');

describe('Promises/A+ Compliance Tests', function() {
  enablePromiseManager(() => {
    // The promise spec does not define behavior for unhandled rejections and
    // assumes they are effectively swallowed. This is not the case with our
    // implementation, so we have to disable error propagation to test that the
    // rest of our behavior is compliant.
    // We run the tests with a separate instance of the control flow to ensure
    // disablign error propagation does not impact other tests.
    var flow = new promise.ControlFlow();
    flow.setPropagateUnhandledRejections(false);

    // Skip the tests in 2.2.6.1/2. We are not compliant in these scenarios.
    var realDescribe = global.describe;
    global.describe = function(name, fn) {
      realDescribe(name, function() {
        var prefix = 'Promises/A+ Compliance Tests '
            + 'SELENIUM_PROMISE_MANAGER=true 2.2.6: '
            + '`then` may be called multiple times on the same promise.';
        var suffix = 'even when one handler is added inside another handler';
        if (this.fullTitle().startsWith(prefix)
            && this.fullTitle().endsWith(suffix)) {
          var realSpecify = global.specify;
          try {
            global.specify = function(name) {
              realSpecify(name);
            };
            fn();
          } finally {
            global.specify = realSpecify;
          }
        } else {
          fn();
        }
      });
    };

    require('promises-aplus-tests').mocha({
      resolved: function(value) {
        return new promise.Promise((fulfill) => fulfill(value), flow);
      },
      rejected: function(error) {
        return new promise.Promise((_, reject) => reject(error), flow);
      },
      deferred: function() {
        var d = new promise.Deferred(flow);
        return {
          resolve: d.fulfill,
          reject: d.reject,
          promise: d.promise
        };
      }
    });

    global.describe = realDescribe;
  });
});

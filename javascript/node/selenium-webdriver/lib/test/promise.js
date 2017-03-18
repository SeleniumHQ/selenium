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


/**
 * Configures a block of mocha tests, ensuring the promise manager is either
 * enabled or disabled for the tests' execution.
 * for their execution.
 */
function withPromiseManager(enabled, fn) {
  describe(`SELENIUM_PROMISE_MANAGER=${enabled}`, function() {
    let saved;

    function changeState() {
      saved = process.env.SELENIUM_PROMISE_MANAGER;
      process.env.SELENIUM_PROMISE_MANAGER = enabled;
    }

    function restoreState() {
      if (saved === undefined) {
        delete process.env.SELENIUM_PROMISE_MANAGER;
      } else {
        process.env.SELENIUM_PROMISE_MANAGER = saved;
      }
    }

    before(changeState);
    after(restoreState);

    try {
      changeState();
      fn();
    } finally {
      restoreState();
    }
  });
};


/**
 * Defines a set of tests to run both with and without the promise manager
 * enabled.
 */
exports.promiseManagerSuite = function(fn) {
  withPromiseManager(true, fn);
  withPromiseManager(false, fn);
};


/**
 * Ensures the promise manager is enabled when the provided tests run.
 */
exports.enablePromiseManager = function(fn) {
  withPromiseManager(true, fn);
};


/**
 * Ensures the promise manager is disabled when the provided tests run.
 */
exports.disablePromiseManager = function(fn) {
  withPromiseManager(false, fn);
};

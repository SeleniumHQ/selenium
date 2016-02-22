// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Test adapter for testing Closure Promises against the
 * Promises/A+ Compliance Test Suite, which is implemented as a Node.js module.
 *
 * This test suite adapter may not be run in Node.js directly, but must first be
 * compiled with the Closure Compiler to pull in the required dependencies.
 *
 * @see https://npmjs.org/package/promises-aplus-tests
 */

goog.provide('goog.promise.testSuiteAdapter');

goog.require('goog.Promise');

goog.setTestOnly('goog.promise.testSuiteAdapter');


var promisesAplusTests = /** @type {function(!Object, function(*))} */ (
    require('promises_aplus_tests'));


/**
 * Adapter for specifying Promise-creating functions to the Promises test suite.
 * @const
 */
goog.promise.testSuiteAdapter = {
  /** @type {function(*): !goog.Promise} */
  'resolved': goog.Promise.resolve,

  /** @type {function(*): !goog.Promise} */
  'rejected': goog.Promise.reject,

  /** @return {!Object} */
  'deferred': function() {
    var promiseObj = {};
    promiseObj['promise'] = new goog.Promise(function(resolve, reject) {
      promiseObj['resolve'] = resolve;
      promiseObj['reject'] = reject;
    });
    return promiseObj;
  }
};


// Node.js defines setTimeout globally, but Closure relies on finding it
// defined on goog.global.
goog.exportSymbol('setTimeout', setTimeout);


// Rethrowing an error to the global scope kills Node immediately. Suppress
// error rethrowing for running this test suite.
goog.Promise.setUnhandledRejectionHandler(goog.nullFunction);


// Run the tests, exiting with a failure code if any of the tests fail.
promisesAplusTests(goog.promise.testSuiteAdapter, function(err) {
  if (err) {
    process.exit(1);
  }
});

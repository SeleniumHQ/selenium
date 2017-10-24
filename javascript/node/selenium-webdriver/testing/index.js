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

/**
 * @fileoverview Provides extensions for
 * [Mocha's BDD interface](https://github.com/mochajs/mocha):
 *
 * You may conditionally suppress a test function using the exported
 * "ignore" function. If the provided predicate returns true, the attached
 * test case will be skipped:
 *
 *     test.ignore(maybe()).it('is flaky', function() {
 *       if (Math.random() < 0.5) throw Error();
 *     });
 *
 *     function maybe() { return Math.random() < 0.5; }
 */

'use strict';


/**
 * Ignores the test chained to this function if the provided predicate returns
 * true.
 * @param {function(): boolean} predicateFn A predicate to call to determine
 *     if the test should be suppressed. This function MUST be synchronous.
 * @return {!Object} An object with wrapped versions of {@link #it()} and
 *     {@link #describe()} that ignore tests as indicated by the predicate.
 */
function ignore(predicateFn) {
  let describe = wrap(getMochaGlobal('xdescribe'), getMochaGlobal('describe'));
  describe.only =
      wrap(getMochaGlobal('xdescribe'), getMochaGlobal('describe').only);

  let it = wrap(getMochaGlobal('xit'), getMochaGlobal('it'));
  it.only = wrap(getMochaGlobal('xit'), getMochaGlobal('it').only);

  return {describe, it};

  function wrap(onSkip, onRun) {
    return function(...args) {
      if (predicateFn()) {
        onSkip(...args);
      } else {
        onRun(...args);
      }
    };
  }
}


/**
 * @param {string} name
 * @return {!Function}
 * @throws {TypeError}
 */
function getMochaGlobal(name) {
  let fn = global[name];
  let type = typeof fn;
  if (type !== 'function') {
    throw TypeError(
        `Expected global.${name} to be a function, but is ${type}. `
            + 'This can happen if you try using this module when running '
            + 'with node directly instead of using the mocha executable');
  }
  return fn;
}


// PUBLIC API


module.exports = {
  ignore,
  after: getMochaGlobal('after'),
  afterEach: getMochaGlobal('afterEach'),
  before: getMochaGlobal('before'),
  beforeEach: getMochaGlobal('beforeEach'),
  describe: getMochaGlobal('describe'),
  it: getMochaGlobal('it'),
};

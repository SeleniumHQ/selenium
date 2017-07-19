// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utilities for working with promises.
 * Note that this file is written ES5-only.
 */

goog.module('goog.labs.promise');

var Promise = goog.require('goog.Promise');


/**
 * Executes an ES6 generator function that may yield Promises, blocking after
 * each Promise until it settles.  Within the generator, the value of each
 * 'yield' expression becomes the resolved value of the yielded promise.
 *
 * If the generator function throws an exception or yields a rejected promise,
 * execution stops, and the promise returned by this function is rejected.
 *
 * A typical call uses generator function syntax:
 *
 *   goog.labs.promise.run(function*() {
 *     console.log('about to start waiting');
 *     while (needsToWait()) {
 *       // Wait 10 seconds.
 *       yield goog.Timer.promise(10000);
 *       console.log('still waiting...');
 *     }
 *   }).then(() => {
 *     console.log('done waiting');
 *   });
 *
 * This function can also be used to simplify asynchronous code:
 *
 *   goog.labs.promise.run(function*()) {
 *     var x = yield somethingThatReturnsAPromise();
 *     var y = yield somethingElseThatReturnsAPromise();
 *     return x + y;
 *   }).then(sum => {
 *     console.log('The sum is:', sum);
 *   });
 *
 * @param {function(this: CONTEXT):TYPE} generatorFunc A function which is
 *     called immediately and returns a generator.
 * @param {CONTEXT=} opt_context The context in which generatorFunc should be
 *     called.
 * @return {!goog.Promise<TYPE>} A promise that is resolved when the generator
 *     returned from generatorFunc is exhausted, or rejected if an error occurs.
 *     If the generator function returns, this promise resolves to the returned
 *     value.
 * @template CONTEXT, TYPE
 */
exports.run = function(generatorFunc, opt_context) {
  var generator = generatorFunc.call(opt_context);
  /**
   * @param {*} previousResolvedValue
   * @param {boolean=} opt_isRejected
   */
  function loop(previousResolvedValue, opt_isRejected) {
    var gen = opt_isRejected ? generator['throw'](previousResolvedValue) :
                               generator.next(previousResolvedValue);
    if (!gen.done) {
      // Wrap gen.value in a promise in case it isn't a promise already.
      return Promise.resolve(gen.value).then(
          function(resolvedValue) { return loop(resolvedValue); },
          function(rejectValue) { return loop(rejectValue, true); });
    }
    return gen.value;
  }
  // Call loop() from then() to ensure exceptions are captured.
  return Promise.resolve().then(loop);
};

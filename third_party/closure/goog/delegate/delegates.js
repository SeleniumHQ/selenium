// Copyright 2017 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides some utility methods for calling delegate lists with
 * common "calling conventions".
 *
 * @see goog.delegate.DelegateRegistry
 */

goog.module('goog.delegate.delegates');


/**
 * Calls the first delegate, or returns undefined if none are given.
 * @param {!Array<T>} delegates
 * @param {function(T): R} mapper
 * @return {R|undefined}
 * @template T, R
 */
exports.callFirst = (delegates, mapper) => {
  return delegates.length > 0 ? mapper(delegates[0]) : undefined;
};


/**
 * Calls delegates until one returns a defined, non-null result.  Returns
 * undefined if no such element is found.
 * @param {!Array<T>} delegates
 * @param {function(T): R|undefined} mapper
 * @return {R|undefined}
 * @template T, R
 */
exports.callUntilDefinedAndNotNull = (delegates, mapper) => {
  for (const delegate of delegates) {
    const result = mapper(delegate);
    if (result != null) return result;
  }
  return undefined;
};


/**
 * Calls delegates until one returns a truthy result.  Returns false if no such
 * element is found.
 * @param {!Array<T>} delegates
 * @param {function(T): R} mapper
 * @return {boolean|R}
 * @template T, R
 */
exports.callUntilTruthy = (delegates, mapper) => {
  for (const delegate of delegates) {
    const result = mapper(delegate);
    if (result) return result;
  }
  return false;
};

// Copyright 2018 The Closure Library Authors. All Rights Reserved.
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

goog.module('goog.promise.NativeResolver');

/**
 * Creates a new JavaScript native Promise and captures its resolve and reject
 * callbacks. The promise, resolve, and reject are available as properties
 * @final
 * @template T
 */
class NativeResolver {
  constructor() {
    /** @type {function((T|!IThenable<T>|!Thenable)=)} */
    this.resolve;
    /** @type {function(*=)} */
    this.reject;

    /** @type {!Promise<T>} */
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

exports = NativeResolver;

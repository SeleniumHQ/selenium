// Copyright 2019 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides an interface that defines how users can extend the
 * `goog.labs.mock` mocking framework with a TimeoutMode. This is used
 * with waitAndVerify to specify a max timeout.
 *
 * In addition it exports a factory method that allows users to easily obtain
 * a TimeoutMode instance.
 */

goog.provide('goog.labs.mock.timeout');
goog.provide('goog.labs.mock.timeout.TimeoutMode');

/**
 * Used to specify max timeout on waitAndVerify
 * @const
 */
goog.labs.mock.timeout.TimeoutMode = class TimeoutMode {
  /**
   * @param {number} duration
   */
  constructor(duration) {
    /**
     * @type {number} duration
     * @public
     */
    this.duration = duration;
  }
};

/**
 * @param {number} duration
 * @return {!goog.labs.mock.timeout.TimeoutMode}
 */
goog.labs.mock.timeout.timeout = function(duration) {
  return new goog.labs.mock.timeout.TimeoutMode(duration);
};

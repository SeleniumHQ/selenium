// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Callback object that counts matches.
 */

goog.provide('goog.dom.pattern.callback.Counter');



/**
 * Callback class for counting matches.
 * @constructor
 * @final
 */
goog.dom.pattern.callback.Counter = function() {
  /**
   * The count of objects matched so far.
   *
   * @type {number}
   */
  this.count = 0;

  /**
   * The callback function.  Suitable as a callback for
   * {@link goog.dom.pattern.Matcher}.
   * @private {?Function}
   */
  this.callback_ = null;
};


/**
 * Get a bound callback function that is suitable as a callback for
 * {@link goog.dom.pattern.Matcher}.
 *
 * @return {!Function} A callback function.
 */
goog.dom.pattern.callback.Counter.prototype.getCallback = function() {
  if (!this.callback_) {
    this.callback_ = goog.bind(function() {
      this.count++;
      return false;
    }, this);
  }
  return this.callback_;
};


/**
 * Reset the counter.
 */
goog.dom.pattern.callback.Counter.prototype.reset = function() {
  this.count = 0;
};

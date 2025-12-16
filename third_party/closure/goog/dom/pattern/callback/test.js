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
 * @fileoverview Callback object that tests if a pattern matches at least once.
 */

goog.provide('goog.dom.pattern.callback.Test');

goog.require('goog.iter.StopIteration');



/**
 * Callback class for testing for at least one match.
 * @constructor
 * @final
 */
goog.dom.pattern.callback.Test = function() {
  /**
   * Whether or not the pattern matched.
   *
   * @type {boolean}
   */
  this.matched = false;

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
goog.dom.pattern.callback.Test.prototype.getCallback = function() {
  if (!this.callback_) {
    this.callback_ = goog.bind(function(node, position) {
      // Mark our match.
      this.matched = true;

      // Stop searching.
      throw goog.iter.StopIteration;
    }, this);
  }
  return this.callback_;
};


/**
 * Reset the counter.
 */
goog.dom.pattern.callback.Test.prototype.reset = function() {
  this.matched = false;
};

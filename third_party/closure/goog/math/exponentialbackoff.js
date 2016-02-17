// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utility class to manage the mathematics behind computing an
 * exponential backoff model.  Given an initial backoff value and a maximum
 * backoff value, every call to backoff() will double the value until maximum
 * backoff value is reached.
 *
 */


goog.provide('goog.math.ExponentialBackoff');

goog.require('goog.asserts');



/**
 * @struct
 * @constructor
 *
 * @param {number} initialValue The initial backoff value.
 * @param {number} maxValue The maximum backoff value.
 * @param {number=} opt_randomFactor When set, adds randomness to the backoff
 *     and decay to avoid a thundering herd problem. Should be a number between
 *     0 and 1, where 0 means no randomness and 1 means a factor of 0x to 2x.
 * @param {number=} opt_backoffFactor The factor to backoff by. Defaults to 2.
 *     Should be a number greater than 1.
 * @param {number=} opt_decayFactor The factor to decay by. Defaults to 2.
 *     Should be a number between greater than one.
 */
goog.math.ExponentialBackoff = function(
    initialValue, maxValue, opt_randomFactor, opt_backoffFactor,
    opt_decayFactor) {
  goog.asserts.assert(
      initialValue > 0, 'Initial value must be greater than zero.');
  goog.asserts.assert(
      maxValue >= initialValue,
      'Max value should be at least as large as initial value.');

  if (goog.isDef(opt_randomFactor)) {
    goog.asserts.assert(
        opt_randomFactor >= 0 && opt_randomFactor <= 1,
        'Randomness factor should be between 0 and 1.');
  }

  if (goog.isDef(opt_backoffFactor)) {
    goog.asserts.assert(
        opt_backoffFactor > 1, 'Backoff factor should be greater than 1');
  }

  if (goog.isDef(opt_decayFactor)) {
    goog.asserts.assert(
        opt_decayFactor >= 1, 'Decay factor should be greater than 1');
  }

  /**
   * @type {number}
   * @private
   */
  this.initialValue_ = initialValue;

  /**
   * @type {number}
   * @private
   */
  this.maxValue_ = maxValue;

  /**
   * The current backoff value.
   * @type {number}
   * @private
   */
  this.currValue_ = initialValue;

  /**
   * The current backoff value minus the random wait (if there is any).
   * @type {number}
   * @private
   */
  this.currBaseValue_ = initialValue;

  /**
   * The random factor to apply to the backoff value to avoid a thundering herd
   * problem. Should be a number between 0 and 1, where 0 means no randomness
   * and 1 means a factor of 0x to 2x.
   * @type {number}
   * @private
   */
  this.randomFactor_ = opt_randomFactor || 0;

  /**
   * Factor to backoff by.
   * @type {number}
   * @private
   */
  this.backoffFactor_ = opt_backoffFactor || 2;

  /**
   * Factor to decay by.
   * @type {number}
   * @private
   */
  this.decayFactor_ = opt_decayFactor || 2;
};


/**
 * The number of backoffs that have happened.
 * @type {number}
 * @private
 */
goog.math.ExponentialBackoff.prototype.currBackoffCount_ = 0;


/**
 * The number of decays that have happened.
 * @type {number}
 * @private
 */
goog.math.ExponentialBackoff.prototype.currDecayCount_ = 0;


/**
 * Resets the backoff value to its initial value.
 */
goog.math.ExponentialBackoff.prototype.reset = function() {
  this.currValue_ = this.initialValue_;
  this.currBaseValue_ = this.initialValue_;
  this.currBackoffCount_ = 0;
  this.currDecayCount_ = 0;
};


/**
 * @return {number} The current backoff value.
 */
goog.math.ExponentialBackoff.prototype.getValue = function() {
  return this.currValue_;
};


/**
 * @return {number} The number of times this class has backed off.
 */
goog.math.ExponentialBackoff.prototype.getBackoffCount = function() {
  return this.currBackoffCount_;
};


/**
 * @return {number} The number of times this class has decayed.
 */
goog.math.ExponentialBackoff.prototype.getDecayCount = function() {
  return this.currDecayCount_;
};


/**
 * Initiates a backoff.
 */
goog.math.ExponentialBackoff.prototype.backoff = function() {
  // If we haven't hit the maximum value yet, keep increasing the base value.
  this.currBaseValue_ =
      Math.min(this.maxValue_, this.currBaseValue_ * this.backoffFactor_);

  var randomWait = this.randomFactor_ ?
      Math.round(
          this.randomFactor_ * (Math.random() - 0.5) * 2 *
          this.currBaseValue_) :
      0;
  this.currValue_ = Math.min(this.maxValue_, this.currBaseValue_ + randomWait);
  this.currBackoffCount_++;
};


/**
 * Initiates a decay.
 */
goog.math.ExponentialBackoff.prototype.decay = function() {
  // If we haven't hit the initial value yet, keep decreasing the base value.
  this.currBaseValue_ =
      Math.max(this.initialValue_, this.currBaseValue_ / this.decayFactor_);

  var randomWait = this.randomFactor_ ?
      Math.round(
          this.randomFactor_ * (Math.random() - 0.5) * 2 *
          this.currBaseValue_) :
      0;
  this.currValue_ =
      Math.max(this.initialValue_, this.currBaseValue_ + randomWait);
  this.currDecayCount_++;
};

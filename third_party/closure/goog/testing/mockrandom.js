// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview MockRandom provides a mechanism for specifying a stream of
 * numbers to expect from calls to Math.random().
 *
 */

goog.provide('goog.testing.MockRandom');

goog.require('goog.Disposable');



/**
 * Class for unit testing code that uses Math.random.
 *
 * @param {Array<number>} sequence The sequence of numbers to return.
 * @param {boolean=} opt_install Whether to install the MockRandom at
 *     construction time.
 * @extends {goog.Disposable}
 * @constructor
 * @final
 */
goog.testing.MockRandom = function(sequence, opt_install) {
  goog.Disposable.call(this);

  /**
   * The sequence of numbers to be returned by calls to random()
   * @type {Array<number>}
   * @private
   */
  this.sequence_ = sequence || [];

  /**
   * The original Math.random function.
   * @type {function(): number}
   * @private
   */
  this.mathRandom_ = Math.random;

  /**
   * Whether to throw an exception when Math.random() is called when there is
   * nothing left in the sequence.
   * @type {boolean}
   * @private
   */
  this.strictlyFromSequence_ = false;

  if (opt_install) {
    this.install();
  }
};
goog.inherits(goog.testing.MockRandom, goog.Disposable);


/**
 * Whether this MockRandom has been installed.
 * @type {boolean}
 * @private
 */
goog.testing.MockRandom.prototype.installed_;


/**
 * Installs this MockRandom as the system number generator.
 */
goog.testing.MockRandom.prototype.install = function() {
  if (!this.installed_) {
    Math.random = goog.bind(this.random, this);
    this.installed_ = true;
  }
};


/**
 * @return {number} The next number in the sequence. If there are no more values
 *     left, this will return a random number, unless
 *     {@code this.strictlyFromSequence_} is true, in which case an error will
 *     be thrown.
 */
goog.testing.MockRandom.prototype.random = function() {
  if (this.hasMoreValues()) {
    return this.sequence_.shift();
  }
  if (this.strictlyFromSequence_) {
    throw new Error('No numbers left in sequence.');
  }
  return this.mathRandom_();
};


/**
 * @return {boolean} Whether there are more numbers left in the sequence.
 */
goog.testing.MockRandom.prototype.hasMoreValues = function() {
  return this.sequence_.length > 0;
};


/**
 * Injects new numbers into the beginning of the sequence.
 * @param {Array<number>|number} values Number or array of numbers to inject.
 */
goog.testing.MockRandom.prototype.inject = function(values) {
  if (goog.isArray(values)) {
    this.sequence_ = values.concat(this.sequence_);
  } else {
    this.sequence_.splice(0, 0, values);
  }
};


/**
 * Uninstalls the MockRandom.
 */
goog.testing.MockRandom.prototype.uninstall = function() {
  if (this.installed_) {
    Math.random = this.mathRandom_;
    this.installed_ = false;
  }
};


/** @override */
goog.testing.MockRandom.prototype.disposeInternal = function() {
  this.uninstall();
  delete this.sequence_;
  delete this.mathRandom_;
  goog.testing.MockRandom.superClass_.disposeInternal.call(this);
};


/**
 * @param {boolean} strictlyFromSequence Whether to throw an exception when
 *     Math.random() is called when there is nothing left in the sequence.
 */
goog.testing.MockRandom.prototype.setStrictlyFromSequence =
    function(strictlyFromSequence) {
  this.strictlyFromSequence_ = strictlyFromSequence;
};

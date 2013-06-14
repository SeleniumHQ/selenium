// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provide definition of an observer. This is meant to
 * be used with {@code goog.labs.observe.Observable}.
 *
 * This file also provides convenient functions to compare and create
 * Observer objects.
 *
 */

goog.provide('goog.labs.observe.Observer');



/**
 * A class implementing {@code Observer} may be informed of changes in
 * observable object.
 * @see {goog.labs.observe.Observable}
 * @interface
 */
goog.labs.observe.Observer = function() {};


/**
 * Notifies the observer of changes to the observable object.
 * @param {!goog.labs.observe.Notice} notice The notice object.
 */
goog.labs.observe.Observer.prototype.notify;


/**
 * Whether this observer is equal to the given observer.
 * @param {!goog.labs.observe.Observer} observer The observer to compare with.
 * @return {boolean} Whether the two observers are equal.
 */
goog.labs.observe.Observer.prototype.equals;


/**
 * @param {!goog.labs.observe.Observer} observer1 Observer to compare.
 * @param {!goog.labs.observe.Observer} observer2 Observer to compare.
 * @return {boolean} Whether observer1 and observer2 are equal, as
 *     determined by the first observer1's {@code equals} method.
 */
goog.labs.observe.Observer.equals = function(observer1, observer2) {
  return observer1 == observer2 || observer1.equals(observer2);
};


/**
 * Creates an observer that calls the given function.
 * @param {function(!goog.labs.observe.Notice)} fn Function to be converted.
 * @param {!Object=} opt_scope Optional scope to execute the function.
 * @return {!goog.labs.observe.Observer} An observer object.
 */
goog.labs.observe.Observer.fromFunction = function(fn, opt_scope) {
  return new goog.labs.observe.Observer.FunctionObserver_(fn, opt_scope);
};



/**
 * An observer that calls the given function on {@code notify}.
 * @param {function(!goog.labs.observe.Notice)} fn Function to delegate to.
 * @param {!Object=} opt_scope Optional scope to execute the function.
 * @constructor
 * @implements {goog.labs.observe.Observer}
 * @private
 */
goog.labs.observe.Observer.FunctionObserver_ = function(fn, opt_scope) {
  this.fn_ = fn;
  this.scope_ = opt_scope;
};


/** @override */
goog.labs.observe.Observer.FunctionObserver_.prototype.notify = function(
    notice) {
  this.fn_.call(this.scope_, notice);
};


/** @override */
goog.labs.observe.Observer.FunctionObserver_.prototype.equals = function(
    observer) {
  return this.fn_ === observer.fn_ && this.scope_ === observer.scope_;
};

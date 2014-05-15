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
 * @fileoverview A set of observations. This set provides a convenient
 * means of observing many observables at once.
 *
 * This is similar in purpose to {@code goog.events.EventHandler}.
 *
 */

goog.provide('goog.labs.observe.ObservationSet');

goog.require('goog.array');
goog.require('goog.labs.observe.Observer');



/**
 * A set of observations. An observation is defined by an observable
 * and an observer. The set keeps track of observations and
 * allows their removal.
 * @param {!Object=} opt_defaultScope Optional function scope to use
 *     when using {@code observeWithFunction} and
 *     {@code unobserveWithFunction}.
 * @constructor
 */
goog.labs.observe.ObservationSet = function(opt_defaultScope) {
  /**
   * @type {!Array.<!goog.labs.observe.ObservationSet.Observation_>}
   * @private
   */
  this.storedObservations_ = [];

  /**
   * @type {!Object|undefined}
   * @private
   */
  this.defaultScope_ = opt_defaultScope;
};


/**
 * Observes the given observer on the observable.
 * @param {!goog.labs.observe.Observable} observable The observable to
 *     observe on.
 * @param {!goog.labs.observe.Observer} observer The observer.
 * @return {boolean} True if the observer is successfully registered.
 */
goog.labs.observe.ObservationSet.prototype.observe = function(
    observable, observer) {
  var success = observable.observe(observer);
  if (success) {
    this.storedObservations_.push(
        new goog.labs.observe.ObservationSet.Observation_(
            observable, observer));
  }
  return success;
};


/**
 * Observes the given function on the observable.
 * @param {!goog.labs.observe.Observable} observable The observable to
 *     observe on.
 * @param {function(!goog.labs.observe.Notice)} fn The handler function.
 * @param {!Object=} opt_scope Optional scope.
 * @return {goog.labs.observe.Observer} The registered observer object.
 *     If the observer is not successfully registered, this will be null.
 */
goog.labs.observe.ObservationSet.prototype.observeWithFunction = function(
    observable, fn, opt_scope) {
  var observer = goog.labs.observe.Observer.fromFunction(
      fn, opt_scope || this.defaultScope_);
  if (this.observe(observable, observer)) {
    return observer;
  }
  return null;
};


/**
 * Unobserves the given observer from the observable.
 * @param {!goog.labs.observe.Observable} observable The observable to
 *     unobserve from.
 * @param {!goog.labs.observe.Observer} observer The observer.
 * @return {boolean} True if the observer is successfully removed.
 */
goog.labs.observe.ObservationSet.prototype.unobserve = function(
    observable, observer) {
  var removed = goog.array.removeIf(
      this.storedObservations_, function(o) {
        return o.observable == observable &&
            goog.labs.observe.Observer.equals(o.observer, observer);
      });

  if (removed) {
    observable.unobserve(observer);
  }
  return removed;
};


/**
 * Unobserves the given function from the observable.
 * @param {!goog.labs.observe.Observable} observable The observable to
 *     unobserve from.
 * @param {function(!goog.labs.observe.Notice)} fn The handler function.
 * @param {!Object=} opt_scope Optional scope.
 * @return {boolean} True if the observer is successfully removed.
 */
goog.labs.observe.ObservationSet.prototype.unobserveWithFunction = function(
    observable, fn, opt_scope) {
  var observer = goog.labs.observe.Observer.fromFunction(
      fn, opt_scope || this.defaultScope_);
  return this.unobserve(observable, observer);
};


/**
 * Removes all observations registered through this set.
 */
goog.labs.observe.ObservationSet.prototype.removeAll = function() {
  goog.array.forEach(this.storedObservations_, function(observation) {
    var observable = observation.observable;
    var observer = observation.observer;
    observable.unobserve(observer);
  });
};



/**
 * A representation of an observation, which is defined uniquely by
 * the observable and observer.
 * @param {!goog.labs.observe.Observable} observable The observable.
 * @param {!goog.labs.observe.Observer} observer The observer.
 * @constructor
 * @private
 */
goog.labs.observe.ObservationSet.Observation_ = function(
    observable, observer) {
  this.observable = observable;
  this.observer = observer;
};

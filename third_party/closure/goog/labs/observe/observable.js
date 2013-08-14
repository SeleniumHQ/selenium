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
 * @fileoverview Experimental observer-observable API. This is
 * intended as super lightweight replacement of
 * goog.events.EventTarget when w3c event model bubble/capture
 * behavior is not required.
 *
 * This is similar to {@code goog.pubsub.PubSub} but with different
 * intent and naming so that it is more discoverable. The API is
 * tighter while allowing for more flexibility offered by the
 * interface {@code Observable}.
 *
 * WARNING: This is still highly experimental. Please contact author
 * before using this.
 *
 */

goog.provide('goog.labs.observe.Observable');

goog.require('goog.disposable.IDisposable');



/**
 * Interface for an observable object.
 * @interface
 * @extends {goog.disposable.IDisposable}
 */
goog.labs.observe.Observable = function() {};


/**
 * Registers an observer on the observable.
 *
 * Note that no guarantee is provided on order of execution of the
 * observers. For a single notification, one Notice object is reused
 * across all invoked observers.
 *
 * Note that if an observation with the same observer is already
 * registered, it will not be registered again. Comparison is done via
 * observer's {@code equals} method.
 *
 * @param {!goog.labs.observe.Observer} observer The observer to add.
 * @return {boolean} Whether the observer was successfully added.
 */
goog.labs.observe.Observable.prototype.observe = function(observer) {};


/**
 * Unregisters an observer from the observable. The parameter must be
 * the same as those passed to {@code observe} method. Comparison is
 * done via observer's {@code equals} method.
 * @param {!goog.labs.observe.Observer} observer The observer to remove.
 * @return {boolean} Whether the observer is removed.
 */
goog.labs.observe.Observable.prototype.unobserve = function(observer) {};


/**
 * Notifies observers by invoking them. Optionally, a data object may be
 * given to be passed to each observer.
 * @param {*=} opt_data An optional data object.
 */
goog.labs.observe.Observable.prototype.notify = function(opt_data) {};

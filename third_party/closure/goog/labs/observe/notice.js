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
 * @fileoverview Provides a notice object that is used to encapsulates
 * information about a particular change/notification on an observable
 * object.
 */

goog.provide('goog.labs.observe.Notice');



/**
 * A notice object encapsulates information about a notification fired
 * by an observable.
 * @param {!goog.labs.observe.Observable} observable The observable
 *     object that fires this notice.
 * @param {*=} opt_data The optional data associated with this notice.
 * @constructor
 */
goog.labs.observe.Notice = function(observable, opt_data) {
  /**
   * @type {!goog.labs.observe.Observable}
   * @private
   */
  this.observable_ = observable;

  /**
   * @type {*}
   * @private
   */
  this.data_ = opt_data;
};


/**
 * @return {!goog.labs.observe.Observable} The observable object that
 *     fires this notice.
 */
goog.labs.observe.Notice.prototype.getObservable = function() {
  return this.observable_;
};


/**
 * @return {*} The optional data associated with this notice. May be
 *     null/undefined.
 */
goog.labs.observe.Notice.prototype.getData = function() {
  return this.data_;
};

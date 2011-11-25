// Copyright 2011 The Closure Library Authors. All Rights Reserved
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
 * @fileoverview The jsaction context object.
 *
 * Context is passed to action handlers to provide
 * them with access to the element the jsaction was found on,
 * as well as the event object and the action being invoked.
 *
 */


goog.provide('goog.jsaction.Context');



/**
 * Constructs a Context instance.
 * @param {string} action The action.
 * @param {!Element} element The element.
 * @param {!Event} e The event object.
 * @param {number} time The time when the event occurred.
 * @constructor
 */
goog.jsaction.Context = function(action, element, e, time) {
  /**
   * @type {string}
   * @private
   */
  this.action_ = action;

  /**
   * @type {!Element}
   * @private
   */
  this.element_ = element;

  /**
   * @type {!Event}
   * @private
   */
  this.event_ = e;

  /**
   * @type {number}
   * @private
   */
  this.time_ = time;
};


/**
 * @return {string} The action.
 */
goog.jsaction.Context.prototype.getAction = function() {
  return this.action_;
};


/**
 * @return {!Element} The element.
 */
goog.jsaction.Context.prototype.getElement = function() {
  return this.element_;
};


/**
 * @return {!Event} The event object.
 */
goog.jsaction.Context.prototype.getEvent = function() {
  return this.event_;
};


/**
 * @return {number} The time the event occurred.
 */
goog.jsaction.Context.prototype.getTime = function() {
  return this.time_;
};

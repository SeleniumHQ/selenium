/** @license
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @fileoverview Defines a class for representing the result of an asynchronous
 * {@code webdriver.Command}.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.Future');

goog.require('goog.events.EventType');
goog.require('goog.events.EventTarget');


/**
 * Represents the result of an asynchronous {@code webdriver.Command}. Methods
 * are provided to check if the result has been set and to retrieve the result.
 * <p/>
 * This instance will dispatch a {@code goog.events.EventType.CHANGE} event when
 * its value is set. An {@code Error} will be thrown if {@code #getValue()} is
 * called before the value has been set.
 * @param {webdriver.WebDriver} driver The WebDriver instance that will
 *     eventually set this instance's value.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
webdriver.Future = function(driver) {
  goog.events.EventTarget.call(this);

  /**
   * The WebDriver that will eventaully set this instance's value.
   * @type {webdriver.WebDriver}
   * @private
   */
  this.driver_ = driver;

  /**
   * The value of this Future.
   * @type {*}
   * @private
   */
  this.value_ = webdriver.Future.NOT_SET_;

  /**
   * Futures whose values are linked to this one. When this future's value is
   * set, all of the linked futures will also be updated.
   * @type {Array.<webdriver.Future>}
   * @private
   */
  this.linkedFutures_ = [];
};
goog.inherits(webdriver.Future,  goog.events.EventTarget);


/**
 * A special place-holder value used to represent that the result for a future
 * has not been computed yet.
 * @type {Object}
 * @private
 */
webdriver.Future.NOT_SET_ = {};


/** @override */
webdriver.Future.prototype.disposeInternal = function() {
  delete this.driver_;
  delete this.value_;
  delete this.linkedFutures_;
  webdriver.Future.superClass_.disposeInternal.call(this);
};


/**
 * @return {*} The value of this Future.
 * @throws If the value has not been set yet.
 */
webdriver.Future.prototype.getValue = function() {
  if (this.value_ === webdriver.Future.NOT_SET_) {
    throw new Error('Value has not been set yet');
  }
  return this.value_;
};


/**
 * @return {webdriver.WebDriver} The WebDriver that set/will set this Future's
 *     value.
 */
webdriver.Future.prototype.getDriver = function() {
  return this.driver_;
};


/**
 * Sets the value of this Future and dispatches a
 * {@code goog.events.EventType.CHANGE} event. If the given value is another
 * future and its value has not been set, a callback will be registered to
 * set this instance's value when the input future's value is set. Note that
 * the value of a future may only be set once.
 * @param {*} value The new value.
 */
webdriver.Future.prototype.setValue = function(value) {
  if (this.isSet()) {
    return;
  }
  if (value instanceof webdriver.Future) {
    if (value.isSet()) {
      this.value_ = value.getValue();
    } else {
      value.linkedFutures_.push(this);
    }
  } else {
    this.value_ = value;
    goog.array.forEach(this.linkedFutures_, function(future) {
      future.setValue(value);
    });
    this.dispatchEvent(goog.events.EventType.CHANGE);
  }
};


/**
 * Sets the value of this future from the value of a Response object.
 * @param {webdriver.Response} response The webdriver.Response to set the value
 *     from.
 */
webdriver.Future.prototype.setValueFromResponse = function(response) {
  this.setValue(response.value);
};


/**
 * @return {boolean} Whether this future has had its value set.
 */
webdriver.Future.prototype.isSet = function() {
  return this.value_ !== webdriver.Future.NOT_SET_;
};

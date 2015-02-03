// Copyright 2015 Selenium comitters
// Copyright 2015 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('webdriver.TouchSequence');

goog.require('goog.array');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');



/**
 * Class for defining sequences of user touch interactions. Each sequence
 * will not be executed until {@link #perform} is called.
 *
 * Example:
 *
 *     new webdriver.TouchSequence(driver).
 *         tapAndHold({x: 0, y: 0}).
 *         move({x: 3, y: 4}).
 *         release({x: 10, y: 10}).
 *         perform();
 *
 * @param {!webdriver.WebDriver} driver The driver instance to use.
 * @constructor
 */
webdriver.TouchSequence = function(driver) {

  /** @private {!webdriver.WebDriver} */
  this.driver_ = driver;

  /** @private {!Array<{description: string, command: !webdriver.Command}>} */
  this.touchActions_ = [];
};


/**
 * Schedules an action to be executed each time {@link #perform} is called on
 * this instance.
 * @param {string} description A description of the command.
 * @param {!webdriver.Command} command The command.
 * @private
 */
webdriver.TouchSequence.prototype.schedule_ = function(description, command) {
  this.touchActions_.push({
    description: description,
    command: command
  });
};


/**
 * Executes this action sequence.
 * @return {!webdriver.promise.Promise} A promise that will be resolved once
 *     this sequence has completed.
 */
webdriver.TouchSequence.prototype.perform = function() {
  // Make a protected copy of the scheduled actions. This will protect against
  // users defining additional commands before this sequence is actually
  // executed.
  var actions = goog.array.clone(this.touchActions_);
  var driver = this.driver_;
  return driver.controlFlow().execute(function() {
    goog.array.forEach(actions, function(action) {
      driver.schedule(action.command, action.description);
    });
  }, 'TouchSequence.perform');
};


/**
 * Taps an element.
 *
 * @param {!webdriver.WebElement} elem The element to tap.
 * @return {!webdriver.TouchSequence} A self reference.
 */
webdriver.TouchSequence.prototype.tap = function(elem) {
  var command = new webdriver.Command(webdriver.CommandName.TOUCH_SINGLE_TAP).
      setParameter('element', elem.getRawId());

  this.schedule_('tap', command);
  return this;
};


/**
 * Double taps an element.
 *
 * @param {!webdriver.WebElement} elem The element to double tap.
 * @return {!webdriver.TouchSequence} A self reference.
 */
webdriver.TouchSequence.prototype.doubleTap = function(elem) {
  var command = new webdriver.Command(webdriver.CommandName.TOUCH_DOUBLE_TAP).
      setParameter('element', elem.getRawId());

  this.schedule_('doubleTap', command);
  return this;
};


/**
 * Long press on an element.
 *
 * @param {!webdriver.WebElement} elem The element to long press.
 * @return {!webdriver.TouchSequence} A self reference.
 */
webdriver.TouchSequence.prototype.longPress = function(elem) {
  var command = new webdriver.Command(webdriver.CommandName.TOUCH_LONG_PRESS).
      setParameter('element', elem.getRawId());

  this.schedule_('longPress', command);
  return this;
};


/**
 * Touch down at the given location.
 *
 * @param {{x: number, y: number}} location The location to touch down at.
 * @return {!webdriver.TouchSequence} A self reference.
 */
webdriver.TouchSequence.prototype.tapAndHold = function(location) {
  var command = new webdriver.Command(webdriver.CommandName.TOUCH_DOWN).
      setParameter('x', location.x).
      setParameter('y', location.y);

  this.schedule_('tapAndHold', command);
  return this;
};


/**
 * Move a held {@linkplain #tapAndHold touch} to the specified location.
 *
 * @param {{x: number, y: number}} location The location to move to.
 * @return {!webdriver.TouchSequence} A self reference.
 */
webdriver.TouchSequence.prototype.move = function(location) {
  var command = new webdriver.Command(webdriver.CommandName.TOUCH_MOVE).
      setParameter('x', location.x).
      setParameter('y', location.y);

  this.schedule_('move', command);
  return this;
};


/**
 * Release a held {@linkplain #tapAndHold touch} at the specified location.
 *
 * @param {{x: number, y: number}} location The location to release at.
 * @return {!webdriver.TouchSequence} A self reference.
 */
webdriver.TouchSequence.prototype.release = function(location) {
  var command = new webdriver.Command(webdriver.CommandName.TOUCH_UP).
      setParameter('x', location.x).
      setParameter('y', location.y);

  this.schedule_('release', command);
  return this;
};


/**
 * Scrolls the touch screen by the given offset.
 *
 * @param {{x: number, y: number}} offset The offset to scroll to.
 * @return {!webdriver.TouchSequence} A self reference.
 */
webdriver.TouchSequence.prototype.scroll = function(offset) {
  var command = new webdriver.Command(webdriver.CommandName.TOUCH_SCROLL).
      setParameter('xoffset', offset.x).
      setParameter('yoffset', offset.y);

  this.schedule_('scroll', command);
  return this;
};


/**
 * Scrolls the touch screen, starting on `elem` and moving by the specified
 * offset.
 *
 * @param {!webdriver.WebElement} elem The element where scroll starts.
 * @param {{x: number, y: number}} offset The offset to scroll to.
 * @return {!webdriver.TouchSequence} A self reference.
 */
webdriver.TouchSequence.prototype.scrollFromElement = function(elem, offset) {
  var command = new webdriver.Command(webdriver.CommandName.TOUCH_SCROLL).
      setParameter('element', elem.getRawId()).
      setParameter('xoffset', offset.x).
      setParameter('yoffset', offset.y);

  this.schedule_('scrollFromElement', command);
  return this;
};


/**
 * Flick, starting anywhere on the screen, at speed xspeed and yspeed.
 *
 * @param {{xspeed: number, yspeed: number}} speed The speed to flick in each
       direction, in pixels per second.
 * @return {!webdriver.TouchSequence} A self reference.
 */
webdriver.TouchSequence.prototype.flick = function(speed) {
  var command = new webdriver.Command(webdriver.CommandName.TOUCH_FLICK).
      setParameter('xspeed', speed.xspeed).
      setParameter('yspeed', speed.yspeed);

  this.schedule_('flick', command);
  return this;
};


/**
 * Flick starting at elem and moving by x and y at specified speed.
 *
 * @param {!webdriver.WebElement} elem The element where flick starts.
 * @param {{x: number, y: number}} offset The offset to flick to.
 * @param {number} speed The speed to flick at in pixels per second.
 * @return {!webdriver.TouchSequence} A self reference.
 */
webdriver.TouchSequence.prototype.flickElement = function(elem, offset, speed) {
  var command = new webdriver.Command(webdriver.CommandName.TOUCH_FLICK).
      setParameter('element', elem.getRawId()).
      setParameter('xoffset', offset.x).
      setParameter('yoffset', offset.y).
      setParameter('speed', speed);

  this.schedule_('flickElement', command);
  return this;
};


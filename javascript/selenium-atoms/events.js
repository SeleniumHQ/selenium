/**
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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
 * @fileoverview Event firing magic.
 */

goog.provide('core.events');

goog.require('bot.dom');
goog.require('bot.events');
goog.require('core.Error');
goog.require('core.locators');
goog.require('goog.dom.TagName');


core.events.controlKeyDown_ = false;
core.events.altKeyDown_ = false;
core.events.metaKeyDown_ = false;
core.events.shiftKeyDown_ = false;

/**
 * Fire a named a event on a particular element;
 *
 * @param {string|!Element} locator The element to fire the event on.
 * @param {string} eventName The name of the event to fire.
 */
core.events.fire = function(locator, eventName) {
  var element = core.locators.findElement(locator);
  bot.events.fire(element, eventName);
};


/**
 * Parse a text description of a set of a coordinates. This is expected to be of
 * the form "x,y" where "x" and "y" are integers. If calling code needs these
 * values to be relative to a particular element they need to translate the
 * values as required
 *
 * @param {string} coordString The coordinates to parse.
 * @return {{x: number, y: number}} The coordinates.
 * @private
 */
core.events.parseCoordinates_ = function(coordString) {

  if (goog.isString(coordString)) {
    // TODO(simon): Tighten constraints on what a valid coordString is.
    var pieces = coordString.split(/,/);
    var x = parseInt(pieces[0]);
    var y = parseInt(pieces[1]);
    return {x: x, y: y};
  }

  return {x: 0, y: 0};
};


/**
 * Fire an event at a location relative to an element. By default the relative
 * location is "0,0", but if not should be stated as a string of the form "x,y"
 *
 * @param {string|!Element} locator The element to fire the event on.
 * @param {string} eventName The name of the event to fire.
 * @param {=string} opt_coordString The coordinate string. "0,0" by default.
 */
core.events.fireAt = function(locator, eventName, opt_coordString) {
  var element = core.locators.findElement(locator);
  var coords = core.events.parseCoordinates_(opt_coordString || "0,0");

  bot.events.fire(element, eventName, coords);
};


/**
 * @param {!Element} element The element to modify.
 * @param {string} value The value to use.
 */
core.events.replaceText_ = function(element, value) {
  bot.events.fire(element, 'focus', {bubble: false});
  bot.events.fire(element, 'select');

  var maxLengthAttr = bot.dom.getAttribute(element, 'maxlength');
  var actualValue = value;
  if (maxLengthAttr != null) {
    var maxLength = parseInt(maxLengthAttr);
    if (value.length > maxLength) {
      actualValue = value.substr(0, maxLength);
    }
  }

  if (bot.dom.isElement(element, goog.dom.TagName.BODY)) {
    if (element.ownerDocument && element.ownerDocument.designMode) {
      var designMode = new String(element.ownerDocument.designMode).toLowerCase();
      if (designMode == "on") {
        // this must be a rich text control!
        element.innerHTML = actualValue;
      }
    }
  } else {
    element.value = actualValue;
  }
  // DGF this used to be skipped in chrome URLs, but no longer.  Is xpcnativewrappers to blame?
  try {
    bot.events.fire(element, 'change');
  } catch (e) {
  }
};


/**
 * Set the value of an input field by forcefully overwriting the "value". Can
 * also be used to set the value of combo boxes, check boxes, etc. In these
 * cases, value should be the value of the option selected, not the visible
 * text.
 *
 * @param {string|!Element} locator The element locator.
 * @param {string} newValue The value to use.
 */
core.events.setValue = function(locator, value) {
  if (core.events.controlKeyDown_ || core.events.altKeyDown_ || core.events.metaKeyDown_) {
    throw new core.Error("type not supported immediately after call to " +
        "controlKeyDown() or altKeyDown() or metaKeyDown()");
  }

  // TODO(simon): fail if it can't be typed into.
  var element = core.locators.findElement(locator);

  var newValue = core.events.shiftKeyDown_ ?
      new String(value).toUpperCase() : value;

  core.events.replaceText_(element, newValue);
};

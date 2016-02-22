// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Event firing magic.
 */

goog.provide('core.events');

goog.require('bot.dom');
goog.require('bot.events');
goog.require('bot.events.EventType');
goog.require('bot.events.MouseArgs');
goog.require('bot.userAgent');
goog.require('core.Error');
goog.require('core.locators');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.style');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');
goog.require('goog.userAgent.product.isVersion');


core.events.controlKeyDown_ = false;
core.events.altKeyDown_ = false;
core.events.metaKeyDown_ = false;
core.events.shiftKeyDown_ = false;

/**
 * @type {function(*): !Object}
 */
var XPCNativeWrapper = XPCNativeWrapper || function(_) {};

core.events.getEventFactory_ = function(eventName) {
  var eventNameForFactory = '';
  if (eventName) {
    eventNameForFactory = eventName.toUpperCase();
  }
  var factory = bot.events.EventType[eventNameForFactory];
  if (factory) {
    return factory;
  }

  return {
    create: function(target, opt_args) {
      var doc = goog.dom.getOwnerDocument(target);
      var event;

      if (bot.userAgent.IE_DOC_PRE9 && doc.createEventObject) {
        event = doc.createEventObject();
      } else {
        event = doc.createEvent('HTMLEvents');
        event.initEvent(eventName, true, true);
      }

      return event;
    },
    type_: eventName
  };
};


/**
 * Fire a named a event on a particular element;
 *
 * @param {string|!Element} locator The element to fire the event on.
 * @param {string} eventName The name of the event to fire.
 */
core.events.fire = function(locator, eventName) {
  var element = core.locators.findElement(locator);
  var type = core.events.getEventFactory_(eventName);

  if (!type) {
    throw new Error('Unable to find type for: ' + eventName);
  }

  bot.events.fire(element, type);
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
    // TODO: Tighten constraints on what a valid coordString is.
    var pieces = coordString.split(/,/);
    var x = parseInt(pieces[0], 0);
    var y = parseInt(pieces[1], 0);
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
 * @param {string=} opt_coordString The coordinate string. "0,0" by default.
 */
core.events.fireAt = function(locator, eventName, opt_coordString) {
  var element = core.locators.findElement(locator);
  var coords = core.events.parseCoordinates_(opt_coordString || '0,0');

  if (goog.userAgent.IE || goog.userAgent.product.CHROME ||
      (goog.userAgent.product.FIREFOX &&
          goog.userAgent.product.isVersion(27))) {
    var bounds = goog.style.getBounds(element);
    coords.x += bounds.left;
    coords.y += bounds.top;
  }

  var type = core.events.getEventFactory_(eventName);
  var args = {
      clientX: coords.x,
      clientY: coords.y,
      button: 0,
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
      relatedTarget: null
  };
  bot.events.fire(element, type, /** @type {!bot.events.MouseArgs} */ (args));
};


/**
 * @param {!Element} element The element to modify.
 * @param {string} value The value to use.
 */
core.events.replaceText_ = function(element, value) {
  bot.events.fire(element, bot.events.EventType.FOCUS);
  bot.events.fire(element, bot.events.EventType.SELECT);

  var maxLengthAttr = bot.dom.getAttribute(element, 'maxlength');
  var actualValue = value;
  if (maxLengthAttr != null) {
    var maxLength = parseInt(maxLengthAttr, 0);
    if (value.length > maxLength) {
      actualValue = value.substr(0, maxLength);
    }
  }

  if (bot.dom.isElement(element, goog.dom.TagName.BODY)) {
    if (element.ownerDocument && element.ownerDocument.designMode) {
      var designMode = new String(element.ownerDocument.designMode).toLowerCase();
      if (designMode == 'on') {
        // this must be a rich text control!
        element.innerHTML = actualValue;
      }
    }
  } else if (goog.userAgent.GECKO && bot.userAgent.FIREFOX_EXTENSION &&
             bot.userAgent.isEngineVersion(8)) {
    // Firefox 8+ fails with a security error if typing into (XPCNativeWrapper)
    // unwrapped objects
    XPCNativeWrapper(element).value = actualValue;
  } else {
    element.value = actualValue;
  }
  // DGF this used to be skipped in chrome URLs, but no longer.
  // Is xpcnativewrappers to blame?
  try {
    var elem = element;
//    if (bot.userAgent.FIREFOX_EXTENSION && Components && Components['classes'] && XPCNativeWrapper) {
//      elem = new XPCNativeWrapper(element);
//    }
    bot.events.fire(elem, bot.events.EventType.CHANGE);
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
 * @param {string} value The value to use.
 */
core.events.setValue = function(locator, value) {
  if (core.events.controlKeyDown_ || core.events.altKeyDown_ || core.events.metaKeyDown_) {
    throw new core.Error('type not supported immediately after call to ' +
        'controlKeyDown() or altKeyDown() or metaKeyDown()');
  }

  // TODO: fail if it can't be typed into.
  var element = core.locators.findElement(locator);

  var newValue = core.events.shiftKeyDown_ ?
      new String(value).toUpperCase() : value;

  core.events.replaceText_(element, newValue);
};

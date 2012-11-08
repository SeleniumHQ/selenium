/*
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

goog.provide('SyntheticMouse');

goog.require('Utils');
goog.require('bot.ErrorCode');
goog.require('bot.Mouse');
goog.require('bot.action');
goog.require('bot.dom');
goog.require('bot.events');
goog.require('bot.events.EventType');
goog.require('bot.window');
goog.require('fxdriver.logging');
goog.require('fxdriver.moz');
goog.require('fxdriver.utils');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.math.Coordinate');
goog.require('goog.style');


SyntheticMouse = function() {
  this.wrappedJSObject = this;

  this.QueryInterface = fxdriver.moz.queryInterface(this,
      [CI.nsISupports, CI.wdIMouse]);

  // Declare the state we'll be using
  this.buttonDown = null;
  this.lastElement = null;
  this.isButtonPressed = false;

  // When the mouse has been pressed, firefox locks to using the viewport, as
  // it was at the time of mouseDown, until the mouse is released. We keep
  // track of the viewport scroll offset in this variable, when we mouseDown,
  // until we mouseUp, so that we can account for any scrolling which may have
  // happened, when we fire events.
  this.viewPortOffset = new goog.math.Coordinate(0, 0);
};


SyntheticMouse.newResponse = function(status, message) {
  return {
    status: status,
    message: message,
    QueryInterface: function(iid) {
      if (iid.equals(Components.interfaces.wdIStatus) ||
          iid.equals(Components.interfaces.nsISupports))
        return this;
      throw Components.results.NS_NOINTERFACE;
    }
  };
};


SyntheticMouse.prototype.isElementShown = function(element) {
  if (!bot.dom.isShown(element, /*ignoreOpacity=*/true)) {
    return SyntheticMouse.newResponse(bot.ErrorCode.ELEMENT_NOT_VISIBLE,
        'Element is not currently visible and so may not be interacted with');
  }
};


SyntheticMouse.prototype.getElement_ = function(coords) {
  return coords.auxiliary || this.lastElement;
};

// wdIMouse

SyntheticMouse.prototype.initialize = function(modifierKeys) {
  this.modifierKeys = modifierKeys;
};


SyntheticMouse.prototype.move = function(target, xOffset, yOffset) {
  // TODO(simon): find the current "body" element iff element == null
  var element = target || this.lastElement;
  this.lastElement = element;

  xOffset = xOffset || 0;
  yOffset = yOffset || 0;

  var doc = goog.dom.getOwnerDocument(element);
  var win = goog.dom.getWindow(doc);
  bot.setWindow(goog.dom.getWindow(doc));
  var mouse = new bot.Mouse();

  var inViewAfterScroll = bot.action.scrollIntoView(
      element,
      new goog.math.Coordinate(xOffset, yOffset));
  // Check to see if the given positions and offsets are outside of the window
  // Are we about to be dragged out of the window?

  var isOption = bot.dom.isElement(element, goog.dom.TagName.OPTION);

  if (!isOption && !inViewAfterScroll) {
    return SyntheticMouse.newResponse(bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS,
        'Element cannot be scrolled into view:' + element);
  }

  var xCompensate = 0;
  var yCompensate = 0;
  if (this.isButtonPressed) {
    // See the comment on the viewPortOffset field for why this is necessary.
    var doc = goog.dom.getOwnerDocument(element);
    var scrollOffset = goog.dom.getDomHelper(doc).getDocumentScroll();
    xCompensate = (scrollOffset.x - this.viewPortOffset.x) * 2;
    yCompensate = (scrollOffset.y - this.viewPortOffset.y) * 2;
  }

  var coords =
      new goog.math.Coordinate(xOffset + xCompensate, yOffset + yCompensate);

  mouse.move(element, coords);

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, 'ok');
};


SyntheticMouse.prototype.click = function(target) {

  // No need to unwrap the target. All information is provided by the wrapped
  // version, and unwrapping does not work for all firefox versions.
  var element = target ? target : this.lastElement;

  var error = this.isElementShown(element);
  if (error) {
    return error;
  }

  // Check to see if this is an option element. If it is, and the parent isn't a multiple
  // select, then click on the select first.
  var tagName = element.tagName.toLowerCase();
  if ('option' == tagName) {
    var parent = element;
    while (parent.parentNode != null && parent.tagName.toLowerCase() != 'select') {
      parent = parent.parentNode;
    }

    if (parent && parent.tagName.toLowerCase() == 'select' && !parent.multiple) {
      bot.action.click(parent);
    }
  }

  fxdriver.logging.info('About to do a bot.action.click on ' + element);
  var keyboardState = new bot.Device.ModifiersState();
  if (this.modifierKeys !== undefined) {
    keyboardState.setPressed(bot.Device.Modifier.SHIFT, this.modifierKeys.isShiftPressed());
    keyboardState.setPressed(bot.Device.Modifier.CONTROL, this.modifierKeys.isControlPressed());
    keyboardState.setPressed(bot.Device.Modifier.ALT, this.modifierKeys.isAltPressed());
    keyboardState.setPressed(bot.Device.Modifier.META, this.modifierKeys.isMetaPressed());
  }

  var mouseWithKeyboardState = new bot.Mouse(null, keyboardState);

  bot.action.click(element, undefined /* coords */, mouseWithKeyboardState);
  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, 'ok');
};

SyntheticMouse.prototype.contextClick = function(target) {

  // No need to unwrap the target. All information is provided by the wrapped
  // version, and unwrapping does not work for all firefox versions.
  var element = target ? target : this.lastElement;

  var error = this.isElementShown(element);
  if (error) {
    return error;
  }

  fxdriver.logging.info('About to do a bot.action.rightClick on ' + element);
  bot.action.rightClick(element);

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, 'ok');
};

SyntheticMouse.prototype.doubleClick = function(target) {
  var element = target ? target : this.lastElement;

  var error = this.isElementShown(element);
  if (error) {
    return error;
  }

  fxdriver.logging.info('About to do a bot.action.doubleClick on ' + element);
  bot.action.doubleClick(element);

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, 'ok');
};


SyntheticMouse.prototype.down = function(coordinates) {
  var element = this.getElement_(coordinates);

  var pos = goog.style.getClientPosition(element);

  this.isButtonPressed = true;
  var doc = goog.dom.getOwnerDocument(element);
  var scrollOffset =
      goog.dom.getDomHelper(doc).getDocumentScroll();
  this.viewPortOffset = scrollOffset;

  // TODO(simon): This implementation isn't good enough. Again
  // Defaults to left mouse button, which is right.
  this.buttonDown = bot.Mouse.Button.LEFT;
  var botCoords = {
    'clientX': coordinates['x'] + pos.x,
    'clientY': coordinates['y'] + pos.y,
    'button': bot.Mouse.Button.LEFT
  };
  this.addEventModifierKeys(botCoords);
  bot.events.fire(element, bot.events.EventType.MOUSEDOWN, botCoords);

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, 'ok');
};


SyntheticMouse.prototype.up = function(coordinates) {
  var element = this.getElement_(coordinates);

  var pos = goog.style.getClientPosition(element);

  // TODO(simon): This implementation isn't good enough. Again
  // Defaults to left mouse button, which is the correct one.
  var button = this.buttonDown;
  var botCoords = {
    'clientX': coordinates['x'] + pos.x,
    'clientY': coordinates['y'] + pos.y,
    'button': button
  };
  this.addEventModifierKeys(botCoords);
  bot.events.fire(element, bot.events.EventType.MOUSEMOVE, botCoords);
  bot.events.fire(element, bot.events.EventType.MOUSEUP, botCoords);

  this.buttonDown = null;
  this.isButtonPressed = false;
  this.viewPortOffset.x = 0;
  this.viewPortOffset.y = 0;

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, 'ok');
};


SyntheticMouse.prototype.addEventModifierKeys = function(botCoords) {
  if (this.modifierKeys !== undefined) {
    botCoords.altKey = this.modifierKeys.isAltPressed();
    botCoords.ctrlKey = this.modifierKeys.isControlPressed();
    botCoords.metaKey = this.modifierKeys.isMetaPressed();
    botCoords.shiftKey = this.modifierKeys.isShiftPressed();
  }
};


// And finally, registering
SyntheticMouse.prototype.classDescription = 'Pure JS implementation of a mouse';
SyntheticMouse.prototype.contractID = '@googlecode.com/webdriver/syntheticmouse;1';
SyntheticMouse.prototype.classID = Components.ID('{E8F9FEFE-C513-4097-98BE-BE00A41D3645}');

/** @const */ var components = [SyntheticMouse];

fxdriver.moz.load('resource://gre/modules/XPCOMUtils.jsm');

if (XPCOMUtils.generateNSGetFactory) {
  NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
} else {
  NSGetModule = XPCOMUtils.generateNSGetModule(components);
}

goog.exportSymbol('SyntheticMouse', SyntheticMouse);
goog.exportSymbol('SyntheticMouse.prototype.down', SyntheticMouse.prototype.down);
goog.exportSymbol('SyntheticMouse.prototype.up', SyntheticMouse.prototype.up);

goog.exportSymbol('SyntheticMouse.prototype.move', SyntheticMouse.prototype.move);

goog.exportSymbol('SyntheticMouse.prototype.click', SyntheticMouse.prototype.click);
goog.exportSymbol('SyntheticMouse.prototype.doubleClick', SyntheticMouse.prototype.doubleClick);
goog.exportSymbol('SyntheticMouse.prototype.contextClick', SyntheticMouse.prototype.contextClick);

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
goog.require('bot.window');
goog.require('fxdriver.moz');
goog.require('fxdriver.utils');
goog.require('fxdriver.Logger');
goog.require('goog.math.Coordinate');


var CC = Components.classes;
var CI = Components.interfaces;


SyntheticMouse = function() {
  this.wrappedJSObject = this;

  this.QueryInterface = fxdriver.moz.queryInterface(this,
      [CI.nsISupports, CI.wdIMouse]);

  // Declare the state we'll be using
  this.buttonDown = null;
  this.lastElement = null;
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
        'Element is not currently visible and so may not be interacted with')
  }
};


SyntheticMouse.prototype.getElement_ = function(coords) {
  return coords.auxiliary ?
      fxdriver.moz.unwrap(coords.auxiliary) : this.lastElement;
};

// wdIMouse

SyntheticMouse.prototype.move = function(target, xOffset, yOffset) {
  // TODO(simon): find the current "body" element iff element == null
  var element = target ? 
      fxdriver.moz.unwrap(target) : this.lastElement;
  this.lastElement = element;

  xOffset = xOffset || 0;
  yOffset = yOffset || 0;

  var doc = goog.dom.getOwnerDocument(element);
  var win = goog.dom.getWindow(doc);
  bot.setWindow(goog.dom.getWindow(doc));
  var mouse = new bot.Mouse();

  if (goog.isFunction(element.scrollIntoView)) {
     goog.style.scrollIntoContainerView(element, doc.documentElement);
  }

  // Check to see if the given positions and offsets are outside of the window
  // Are we about to be dragged out of the window?
  var windowSize = bot.window.getInteractableSize(win);

  var isOption = bot.dom.isElement(element, goog.dom.TagName.OPTION);
  var pos = Utils.getElementLocation(element);

  var targetX = pos.x + xOffset;
  var targetY = pos.y + yOffset;

  if (!isOption &&
      (targetX > windowSize.width || targetY > windowSize.height)) {
    return SyntheticMouse.newResponse(bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS,
        'Requested location (' + targetX + ', ' + targetY +
        ') is outside the bounds of the document (' + windowSize.width + ', ' +
        windowSize.height + ')');
  }

  var coords = new goog.math.Coordinate(xOffset, yOffset);
  mouse.move(element, coords);

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, "ok");
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
  if ("option" == tagName) {
    var parent = element;
    while (parent.parentNode != null && parent.tagName.toLowerCase() != "select") {
      parent = parent.parentNode;
    }

    if (parent && parent.tagName.toLowerCase() == "select" && !parent.multiple) {
      bot.action.click(parent);
    }
  }

  fxdriver.Logger.dumpn("About to do a bot.action.click on " + element);
  bot.action.click(element);

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, "ok");
};

SyntheticMouse.prototype.contextClick = function(target) {

  // No need to unwrap the target. All information is provided by the wrapped
  // version, and unwrapping does not work for all firefox versions.
  var element = target ? target : this.lastElement;

  var error = this.isElementShown(element);
  if (error) {
    return error;
  }

  fxdriver.Logger.dumpn("About to do a bot.action.rightClick on " + element);
  bot.action.rightClick(element);

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, "ok");
};

SyntheticMouse.prototype.doubleClick = function(target) {
  var element = target ? target : this.lastElement;

  var error = this.isElementShown(element);
  if (error) {
    return error;
  }

  fxdriver.Logger.dumpn("About to do a bot.action.doubleClick on " + element);
  bot.action.doubleClick(element);

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, "ok");
};


SyntheticMouse.prototype.down = function(coordinates) {
  var element = this.getElement_(coordinates);

  var pos = goog.style.getClientPosition(element);

  // TODO(simon): This implementation isn't good enough. Again
  // Defaults to left mouse button, which is right.
  this.buttonDown = bot.Mouse.Button.LEFT;
  var botCoords = {
    'clientX': coordinates['x'] + pos.x,
    'clientY': coordinates['y'] + pos.y,
    'button': bot.Mouse.Button.LEFT
  };
  bot.events.fire(element, goog.events.EventType.MOUSEDOWN, botCoords);

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, "ok");
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
  bot.events.fire(element, goog.events.EventType.MOUSEMOVE, botCoords);
  bot.events.fire(element, goog.events.EventType.MOUSEUP, botCoords);

  this.buttonDown = null;

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, "ok");
};


// And finally, registering
SyntheticMouse.prototype.classDescription = "Pure JS implementation of a mouse";
SyntheticMouse.prototype.contractID = '@googlecode.com/webdriver/syntheticmouse;1';
SyntheticMouse.prototype.classID = Components.ID('{E8F9FEFE-C513-4097-98BE-BE00A41D3645}');

/** @const */ var components = [SyntheticMouse];
var NSGetFactory, NSGetModule;

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

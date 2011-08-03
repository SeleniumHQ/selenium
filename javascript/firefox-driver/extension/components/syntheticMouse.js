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

var CC = Components.classes;
var CI = Components.interfaces;
var CU = Components.utils;

CU.import("resource://gre/modules/XPCOMUtils.jsm");


function SyntheticMouse() {
  // Get the wonder of the events
  CU.import('resource://fxdriver/modules/atoms.js');
  // And the utility methods we may need
  CU.import('resource://fxdriver/modules/utils.js');

  this.wrappedJSObject = this;

  this.QueryInterface = webdriver.firefox.utils.queryInterface(this,
      [CI.nsISupports, CI.wdIMouse]);

  // Declare the state we'll be using
  this.buttonDown = bot.Mouse.Button.NONE;
  this.lastElement = null;
}


SyntheticMouse.prototype.newResponse = function(status, message) {
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
    return this.newResponse(ErrorCode.ELEMENT_NOT_VISIBLE,
        'Element is not currently visible and so may not be interacted with')
  }
};


SyntheticMouse.prototype.getElement_ = function(coords) {
  return coords.auxiliary ?
      webdriver.firefox.utils.unwrap(coords.auxiliary) : this.lastElement;
};

// wdIMouse

SyntheticMouse.prototype.move = function(target, xOffset, yOffset) {
  // TODO(simon): find the current "body" element iff element == null
  var element = target ? 
      webdriver.firefox.utils.unwrap(target) : this.lastElement;

   if (goog.isFunction(element.scrollIntoView)) {
    element.scrollIntoView();
  }

  if (this.lastElement && element && this.lastElement != element) {
    var currLoc = Utils.getElementLocation(this.lastElement);
    var targetLoc = Utils.getElementLocation(element);
    xOffset += targetLoc['x'] - currLoc['x'];
    yOffset += targetLoc['y'] - currLoc['y'];
  }

  this.lastElement = element;
  this.lastElement = element;
  var pos = Utils.getElementLocation(element);
  var owner = goog.dom.getOwnerDocument(element);
  bot.setWindow(goog.dom.getWindow(owner));

  // Which element shall we pretend to be leaving?
  var parent = bot.dom.getParentElement(element);

  // TODO(simon): if no offset is specified, use the centre of the element    
  var fireAndCheck = function(e, eventName, opt_coordinates) {
    if (!e) {
      return false;
    }
    bot.events.fire(e, eventName, opt_coordinates);
    return true;
  };

  var button = this.buttonDown;
  var botCoords = {
    'clientX': pos.x,
    'clientY': pos.y,
    'button': button,
    'related': parent
  };

  var intermediateSteps = 3;
  var xInc = Math.floor(xOffset / intermediateSteps);
  var yInc = Math.floor(yOffset / intermediateSteps);
  var currX = pos.x;
  var currY = pos.y;

  var proceed = fireAndCheck(parent, goog.events.EventType.MOUSEOUT, {'related': element}) &&
      fireAndCheck(element, goog.events.EventType.MOUSEOVER, botCoords);
    for (var i = 0; i < intermediateSteps && proceed; i++) {
      botCoords['clientX'] = xInc + currX;  currX += xInc;
      botCoords['clientY'] = yInc + currY;  currY += yInc;
      proceed = fireAndCheck(element, goog.events.EventType.MOUSEMOVE, botCoords);
  }


  botCoords['clientX'] = (pos.x + xOffset);
  botCoords['clientY'] = (pos.y + yOffset);

  proceed = fireAndCheck(element, goog.events.EventType.MOUSEMOVE, botCoords);

  if (!proceed || !bot.dom.isShown(element, /*ignoreOpacity=*/true)) {
    return this.newResponse(ErrorCode.SUCCESS, "ok");
  }

  bot.events.fire(element, goog.events.EventType.MOUSEOVER, botCoords);

  return this.newResponse(ErrorCode.SUCCESS, "ok");
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

  Logger.dumpn("About to do a bot.action.click on " + element);
  bot.action.click(element);

  return this.newResponse(ErrorCode.SUCCESS, "ok");
};


SyntheticMouse.prototype.doubleClick = function(target) {
  var element = target ? webdriver.firefox.utils.unwrap(target) : this.lastElement;
  
  var error = this.isElementShown(element);
  if (error) {
    return error;
  }

  if (goog.isFunction(element.scrollIntoView)) {
    element.scrollIntoView();
  }

  // TODO(simon): This implementation isn't good enough.
  var size = goog.style.getSize(element);
  var botCoords = {
    clientX: Math.floor(size.width / 2),
    clientY: Math.floor(size.height / 2),
    button: bot.Mouse.Button.LEFT
  };
  bot.events.fire(element, goog.events.EventType.DBLCLICK, botCoords);

  return this.newResponse(ErrorCode.SUCCESS, "ok");
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
  }
  bot.events.fire(element, goog.events.EventType.MOUSEDOWN, botCoords);

  return this.newResponse(ErrorCode.SUCCESS, "ok");
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
  
  this.buttonDown = bot.Mouse.Button.NONE;

  return this.newResponse(ErrorCode.SUCCESS, "ok");
};


// And finally, registering
SyntheticMouse.prototype.classDescription = "Pure JS implementation of a mouse";
SyntheticMouse.prototype.contractID = '@googlecode.com/webdriver/syntheticmouse;1';
SyntheticMouse.prototype.classID = Components.ID('{E8F9FEFE-C513-4097-98BE-BE00A41D3645}');

const components = [SyntheticMouse];
var NSGetFactory, NSGetModule;
if (XPCOMUtils.generateNSGetFactory) {
  NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
} else {
  NSGetModule = XPCOMUtils.generateNSGetModule(components);
}

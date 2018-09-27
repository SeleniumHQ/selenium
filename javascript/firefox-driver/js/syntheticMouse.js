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

goog.provide('SyntheticMouse');

goog.require('Utils');
goog.require('bot.ErrorCode');
goog.require('bot.Mouse');
goog.require('bot.Device.EventEmitter');
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
goog.require('goog.log');
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


/**
 * @private {goog.log.Logger}
 * @const
 */
SyntheticMouse.LOG_ = fxdriver.logging.getLogger('fxdriver.SyntheticMouse');


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


SyntheticMouse.prototype.isElementShownAndClickable = function(element) {
  var error = this.isElementShown(element);
  if (error) {
    return error;
  }

  var checkOverlapping = true;
  try {
    var prefStore = fxdriver.moz.getService('@mozilla.org/preferences-service;1',
                                            'nsIPrefBranch');
    if (prefStore.getBoolPref('webdriver.overlappingCheckDisabled', false)) {
      checkOverlapping = false;
    }
  } catch (ignored) {}

  if (checkOverlapping) {
    error = this.isElementClickable(element);
    if (error) {
      return error;
    }
  }
}


SyntheticMouse.prototype.isElementShown = function(element) {
  if (!bot.dom.isShown(element, /*ignoreOpacity=*/true)) {
    return SyntheticMouse.newResponse(bot.ErrorCode.ELEMENT_NOT_VISIBLE,
        'Element is not currently visible and so may not be interacted with');
  }
};


SyntheticMouse.prototype.isElementClickable = function(element) {
  // get the outermost ancestor of the element. This will be either the document
  // or a shadow root.
  var owner = element;
  while (owner.parentNode) {
    owner = owner.parentNode;
  }

  var tagName = element.tagName.toLowerCase();

  // TODO: https://gist.github.com/p0deje/c549e93fa19bf7aaee49
  if ('select' == tagName) {
    return;
  }

  // Check to see if this is an option element. If it is, and the parent isn't a multiple
  // select, then check that select is clickable.
  if ('option' == tagName) {
    var parent = element;
    while (parent.parentNode != null && parent.tagName.toLowerCase() != 'select') {
      parent = parent.parentNode;
    }

    if (parent && parent.tagName.toLowerCase() == 'select') {
      return this.isElementClickable(parent);
    }
  }

  // Check to see if this is an area element. If it is, find the image element that
  // uses area's map, then check that image is clickable.
  if ('area' == tagName) {
    var map = element.parentElement;
    if (map.tagName.toLowerCase() != 'map') {
      throw new Error('the area is not within a map');
    }
    var mapName = map.getAttribute('name');
    if (mapName == null) {
      throw new Error ("area's parent map must have a name");
    }
    mapName = '#' + mapName.toLowerCase();
    var images = owner.getElementsByTagName('img');
    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      if (image.useMap.toLowerCase() == mapName) {
        return this.isElementClickable(image);
      }
    }
  }

  var rect = bot.dom.getClientRect(element);
  var coords = {
    x: this.lastMousePosition.x + rect.left,
    y: this.lastMousePosition.y + rect.top
  }

  var elementAtPoint = owner.elementFromPoint(coords.x, coords.y);

  // element may be huge, so coordinates are outside the viewport
  if (elementAtPoint === null) {
    return;
  }

  if (element == elementAtPoint) {
    return;
  }

  // allow clicks to element descendants
  var parentElemIter = elementAtPoint.parentNode;
  while (parentElemIter) {
    if (parentElemIter == element) {
      return;
    }
    parentElemIter = parentElemIter.parentNode;
  }

  // elementFromPoint is not without fault, for example:
  // <button><span></button> and span.click() results in
  // elementAtPoint being the button rather than the span.
  // catch these potential edge cases by checking if the
  // target element is a direct descendent of the elementAtPoint
  parentElemIter = element.parentNode;
  while (parentElemIter) {
    if (parentElemIter == elementAtPoint) {
      return;
    }
    parentElemIter = parentElemIter.parentNode;
  }

  var elementAtPointHTML =
    elementAtPoint.outerHTML.replace(elementAtPoint.innerHTML, '');
  
  var elementHTML =
    element.outerHTML.replace(element.innerHTML, '');

  return SyntheticMouse.newResponse(bot.ErrorCode.UNKNOWN_ERROR,
      'Element ' + elementHTML + ' is not clickable at point (' 
       + coords.x + ', ' + coords.y + '). ' +
      'Other element would receive the click: ' + elementAtPointHTML);
};


SyntheticMouse.prototype.getElement_ = function(coords) {
  return coords.auxiliary || this.lastElement;
};


SyntheticMouse.prototype.getMouse_ = function(opt_modifierKeys) {
  if (!this.mouse) {
    this.mouse = new bot.Mouse(null, opt_modifierKeys || this.modifierKeys, new SyntheticMouse.EventEmitter());
  }
  return this.mouse;
};


// wdIMouse

SyntheticMouse.prototype.initialize = function(modifierKeys) {
  this.modifierKeys = modifierKeys;
};


SyntheticMouse.prototype.move = function(target, xOffset, yOffset) {
  goog.log.info(SyntheticMouse.LOG_,
      'SyntheticMouse.move ' + target + ' ' + xOffset + ' ' + yOffset);
  xOffset = xOffset || 0;
  yOffset = yOffset || 0;

  var element;
  if (target) {
    if (target.nodeType == goog.dom.NodeType.ELEMENT) {
      element = target;
    } else {
      if (this.lastElement) {
        var sameDoc;
        try {
          goog.dom.getOwnerDocument(this.lastElement);
          sameDoc = true;
        } catch (ex) {
          sameDoc = false;
        }
        if (sameDoc) {
          // move to relative offset
          element = this.lastElement;
          xOffset = this.lastMousePosition.x + xOffset;
          yOffset = this.lastMousePosition.y + yOffset;
        }
      }

      if (!element) {
        // no previous element, move relative to viewport
        element = Utils.getMainDocumentElement(target);
        var bodyPos = goog.style.getClientPosition(element);
        xOffset = xOffset - bodyPos.x;
        yOffset = yOffset - bodyPos.y;
      }
    }
  }

  var doc = goog.dom.getOwnerDocument(element);
  bot.setWindow(goog.dom.getWindow(doc));

  var xCompensate = 0;
  var yCompensate = 0;
  if (this.isButtonPressed) {
    // See the comment on the viewPortOffset field for why this is necessary.
    var scrollOffset = goog.dom.getDomHelper(doc).getDocumentScroll();
    xCompensate = (scrollOffset.x - this.viewPortOffset.x) * 2;
    yCompensate = (scrollOffset.y - this.viewPortOffset.y) * 2;
    goog.log.info(SyntheticMouse.LOG_,
        'xCompensate = ' + xCompensate + ' yCompensate = ' + yCompensate);
  }

  var coords =
      new goog.math.Coordinate(xOffset + xCompensate, yOffset + yCompensate);

  goog.log.info(SyntheticMouse.LOG_,
      'Calling mouse.move with: ' + coords.x + ', ' + coords.y + ', ' + element);
  this.getMouse_().move(element, coords);

  this.lastElement = element;
  this.lastMousePosition = coords;

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, 'ok');
};


SyntheticMouse.prototype.click = function(target) {
  goog.log.info(SyntheticMouse.LOG_, 'SyntheticMouse.click ' + target);

  // No need to unwrap the target. All information is provided by the wrapped
  // version, and unwrapping does not work for all firefox versions.
  var element = target ? target : this.lastElement;
  var error = this.isElementShownAndClickable(element);
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
      goog.log.info(SyntheticMouse.LOG_, 'About to do a bot.action.click on ' + parent);
      bot.action.click(parent, undefined /* coords */);
    }

    goog.log.info(SyntheticMouse.LOG_, 'About to do a bot.action.click on ' + element);
    bot.action.click(element, undefined, new bot.Mouse(null, this.modifierKeys));

  } else {
    goog.log.info(SyntheticMouse.LOG_, 'About to do a bot.action.click on ' + element);
    bot.action.click(element, this.lastMousePosition, this.getMouse_(), true);
  }

  try { // https://github.com/SeleniumHQ/selenium/issues/1509
    if (bot.dom.isEditable(element) && element.value !== undefined) {
      goog.dom.selection.setCursorPosition(
        element, element.value.length);
    }
  } catch (ignored) {
  }

  this.lastElement = element;

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, 'ok');
};

SyntheticMouse.prototype.contextClick = function(target) {
  goog.log.info(SyntheticMouse.LOG_, 'SyntheticMouse.contextClick ' + target);

  // No need to unwrap the target. All information is provided by the wrapped
  // version, and unwrapping does not work for all firefox versions.
  var element = target ? target : this.lastElement;
  var error = this.isElementShownAndClickable(element);
  if (error) {
    return error;
  }

  goog.log.info(SyntheticMouse.LOG_,
      'About to do a bot.action.rightClick on ' + element);
  bot.action.rightClick(element, this.lastMousePosition);

  this.lastElement = element;

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, 'ok');
};

SyntheticMouse.prototype.doubleClick = function(target) {
  goog.log.info(SyntheticMouse.LOG_,
      'SyntheticMouse.doubleClick ' + target);

  var element = target ? target : this.lastElement;
  var error = this.isElementShownAndClickable(element);
  if (error) {
    return error;
  }

  goog.log.info(SyntheticMouse.LOG_,
      'About to do a bot.action.doubleClick2 on ' + element);
  bot.action.doubleClick2(element, this.lastMousePosition, this.getMouse_());

  this.lastElement = element;

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, 'ok');
};


SyntheticMouse.prototype.down = function(coordinates) {
  goog.log.info(SyntheticMouse.LOG_, 'SyntheticMouse.down ' + coordinates);

  var element = this.getElement_(coordinates);

  this.getMouse_().pressButton(bot.Mouse.Button.LEFT);

  this.isButtonPressed = true;
  var doc = goog.dom.getOwnerDocument(element);
  this.viewPortOffset = goog.dom.getDomHelper(doc).getDocumentScroll();

  this.lastElement = element;

  return SyntheticMouse.newResponse(bot.ErrorCode.SUCCESS, 'ok');
};


SyntheticMouse.prototype.up = function(coordinates) {
  goog.log.info(SyntheticMouse.LOG_, 'SyntheticMouse.up ' + coordinates);

  var element = this.getElement_(coordinates);

  this.getMouse_().releaseButton();

  this.buttonDown = null;
  this.isButtonPressed = false;
  this.viewPortOffset.x = 0;
  this.viewPortOffset.y = 0;

  this.lastElement = element;

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


/**
 * Fires events using nsIDOMWindowUtils
 *
 * @constructor
 * @extends {bot.Device.EventEmitter}
 */
SyntheticMouse.EventEmitter = function() {
  goog.base(this);
};
goog.inherits(SyntheticMouse.EventEmitter, bot.Device.EventEmitter);


/**
 * Parse the key modifier flags from aEvent. Used to share code between
 * synthesizeMouse and synthesizeKey.
 */
SyntheticMouse.EventEmitter.prototype._parseModifiers = function(event) {
  var masks = Components.interfaces.nsIDOMNSEvent;
  var mval = 0;
  if (event.shiftKey)
    mval |= masks.SHIFT_MASK;
  if (event.ctrlKey)
    mval |= masks.CONTROL_MASK;
  if (event.altKey)
    mval |= masks.ALT_MASK;
  if (event.metaKey)
    mval |= masks.META_MASK;
  if (event.accelKey)
    mval |= (navigator.platform.indexOf("Mac") >= 0) ? masks.META_MASK :
            masks.CONTROL_MASK;

  return mval;
};


SyntheticMouse.EventEmitter.prototype._getDOMWindowUtils = function(aWindow) {
  if (!aWindow) {
    aWindow = window;
  }

  //TODO: this is assuming we are in chrome space
  return aWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor).
      getInterface(Components.interfaces.nsIDOMWindowUtils);
};


/**
 * Fires an HTML event given the state of the device.
 *
 * @param {!Element} target The element on which to fire the event.
 * @param {bot.events.EventType} type HTML Event type.
 * @return {boolean} Whether the event fired successfully; false if cancelled.
 * @protected
 */
SyntheticMouse.EventEmitter.prototype.fireHtmlEvent = function(target, type) {
  return bot.events.fire(target, type);
};


/**
 * Fires a keyboard event given the state of the device and the given arguments.
 *
 * @param {!Element} target The element on which to fire the event.
 * @param {bot.events.EventType} type Keyboard event type.
 * @param {bot.events.KeyboardArgs} args Keyboard event arguments.
 * @return {boolean} Whether the event fired successfully; false if cancelled.
 * @protected
 */
SyntheticMouse.EventEmitter.prototype.fireKeyboardEvent = function(target, type, args) {
  var doc = goog.dom.getOwnerDocument(target);
  var wind = goog.dom.getWindow(doc);
  var utils = this._getDOMWindowUtils(wind);
  var modifiers = this._parseModifiers(args);
  utils.sendKeyEvent(type, args.keyCode, args.charCode, modifiers);
  return true;
};


/**
 * Fires a mouse event given the state of the device and the given arguments.
 *
 * @param {!Element} target The element on which to fire the event.
 * @param {bot.events.EventType} type Mouse event type.
 * @param {bot.events.MouseArgs} args Mouse event arguments.
 * @return {boolean} Whether the event fired successfully; false if cancelled.
 * @protected
 */
SyntheticMouse.EventEmitter.prototype.fireMouseEvent = function(target, type, args) {
  goog.log.info(SyntheticMouse.LOG_,
      'Calling fireMouseEvent ' + type + ' ' + args.clientX +
      ', ' + args.clientY + ', ' + target);
  if (type == 'click' || type == 'dblclick') {
    // A click event will be automatically fired as a result of a mousedown and mouseup in sequence
    return true;
  }
  var doc = goog.dom.getOwnerDocument(target);
  var wind = goog.dom.getWindow(doc);
  var utils = this._getDOMWindowUtils(wind);
  var modifiers = this._parseModifiers(args);
  if (utils.sendMouseEventToWindow) {
    // Firefox 4+
    utils.sendMouseEventToWindow(type.type_, Math.round(args.clientX), Math.round(args.clientY),
                                 args.button, args.count, modifiers);
  } else {
    // Firefox 3
    utils.sendMouseEvent(type.type_, Math.round(args.clientX), Math.round(args.clientY),
                         args.button, args.count, modifiers);
  }
  return true;
};


/**
 * Fires a mouse event given the state of the device and the given arguments.
 *
 * @param {!Element} target The element on which to fire the event.
 * @param {bot.events.EventType} type Touch event type.
 * @param {bot.events.TouchArgs} args Touch event arguments.
 * @return {boolean} Whether the event fired successfully; false if cancelled.
 * @protected
 */
SyntheticMouse.EventEmitter.prototype.fireTouchEvent = function(target, type, args) {
  return bot.events.fire(target, type, args);
};


/**
 * Fires an MSPointer event given the state of the device and the given arguments.
 *
 * @param {!Element} target The element on which to fire the event.
 * @param {bot.events.EventType} type MSPointer event type.
 * @param {bot.events.MSPointerArgs} args MSPointer event arguments.
 * @return {boolean} Whether the event fired successfully; false if cancelled.
 * @protected
 */
SyntheticMouse.EventEmitter.prototype.fireMSPointerEvent = function(target, type, args) {
  return bot.events.fire(target, type, args);
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

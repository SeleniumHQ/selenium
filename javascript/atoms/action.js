// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
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

/**
 * @fileoverview Atoms for simulating user actions against the DOM.
 * The bot.action namespace is required since these atoms would otherwise form a
 * circular dependency between bot.dom and bot.events.
 *
 */

goog.provide('bot.action');

goog.require('bot');
goog.require('bot.Device');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.Keyboard');
goog.require('bot.Mouse');
goog.require('bot.Touchscreen');
goog.require('bot.dom');
goog.require('bot.events');
goog.require('bot.events.EventType');
goog.require('bot.userAgent');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.math.Vec2');
goog.require('goog.style');
goog.require('goog.userAgent');


/**
 * Throws an exception if an element is not shown to the user, ignoring its
 * opacity.

 *
 * @param {!Element} element The element to check.
 * @see bot.dom.isShown.
 * @private
 */
bot.action.checkShown_ = function(element) {
  if (!bot.dom.isShown(element, /*ignoreOpacity=*/true)) {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_VISIBLE,
        'Element is not currently visible and may not be manipulated');
  }
};


/**
 * Throws an exception if the given element cannot be interacted with.
 *
 * @param {!Element} element The element to check.
 * @throws {bot.Error} If the element cannot be interacted with.
 * @see bot.dom.isInteractable.
 * @private
 */
bot.action.checkInteractable_ = function(element) {
  if (!bot.dom.isInteractable(element)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'Element is not currently interactable and may not be manipulated');

  }
};


/**
 * Clears the given {@code element} if it is a editable text field.
 *
 * @param {!Element} element The element to clear.
 * @throws {bot.Error} If the element is not an editable text field.
 */
bot.action.clear = function(element) {
  bot.action.checkInteractable_(element);
  if (!bot.dom.isEditable(element)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'Element must be user-editable in order to clear it.');
  }

  bot.action.LegacyDevice_.focusOnElement(element);
  if (element.value) {
    element.value = '';
    bot.events.fire(element, bot.events.EventType.CHANGE);
  }

  if (bot.dom.isContentEditable(element)) {
    // A single space is required, if you put empty string here you'll not be
    // able to interact with this element anymore in Firefox.
    element.innerHTML = ' ';
    // contentEditable does not generate onchange event.
  }
};


/**
 * Focuses on the given element if it is not already the active element.
 *
 * @param {!Element} element The element to focus on.
 */
bot.action.focusOnElement = function(element) {
  bot.action.checkInteractable_(element);
  bot.action.LegacyDevice_.focusOnElement(element);
};


/**
 * Types keys on the given {@code element} with a virtual keyboard.
 *
 * <p>Callers can pass in a string, a key in bot.Keyboard.Key, or an array
 * of strings or keys. If a modifier key is provided, it is pressed but not
 * released, until it is either is listed again or the function ends.
 *
 * <p>Example:
 *   bot.keys.type(element, ['ab', bot.Keyboard.Key.LEFT,
 *                           bot.Keyboard.Key.SHIFT, 'cd']);
 *
 * @param {!Element} element The element receiving the event.
 * @param {(string|!bot.Keyboard.Key|!Array.<(string|!bot.Keyboard.Key)>)}
 *    values Value or values to type on the element.
 * @param {bot.Keyboard=} opt_keyboard Keyboard to use; if not provided,
 *    constructs one.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.type = function(element, values, opt_keyboard) {
  bot.action.checkShown_(element);
  bot.action.checkInteractable_(element);
  var keyboard = opt_keyboard || new bot.Keyboard();
  keyboard.moveCursor(element);

  function typeValue(value) {
    if (goog.isString(value)) {
      goog.array.forEach(value.split(''), function(ch) {
        var keyShiftPair = bot.Keyboard.Key.fromChar(ch);
        var shiftIsPressed = keyboard.isPressed(bot.Keyboard.Keys.SHIFT);
        if (keyShiftPair.shift && !shiftIsPressed) {
          keyboard.pressKey(bot.Keyboard.Keys.SHIFT);
        }
        keyboard.pressKey(keyShiftPair.key);
        keyboard.releaseKey(keyShiftPair.key);
        if (keyShiftPair.shift && !shiftIsPressed) {
          keyboard.releaseKey(bot.Keyboard.Keys.SHIFT);
        }
      });
    } else if (goog.array.contains(bot.Keyboard.MODIFIERS, value)) {
      if (keyboard.isPressed(value)) {
        keyboard.releaseKey(value);
      } else {
        keyboard.pressKey(value);
      }
    } else {
      keyboard.pressKey(value);
      keyboard.releaseKey(value);
    }
  }

  if (goog.isArray(values)) {
    goog.array.forEach(values, typeValue);
  } else {
    typeValue(values);
  }

  // Release all the modifier keys.
  goog.array.forEach(bot.Keyboard.MODIFIERS, function(key) {
    if (keyboard.isPressed(key)) {
      keyboard.releaseKey(key);
    }
  });
};


/**
 * Submits the form containing the given {@code element}.
 *
 * <p>Note this function submits the form, but does not simulate user input
 * (a click or key press).
 *
 * @param {!Element} element The element to submit.
 * @deprecated Click on a submit button or type ENTER in a text box instead.
 */
bot.action.submit = function(element) {
  var form = bot.action.LegacyDevice_.findAncestorForm(element);
  if (!form) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
                        'Element was not in a form, so could not submit.');
  }
  bot.action.LegacyDevice_.submitForm(element, form);
};


/**
 * Moves the mouse over the given {@code element} with a virtual mouse.
 *
 * @param {!Element} element The element to click.
 * @param {goog.math.Coordinate=} opt_coords Mouse position relative to the
 *   element.
 * @param {bot.Mouse=} opt_mouse Mouse to use; if not provided, constructs one.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.moveMouse = function(element, opt_coords, opt_mouse) {
  var coords = bot.action.prepareToInteractWith_(element, opt_coords);
  var mouse = opt_mouse || new bot.Mouse();
  mouse.move(element, coords);
};


/**
 * Clicks on the given {@code element} with a virtual mouse.
 *
 * @param {!Element} element The element to click.
 * @param {goog.math.Coordinate=} opt_coords Mouse position relative to the
 *   element.
 * @param {bot.Mouse=} opt_mouse Mouse to use; if not provided, constructs one.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.click = function(element, opt_coords, opt_mouse) {
  var coords = bot.action.prepareToInteractWith_(element, opt_coords);
  var mouse = opt_mouse || new bot.Mouse();
  mouse.move(element, coords);
  mouse.pressButton(bot.Mouse.Button.LEFT);
  mouse.releaseButton();
};


/**
 * Right-clicks on the given {@code element} with a virtual mouse.
 *
 * @param {!Element} element The element to click.
 * @param {goog.math.Coordinate=} opt_coords Mouse position relative to the
 *   element.
 * @param {bot.Mouse=} opt_mouse Mouse to use; if not provided, constructs one.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.rightClick = function(element, opt_coords, opt_mouse) {
  var coords = bot.action.prepareToInteractWith_(element, opt_coords);
  var mouse = opt_mouse || new bot.Mouse();
  mouse.move(element, coords);
  mouse.pressButton(bot.Mouse.Button.RIGHT);
  mouse.releaseButton();
};


/**
 * Double-clicks on the given {@code element} with a virtual mouse.
 *
 * @param {!Element} element The element to click.
 * @param {goog.math.Coordinate=} opt_coords Mouse position relative to the
 *   element.
 * @param {bot.Mouse=} opt_mouse Mouse to use; if not provided, constructs one.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.doubleClick = function(element, opt_coords, opt_mouse) {
  var coords = bot.action.prepareToInteractWith_(element, opt_coords);
  var mouse = opt_mouse || new bot.Mouse();
  mouse.move(element, coords);
  mouse.pressButton(bot.Mouse.Button.LEFT);
  mouse.releaseButton();
  mouse.pressButton(bot.Mouse.Button.LEFT);
  mouse.releaseButton();
};


/**
 * Scrolls the mouse wheel on the given {@code element} with a virtual mouse.
 *
 * @param {!Element} element The element to scroll the mouse wheel on.
 * @param {number} ticks Number of ticks to scroll the mouse wheel; a positive
 *   number scrolls down and a negative scrolls up.
 * @param {goog.math.Coordinate=} opt_coords Mouse position relative to the
 *   element.
 * @param {bot.Mouse=} opt_mouse Mouse to use; if not provided, constructs one.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.scrollMouse = function(element, ticks, opt_coords, opt_mouse) {
  var coords = bot.action.prepareToInteractWith_(element, opt_coords);
  var mouse = opt_mouse || new bot.Mouse();
  mouse.move(element, coords);
  mouse.scroll(ticks);
};


/**
 * Drags the given {@code element} by (dx, dy) with a virtual mouse.
 *
 * @param {!Element} element The element to drag.
 * @param {number} dx Increment in x coordinate.
 * @param {number} dy Increment in y coordinate.
 * @param {goog.math.Coordinate=} opt_coords Drag start position relative to the
 *   element.
 * @param {bot.Mouse=} opt_mouse Mouse to use; if not provided, constructs one.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.drag = function(element, dx, dy, opt_coords, opt_mouse) {
  var coords = bot.action.prepareToInteractWith_(element, opt_coords);
  var mouse = opt_mouse || new bot.Mouse();
  mouse.move(element, coords);
  mouse.pressButton(bot.Mouse.Button.LEFT);

  // Fire two mousemoves (middle and destination) to trigger a drag action.
  var initPos = goog.style.getClientPosition(element);
  var midXY = new goog.math.Coordinate(coords.x + Math.floor(dx / 2),
                                       coords.y + Math.floor(dy / 2));
  mouse.move(element, midXY);

  var midPos = goog.style.getClientPosition(element);
  var finalXY = new goog.math.Coordinate(initPos.x + coords.x + dx - midPos.x,
                                         initPos.y + coords.y + dy - midPos.y);
  mouse.move(element, finalXY);

  mouse.releaseButton();
};


/**
 * Taps on the given {@code element} with a virtual touch screen.
 *
 * @param {!Element} element The element to tap.
 * @param {goog.math.Coordinate=} opt_coords Finger position relative to the
 *   target.
 * @param {bot.Touchscreen=} opt_touchscreen Touchscreen to use; if not
 *    provided, constructs one.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.tap = function(element, opt_coords, opt_touchscreen) {
  var coords = bot.action.prepareToInteractWith_(element, opt_coords);
  var touchscreen = opt_touchscreen || new bot.Touchscreen();
  touchscreen.move(element, coords);
  touchscreen.press();
  touchscreen.release();
};


/**
 * Swipes the given {@code element} by (dx, dy) with a virtual touch screen.
 *
 * @param {!Element} element The element to swipe.
 * @param {number} dx Increment in x coordinate.
 * @param {number} dy Increment in y coordinate.
 * @param {goog.math.Coordinate=} opt_coords Swipe start position relative to
 *   the element.
 * @param {bot.Touchscreen=} opt_touchscreen Touchscreen to use; if not
 *    provided, constructs one.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.swipe = function(element, dx, dy, opt_coords, opt_touchscreen) {
  var coords = bot.action.prepareToInteractWith_(element, opt_coords);
  var touchscreen = opt_touchscreen || new bot.Touchscreen();
  touchscreen.move(element, coords);
  touchscreen.press();

  // Fire two touchmoves (middle and destination) to trigger a drag action.
  var initPos = goog.style.getClientPosition(element);
  var midXY = new goog.math.Coordinate(coords.x + Math.floor(dx / 2),
                                       coords.y + Math.floor(dy / 2));
  touchscreen.move(element, midXY);

  var midPos = goog.style.getClientPosition(element);
  var finalXY = new goog.math.Coordinate(initPos.x + coords.x + dx - midPos.x,
                                         initPos.y + coords.y + dy - midPos.y);
  touchscreen.move(element, finalXY);

  touchscreen.release();
};


/**
 * Pinches the given {@code element} by the given distance with a virtual touch
 * screen. A positive distance moves two fingers inward toward each and a
 * negative distances spreds them outward. The optional coordinate is the point
 * the fingers move towards (for positive distances) or away from (for negative
 * distances); and if not provided, defaults to the center of the element.
 *
 * @param {!Element} element The element to pinch.
 * @param {number} distance The distance by which to pinch the element.
 * @param {goog.math.Coordinate=} opt_coords Position relative to the element
 *   at the center of the pinch.
 * @param {bot.Touchscreen=} opt_touchscreen Touchscreen to use; if not
 *    provided, constructs one.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.pinch = function(element, distance, opt_coords, opt_touchscreen) {
  if (distance == 0) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
                        'Cannot pinch by a distance of zero.');
  }
  function startSoThatEndsAtMax(offsetVec) {
    if (distance < 0) {
      var magnitude = offsetVec.magnitude();
      offsetVec.scale(magnitude ? (magnitude + distance) / magnitude : 0);
    }
  }
  var halfDistance = distance / 2;
  function scaleByHalfDistance(offsetVec) {
    var magnitude = offsetVec.magnitude();
    offsetVec.scale(magnitude ? (magnitude - halfDistance) / magnitude : 0);
  }
  bot.action.multiTouchAction_(element,
                               startSoThatEndsAtMax,
                               scaleByHalfDistance,
                               opt_coords,
                               opt_touchscreen);
};


/**
 * Rotates the given {@code element} by the given angle with a virtual touch
 * screen. A positive angle moves two fingers clockwise and a negative angle
 * moves them counter-clockwise. The optional coordinate is the point to
 * rotate around; and if not provided, defaults to the center of the element.
 *
 * @param {!Element} element The element to rotate.
 * @param {number} angle The angle by which to rotate the element.
 * @param {goog.math.Coordinate=} opt_coords Position relative to the element
 *   at the center of the rotation.
 * @param {bot.Touchscreen=} opt_touchscreen Touchscreen to use; if not
 *    provided, constructs one.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.rotate = function(element, angle, opt_coords, opt_touchscreen) {
  if (angle == 0) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
                        'Cannot rotate by an angle of zero.');
  }
  function startHalfwayToMax(offsetVec) {
    offsetVec.scale(0.5);
  }
  var halfRadians = Math.PI * (angle / 180) / 2;
  function rotateByHalfAngle(offsetVec) {
    offsetVec.rotate(halfRadians);
  }
  bot.action.multiTouchAction_(element,
                               startHalfwayToMax,
                               rotateByHalfAngle,
                               opt_coords,
                               opt_touchscreen);
};


/**
 * Performs a multi-touch action with two fingers on the given element. This
 * helper function works by manipulating an "offsetVector", which is the vector
 * away from the center of the interaction at which the fingers are positioned.
 * It computes the maximum offset vector and passes it to transformStart to
 * find the starting position of the fingers; it then passes it to transformHalf
 * twice to find the midpoint and final position of the fingers.
 *
 * @param {!Element} element Element to interact with.
 * @param {function(goog.math.Vec2)} transformStart Function to transform the
 *   maximum offset vector to the starting offset vector.
 * @param {function(goog.math.Vec2)} transformHalf Function to transform the
 *   offset vector halfway to its destination.
 * @param {goog.math.Coordinate=} opt_coords Position relative to the element
 *   at the center of the pinch.
 * @param {bot.Touchscreen=} opt_touchscreen Touchscreen to use; if not
 *    provided, constructs one.
 * @private
 */
bot.action.multiTouchAction_ = function(element, transformStart, transformHalf,
                                        opt_coords, opt_touchscreen) {
  var center = bot.action.prepareToInteractWith_(element, opt_coords);
  var size = bot.action.getInteractableSize(element);
  var offsetVec = new goog.math.Vec2(
      Math.min(center.x, size.width - center.x),
      Math.min(center.y, size.height - center.y));

  var touchScreen = opt_touchscreen || new bot.Touchscreen();
  transformStart(offsetVec);
  var start1 = goog.math.Vec2.sum(center, offsetVec);
  var start2 = goog.math.Vec2.difference(center, offsetVec);
  touchScreen.move(element, start1, start2);
  touchScreen.press(/*Two Finger Press*/ true);

  var initPos = goog.style.getClientPosition(element);
  transformHalf(offsetVec);
  var mid1 = goog.math.Vec2.sum(center, offsetVec);
  var mid2 = goog.math.Vec2.difference(center, offsetVec);
  touchScreen.move(element, mid1, mid2);

  var movedVec = goog.math.Vec2.difference(
      goog.style.getClientPosition(element), initPos);
  transformHalf(offsetVec);
  var end1 = goog.math.Vec2.sum(center, offsetVec).subtract(movedVec);
  var end2 = goog.math.Vec2.difference(center, offsetVec).subtract(movedVec);
  touchScreen.move(element, end1, end2);
  touchScreen.release();
};


/**
 * Prepares to interact with the given {@code element}. It checks if the the
 * element is shown, scrolls the element into view, and returns the coordinates
 * of the interaction, which if not provided, is the center of the element.
 *
 * @param {!Element} element The element to be interacted with.
 * @param {goog.math.Coordinate=} opt_coords Position relative to the target.
 * @return {!goog.math.Vec2} Coordinates at the center of the interaction.
 * @throws {bot.Error} If the element cannot be interacted with.
 * @private
 */
bot.action.prepareToInteractWith_ = function(element, opt_coords) {
  bot.action.checkShown_(element);

  // Unlike element.scrollIntoView(), this scrolls the minimal amount
  // necessary, not scrolling at all if the element is already in view.
  var doc = goog.dom.getOwnerDocument(element);
  goog.style.scrollIntoContainerView(element,
      goog.userAgent.WEBKIT ? doc.body : doc.documentElement);

  // NOTE(user): Ideally, we would check that any provided coordinates fall
  // within the bounds of the element, but this has proven difficult, because:
  // (1) Browsers sometimes lie about the true size of elements, e.g. when text
  // overflows the bounding box of an element, browsers report the size of the
  // box even though the true area that can be interacted with is larger; and
  // (2) Elements with children styled as position:absolute will often not have
  // a bounding box that surrounds all of their children, but it is useful for
  // the user to be able to interact with this parent element as if it does.
  if (opt_coords) {
    return goog.math.Vec2.fromCoordinate(opt_coords);
  } else {
    var size = bot.action.getInteractableSize(element);
    return new goog.math.Vec2(size.width / 2, size.height / 2);
  }
};


/**
 * Returns the interactable size of an element.
 *
 * @param {!Element} elem Element.
 * @return {!goog.math.Size} size Size of the element.
 */
bot.action.getInteractableSize = function(elem) {
  var size = goog.style.getSize(elem);
  return ((size.width > 0 && size.height > 0) || !elem.offsetParent) ? size :
      bot.action.getInteractableSize(elem.offsetParent);
};



/**
 * A Device that is intended to allows access to protected members of the
 * Device superclass. A singleton.
 *
 * @constructor
 * @extends {bot.Device}
 * @private
 */
bot.action.LegacyDevice_ = function() {
  goog.base(this);
};
goog.inherits(bot.action.LegacyDevice_, bot.Device);
goog.addSingletonGetter(bot.action.LegacyDevice_);


/**
 * Focuses on the given element.  See {@link bot.device.focusOnElement}.
 * @param {!Element} element The element to focus on.
 * @return {boolean} True if element.focus() was called on the element.
 */
bot.action.LegacyDevice_.focusOnElement = function(element) {
  var instance = bot.action.LegacyDevice_.getInstance();
  instance.setElement(element);
  return instance.focusOnElement();
};


/**
 * Submit the form for the element.  See {@link bot.device.submit}.
 * @param {!Element} element The element to submit a form on.
 * @param {!Element} form The form to submit.
 */
bot.action.LegacyDevice_.submitForm = function(element, form) {
  var instance = bot.action.LegacyDevice_.getInstance();
  instance.setElement(element);
  instance.submitForm(form);
};


/**
 * Find FORM element that is an ancestor of the passed in element.  See
 * {@link bot.device.findAncestorForm}.
 * @param {!Element} element The element to find an ancestor form.
 * @return {Element} form The ancestor form, or null if none.
 */
bot.action.LegacyDevice_.findAncestorForm = function(element) {
  return bot.Device.findAncestorForm(element);
};


/**
 * Scrolls the given {@code element} in to the current viewport. Aims to do the
 * minimum scrolling necessary, but prefers too much scrolling to too little.
 *
 * @param {!Element} element The element to scroll in to view.
 * @param {!goog.math.Coordinate=} opt_coords Offset relative to the top-left
 *     corner of the element, to ensure is scrolled in to view.
 * @return {boolean} Whether the element is in view after scrolling.
 */
bot.action.scrollIntoView = function(element, opt_coords) {
  if (!bot.dom.isScrolledIntoView(element, opt_coords)) {
    element.scrollIntoView();
    // In Opera 10, scrollIntoView only scrolls the element into the viewport of
    // its immediate parent window, so we explicitly scroll the ancestor frames
    // into view of their respective windows. Note that scrolling the top frame
    // first --- and so on down to the element itself --- does not work, because
    // Opera 10 apparently treats element.scrollIntoView() as a noop when it
    // immediately follows a scrollIntoView() call on its parent frame.
    if (goog.userAgent.OPERA && !bot.userAgent.isEngineVersion(11)) {
      var win = goog.dom.getWindow(goog.dom.getOwnerDocument(element));
      for (var frame = win.frameElement; frame; frame = win.frameElement) {
        frame.scrollIntoView();
        win = goog.dom.getWindow(goog.dom.getOwnerDocument(frame));
      }
    }
  }
  if (opt_coords) {
    var rect = new goog.math.Rect(opt_coords.x, opt_coords.y, 1, 1);
    bot.dom.scrollElementRegionIntoClientView(element, rect);
  }
  var isInView = bot.dom.isScrolledIntoView(element, opt_coords);
  if (!isInView && opt_coords) {
    // It's possible that the element has been scrolled in to view, but the
    // coords passed aren't in view; if this is the case, scroll those
    // coordinates into view.
    var elementCoordsInViewport = goog.style.getClientPosition(element);
    var desiredPointInViewport =
        goog.math.Coordinate.sum(elementCoordsInViewport, opt_coords);
    try {
      bot.dom.getInViewLocation(
          desiredPointInViewport,
          goog.dom.getWindow(goog.dom.getOwnerDocument(element)));
      isInView = true;
    } catch (ex) {
      // Point couldn't be scrolled into view.
      isInView = false;
    }
  }

  return isInView;
};

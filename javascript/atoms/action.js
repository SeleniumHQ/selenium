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
goog.require('bot.locators');
goog.require('bot.userAgent');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.math.Vec2');
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
 * <p>Callers can pass in either strings or members of bot.Keyboard.Key. If a
 * modifier key is provided, it is pressed but not released, until it is either
 * is listed again or the function ends.
 *
 * <p>Example:
 *   bot.keys.type(element, 'ab', bot.Keyboard.Key.LEFT,
 *                 bot.Keyboard.Key.DELETE, bot.Keyboard.Key.SHIFT, 'cd');
 *
 * @param {!Element} element The element receiving the event.
 * @param {...(string|!bot.Keyboard.Key)} var_args Values to type on the
 *    element, either strings or members of bot.Keyboard.Key.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.type = function(element, var_args) {
  bot.action.checkShown_(element);
  bot.action.checkInteractable_(element);
  var keyboard = new bot.Keyboard();
  keyboard.moveCursor(element);

  var values = goog.array.slice(arguments, 1);
  goog.array.forEach(values, function(value) {
    if (goog.isString(value)) {
      goog.array.forEach(value.split(''), function(ch) {
        var keyShiftPair = bot.Keyboard.Key.fromChar(ch);
        if (keyShiftPair.shift) {
          keyboard.pressKey(bot.Keyboard.Keys.SHIFT);
        }
        keyboard.pressKey(keyShiftPair.key);
        keyboard.releaseKey(keyShiftPair.key);
        if (keyShiftPair.shift) {
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
  });

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
  bot.action.moveAndReturnMouse_(element, opt_coords, opt_mouse);
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
  var mouse = bot.action.moveAndReturnMouse_(element, opt_coords, opt_mouse);
  bot.action.pressAndReleaseButton_(mouse, element, bot.Mouse.Button.LEFT);
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
  var mouse = bot.action.moveAndReturnMouse_(element, opt_coords, opt_mouse);
  bot.action.pressAndReleaseButton_(mouse, element, bot.Mouse.Button.RIGHT);
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
  var mouse = bot.action.moveAndReturnMouse_(element, opt_coords, opt_mouse);
  bot.action.pressAndReleaseButton_(mouse, element, bot.Mouse.Button.LEFT);
  bot.action.pressAndReleaseButton_(mouse, element, bot.Mouse.Button.LEFT);
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
  var mouse = bot.action.moveAndReturnMouse_(element, opt_coords);
  mouse.pressButton(bot.Mouse.Button.LEFT);

  // Fire two mousemoves (middle and destination) to trigger a drag action.
  var initPos = goog.style.getClientPosition(element);
  var midXY = new goog.math.Coordinate(opt_coords.x + Math.floor(dx / 2),
                                       opt_coords.y + Math.floor(dy / 2));
  mouse.move(element, midXY);

  var midPos = goog.style.getClientPosition(element);
  var finalXY = new goog.math.Coordinate(
      initPos.x + opt_coords.x + dx - midPos.x,
      initPos.y + opt_coords.y + dy - midPos.y);
  mouse.move(element, finalXY);

  mouse.releaseButton();
};


/**
 * A helper function which prepares a virtual mouse for an action on the given
 * {@code element}. It checks if the the element is shown, scrolls the element
 * into view, and moves the mouse to the given {@code opt_coords} if provided;
 * if not provided, the mouse is moved to the center of the element.
 *
 * @param {!Element} element The element to click.
 * @param {goog.math.Coordinate=} opt_coords Mouse position relative to the
 *   target.
 * @param {bot.Mouse=} opt_mouse Mouse to use; if not provided, constructs one.
 * @return {!bot.Mouse} The mouse object used for the click.
 * @throws {bot.Error} If the element cannot be interacted with.
 * @private
 */
bot.action.moveAndReturnMouse_ = function(element, opt_coords, opt_mouse) {
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
  if (!opt_coords) {
    var size = goog.style.getSize(element);
    opt_coords = new goog.math.Coordinate(size.width / 2, size.height / 2);
  }

  var mouse = opt_mouse || new bot.Mouse();
  mouse.move(element, opt_coords);
  return mouse;
};


/**
 * A helper function which triggers a mouse press and mouse release.
 *
 * @param {!bot.Mouse} mouse The object which is used to trigger the mouse
 * events.
 * @param {!Element} element The element to click.
 * @param {!bot.Mouse.Button} button The mouse button.
 * {@code element}.
 * @private
 */
bot.action.pressAndReleaseButton_ = function(mouse, element, button) {
  mouse.pressButton(button);
  mouse.releaseButton();
};


/**
 * Taps on the given {@code element} with a virtual touch screen.
 *
 * @param {!Element} element The element to tap.
 * @param {goog.math.Coordinate=} opt_coords Finger position relative to the
 *   target.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.tap = function(element, opt_coords) {
  bot.action.checkShown_(element);

  var touchScreen = new bot.Touchscreen();
  if (!opt_coords) {
    var size = goog.style.getSize(element);
    opt_coords = new goog.math.Coordinate(size.width / 2, size.height / 2);
  }
  touchScreen.move(element, opt_coords);
  touchScreen.press();
  touchScreen.release();
};


/**
 * Swipes the given {@code element} by (dx, dy) with a virtual touch screen.
 *
 * @param {!Element} element The element to swipe.
 * @param {number} dx Increment in x coordinate.
 * @param {number} dy Increment in y coordinate.
 * @param {goog.math.Coordinate=} opt_coords swipe start position relative to
 *   the element.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.swipe = function(element, dx, dy, opt_coords) {
  bot.action.checkInteractable_(element);

  var touchScreen = new bot.Touchscreen();
  if (!opt_coords) {
    var size = goog.style.getSize(element);
    opt_coords = new goog.math.Coordinate(size.width / 2, size.height / 2);
  }
  touchScreen.move(element, opt_coords);
  touchScreen.press();

  // Fire two touchmoves (middle and destination) to trigger a drag action.
  var initPos = goog.style.getClientPosition(element);
  var midXY = new goog.math.Coordinate(opt_coords.x + Math.floor(dx / 2),
                                       opt_coords.y + Math.floor(dy / 2));
  touchScreen.move(element, midXY);

  var midPos = goog.style.getClientPosition(element);
  var finalXY = new goog.math.Coordinate(
      initPos.x + opt_coords.x + dx - midPos.x,
      initPos.y + opt_coords.y + dy - midPos.y);
  touchScreen.move(element, finalXY);

  touchScreen.release();
};


/**
 * Helper function that has common logic needing for the pinch and zoom actions.
 *
 * @param {!Element} element The element to scale.
 * @param {boolean} isZoom Whether or not to zoom.
 * @private
 */
bot.action.scale_ = function(element, isZoom) {
  bot.action.checkInteractable_(element);
  var size = goog.style.getSize(element);
  var center = new goog.math.Vec2(size.width / 2, size.height / 2);
  // To choose the default coordinate, we imagine a circle centered on the
  // element's center. The first finger coordinate is the top of this circle
  // i.e. the 12 o'clock mark and the second finger is at 6 o'clock.
  var outer1 = new goog.math.Coordinate(size.width / 2, 0);
  var outer2 = new goog.math.Coordinate(size.width / 2, size.height);
  var mid1 = new goog.math.Coordinate(size.width / 2, size.height);
  var mid2 = new goog.math.Coordinate(size.width / 2, 3 * size.height / 4);

  // For zoom, start from the center and go outwards and vice versa for pinch.
  var start1 = isZoom ? center : outer1;
  var start2 = isZoom ? center : outer2;
  var end1 = isZoom ? outer1 : center;
  var end2 = isZoom ? outer2 : center;

  var touchScreen = new bot.Touchscreen();
  touchScreen.move(element, start1, start2);
  touchScreen.press(/*Two Finger Press*/ true);
  touchScreen.move(element, mid1, mid2);
  touchScreen.move(element, end1, end2);
  touchScreen.release();
};


/**
 * Pinches the given {@code element} (moves fingers inward to its center) with a
 * virtual touch screen.
 *
 * @param {!Element} element The element to pinch.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.pinch = function(element) {
  bot.action.scale_(element, /* isZoom */ false);
};


/**
 * Zooms the given {@code element} (moves fingers outward to its edge) with a
 * virtual touch screen.
 *
 * @param {!Element} element The element to zoom.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.zoom = function(element) {
  bot.action.scale_(element, /* isZoom */ true);
};


/**
 * Rotates the given {@code element} (moves fingers along a circular arc) with a
 * virtual touch screen by the given rotation {@code angle}.
 *
 * @param {!Element} element The element to rotate.
 * @param {number} angle The degrees of rotation between -180 and 180.  A
 *   positve number indicates a clockwise rotation.
 * @throws {bot.Error} If the element cannot be interacted with.
 */
bot.action.rotate = function(element, angle) {
  bot.action.checkInteractable_(element);
  var size = goog.style.getSize(element);
  var center = new goog.math.Vec2(size.width / 2, size.height / 2);
  // To choose the default coordinate, we imagine a circle centered on the
  // element's center. The first finger coordinate is the top of this circle
  // i.e. the 12 o'clock mark and the second finger is at 6 o'clock.
  var coords1 = new goog.math.Vec2(size.width / 2, 0);
  var coords2 = new goog.math.Vec2(size.width / 2, size.height);

  // Convert the degrees to radians.
  var halfRadians = Math.PI * (angle / 180) / 2;

  var touchScreen = new bot.Touchscreen();
  touchScreen.move(element, coords1, coords2);
  touchScreen.press(/*Two Finger Press*/ true);

  // Complete the rotation in two steps.
  var mid1 = goog.math.Vec2.rotateAroundPoint(coords1, center, halfRadians);
  var mid2 = goog.math.Vec2.rotateAroundPoint(coords2, center, halfRadians);
  touchScreen.move(element, mid1, mid2);

  var end1 = goog.math.Vec2.rotateAroundPoint(mid1, center, halfRadians);
  var end2 = goog.math.Vec2.rotateAroundPoint(mid2, center, halfRadians);
  touchScreen.move(element, end1, end2);

  touchScreen.release();
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

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
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.Keyboard');
goog.require('bot.Mouse');
goog.require('bot.dom');
goog.require('bot.events');
goog.require('bot.locators');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');
goog.require('goog.math.Coordinate');
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
 * Throws an exception if an element is not interactable.
 *
 * @param {!Element} element The element to check.
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
 * @param {Node} node The node to test.
 * @return {boolean} Whether the node is a SELECT element.
 * @private
 */
bot.action.isSelectElement_ = function(node) {
  return bot.dom.isElement(node, goog.dom.TagName.SELECT);
};


/**
 * Sets the selected state of an INPUT element.
 * @param {!Element} element The element to manipulate.
 * @param {boolean} selected Whether the final state of the element should be
 *     what a user would consider "selected".
 * @see bot.action.setSelected
 * @private
 */
bot.action.selectInputElement_ = function(element, selected) {
  var type = element.type.toLowerCase();
  if (type == 'checkbox' || type == 'radio') {
    if (element.checked != selected) {
      if (element.type == 'radio' && !selected) {
        throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
            'You may not deselect a radio button');
      }

      if (selected == bot.dom.isSelected(element)) {
        return;  // Already in the desired state.
      }

      element.checked = selected;
      bot.events.fire(element, goog.events.EventType.CHANGE);
    }
  } else {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_SELECTABLE,
        'You may not select an unselectable input element: ' +
            element.type);
  }
};


/**
 * Sets the selected state of an OPTION element.
 * @param {!Element} element The element to manipulate.
 * @param {boolean} selected Whether the final state of the element should be
 *     what a user would consider "selected".
 * @see bot.action.setSelected
 * @private
 */
bot.action.selectOptionElement_ = function(element, selected) {
  var select = (/** @type {!Element} */
      goog.dom.getAncestor(element, bot.action.isSelectElement_));

  if (!select.multiple && !selected) {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_SELECTABLE,
        'You may not deselect an option within a select that ' +
        'does not support multiple selections.');
  }

  if (selected == bot.dom.isSelected(element)) {
    return;  // Already in the desired state.
  }

  if (goog.userAgent.IE) {
    select.focus();
  }

  element.selected = selected;
  bot.events.fire(select, goog.events.EventType.CHANGE);

  if (goog.userAgent.IE) {
    select.blur();
  }
};


/**
 * Sets an element's selected element to the specified state. Only elements that
 * support the "checked" or "selected" attribute may be selected.
 * <p/>
 * This function has no effect if the element is already in the desired state.
 * Otherwise, the element's state is toggled and a "change" event is fired.
 *
 * @param {!Element} element The element to manipulate.
 * @param {boolean} selected Whether the final state of the element should be
 *     what a user would consider "selected".
 */
bot.action.setSelected = function(element, selected) {
  // TODO(user): Fire more than just change events: mousemove, keydown, etc?
  bot.action.checkInteractable_(element);

  if (bot.dom.isElement(element, goog.dom.TagName.INPUT)) {
    bot.action.selectInputElement_(element, selected);
  } else if (bot.dom.isElement(element, goog.dom.TagName.OPTION)) {
    bot.action.selectOptionElement_(element, selected);
  } else {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_SELECTABLE,
        'You may not select an unselectable element: ' + element.tagName);
  }
};


/**
 * Toggles the selected state of the given element.
 *
 * @param {!Element} element The element to toggle.
 * @return {boolean} The new selected state of the element.
 * @see bot.action.setSelected
 * @see bot.dom.isSelected
 */
bot.action.toggle = function(element) {
  bot.action.checkShown_(element);
  if (bot.dom.isElement(element, goog.dom.TagName.INPUT) &&
      'radio' == element.type) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'You may not toggle a radio button');
  }
  bot.action.setSelected(element, !bot.dom.isSelected(element));
  return bot.dom.isSelected(element);
};


/**
 * Focuses on the given element if it is not already the active element. If
 * a focus change is required, the active element will be blurred before
 * focusing on the given element.
 * @param {!Element} element The element to focus on.
 * @param {Element=} opt_activeElement The currently active element. If
 *     provided, and different from {@code element}, the active element will
 *     be blurred before focusing on the element.
 */

bot.action.focusOnElement = function(element, opt_activeElement) {
  bot.action.checkInteractable_(element);
  var activeElement = opt_activeElement || bot.dom.getActiveElement(element);

  if (element != activeElement) {
    // NOTE(user): This check is for browsers that do not support the
    // document.activeElement property, like Safari 3. Interestingly,
    // Safari 3 implicitly blurs the activeElement when we call focus()
    // below, so the blur event still fires on the activeElement.
    if (activeElement) {
      if (goog.isFunction(activeElement.blur) ||
          // IE seems to report native functions as being objects.
          goog.userAgent.IE && goog.isObject(activeElement.blur)) {
        activeElement.blur();
      }

      // Apparently, in certain situations, IE6 and IE7 will not fire an onblur
      // event after blur() is called, unless window.focus() is called
      // immediately afterward.
      // Note that IE8 will hit this branch unless the page is forced into
      // IE8-strict mode. This shouldn't hurt anything, we just use the
      // useragent sniff so we can compile this out for proper browsers.
      if (goog.userAgent.IE && !goog.userAgent.isVersion(8)) {
        goog.dom.getWindow(goog.dom.getOwnerDocument(element)).focus();
      }
    }
    // In IE, blur and focus events fire asynchronously.
    // TODO(user): Does this mean we've entered callback territory?
    if (goog.isFunction(element.focus) ||
        goog.userAgent.IE && goog.isObject(element.focus)) {
      element.focus();
    }
  }
};


/**
 * Clears a textual form field.
 *
 * <p/>Throws an exception if the element is not shown, disabled, or editable.
 *
 * @param {!Element} element The element to clear.
 */
bot.action.clear = function(element) {
  bot.action.checkInteractable_(element);
  if (!bot.dom.isEditable(element)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'Element cannot contain user-editable text');
  }

  bot.action.focusOnElement(element);
  if (element.value) {
    element.value = '';
    bot.events.fire(element, goog.events.EventType.CHANGE);
  }
  
  if (bot.dom.getProperty(element, 'contentEditable') == 'true' ||
      bot.dom.getAttribute(element, 'contentEditable') != null) {
    element.innerHTML = ' ';
    // contentEditable does not generate onchange event
  }
};


/**
 * Types keys on an element.
 *
 * Callers can pass in either strings or members of bot.Keyboard.Key. If a
 * modifier key is provided, it is pressed but not released, until it is either
 * is listed again or the function ends.
 *
 * Example:
 *   bot.keys.type(element, 'ab', bot.Keyboard.Key.LEFT,
 *                 bot.Keyboard.Key.DELETE, bot.Keyboard.Key.SHIFT, 'cd');
 *
 * @param {!Element} element The element receiving the event.
 * @param {...(string|!bot.Keyboard.Key)} var_args Values to type on the
 *    element, either strings or members of bot.Keyboard.Key.
 */
bot.action.type = function(element, var_args) {
  bot.action.checkShown_(element);
  bot.action.focusOnElement(element);
  var keyboard = new bot.Keyboard(element);

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
 * @param {Node} node The node to test.
 * @return {boolean} Whether the node is a FORM element.
 * @private
 */
bot.action.isForm_ = function(node) {
  return bot.dom.isElement(node, goog.dom.TagName.FORM);
};


/**
 * Submits the form containing the given element. Note this function triggers
 * the submit action, but does not simulate user input (a click or key press).
 * To trigger a submit from user action, dispatch the desired event on the
 * appropriate element using {@code bot.events.fire}.
 * @param {!Element} element The element to submit.
 * @see bot.events.fire
 */
bot.action.submit = function(element) {
  // TODO(user): This should find first submittable element in the form and
  // submit that instead of going directly for the FORM.
  var form = (/** @type {Element} */ goog.dom.getAncestor(element,
      bot.action.isForm_, /*includeNode=*/true));
  if (!form) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'Element was not in a form, so could not submit.');
  }
  bot.action.submitForm_(form);
};


/**
 * Submits the specified form. Unlike the public function, it expects to be
 * given a <form> element and fails if it is not.
 * @param {!Element} form The form to submit.
 * @private
 */
bot.action.submitForm_ = function(form) {
  if (!bot.action.isForm_(form)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'Element was not in a form, so could not submit.');
  }
  if (bot.events.fire(form, goog.events.EventType.SUBMIT)) {
    // When a form has an element with an id or name exactly equal to "submit"
    // (not uncommon) it masks the form.submit function. We  can avoid this by
    // calling the prototype's submit function, except in IE < 8, where DOM id
    // elements don't let you reference their prototypes. For IE < 8, can change
    // the id and names of the elements and revert them back, but they must be
    // reverted before the submit call, because the onsubmit handler might rely
    // on their being correct, and the HTTP request might otherwise be left with
    // incorrect value names. Fortunately, saving the submit function and
    // calling it after reverting the ids and names works! Oh, and goog.typeOf
    // (and thus goog.isFunction) doesn't work for form.submit in IE < 8.
    if (!bot.dom.isElement(form.submit)) {
      form.submit();
    } else if (!goog.userAgent.IE || goog.userAgent.isVersion(8)) {
      (/** @type {Function} */ form.constructor.prototype.submit).call(form);
    } else {
      var idMasks = bot.locators.findElements({'id': 'submit'}, form);
      var nameMasks = bot.locators.findElements({'name': 'submit'}, form);
      goog.array.forEach(idMasks, function(m) {
        m.removeAttribute('id');
      });
      goog.array.forEach(nameMasks, function(m) {
        m.removeAttribute('name');
      });
      var submitFunction = form.submit;
      goog.array.forEach(idMasks, function(m) {
        m.setAttribute('id', 'submit');
      });
      goog.array.forEach(nameMasks, function(m) {
        m.setAttribute('name', 'submit');
      });
      submitFunction();
    }
  }
};


/**
 * Simulates a click sequence on the given {@code element}. A click sequence
 * is defined as the following events:
 * <ol>
 * <li>mouseover</li>
 * <li>mousemove</li>
 * <li>mousedown</li>
 * <li>blur[1]</li>
 * <li>focus[1]</li>
 * <li>mouseup</li>
 * <li>click</li>
 * </ol>
 *
 * <p/>[1] The "blur" and "focus" events are only generated if the {@code
 * element} does not already have focus. The blur event will be fired on the
 * currently focused element, and the focus event on the click target.
 *
 * <p/>Throws an exception if the element is not shown or is disabled.
 *
 * @param {!Element} element The element to click.
 * @param {goog.math.Coordinate=} opt_coords Mouse position relative to the
 *   target.
 */
bot.action.click = function(element, opt_coords) {
  var mouse = bot.action.prepareMouseForClick_(element, opt_coords);
  bot.action.pressAndReleaseButton_(
      mouse, element, bot.Mouse.Button.LEFT);
};


/**
 * Simulates a right click sequence on the given {@code element}. A click
 * sequence is defined as the following events:
 * <ol>
 * <li>mouseover</li>
 * <li>mousemove</li>
 * <li>mousedown</li>
 * <li>blur[1]</li>
 * <li>focus[1]</li>
 * <li>mouseup</li>
 * <li>contextmenu</li>
 * </ol>
 *
 * <p/>[1] The "blur" and "focus" events are only generated if the {@code
 * element} does not already have focus. The blur event will be fired on the
 * currently focused element, and the focus event on the click target.
 *
 * <p/>Throws an exception if the element is not shown or is disabled.
 *
 * @param {!Element} element The element to click.
 * @param {goog.math.Coordinate=} opt_coords Mouse position relative to the
 *   target.
 */
bot.action.rightClick = function(element, opt_coords) {
  var mouse = bot.action.prepareMouseForClick_(element, opt_coords);
  bot.action.pressAndReleaseButton_(
      mouse, element, bot.Mouse.Button.RIGHT);
};


/**
 * Simulates a double click sequence on the given {@code element}. A double
 * click sequence is defined as the following events:
 * <ol>
 * <li>mouseover</li>
 * <li>mousemove</li>
 * <li>mousedown</li>
 * <li>blur[1]</li>
 * <li>focus[1]</li>
 * <li>mouseup</li>
 * <li>click</li>
 * <li>mousedown</li>
 * <li>mouseup</li>
 * <li>click</li>
 * <li>doubleclick</li>
 * </ol>
 *
 * <p/>[1] The "blur" and "focus" events are only generated if the {@code
 * element} does not already have focus. The blur event will be fired on the
 * currently focused element, and the focus event on the click target.
 *
 * <p/>Throws an exception if the element is not shown or is disabled.
 *
 * @param {!Element} element The element to click.
 * @param {goog.math.Coordinate=} opt_coords Mouse position relative to the
 *   target.
 */
bot.action.doubleClick = function(element, opt_coords) {
  var mouse = bot.action.prepareMouseForClick_(element, opt_coords);

  bot.action.pressAndReleaseButton_(
      mouse, element, bot.Mouse.Button.LEFT);
  // In the second click of a double click we don't have to focus on the element
  // again.
  bot.action.pressAndReleaseButton_(
      mouse, element, bot.Mouse.Button.LEFT, true);
};


/**
 * A helper function which prepares the mouse for a click action. It checks if
 * the the element is shown, scrolls the element into few, sets the
 * {@code opt_coords} if they are undefined, and moves the mouse to the right
 * position.
 *
 * @param {!Element} element The element to click.
 * @param {goog.math.Coordinate=} opt_coords Mouse position relative to the
 *   target.
 * @return {!bot.Mouse} The mouse object used for the click.
 * @private
 */
bot.action.prepareMouseForClick_ = function(element, opt_coords) {
  if (!bot.dom.isShown(element, true)) {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_VISIBLE,
        'Element is not currently visible and may not be manipulated');
  }

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

  var mouse = new bot.Mouse();
  mouse.move(element, opt_coords);

  return mouse;
};


/**
 * A helper function which triggers a mousePress and a mouseRelease event.
 *
 * @param {!bot.Mouse} mouse The object which is used to trigger the mouse
 * events.
 * @param {!Element} element The element to click.
 * @param {!bot.Mouse.Button} button The mouse button.
 * @param {boolean=} opt_doNotFocusOnElement Whether to focus on the
 * {@code element}.
 * @private
 */
bot.action.pressAndReleaseButton_ =
    function(mouse, element, button, opt_doNotFocusOnElement) {
  var performFocus = mouse.pressButton(button);

  // focus on the element
  if (!opt_doNotFocusOnElement &&
      performFocus &&
      bot.dom.isInteractable(element)) {
    var activeElement = bot.dom.getActiveElement(element);
    bot.action.focusOnElement(element, activeElement);
  }

  mouse.releaseButton();
};


/**
 * Drags the element by (dx, dy).
 *
 * @param {!Element} element The element to drag.
 * @param {number} dx Increment in x coordinate.
 * @param {number} dy Increment in y coordinate.
 * @param {goog.math.Coordinate=} opt_coords Drag start position relative to the
 *   element.
 */
bot.action.drag = function(element, dx, dy, opt_coords) {
  bot.action.checkShown_(element);

  var mouse = new bot.Mouse();
  if (!opt_coords) {
    var size = goog.style.getSize(element);
    opt_coords = new goog.math.Coordinate(size.width / 2, size.height / 2);
  }
  mouse.move(element, opt_coords);

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


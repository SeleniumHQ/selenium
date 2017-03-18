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
 * @fileoverview The file contains the base class for input devices such as
 * the keyboard, mouse, and touchscreen.
 */

goog.provide('bot.Device');
goog.provide('bot.Device.EventEmitter');

goog.require('bot');
goog.require('bot.dom');
goog.require('bot.locators');
goog.require('bot.userAgent');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');



/**
 * A Device class that provides common functionality for input devices.
 * @param {bot.Device.ModifiersState=} opt_modifiersState state of modifier
 * keys. The state is shared, not copied from this parameter.
 * @param {bot.Device.EventEmitter=} opt_eventEmitter An object that should be
 *     used to fire events.
 * @constructor
 */
bot.Device = function(opt_modifiersState, opt_eventEmitter) {
  /**
   * Element being interacted with.
   * @private {!Element}
   */
  this.element_ = bot.getDocument().documentElement;

  /**
   * If the element is an option, this is its parent select element.
   * @private {Element}
   */
  this.select_ = null;

  // If there is an active element, make that the current element instead.
  var activeElement = bot.dom.getActiveElement(this.element_);
  if (activeElement) {
    this.setElement(activeElement);
  }

  /**
   * State of modifier keys for this device.
   * @protected {bot.Device.ModifiersState}
   */
  this.modifiersState = opt_modifiersState || new bot.Device.ModifiersState();

  /** @protected {!bot.Device.EventEmitter} */
  this.eventEmitter = opt_eventEmitter || new bot.Device.EventEmitter();
};


/**
 * Returns the element with which the device is interacting.
 *
 * @return {!Element} Element being interacted with.
 * @protected
 */
bot.Device.prototype.getElement = function() {
  return this.element_;
};


/**
 * Sets the element with which the device is interacting.
 *
 * @param {!Element} element Element being interacted with.
 * @protected
 */
bot.Device.prototype.setElement = function(element) {
  this.element_ = element;
  if (bot.dom.isElement(element, goog.dom.TagName.OPTION)) {
    this.select_ = /** @type {Element} */ (goog.dom.getAncestor(element,
        function(node) {
          return bot.dom.isElement(node, goog.dom.TagName.SELECT);
        }));
  } else {
    this.select_ = null;
  }
};


/**
 * Fires an HTML event given the state of the device.
 *
 * @param {bot.events.EventType} type HTML Event type.
 * @return {boolean} Whether the event fired successfully; false if cancelled.
 * @protected
 */
bot.Device.prototype.fireHtmlEvent = function(type) {
  return this.eventEmitter.fireHtmlEvent(this.element_, type);
};


/**
 * Fires a keyboard event given the state of the device and the given arguments.
 * TODO: Populate the modifier keys in this method.
 *
 * @param {bot.events.EventType} type Keyboard event type.
 * @param {bot.events.KeyboardArgs} args Keyboard event arguments.
 * @return {boolean} Whether the event fired successfully; false if cancelled.
 * @protected
 */
bot.Device.prototype.fireKeyboardEvent = function(type, args) {
  return this.eventEmitter.fireKeyboardEvent(this.element_, type, args);
};


/**
 * Fires a mouse event given the state of the device and the given arguments.
 * TODO: Populate the modifier keys in this method.
 *
 * @param {bot.events.EventType} type Mouse event type.
 * @param {!goog.math.Coordinate} coord The coordinate where event will fire.
 * @param {number} button The mouse button value for the event.
 * @param {Element=} opt_related The related element of this event.
 * @param {?number=} opt_wheelDelta The wheel delta value for the event.
 * @param {boolean=} opt_force Whether the event should be fired even if the
 *     element is not interactable, such as the case of a mousemove or
 *     mouseover event that immediately follows a mouseout.
 * @param {?number=} opt_pointerId The pointerId associated with the event.
 * @param {?number=} opt_count Number of clicks that have been performed.
 * @return {boolean} Whether the event fired successfully; false if cancelled.
 * @protected
 */
bot.Device.prototype.fireMouseEvent = function(type, coord, button,
    opt_related, opt_wheelDelta, opt_force, opt_pointerId, opt_count)  {
  if (!opt_force && !bot.dom.isInteractable(this.element_)) {
    return false;
  }

  if (opt_related &&
      !(bot.events.EventType.MOUSEOVER == type ||
        bot.events.EventType.MOUSEOUT == type)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
                        'Event type does not allow related target: ' + type);
  }

  var args = {
    clientX: coord.x,
    clientY: coord.y,
    button: button,
    altKey: this.modifiersState.isAltPressed(),
    ctrlKey: this.modifiersState.isControlPressed(),
    shiftKey: this.modifiersState.isShiftPressed(),
    metaKey: this.modifiersState.isMetaPressed(),
    wheelDelta: opt_wheelDelta || 0,
    relatedTarget: opt_related || null,
    count: opt_count || 1
  };

  var pointerId = opt_pointerId || bot.Device.MOUSE_MS_POINTER_ID;

  var target = this.element_;
  // On click and mousedown events, captured pointers are ignored and the
  // event always fires on the original element.
  if (type != bot.events.EventType.CLICK &&
      type != bot.events.EventType.MOUSEDOWN &&
      pointerId in bot.Device.pointerElementMap_) {
    target = bot.Device.pointerElementMap_[pointerId];
  } else if (this.select_) {
    target = this.getTargetOfOptionMouseEvent_(type);
  }
  return target ? this.eventEmitter.fireMouseEvent(target, type, args) : true;
};


/**
 * Fires a touch event given the state of the deive and the given arguments.
 *
 * @param {bot.events.EventType} type Event type.
 * @param {number} id The touch identifier.
 * @param {!goog.math.Coordinate} coord The coordinate where event will fire.
 * @param {number=} opt_id2 The touch identifier of the second finger.
 * @param {!goog.math.Coordinate=} opt_coord2 The coordinate of the second
 *    finger, if any.
 * @return {boolean} Whether the event fired successfully or was cancelled.
 * @protected
 */
bot.Device.prototype.fireTouchEvent = function(type, id, coord, opt_id2,
                                               opt_coord2) {
  var args = {
    touches: [],
    targetTouches: [],
    changedTouches: [],
    altKey: this.modifiersState.isAltPressed(),
    ctrlKey: this.modifiersState.isControlPressed(),
    shiftKey: this.modifiersState.isShiftPressed(),
    metaKey: this.modifiersState.isMetaPressed(),
    relatedTarget: null,
    scale: 0,
    rotation: 0
  };
  var pageOffset = goog.dom.getDomHelper(this.element_).getDocumentScroll();

  function addTouch(identifier, coords) {
    // Android devices leave identifier to zero.
    var id = goog.userAgent.product.ANDROID ? 0 : identifier;
    var touch = {
      identifier: identifier,
      screenX: coords.x,
      screenY: coords.y,
      clientX: coords.x,
      clientY: coords.y,
      pageX: coords.x + pageOffset.x,
      pageY: coords.y + pageOffset.y
    };

    args.changedTouches.push(touch);
    if (type == bot.events.EventType.TOUCHSTART ||
        type == bot.events.EventType.TOUCHMOVE) {
      args.touches.push(touch);
      args.targetTouches.push(touch);
    }
  }

  addTouch(id, coord);
  if (goog.isDef(opt_id2)) {
    addTouch(opt_id2, opt_coord2);
  }

  return this.eventEmitter.fireTouchEvent(this.element_, type, args);
};


/**
 * Fires a MSPointer event given the state of the device and the given
 * arguments.
 *
 * @param {bot.events.EventType} type MSPointer event type.
 * @param {!goog.math.Coordinate} coord The coordinate where event will fire.
 * @param {number} button The mouse button value for the event.
 * @param {number} pointerId The pointer id for this event.
 * @param {number} device The device type used for this event.
 * @param {boolean} isPrimary Whether the pointer represents the primary point
 *     of contact.
 * @param {Element=} opt_related The related element of this event.
 * @param {boolean=} opt_force Whether the event should be fired even if the
 *     element is not interactable, such as the case of a mousemove or
 *     mouseover event that immediately follows a mouseout.
 * @return {boolean} Whether the event fired successfully; false if cancelled.
 * @protected
 */
bot.Device.prototype.fireMSPointerEvent = function(type, coord, button,
    pointerId, device, isPrimary, opt_related, opt_force) {
  if (!opt_force && !bot.dom.isInteractable(this.element_)) {
    return false;
  }

  if (opt_related &&
      !(bot.events.EventType.MSPOINTEROVER == type ||
        bot.events.EventType.MSPOINTEROUT == type)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
                        'Event type does not allow related target: ' + type);
  }

  var args = {
    clientX: coord.x,
    clientY: coord.y,
    button: button,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
    relatedTarget: opt_related || null,
    width: 0,
    height: 0,
    pressure: 0, // Pressure is only given when a stylus is used.
    rotation: 0,
    pointerId: pointerId,
    tiltX: 0,
    tiltY: 0,
    pointerType: device,
    isPrimary: isPrimary
  };

  var target = this.select_ ?
      this.getTargetOfOptionMouseEvent_(type) : this.element_;
  if (bot.Device.pointerElementMap_[pointerId]) {
    target = bot.Device.pointerElementMap_[pointerId];
  }
  var owner = goog.dom.getWindow(goog.dom.getOwnerDocument(this.element_));
  var originalMsSetPointerCapture;
  if (owner && type == bot.events.EventType.MSPOINTERDOWN) {
    // Overwrite msSetPointerCapture on the Element's msSetPointerCapture
    // because synthetic pointer events cause an access denied exception.
    // The prototype is modified because the pointer event will bubble up and
    // we do not know which element will handle the pointer event.
    originalMsSetPointerCapture =
        owner['Element'].prototype.msSetPointerCapture;
    owner['Element'].prototype.msSetPointerCapture = function(id) {
      bot.Device.pointerElementMap_[id] = this;
    };
  }
  var result =
      target ? this.eventEmitter.fireMSPointerEvent(target, type, args) : true;
  if (originalMsSetPointerCapture) {
    owner['Element'].prototype.msSetPointerCapture =
        originalMsSetPointerCapture;
  }
  return result;
};


/**
 * A mouse event fired "on" an option element, doesn't always fire on the
 * option element itself. Sometimes it fires on the parent select element
 * and sometimes not at all, depending on the browser and event type. This
 * returns the true target element of the event, or null if none is fired.
 *
 * @param {bot.events.EventType} type Type of event.
 * @return {Element} Element the event should be fired on, null if none.
 * @private
 */
bot.Device.prototype.getTargetOfOptionMouseEvent_ = function(type) {
  // IE either fires the event on the parent select or not at all.
  if (goog.userAgent.IE) {
    switch (type) {
      case bot.events.EventType.MOUSEOVER:
      case bot.events.EventType.MSPOINTEROVER:
        return null;
      case bot.events.EventType.CONTEXTMENU:
      case bot.events.EventType.MOUSEMOVE:
      case bot.events.EventType.MSPOINTERMOVE:
        return this.select_.multiple ? this.select_ : null;
      default:
        return this.select_;
    }
  }

  // WebKit always fires on the option element of multi-selects.
  // On single-selects, it either fires on the parent or not at all.
  if (goog.userAgent.WEBKIT) {
    switch (type) {
      case bot.events.EventType.CLICK:
      case bot.events.EventType.MOUSEUP:
        return this.select_.multiple ? this.element_ : this.select_;
      default:
        return this.select_.multiple ? this.element_ : null;
    }
  }

  // Firefox fires every event or the option element.
  return this.element_;
};


/**
 * A helper function to fire click events.  This method is shared between
 * the mouse and touchscreen devices.
 *
 * @param {!goog.math.Coordinate} coord The coordinate where event will fire.
 * @param {number} button The mouse button value for the event.
 * @param {boolean=} opt_force Whether the click should occur even if the
 *     element is not interactable, such as when an element is hidden by a
 *     mouseup handler.
 * @param {?number=} opt_pointerId The pointer id associated with the click.
 * @protected
 */
bot.Device.prototype.clickElement = function(coord, button, opt_force,
                                             opt_pointerId) {
  if (!opt_force && !bot.dom.isInteractable(this.element_)) {
    return;
  }

  // bot.events.fire(element, 'click') can trigger all onclick events, but may
  // not follow links (FORM.action or A.href).
  //     TAG      IE   GECKO  WebKit
  // A(href)      No    No     Yes
  // FORM(action) No    Yes    Yes
  var targetLink = null;
  var targetButton = null;
  if (!bot.Device.ALWAYS_FOLLOWS_LINKS_ON_CLICK_) {
    for (var e = this.element_; e; e = e.parentNode) {
      if (bot.dom.isElement(e, goog.dom.TagName.A)) {
        targetLink = /**@type {!Element}*/ (e);
        break;
      } else if (bot.Device.isFormSubmitElement(e)) {
        targetButton = e;
        break;
      }
    }
  }

  // When an element is toggled as the result of a click, the toggling and the
  // change event happens before the click event on some browsers. However, on
  // radio buttons and checkboxes, the click handler can prevent the toggle from
  // happening, so we must fire the click first to see if it is cancelled.
  var isRadioOrCheckbox = !this.select_ && bot.dom.isSelectable(this.element_);
  var wasChecked = isRadioOrCheckbox && bot.dom.isSelected(this.element_);

  // NOTE: Clicking on a form submit button is a little broken:
  // (1) When clicking a form submit button in IE, firing a click event or
  // calling Form.submit() will not by itself submit the form, so we call
  // Element.click() explicitly, but as a result, the coordinates of the click
  // event are not provided. Also, when clicking on an <input type=image>, the
  // coordinates click that are submitted with the form are always (0, 0).
  // (2) When clicking a form submit button in GECKO, while the coordinates of
  // the click event are correct, those submitted with the form are always (0,0)
  // .
  // TODO: See if either of these can be resolved, perhaps by adding
  // hidden form elements with the coordinates before the form is submitted.
  if (goog.userAgent.IE && targetButton) {
    targetButton.click();
    return;
  }

  var performDefault = this.fireMouseEvent(
      bot.events.EventType.CLICK, coord, button, null, 0, opt_force,
      opt_pointerId);
  if (!performDefault) {
    return;
  }

  if (targetLink && bot.Device.shouldFollowHref_(targetLink)) {
    bot.Device.followHref_(targetLink);
  } else if (isRadioOrCheckbox) {
    this.toggleRadioButtonOrCheckbox_(wasChecked);
  }
};


/**
 * Focuses on the given element and returns true if it supports being focused
 * and does not already have focus; otherwise, returns false. If another element
 * has focus, that element will be blurred before focusing on the given element.
 *
 * @return {boolean} Whether the element was given focus.
 * @protected
 */
bot.Device.prototype.focusOnElement = function() {
  var elementToFocus = goog.dom.getAncestor(
      this.element_,
      function (node) {
        return !!node && bot.dom.isElement(node) &&
            bot.dom.isFocusable(/** @type {!Element} */ (node));
      },
      true /* Return this.element_ if it is focusable. */);
  elementToFocus = elementToFocus || this.element_;

  var activeElement = bot.dom.getActiveElement(elementToFocus);
  if (elementToFocus == activeElement) {
    return false;
  }

  // If there is a currently active element, try to blur it.
  if (activeElement && (goog.isFunction(activeElement.blur) ||
      // IE reports native functions as being objects.
      goog.userAgent.IE && goog.isObject(activeElement.blur))) {
    // In IE, the focus() and blur() functions fire their respective events
    // asynchronously, and as the result, the focus/blur events fired by the
    // the atoms actions will often be in the wrong order on IE. Firing a blur
    // out of order sometimes causes IE to throw an "Unspecified error", so we
    // wrap it in a try-catch and catch and ignore the error in this case.
    if (!bot.dom.isElement(activeElement, goog.dom.TagName.BODY)) {
      try {
        activeElement.blur();
      } catch (e) {
        if (!(goog.userAgent.IE && e.message == 'Unspecified error.')) {
          throw e;
        }
      }
    }

    // Sometimes IE6 and IE7 will not fire an onblur event after blur()
    // is called, unless window.focus() is called immediately afterward.
    // Note that IE8 will hit this branch unless the page is forced into
    // IE8-strict mode. This shouldn't hurt anything, we just use the
    // useragent sniff so we can compile this out for proper browsers.
    if (goog.userAgent.IE && !bot.userAgent.isEngineVersion(8)) {
      goog.dom.getWindow(goog.dom.getOwnerDocument(elementToFocus)).focus();
    }
  }

  // Try to focus on the element.
  if (goog.isFunction(elementToFocus.focus) ||
      goog.userAgent.IE && goog.isObject(elementToFocus.focus)) {
    elementToFocus.focus();
    return true;
  }

  return false;
};


/**
 * Whether links must be manually followed when clicking (because firing click
 * events doesn't follow them).
 * @private {boolean}
 * @const
 */
bot.Device.ALWAYS_FOLLOWS_LINKS_ON_CLICK_ =
    goog.userAgent.WEBKIT ||
    (bot.userAgent.FIREFOX_EXTENSION && bot.userAgent.isProductVersion(3.6));


/**
 * @param {Node} element The element to check.
 * @return {boolean} Whether the element is a submit element in form.
 * @protected
 */
bot.Device.isFormSubmitElement = function(element) {
  if (bot.dom.isElement(element, goog.dom.TagName.INPUT)) {
    var type = element.type.toLowerCase();
    if (type == 'submit' || type == 'image') {
      return true;
    }
  }

  if (bot.dom.isElement(element, goog.dom.TagName.BUTTON)) {
    var type = element.type.toLowerCase();
    if (type == 'submit') {
      return true;
    }
  }
  return false;
};


/**
 * Indicates whether we should manually follow the href of the element we're
 * clicking.
 *
 * Versions of firefox from 4+ will handle links properly when this is used in
 * an extension. Versions of Firefox prior to this may or may not do the right
 * thing depending on whether a target window is opened and whether the click
 * has caused a change in just the hash part of the URL.
 *
 * @param {!Element} element The element to consider.
 * @return {boolean} Whether following an href should be skipped.
 * @private
 */
bot.Device.shouldFollowHref_ = function(element) {
  if (bot.Device.ALWAYS_FOLLOWS_LINKS_ON_CLICK_ || !element.href) {
    return false;
  }

  if (!bot.userAgent.FIREFOX_EXTENSION) {
    return true;
  }

  if (element.target || element.href.toLowerCase().indexOf('javascript') == 0) {
    return false;
  }

  var owner = goog.dom.getWindow(goog.dom.getOwnerDocument(element));
  var sourceUrl = owner.location.href;
  var destinationUrl = bot.Device.resolveUrl_(owner.location, element.href);
  var isOnlyHashChange =
      sourceUrl.split('#')[0] === destinationUrl.split('#')[0];

  return !isOnlyHashChange;
};


/**
 * Explicitly follows the href of an anchor.
 *
 * @param {!Element} anchorElement An anchor element.
 * @private
 */
bot.Device.followHref_ = function(anchorElement) {
  var targetHref = anchorElement.href;
  var owner = goog.dom.getWindow(goog.dom.getOwnerDocument(anchorElement));

  // IE7 and earlier incorrect resolve a relative href against the top window
  // location instead of the window to which the href is assigned. As a result,
  // we have to resolve the relative URL ourselves. We do not use Closure's
  // goog.Uri to resolve, because it incorrectly fails to support empty but
  // undefined query and fragment components and re-encodes the given url.
  if (goog.userAgent.IE && !bot.userAgent.isEngineVersion(8)) {
    targetHref = bot.Device.resolveUrl_(owner.location, targetHref);
  }

  if (anchorElement.target) {
    owner.open(targetHref, anchorElement.target);
  } else {
    owner.location.href = targetHref;
  }
};


/**
 * Toggles the selected state of the current element if it is an option. This
 * is a noop if the element is not an option, or if it is selected and belongs
 * to a single-select, because it can't be toggled off.
 *
 * @protected
 */
bot.Device.prototype.maybeToggleOption = function() {
  // If this is not an <option> or not interactable, exit.
  if (!this.select_ || !bot.dom.isInteractable(this.element_)) {
    return;
  }
  var select = /** @type {!Element} */ (this.select_);
  var wasSelected = bot.dom.isSelected(this.element_);
  // Cannot toggle off options in single-selects.
  if (wasSelected && !select.multiple) {
    return;
  }

  // TODO: In a multiselect, clicking an option without the ctrl key down
  // should deselect all other selected options. Right now multiselect click
  // works as ctrl+click should (and unit tests written so that they pass).

  this.element_.selected = !wasSelected;
  // Only WebKit fires the change event itself and only for multi-selects,
  // except for Android versions >= 4.0 and Chrome >= 28.
  if (!(goog.userAgent.WEBKIT && select.multiple) ||
      (goog.userAgent.product.CHROME && bot.userAgent.isProductVersion(28)) ||
      (goog.userAgent.product.ANDROID && bot.userAgent.isProductVersion(4))) {
    bot.events.fire(select, bot.events.EventType.CHANGE);
  }
};


/**
 * Toggles the checked state of a radio button or checkbox. This is a noop if
 * it is a radio button that is checked, because it can't be toggled off.
 *
 * @param {boolean} wasChecked Whether the element was originally checked.
 * @private
 */
bot.Device.prototype.toggleRadioButtonOrCheckbox_ = function(wasChecked) {
  // Gecko and WebKit toggle the element as a result of a click.
  if (goog.userAgent.GECKO || goog.userAgent.WEBKIT) {
    return;
  }
  // Cannot toggle off radio buttons.
  if (wasChecked && this.element_.type.toLowerCase() == 'radio') {
    return;
  }
  this.element_.checked = !wasChecked;
};


/**
 * Find FORM element that is an ancestor of the passed in element.
 * @param {Node} node The node to find a FORM for.
 * @return {Element} The ancestor FORM element if it exists.
 * @protected
 */
bot.Device.findAncestorForm = function(node) {
  return /** @type {Element} */ (goog.dom.getAncestor(
      node, bot.Device.isForm_, /*includeNode=*/true));
};


/**
 * @param {Node} node The node to test.
 * @return {boolean} Whether the node is a FORM element.
 * @private
 */
bot.Device.isForm_ = function(node) {
  return bot.dom.isElement(node, goog.dom.TagName.FORM);
};


/**
 * Submits the specified form. Unlike the public function, it expects to be
 * given a form element and fails if it is not.
 * @param {!Element} form The form to submit.
 * @protected
 */
bot.Device.prototype.submitForm = function(form) {
  if (!bot.Device.isForm_(form)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
                        'Element is not a form, so could not submit.');
  }
  if (bot.events.fire(form, bot.events.EventType.SUBMIT)) {
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
    } else if (!goog.userAgent.IE || bot.userAgent.isEngineVersion(8)) {
      /** @type {Function} */ (form.constructor.prototype['submit']).call(form);
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
 * Regular expression for splitting up a URL into components.
 * @private {!RegExp}
 * @const
 */
bot.Device.URL_REGEXP_ = new RegExp(
    '^' +
    '([^:/?#.]+:)?' +   // protocol
    '(?://([^/]*))?' +  // host
    '([^?#]+)?' +       // pathname
    '(\\?[^#]*)?' +     // search
    '(#.*)?' +          // hash
    '$');


/**
 * Resolves a potentially relative URL against a base location.
 * @param {!Location} base Base location against which to resolve.
 * @param {string} rel Url to resolve against the location.
 * @return {string} Resolution of url against base location.
 * @private
 */
bot.Device.resolveUrl_ = function(base, rel) {
  var m = rel.match(bot.Device.URL_REGEXP_);
  if (!m) {
    return '';
  }
  var target = {
    protocol: m[1] || '',
    host: m[2] || '',
    pathname: m[3] || '',
    search: m[4] || '',
    hash: m[5] || ''
  };

  if (!target.protocol) {
    target.protocol = base.protocol;
    if (!target.host) {
      target.host = base.host;
      if (!target.pathname) {
        target.pathname = base.pathname;
        target.search = target.search || base.search;
      } else if (target.pathname.charAt(0) != '/') {
        var lastSlashIndex = base.pathname.lastIndexOf('/');
        if (lastSlashIndex != -1) {
          var directory = base.pathname.substr(0, lastSlashIndex + 1);
          target.pathname = directory + target.pathname;
        }
      }
    }
  }

  return target.protocol + '//' + target.host + target.pathname +
      target.search + target.hash;
};



/**
 * Stores the state of modifier keys
 *
 * @constructor
 */
bot.Device.ModifiersState = function() {
  /**
   * State of the modifier keys.
   * @private {number}
   */
  this.pressedModifiers_ = 0;
};


/**
 * An enum for the various modifier keys (keycode-independent).
 * @enum {number}
 */
bot.Device.Modifier = {
  SHIFT: 0x1,
  CONTROL: 0x2,
  ALT: 0x4,
  META: 0x8
};


/**
 * Checks whether a specific modifier is pressed
 * @param {!bot.Device.Modifier} modifier The modifier to check.
 * @return {boolean} Whether the modifier is pressed.
 */
bot.Device.ModifiersState.prototype.isPressed = function(modifier) {
  return (this.pressedModifiers_ & modifier) != 0;
};


/**
 * Sets the state of a given modifier.
 * @param {!bot.Device.Modifier} modifier The modifier to set.
 * @param {boolean} isPressed whether the modifier is set or released.
 */
bot.Device.ModifiersState.prototype.setPressed = function(
    modifier, isPressed) {
  if (isPressed) {
    this.pressedModifiers_ = this.pressedModifiers_ | modifier;
  } else {
    this.pressedModifiers_ = this.pressedModifiers_ & (~modifier);
  }
};


/**
 * @return {boolean} State of the Shift key.
 */
bot.Device.ModifiersState.prototype.isShiftPressed = function() {
  return this.isPressed(bot.Device.Modifier.SHIFT);
};


/**
 * @return {boolean} State of the Control key.
 */
bot.Device.ModifiersState.prototype.isControlPressed = function() {
  return this.isPressed(bot.Device.Modifier.CONTROL);
};


/**
 * @return {boolean} State of the Alt key.
 */
bot.Device.ModifiersState.prototype.isAltPressed = function() {
  return this.isPressed(bot.Device.Modifier.ALT);
};


/**
 * @return {boolean} State of the Meta key.
 */
bot.Device.ModifiersState.prototype.isMetaPressed = function() {
  return this.isPressed(bot.Device.Modifier.META);
};


/**
 * The pointer id used for MSPointer events initiated through a mouse device.
 * @type {number}
 * @const
 */
bot.Device.MOUSE_MS_POINTER_ID = 1;


/**
 * A map of pointer id to Elements.
 * @private {!Object.<number, !Element>}
 */
bot.Device.pointerElementMap_ = {};


/**
 * Gets the element associated with a pointer id.
 * @param {number} pointerId The pointer Id.
 * @return {?Element} The element associated with the pointer id.
 * @protected
 */
bot.Device.getPointerElement = function(pointerId) {
  return bot.Device.pointerElementMap_[pointerId];
};


/**
 * Clear the pointer map.
 * @protected
 */
bot.Device.clearPointerMap = function() {
  bot.Device.pointerElementMap_ = {};
};


/**
 * Fires events, a driver can replace it with a custom implementation
 *
 * @constructor
 */
bot.Device.EventEmitter = function() {
};


/**
 * Fires an HTML event given the state of the device.
 *
 * @param {!Element} target The element on which to fire the event.
 * @param {bot.events.EventType} type HTML Event type.
 * @return {boolean} Whether the event fired successfully; false if cancelled.
 * @protected
 */
bot.Device.EventEmitter.prototype.fireHtmlEvent = function(target, type) {
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
bot.Device.EventEmitter.prototype.fireKeyboardEvent = function(
    target, type, args) {
  return bot.events.fire(target, type, args);
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
bot.Device.EventEmitter.prototype.fireMouseEvent = function(
    target, type, args) {
  return bot.events.fire(target, type, args);
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
bot.Device.EventEmitter.prototype.fireTouchEvent = function(
    target, type, args) {
  return bot.events.fire(target, type, args);
};


/**
 * Fires an MSPointer event given the state of the device and the given
 * arguments.
 *
 * @param {!Element} target The element on which to fire the event.
 * @param {bot.events.EventType} type MSPointer event type.
 * @param {bot.events.MSPointerArgs} args MSPointer event arguments.
 * @return {boolean} Whether the event fired successfully; false if cancelled.
 * @protected
 */
bot.Device.EventEmitter.prototype.fireMSPointerEvent = function(
    target, type, args) {
  return bot.events.fire(target, type, args);
};

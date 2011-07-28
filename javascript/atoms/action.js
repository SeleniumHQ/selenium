
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
goog.require('bot.dom');
goog.require('bot.events');
goog.require('bot.userAgent');
goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product.isVersion');


/**
 * Returns whether an element is in an interactable state: whether it is shown
 * to the user, ignoring its opacity, and whether it is enabled. If throws is
 * set to true, throws an exception if false instead of returning false.
 *
 * @param {!Element} element The element to check.
 * @param {boolean=} opt_throws Whether to throw an exception if false.
 * @return {boolean} Whether the element is interactable.
 * @see bot.dom.isShown.
 * @see bot.dom.isEnabled
 * @private
 */
bot.action.isInteractable_ = function(element, opt_throws) {
  var shown = bot.dom.isShown(element, /*ignoreOpacity=*/true);
  var interactable = shown && bot.dom.isEnabled(element);
  if (opt_throws && !shown) {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_VISIBLE,
        'Element is not currently visible and may not be manipulated');
  } else if (opt_throws && !interactable) {  // when not enabled
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'Element is not currently enabled and may not be manipulated');
  }
  return interactable;
};


/**
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element could be checked or selected.
 */
bot.action.isSelectable = function(element) {
  if (bot.dom.isElement(element, goog.dom.TagName.OPTION)) {
    return true;
  }

  if (bot.dom.isElement(element, goog.dom.TagName.INPUT)) {
    var type = element.type.toLowerCase();
    return type == 'checkbox' || type == 'radio';
  }

  return false;
};


/**
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element is checked or selected.
 */
bot.action.isSelected = function(element) {
  if (!bot.action.isSelectable(element)) {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_SELECTABLE,
        'Element is not selectable');
  }

  var propertyName = 'selected';
  var type = element.type && element.type.toLowerCase();
  if ('checkbox' == type || 'radio' == type) {
    propertyName = 'checked';
  }

  return !!bot.dom.getProperty(element, propertyName);
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

      if (selected == bot.action.isSelected(element)) {
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

  if (selected == bot.action.isSelected(element)) {
    return;  // Already in the desired state.
  }

  element.selected = selected;
  bot.events.fire(select, goog.events.EventType.CHANGE);
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
  bot.action.isInteractable_(element, true);

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
 * @see bot.action.isSelected
 */
bot.action.toggle = function(element) {
  bot.action.isInteractable_(element, true);
  if (bot.dom.isElement(element, goog.dom.TagName.INPUT) &&
      'radio' == element.type) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'You may not toggle a radio button');
  }
  bot.action.setSelected(element, !bot.action.isSelected(element));
  return bot.action.isSelected(element);
};


/**
 * Focuses on the given element if it is not already the active element. If
 * a focus change is required, the active element will be blurred before
 * focusing on the given element. This function will be a no-op if
 * focusing on the given element.
 * @param {!Element} element The element to focus on.
 * @param {Element=} opt_activeElement The currently active element. If
 *     provided, and different from {@code element}, the active element will
 *     be blurred before focusing on the element.
 * @see bot.dom.isFocusable
 */
bot.action.focusOnElement = function(element, opt_activeElement) {
  bot.action.isInteractable_(element, true);
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
  bot.action.isInteractable_(element, true);
  if (!bot.dom.isEditable(element)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'Element is readonly and may not be cleared.');
  }

  bot.action.focusOnElement(element);
  if (element.value) {
    element.value = '';
    bot.events.fire(element, goog.events.EventType.CHANGE);
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
 *   bot.action.type(element, 'ab', bot.Keyboard.Key.LEFT,
 *                 bot.Keyboard.Key.DELETE, bot.Keyboard.Key.SHIFT, 'cd');
 *
 * @param {!Element} element The element receiving the event.
 * @param {...(string|!bot.Keyboard.Key)} var_args Values to type on the
 *    element, either strings or members of bot.Keyboard.Key.
 */
bot.action.type = function(element, var_args) {
  bot.action.isInteractable_(element, true);
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
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element blocks js execution when mouse down
 *     fires on an option.
 * @private
 */
bot.action.blocksOnMouseDown_ = function(element) {
  var isFirefox3 = goog.userAgent.GECKO && !bot.userAgent.isVersion(4);

  if (goog.userAgent.WEBKIT || isFirefox3) {
    var tagName = element.tagName.toLowerCase();
    return ('option' == tagName || 'select' == tagName);
  }
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
  // TODO(jleyba): This should find first submittable element in the form and
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
 * @param {Node} element The element to check.
 * @return {boolean} Whether the element is a submit element in form.
 * @private
 */
bot.action.isFormSubmitElement_ = function(element) {
  if (bot.dom.isElement(element, goog.dom.TagName.INPUT)) {
    var type = element.type.toLowerCase();
    if (type == 'submit' || type == 'image') {
      return true;
    }
  }

  if (bot.dom.isElement(element, goog.dom.TagName.BUTTON)) {
    var buttonType = element.type.toLowerCase();
    if (buttonType == 'submit') {
      return true;
    }
  }
  return false;
};


/**
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element blocks js execution when mouse down
 *     fires on an option.
 * @private
 */
bot.action.blocksOnMouseDown_ = function(element) {
  var isFirefox3 = goog.userAgent.GECKO && !bot.userAgent.isVersion(4);

  if (goog.userAgent.WEBKIT || isFirefox3) {
    var tagName = element.tagName.toLowerCase();
    return ('option' == tagName || 'select' == tagName);
  }

  return false;
};


/**
 * @return {boolean} Whether synthesized events are trusted to update INPUTs.
 * @private
 */
bot.action.areSynthesisedEventsTrusted_ = function() {
  return !goog.userAgent.IE &&
      (goog.userAgent.GECKO &&
       bot.isFirefoxExtension() && bot.userAgent.isVersion(4));
};


/**
 * @return {boolean} Whether synthesized events can cause new windows to open.
 * @private
 */
bot.action.synthesisedEventsCanOpenJavascriptWindows_ = function() {
  return goog.userAgent.GECKO && bot.isFirefoxExtension();
};


/**
 * @return {boolean} Whether a synthesized event is expected to cause hash
 *     changes in the current URL.
 * @private
 */
bot.action.synthesisedEventsCanCauseHashChanges_ = function() {
  return bot.action.synthesisedEventsCanOpenJavascriptWindows_();
};


/**
 *
 *
 * @param {!Element} anchorElement The element to consider.
 * @return {!string} The URL that the document owning the link element is on.
 * @private
 */
bot.action.getSourceUrlOfLink_ = function(anchorElement) {
  var owner = goog.dom.getWindow(goog.dom.getOwnerDocument(anchorElement));
  return owner.location.href;
};


/**
 * @param {!Element} anchorElement The element to consider.
 * @return {!boolean} Whether navigating between the two URLs is only a change
 *     in hash, indicating that a new HTTP request should not be made for the
 *     navigation.
 * @private
 */
bot.action.isOnlyHashChange_ = function(anchorElement) {
  var sourceUrl = bot.action.getSourceUrlOfLink_(anchorElement);
  var destinationUrl =
      goog.Uri.resolve(sourceUrl, anchorElement.href).toString();
  return sourceUrl.split('#')[0] === destinationUrl.split('#')[0];
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
 * @param {goog.math.Coordinate=} opt_coords Mouse position related to the
 *   target.
 */
bot.action.click = function(element, opt_coords) {
  if (!bot.dom.isShown(element, true)) {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_VISIBLE,
        'Element is not currently visible and may not be manipulated');
  }
  var activeElement = bot.dom.getActiveElement(element);

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

  // TODO(user): Should we also handle clicking on an image map as well?
  // It's easy to link to the map, but non trivial to find out which area to
  // trigger.

  var parent = bot.dom.getParentElement(element);

  // Use string properties for indices so that the compiler does not
  // obfuscate them.
  var coords = {
    'x': size.width / 2,
    'y': size.height / 2,
    'button': undefined,
    'bubble': undefined,
    'alt': undefined,
    'control': undefined,
    'shift': undefined,
    'meta': undefined,
    'related': parent
  };

  var originalState = bot.action.isSelectable(element) &&
      bot.action.isSelected(element);

  // Abort the click sequence if any of the event listeners hide
  // the element. Open question: the remaining click events should be fired
  // somewhere, but where?
  bot.events.fire(
      element, goog.events.EventType.MOUSEOVER, {'related': parent});
  if (!bot.action.isInteractable_(element)) {
    return;
  }

  bot.events.fire(element, goog.events.EventType.MOUSEMOVE, coords);
  if (!bot.action.isInteractable_(element)) {
    return;
  }

  // Hilariously, if this is an option on a webkit-based browser, this mouse
  //down will cause  the select to open and block the remaining execution.
  var performFocus = true;
  if (bot.action.blocksOnMouseDown_(element)) {
    // TODO(simon): we should be doing better than this.
  } else {
    performFocus = bot.events.fire(
        element, goog.events.EventType.MOUSEDOWN, coords);
  }
  if (!bot.action.isInteractable_(element)) {
    return;
  }

  if (performFocus) {
    bot.action.focusOnElement(element, activeElement);
    if (!bot.action.isInteractable_(element)) {
      return;
    }
  }

  bot.events.fire(element, goog.events.EventType.MOUSEUP, coords);
  if (!bot.action.isInteractable_(element)) {
    return;
  }

  // bot.events.fire(element, 'click') can trigger all onclick events, but may
  // not follow links (FORM.action or A.href).
  //     TAG      IE   GECKO  WebKit Opera
  // A(href)      No    No     Yes    Yes
  // FORM(action) No    Yes    Yes    Yes
  var targetLink = null;
  var targetButton = null;
  var explicitFollow = (goog.userAgent.IE || goog.userAgent.GECKO) &&
      !bot.action.areSynthesisedEventsTrusted_();
  if (explicitFollow) {
    for (var e = element; e; e = e.parentNode) {
      if (bot.dom.isElement(e, goog.dom.TagName.A)) {
        targetLink = /**@type {!Element}*/ (e);
        break;
      } else if (bot.action.isFormSubmitElement_(e)) {
        targetButton = e;
        break;
      }
    }
  }

  // NOTE(wmyaoyao): Clicking on a form submit button is a little broken:
  // (1) When clicking a form submit button in IE, firing a click event or
  // calling Form.submit() will not by itself submit the form, so we call
  // Element.click() explicitly, but as a result, the coordinates of the click
  // event are not provided. Also, when clicking on an <input type=image>, the
  // coordinates click that are submitted with the form are always (0, 0).
  // (2) When clicking a form submit button in GECKO, while the coordinates of
  // the click event are correct, those submitted with the form are always (0,0)
  // .
  // TODO(user): See if either of these can be resolved, perhaps by adding
  // hidden form elements with the coordinates before the form is submitted.
  if (goog.userAgent.IE && targetButton) {
    targetButton.click();
    return;
  }

  var performDefault =
      bot.events.fire(element, goog.events.EventType.CLICK, coords);

  if (!performDefault) {
    return;
  }

  if (!bot.action.areSynthesisedEventsTrusted_()) {
    if (targetLink && targetLink.href &&
        !(targetLink.target &&
            bot.action.synthesisedEventsCanOpenJavascriptWindows_()) &&
        !(bot.action.isOnlyHashChange_(targetLink) &&
            bot.action.synthesisedEventsCanCauseHashChanges_())) {
      bot.action.followHref_(targetLink);
    }
  }

  if (bot.dom.isShown(element, /*ignoreOpacity=*/true) &&
      bot.action.isSelectable(element) &&
      bot.dom.isEnabled(element)) {
    // If this is a radio button, a second click should not disable it.
    if (element.tagName.toLowerCase() == 'input' && element.type &&
        element.type.toLowerCase() == 'radio' &&
        bot.action.isSelected(element)) {
      return;
    }

    var select = (/** @type {!Element} */
        goog.dom.getAncestor(element, bot.action.isSelectElement_));
    if (!select || select.multiple || !originalState) {
      bot.action.setSelected(element, !originalState);
    }
  }
};


/**
 * Explicitly follows the href of an anchor.
 *
 * @param {!Element} anchorElement An anchor element.
 * @private
 */
bot.action.followHref_ = function(anchorElement) {
  var targetHref = anchorElement.href;
  var owner = goog.dom.getWindow(goog.dom.getOwnerDocument(anchorElement));

  // IE7 and earlier incorrect resolve a relative href against the top window
  // location instead of the window to which the href is assigned. As a result,
  // we have to resolve the relative URL ourselves. We do not use Closure's
  // goog.Uri to resolve, because it incorrectly fails to support empty but
  // undefined query and fragment components and re-encodes the given url.
  if (goog.userAgent.IE && !goog.userAgent.isVersion(8)) {
    targetHref = bot.action.resolveUrl_(owner.location, targetHref);
  }

  if (anchorElement.target) {
    owner.open(targetHref, anchorElement.target);
  } else {
    owner.location.href = targetHref;
  }
};


/**
 * Regular expression for splitting up a URL into components.
 * @type {!RegExp}
 * @private
 */
bot.action.URL_REGEXP_ = new RegExp(
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
bot.action.resolveUrl_ = function(base, rel) {
  var m = rel.match(bot.action.URL_REGEXP_);
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


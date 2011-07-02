
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
goog.require('bot.dom');
goog.require('bot.events');
goog.require('bot.userAgent');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product.isVersion');
goog.require('goog.Uri');

/**
 * Determines if an element is shown on the page and may be manipulated by the
 * user. This computation does not factor in the element's opacity, as users
 * may click on invisible elements.
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element is visible and may be manipulated.
 * @see bot.dom.isShown.
 * @private
 */
bot.action.isShown_ = function(element) {
  return bot.dom.isShown(element, /*ignoreOpacity=*/true);
};


/**
 * Throws an error if an element is not currently displayed.
 * @param {!Element} element The element to check.
 * @see bot.dom.isShown
 * @private
 */
bot.action.checkShown_ = function(element) {
  if (!bot.action.isShown_(element)) {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_VISIBLE,
        'Element is not currently visible and may not be manipulated');
  }
};


/**
 * Throws an error if an element is not currently enabled.
 * @param {!Element} element The element to check.
 * @see bot.dom.isEnabled
 * @private
 */
bot.action.checkEnabled_ = function(element) {
  if (!bot.dom.isEnabled(element)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'Element is not currently enabled and may not be manipulated');
  }
};


/**
 * Throws an error if an element is not currently shown and enabled.
 * @param {!Element} element The element to check.
 * @see bot.dom.isShown
 * @see bot.dom.isEnabled
 * @private
 */
bot.action.checkShownAndEnabled_ = function(element) {
  if (!bot.action.isShown_(element)) {
    throw new bot.Error(bot.ErrorCode.ELEMENT_NOT_VISIBLE,
        'Element is not currently visible and may not be manipulated');
  }
  if (!bot.dom.isEnabled(element)) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'Element is not currently enabled and may not be manipulated');
  }
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
 * TODO(user): Add support for contentEditable and designMode elements.
 *
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element accepts user-typed text.
 */
bot.action.isTextual = function(element) {
  if (bot.dom.isElement(element, goog.dom.TagName.TEXTAREA)) {
    return true;
  }

  if (bot.dom.isElement(element, goog.dom.TagName.INPUT)) {
    var type = element.type.toLowerCase();
    return type == 'text' || type == 'password' ||
           type == 'email' || type == 'search';
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
 * Given an element, find the first ancestor which is a SELECT.
 * @param {!Element} child The start point of the search.
 * @return {Element} The SELECT element or null.
 * @private
 */
bot.action.getSelect_ = function(child) {
  return (/** @type {Element} */
      goog.dom.getAncestor(child, bot.action.isSelectElement_));
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
  var select = bot.action.getSelect_(element);

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
   bot.action.checkShownAndEnabled_(element);

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
 * the {@code element} is not eligible to receive focus.
 * @param {!Element} element The element to focus on.
 * @param {Element=} opt_activeElement The currently active element. If
 *     provided, and different from {@code element}, the active element will
 *     be blurred before focusing on the element.
 * @see bot.dom.isFocusable
 */
bot.action.focusOnElement = function(element, opt_activeElement) {
  if (!bot.dom.isFocusable(element)) {
    return;
  }

  var activeElement = opt_activeElement || bot.dom.getActiveElement(element);
  bot.action.checkShown_(element);

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
 * Clears a form field. If the element does not support being cleared, no action
 * is taken.
 * @param {!Element} element The element to clear.
 */
bot.action.clear = function(element) {
  if (!bot.action.isTextual(element)) {
    return;
  }

  if (bot.dom.getProperty(element, 'readOnly')) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'Element is readonly and may not be cleared.');
  }

  if (element.value != '') {
    bot.action.checkShown_(element);
    bot.action.checkEnabled_(element);
    bot.action.focusOnElement(element);

    element.value = '';
    bot.events.fire(element, goog.events.EventType.CHANGE);
  }

  // TODO(user): Support checkboxes
  // TODO(user): Fail out if clearing a file input
  // TODO(user): Support multiselect (option & optgroup & select)
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
  var form = goog.dom.getAncestor(element, bot.action.isForm_,
      /*includeNode=*/true);
  if (!form) {
    throw new bot.Error(bot.ErrorCode.INVALID_ELEMENT_STATE,
        'Element was not in a form, so could not submit.');
  }
  if (bot.events.fire((/**@type{!Element}*/form),
      goog.events.EventType.SUBMIT)) {
    form.submit();
  }
};


/**
 * @param {!Element} element The element to check.
 * @return Whether the element blocks js execution when mouse down fires on an
 *   option.
 * @private
 */
bot.action.blocksOnMouseDown_ = function(element) {
  var isFirefox3 = goog.userAgent.GECKO && !bot.userAgent.isVersion(4);

  if (goog.userAgent.WEBKIT || isFirefox3) {
    var tagName = element.tagName.toLowerCase();
    return ("option" == tagName || "select" == tagName);
  }
  
  return false;
}


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
 * <p/>[1] The "blur" and "focus" events are only generated if the
 * {@code elemnet} does not already have focus. The blur event will be
 * fired on the currently focused element, and the focus event on the
 * click target.
 *
 * @param {!Element} element The element to generate the click event on.
 *   The element must be shown on the page.
 */
bot.action.click = function(element) {
  bot.action.checkShown_(element);
  var activeElement = bot.dom.getActiveElement(element);

  if (goog.isFunction(element.scrollIntoView)) {
    element.scrollIntoView();
  }

  // Guaranteed to not return null since we've verified element is shown.
  var size = goog.style.getSize(element);

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
    'related': undefined
  };

  var originalState = bot.action.isSelectable(element) && bot.action.isSelected(element);

  // Abort the click sequence if any of the event listeners hide
  // the element. Open question: the remaining click events should be fired
  // somewhere, but where?
  bot.events.fire(element, goog.events.EventType.MOUSEOVER);
  if (!bot.action.isShown_(element)) {
    return;
  }

  bot.events.fire(element, goog.events.EventType.MOUSEMOVE, coords);
  if (!bot.action.isShown_(element)) {
    return;
  }

  // Hilariously, if this is an option on a webkit-based browser, this mouse
  //down will cause  the select to open and block the remaining execution.

  if (bot.action.blocksOnMouseDown_(element)) {
    // TODO(simon): we should be doing better than this.
  } else {
    bot.events.fire(element, goog.events.EventType.MOUSEDOWN, coords);
  }
  if (!bot.action.isShown_(element)) {
    return;
  }

  bot.action.focusOnElement(element, activeElement);
  if (!bot.action.isShown_(element)) {
    return;
  }

  bot.events.fire(element, goog.events.EventType.MOUSEUP, coords);
  if (!bot.action.isShown_(element)) {
    return;
  }

  var performDefault =
      bot.events.fire(element, goog.events.EventType.CLICK, coords);

  if ((goog.userAgent.IE || goog.userAgent.GECKO) &&
      !bot.isFirefoxExtension()) {
    if (performDefault) {
      var anchor = /**@type {Element}*/ (goog.dom.getAncestor(element,
          function(e) {
            return bot.dom.isElement(e, goog.dom.TagName.A);
          }, true));
  
      if (anchor && anchor.href) {
        bot.action.followHref_(anchor);
      }
    }
  }

  if (bot.action.isShown_(element) &&
      bot.action.isSelectable(element) &&
      bot.dom.isEnabled(element)) {
    // If this is a radio button, a second click should not disable it.
    if (element.tagName.toLowerCase() == "input" && element.type &&
        element.type.toLowerCase() == "radio" && bot.action.isSelected(element)) {
      return;
    }

    var select = bot.action.getSelect_(element);
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

  var destination = goog.Uri.resolve(owner.location.href, targetHref);

  if (anchorElement.target) {
    owner.open(destination, anchorElement.target);
  } else {
    owner.location.href = destination;
  }
};


/**
 * Go back in the browser history. The number of pages to go back can
 * optionally be specified and defaults to 1.
 *
 * @param {number=} opt_numPages Number of pages to go back.
 */
bot.action.back = function(opt_numPages) {
  var numPages = bot.action.checkNumPages_(opt_numPages);
  bot.getWindow().history.go(-numPages);
};


/**
 * Go forward in the browser history. The number of pages to go forward can
 * optionally be specified and defaults to 1.
 *
 * @param {number=} opt_numPages Number of pages to go forward.
 */
bot.action.forward = function(opt_numPages) {
  var numPages = bot.action.checkNumPages_(opt_numPages);
  bot.getWindow().history.go(numPages);
};


/**
 * @param {number=} opt_numPages Number of pages to move in history.
 * @return {number} Correct number of pages to move in history.
 */
bot.action.checkNumPages_ = function(opt_numPages) {
  var numPages = goog.isDef(opt_numPages) ? opt_numPages : 1;
  if (numPages <= 0) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'number of pages must be positive');
  }
  if (numPages >= bot.getWindow().history.length) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'number of pages must be less than the length of the browser history');
  }
  return numPages;
};

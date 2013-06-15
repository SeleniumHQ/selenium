// Copyright 2012 Software Freedom Conservancy
// Copyright 2010 WebDriver committers
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
 * @fileoverview DOM manipulation and querying routines.
 */

goog.provide('bot.dom');

goog.require('bot');
goog.require('bot.color');
goog.require('bot.locators.xpath');
goog.require('bot.userAgent');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.userAgent');


/**
 * Retrieves the active element for a node's owner document.
 * @param {!(Node|Window)} nodeOrWindow The node whose owner document to get
 *     the active element for.
 * @return {Element} The active element, if any.
 */
bot.dom.getActiveElement = function(nodeOrWindow) {
  return goog.dom.getActiveElement(
      goog.dom.getOwnerDocument(nodeOrWindow));
};


/**
 * Returns whether the given node is an element and, optionally, whether it has
 * the given tag name. If the tag name is not provided, returns true if the node
 * is an element, regardless of the tag name.h
 *
 * @param {Node} node The node to test.
 * @param {string=} opt_tagName Tag name to test the node for.
 * @return {boolean} Whether the node is an element with the given tag name.
 */
bot.dom.isElement = function(node, opt_tagName) {
  return !!node && node.nodeType == goog.dom.NodeType.ELEMENT &&
      (!opt_tagName || node.tagName.toUpperCase() == opt_tagName);
};


/**
 * Returns whether an element is in an interactable state: whether it is shown
 * to the user, ignoring its opacity, and whether it is enabled.
 *
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element is interactable.
 * @see bot.dom.isShown.
 * @see bot.dom.isEnabled
 */
bot.dom.isInteractable = function(element) {
  return bot.dom.isShown(element, /*ignoreOpacity=*/true) &&
      bot.dom.isEnabled(element) &&
      !bot.dom.hasPointerEventsDisabled_(element);
};


/**
 * @param {!Element} element Element.
 * @return {boolean} Whether element is set by the CSS pointer-events property
 *     not to be interactable.
 * @private
 */
bot.dom.hasPointerEventsDisabled_ = function(element) {
  if (goog.userAgent.IE || goog.userAgent.OPERA ||
      (goog.userAgent.GECKO && !bot.userAgent.isEngineVersion('1.9.2'))) {
    // Don't support pointer events
    return false;
  }
  return bot.dom.getEffectiveStyle(element, 'pointer-events') == 'none';
};


/**
 * Returns whether the element can be checked or selected.
 *
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element could be checked or selected.
 */
bot.dom.isSelectable = function(element) {
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
 * Returns whether the element is checked or selected.
 *
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element is checked or selected.
 */
bot.dom.isSelected = function(element) {
  if (!bot.dom.isSelectable(element)) {
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
 * List of the focusable fields, according to
 * http://www.w3.org/TR/html401/interact/scripts.html#adef-onfocus
 * @private {!Array.<!goog.dom.TagName>}
 * @const
 */
bot.dom.FOCUSABLE_FORM_FIELDS_ = [
  goog.dom.TagName.A,
  goog.dom.TagName.AREA,
  goog.dom.TagName.BUTTON,
  goog.dom.TagName.INPUT,
  goog.dom.TagName.LABEL,
  goog.dom.TagName.SELECT,
  goog.dom.TagName.TEXTAREA
];


/**
 * Returns whether a node is a focusable element.  An element may receive focus
 * if it is a form field or has a positive tabindex.
 * @param {!Element} element The node to test.
 * @return {boolean} Whether the node is focusable.
 */
bot.dom.isFocusable = function(element) {
  return goog.array.some(bot.dom.FOCUSABLE_FORM_FIELDS_, function(tagName) {
    return element.tagName.toUpperCase() == tagName;
  }) || (bot.dom.getAttribute(element, 'tabindex') != null &&
         Number(bot.dom.getProperty(element, 'tabIndex')) >= 0);
};


/**
 * Looks up the given property (not to be confused with an attribute) on the
 * given element.
 *
 * @param {!Element} element The element to use.
 * @param {string} propertyName The name of the property.
 * @return {*} The value of the property.
 */
bot.dom.getProperty = function(element, propertyName) {
  // When an <option>'s value attribute is not set, its value property should be
  // its text content, but IE < 8 does not adhere to that behavior, so fix it.
  // http://www.w3.org/TR/1999/REC-html401-19991224/interact/forms.html#adef-value-OPTION
  if (bot.userAgent.IE_DOC_PRE8 && propertyName == 'value' &&
      bot.dom.isElement(element, goog.dom.TagName.OPTION) &&
      goog.isNull(bot.dom.getAttribute(element, 'value'))) {
    return goog.dom.getRawTextContent(element);
  }
  return element[propertyName];
};


/**
 * Regex to split on semicolons, but not when enclosed in parens or quotes.
 * Helper for {@link bot.dom.standardizeStyleAttribute_}.
 * If the style attribute ends with a semicolon this will include an empty
 * string at the end of the array
 * @private {!RegExp}
 * @const
 */
bot.dom.SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS_REGEXP_ =
    new RegExp('[;]+' +
               '(?=(?:(?:[^"]*"){2})*[^"]*$)' +
               '(?=(?:(?:[^\']*\'){2})*[^\']*$)' +
               '(?=(?:[^()]*\\([^()]*\\))*[^()]*$)');


/**
 * Standardize a style attribute value, which includes:
 *  (1) converting all property names lowercase
 *  (2) ensuring it ends in a trailing semi-colon
 *  (3) removing empty style values (which only appear on Opera).
 * @param {string} value The style attribute value.
 * @return {string} The identical value, with the formatting rules described
 *     above applied.
 * @private
 */
bot.dom.standardizeStyleAttribute_ = function(value) {
  var styleArray = value.split(
      bot.dom.SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS_REGEXP_);
  var css = [];
  goog.array.forEach(styleArray, function(pair) {
    var i = pair.indexOf(':');
    if (i > 0) {
      var keyValue = [pair.slice(0, i), pair.slice(i + 1)];
      if (keyValue.length == 2) {
        css.push(keyValue[0].toLowerCase(), ':', keyValue[1], ';');
      }
    }
  });
  css = css.join('');
  css = css.charAt(css.length - 1) == ';' ? css : css + ';';
  return goog.userAgent.OPERA ? css.replace(/\w+:;/g, '') : css;
};


/**
 * Get the user-specified value of the given attribute of the element, or null
 * if the attribute is not present.
 *
 * <p>For boolean attributes such as "selected" or "checked", this method
 * returns the value of element.getAttribute(attributeName) cast to a String
 * when attribute is present. For modern browsers, this will be the string the
 * attribute is given in the HTML, but for IE8 it will be the name of the
 * attribute, and for IE7, it will be the string "true". To test whether a
 * boolean attribute is present, test whether the return value is non-null, the
 * same as one would for non-boolean attributes. Specifically, do *not* test
 * whether the boolean evaluation of the return value is true, because the value
 * of a boolean attribute that is present will often be the empty string.
 *
 * <p>For the style attribute, it standardizes the value by lower-casing the
 * property names and always including a trailing semi-colon.
 *
 * @param {!Element} element The element to use.
 * @param {string} attributeName The name of the attribute to return.
 * @return {?string} The value of the attribute or "null" if entirely missing.
 */
bot.dom.getAttribute = function(element, attributeName) {
  attributeName = attributeName.toLowerCase();

  // The style attribute should be a css text string that includes only what
  // the HTML element specifies itself (excluding what is inherited from parent
  // elements or style sheets). We standardize the format of this string via the
  // standardizeStyleAttribute method.
  if (attributeName == 'style') {
    return bot.dom.standardizeStyleAttribute_(element.style.cssText);
  }

  // In IE doc mode < 8, the "value" attribute of an <input> is only accessible
  // as a property.
  if (bot.userAgent.IE_DOC_PRE8 && attributeName == 'value' &&
      bot.dom.isElement(element, goog.dom.TagName.INPUT)) {
    return element['value'];
  }

  // In IE < 9, element.getAttributeNode will return null for some boolean
  // attributes that are present, such as the selected attribute on <option>
  // elements. This if-statement is sufficient if these cases are restricted
  // to boolean attributes whose reflected property names are all lowercase
  // (as attributeName is by this point), like "selected". We have not
  // found a boolean attribute for which this does not work.
  if (bot.userAgent.IE_DOC_PRE9 && element[attributeName] === true) {
    return String(element.getAttribute(attributeName));
  }

  // When the attribute is not present, either attr will be null or
  // attr.specified will be false.
  var attr = element.getAttributeNode(attributeName);
  return (attr && attr.specified) ? attr.value : null;
};


/**
 * List of elements that support the "disabled" attribute, as defined by the
 * HTML 4.01 specification.
 * @private {!Array.<goog.dom.TagName>}
 * @const
 * @see http://www.w3.org/TR/html401/interact/forms.html#h-17.12.1
 */
bot.dom.DISABLED_ATTRIBUTE_SUPPORTED_ = [
  goog.dom.TagName.BUTTON,
  goog.dom.TagName.INPUT,
  goog.dom.TagName.OPTGROUP,
  goog.dom.TagName.OPTION,
  goog.dom.TagName.SELECT,
  goog.dom.TagName.TEXTAREA
];


/**
 * Determines if an element is enabled. An element is considered enabled if it
 * does not support the "disabled" attribute, or if it is not disabled.
 * @param {!Element} el The element to test.
 * @return {boolean} Whether the element is enabled.
 */
bot.dom.isEnabled = function(el) {
  var tagName = el.tagName.toUpperCase();
  if (!goog.array.contains(bot.dom.DISABLED_ATTRIBUTE_SUPPORTED_, tagName)) {
    return true;
  }

  if (bot.dom.getProperty(el, 'disabled')) {
    return false;
  }

  // The element is not explicitly disabled, but if it is an OPTION or OPTGROUP,
  // we must test if it inherits its state from a parent.
  if (el.parentNode &&
      el.parentNode.nodeType == goog.dom.NodeType.ELEMENT &&
      goog.dom.TagName.OPTGROUP == tagName ||
      goog.dom.TagName.OPTION == tagName) {
    return bot.dom.isEnabled(/**@type{!Element}*/ (el.parentNode));
  }

  // Is there an ancestor of the current element that is a disabled fieldset
  // and whose child is also an ancestor-or-self of the current element but is
  // not the first legend child of the fieldset. If so then the element is
  // disabled.
  return !goog.dom.getAncestor(el, function(e) {
    var parent = e.parentNode;

    if (parent &&
        bot.dom.isElement(parent, goog.dom.TagName.FIELDSET) &&
        bot.dom.getProperty(/** @type {!Element} */ (parent), 'disabled')) {
      if (!bot.dom.isElement(e, goog.dom.TagName.LEGEND)) {
        return true;
      }

      var sibling = e;
      // Are there any previous legend siblings? If so then we are not the
      // first and the element is disabled
      while (sibling = goog.dom.getPreviousElementSibling(sibling)) {
        if (bot.dom.isElement(sibling, goog.dom.TagName.LEGEND)) {
          return true;
        }
      }
    }
    return false;
  }, true);
};


/**
 * List of input types that create text fields.
 * @private {!Array.<string>}
 * @const
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#attr-input-type
 */
bot.dom.TEXTUAL_INPUT_TYPES_ = [
  'text',
  'search',
  'tel',
  'url',
  'email',
  'password',
  'number'
];


/**
 * TODO(user): Add support for designMode elements.
 *
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element accepts user-typed text.
 */
bot.dom.isTextual = function(element) {
  if (bot.dom.isElement(element, goog.dom.TagName.TEXTAREA)) {
    return true;
  }

  if (bot.dom.isElement(element, goog.dom.TagName.INPUT)) {
    var type = element.type.toLowerCase();
    return goog.array.contains(bot.dom.TEXTUAL_INPUT_TYPES_, type);
  }

  if (bot.dom.isContentEditable(element)) {
    return true;
  }

  return false;
};


/**
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element is contentEditable.
 */
bot.dom.isContentEditable = function(element) {
  // Check if browser supports contentEditable.
  if (!goog.isDef(element['contentEditable'])) {
    return false;
  }

  // Checking the element's isContentEditable property is preferred except for
  // IE where that property is not reliable on IE versions 7, 8, and 9.
  if (!goog.userAgent.IE && goog.isDef(element['isContentEditable'])) {
    return element.isContentEditable;
  }

  // For IE and for browsers where contentEditable is supported but
  // isContentEditable is not, traverse up the ancestors:
  function legacyIsContentEditable(e) {
    if (e.contentEditable == 'inherit') {
      var parent = bot.dom.getParentElement(e);
      return parent ? legacyIsContentEditable(parent) : false;
    } else {
      return e.contentEditable == 'true';
    }
  }
  return legacyIsContentEditable(element);
};


/**
 * TODO(user): Merge isTextual into this function and move to bot.dom.
 * For Puppet, requires adding support to getVisibleText for grabbing
 * text from all textual elements.
 *
 * Whether the element may contain text the user can edit.
 *
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the element accepts user-typed text.
 */
bot.dom.isEditable = function(element) {
  return bot.dom.isTextual(element) &&
      !bot.dom.getProperty(element, 'readOnly');
};


/**
 * Returns the parent element of the given node, or null. This is required
 * because the parent node may not be another element.
 *
 * @param {!Node} node The node who's parent is desired.
 * @return {Element} The parent element, if available, null otherwise.
 */
bot.dom.getParentElement = function(node) {
  var elem = node.parentNode;

  while (elem &&
         elem.nodeType != goog.dom.NodeType.ELEMENT &&
         elem.nodeType != goog.dom.NodeType.DOCUMENT &&
         elem.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    elem = elem.parentNode;
  }
  return /** @type {Element} */ (bot.dom.isElement(elem) ? elem : null);
};


/**
 * Retrieves an explicitly-set, inline style value of an element. This returns
 * '' if there isn't a style attribute on the element or if this style property
 * has not been explicitly set in script.
 *
 * @param {!Element} elem Element to get the style value from.
 * @param {string} styleName Name of the style property in selector-case.
 * @return {string} The value of the style property.
 */
bot.dom.getInlineStyle = function(elem, styleName) {
  return goog.style.getStyle(elem, styleName);
};


/**
 * Retrieves the implicitly-set, effective style of an element, or null if it is
 * unknown. It returns the computed style where available; otherwise it looks
 * up the DOM tree for the first style value not equal to 'inherit,' using the
 * IE currentStyle of each node if available, and otherwise the inline style.
 * Since the computed, current, and inline styles can be different, the return
 * value of this function is not always consistent across browsers. See:
 * http://code.google.com/p/doctype/wiki/ArticleComputedStyleVsCascadedStyle
 *
 * @param {!Element} elem Element to get the style value from.
 * @param {string} propertyName Name of the CSS property in selector-case.
 * @return {?string} The value of the style property, or null.
 */
bot.dom.getEffectiveStyle = function(elem, propertyName) {
  var styleName = goog.string.toCamelCase(propertyName);
  if (styleName == 'float' ||
      styleName == 'cssFloat' ||
      styleName == 'styleFloat') {
    styleName = bot.userAgent.IE_DOC_PRE9 ? 'styleFloat' : 'cssFloat';
  }
  var style = goog.style.getComputedStyle(elem, styleName) ||
      bot.dom.getCascadedStyle_(elem, styleName);
  if (style === null) {
    return null;
  }
  return bot.color.standardizeColor(propertyName, style);
};


/**
 * Looks up the DOM tree for the first style value not equal to 'inherit,' using
 * the currentStyle of each node if available, and otherwise the inline style.
 *
 * @param {!Element} elem Element to get the style value from.
 * @param {string} styleName CSS style property in camelCase.
 * @return {?string} The value of the style property, or null.
 * @private
 */
bot.dom.getCascadedStyle_ = function(elem, styleName) {
  var style = elem.currentStyle || elem.style;
  var value = style[styleName];
  if (!goog.isDef(value) && goog.isFunction(style['getPropertyValue'])) {
    value = style['getPropertyValue'](styleName);
  }

  if (value != 'inherit') {
    return goog.isDef(value) ? value : null;
  }
  var parent = bot.dom.getParentElement(elem);
  return parent ? bot.dom.getCascadedStyle_(parent, styleName) : null;
};


/**
 * Determines whether an element is what a user would call "shown". This means
 * that the element is shown in the viewport of the browser, and only has
 * height and width greater than 0px, and that its visibility is not "hidden"
 * and its display property is not "none".
 * Options and Optgroup elements are treated as special cases: they are
 * considered shown iff they have a enclosing select element that is shown.
 *
 * @param {!Element} elem The element to consider.
 * @param {boolean=} opt_ignoreOpacity Whether to ignore the element's opacity
 *     when determining whether it is shown; defaults to false.
 * @return {boolean} Whether or not the element is visible.
 */
bot.dom.isShown = function(elem, opt_ignoreOpacity) {
  if (!bot.dom.isElement(elem)) {
    throw new Error('Argument to isShown must be of type Element');
  }

  // Option or optgroup is shown iff enclosing select is shown (ignoring the
  // select's opacity).
  if (bot.dom.isElement(elem, goog.dom.TagName.OPTION) ||
      bot.dom.isElement(elem, goog.dom.TagName.OPTGROUP)) {
    var select = /**@type {Element}*/ (goog.dom.getAncestor(elem, function(e) {
      return bot.dom.isElement(e, goog.dom.TagName.SELECT);
    }));
    return !!select && bot.dom.isShown(select, /*ignoreOpacity=*/true);
  }

  // Image map elements are shown if image that uses it is shown, and
  // the area of the element is positive.
  var imageMap = bot.dom.maybeFindImageMap_(elem);
  if (imageMap) {
    return !!imageMap.image &&
           imageMap.rect.width > 0 && imageMap.rect.height > 0 &&
           bot.dom.isShown(imageMap.image, opt_ignoreOpacity);
  }

  // Any hidden input is not shown.
  if (bot.dom.isElement(elem, goog.dom.TagName.INPUT) &&
      elem.type.toLowerCase() == 'hidden') {
    return false;
  }

  // Any NOSCRIPT element is not shown.
  if (bot.dom.isElement(elem, goog.dom.TagName.NOSCRIPT)) {
    return false;
  }

  // Any element with hidden visibility is not shown.
  if (bot.dom.getEffectiveStyle(elem, 'visibility') == 'hidden') {
    return false;
  }

  // Any element with a display style equal to 'none' or that has an ancestor
  // with display style equal to 'none' is not shown.
  function displayed(e) {
    if (bot.dom.getEffectiveStyle(e, 'display') == 'none') {
      return false;
    }
    var parent = bot.dom.getParentElement(e);
    return !parent || displayed(parent);
  }
  if (!displayed(elem)) {
    return false;
  }

  // Any transparent element is not shown.
  if (!opt_ignoreOpacity && bot.dom.getOpacity(elem) == 0) {
    return false;
  }

  // Any element without positive size dimensions is not shown.
  function positiveSize(e) {
    var rect = bot.dom.getClientRect(e);
    if (rect.height > 0 && rect.width > 0) {
      return true;
    }
    // A vertical or horizontal SVG Path element will report zero width or
    // height but is "shown" if it has a positive stroke-width.
    if (bot.dom.isElement(e, 'PATH') && (rect.height > 0 || rect.width > 0)) {
      var strokeWidth = bot.dom.getEffectiveStyle(e, 'stroke-width');
      return !!strokeWidth && (parseInt(strokeWidth, 10) > 0);
    }
    // Zero-sized elements should still be considered to have positive size
    // if they have a child element or text node with positive size, unless
    // the element has an 'overflow' style of 'hidden'.
    return bot.dom.getEffectiveStyle(e, 'overflow') != 'hidden' &&
        goog.array.some(e.childNodes, function(n) {
          return n.nodeType == goog.dom.NodeType.TEXT ||
                 (bot.dom.isElement(n) && positiveSize(n));
        });
  }
  if (!positiveSize(elem)) {
    return false;
  }

  // Elements that are hidden by overflow are not shown.
  if (bot.dom.getOverflowState(elem) == bot.dom.OverflowState.HIDDEN) {
    return false;
  }

  function isTransformHiding(e) {
    var transform = bot.dom.getEffectiveStyle(e, '-o-transform') ||
                    bot.dom.getEffectiveStyle(e, '-webkit-transform') ||
                    bot.dom.getEffectiveStyle(e, '-ms-transform') ||
                    bot.dom.getEffectiveStyle(e, '-moz-transform') ||
                    bot.dom.getEffectiveStyle(e, 'transform');

    // Not all browsers know what a transform is so if we have a returned value
    // lets carry on checking up the tree just in case. If we ask for the
    // transform matrix and look at the details there it will return the centre
    // of the element
    if (transform && transform !== "none") {
      var locOfElement = goog.style.getClientPosition(e);
      var rect = bot.dom.getClientRect(e);
      if ((locOfElement.x + (rect.width)) >= 0 &&
          (locOfElement.y + (rect.height)) >= 0){
        return true;
      } else {
        return false;
      }
    } else {
      var parent = bot.dom.getParentElement(e);
      return !parent || isTransformHiding(parent);
    }
  }
  return isTransformHiding(elem);
};


/**
 * The kind of overflow area in which an element may be located. NONE if it does
 * not overflow any ancestor element; HIDDEN if it overflows and cannot be
 * scrolled into view; SCROLL if it overflows but can be scrolled into view.
 *
 * @enum {string}
 */
bot.dom.OverflowState = {
  NONE: 'none',
  HIDDEN: 'hidden',
  SCROLL: 'scroll'
};


/**
 * Returns the overflow state of the given element.
 *
 * @param {!Element} elem Element.
 * @return {bot.dom.OverflowState} Overflow state of the element.
 */
bot.dom.getOverflowState = function(elem) {
  var elemRect = bot.dom.getClientRect(elem);
  var ownerDoc = goog.dom.getOwnerDocument(elem);
  var htmlElem = ownerDoc.documentElement;
  var bodyElem = ownerDoc.body;
  var htmlOverflowStyle = bot.dom.getEffectiveStyle(htmlElem, 'overflow');

  // Return the x and y overflow styles for the given element.
  function getOverflowStyles(e) {
    // When the <html> element has an overflow style of 'visible', it assumes
    // the overflow style of the body, and the body is really overflow:visible.
    var overflowElem = e;
    if (htmlOverflowStyle == 'visible') {
      if (e == htmlElem) {
        overflowElem = bodyElem;
      } else if (e == bodyElem) {
        return {x: 'visible', y: 'visible'};
      }
    }
    var overflow = {
      x: bot.dom.getEffectiveStyle(overflowElem, 'overflow-x'),
      y: bot.dom.getEffectiveStyle(overflowElem, 'overflow-y')
    };
    // The <html> element is really only ever 'auto' or 'hidden'. CSS cannot
    // force a scrollbar (so no genuine 'scroll' style) and it cannot force the
    // viewport to expand to the content (so no genuine 'visible' style).
    if (e == htmlElem) {
      overflow.x = overflow.x == 'hidden' ? 'hidden' : 'auto';
      overflow.y = overflow.y == 'hidden' ? 'hidden' : 'auto';
    }
    return overflow;
  }

  // Return the closest ancestor that the given element may overflow.
  function getOverflowParent(e) {
    var position = bot.dom.getEffectiveStyle(e, 'position');
    if (position == 'fixed') {
      // Fixed-position element may only overflow the viewport.
      return htmlElem;
    } else {
      var parent = bot.dom.getParentElement(e);
      while (parent && !canBeOverflowed(parent)) {
        parent = bot.dom.getParentElement(parent);
      }
      return parent;
    }

    function canBeOverflowed(container) {
      // The HTML element can always be overflowed.
      if (container == htmlElem) {
        return true;
      }
      // An element cannot overflow an element with an inline display style.
      var containerDisplay = /** @type {string} */ (
          bot.dom.getEffectiveStyle(container, 'display'));
      if (goog.string.startsWith(containerDisplay, 'inline')) {
        return false;
      }
      // An absolute-positioned element cannot overflow a static-positioned one.
      if (position == 'absolute' &&
          bot.dom.getEffectiveStyle(container, 'position') == 'static') {
        return false;
      }
      return true;
    }
  }

  // Check if the element overflows any ancestor element.
  for (var container = getOverflowParent(elem);
       !!container;
       container = getOverflowParent(container)) {
    var containerRect = bot.dom.getClientRect(container);
    var containerOverflow = getOverflowStyles(container);

    // Check "overflow": if an element is to the right or below a container
    var overflowsX = elemRect.left >= containerRect.left + containerRect.width;
    var overflowsY = elemRect.top >= containerRect.top + containerRect.height;
    if ((overflowsX && containerOverflow.x == 'hidden') ||
        (overflowsY && containerOverflow.y == 'hidden')) {
      // The element is definitely hidden by overflow.
      return bot.dom.OverflowState.HIDDEN;
    } else if ((overflowsX && containerOverflow.x != 'visible') ||
               (overflowsY && containerOverflow.y != 'visible')) {
      // If the element can be scrolled into view of the parent, it has a scroll
      // state; unless the parent itself is entirely hidden by overflow, in
      // which it is also hidden by overflow.
      var containerState = bot.dom.getOverflowState(container);
      return containerState == bot.dom.OverflowState.HIDDEN ?
          bot.dom.OverflowState.HIDDEN : bot.dom.OverflowState.SCROLL;
    }
  }

  // Does not overflow any ancestor.
  return bot.dom.OverflowState.NONE;
};


/**
 * Gets the client rectangle of the DOM element. It often returns the same value
 * as Element.getBoundingClientRect, but is "fixed" for various scenarios:
 * 1. Like goog.style.getClientPosition, it adjusts for the inset border in IE.
 * 2. Gets a rect for <map>'s and <area>'s relative to the image using them.
 * 3. Gets a rect for SVG elements representing their true bounding box.
 *
 * @param {!Element} elem The element to use.
 * @return {!goog.math.Rect} The interaction box of the element.
 */
bot.dom.getClientRect = function(elem) {
  var imageMap = bot.dom.maybeFindImageMap_(elem);
  if (imageMap) {
    return imageMap.rect;
  } else if (goog.isFunction(elem['getBBox'])) {
    // Special case for SVG elements.
    try {
      var svgRect = elem['getBBox']();
      return new goog.math.Rect(
          svgRect.x, svgRect.y, svgRect.width, svgRect.height);
    } catch (err) {
      if (goog.userAgent.GECKO &&
          (err.name === "NS_ERROR_FAILURE" ||
           goog.string.contains(err.message,
               'Component returned failure code: 0x80004005'))) {
        // Working around https://bugzilla.mozilla.org/show_bug.cgi?id=612118
        return new goog.math.Rect(0, 0, 0, 0);
      } else {
        throw err;
      }
    }
  } else if (bot.dom.isElement(elem, goog.dom.TagName.HTML)) {
    // Define the client rect of the <html> element to be the viewport.
    var doc = goog.dom.getOwnerDocument(elem);
    var viewportSize = goog.dom.getViewportSize(goog.dom.getWindow(doc));
    return new goog.math.Rect(0, 0, viewportSize.width, viewportSize.height);
  } else {
    // getClientPosition accounts for inset borders on IE.
    var pos = goog.style.getClientPosition(elem);
    var offsetWidth = elem.offsetWidth;
    var offsetHeight = elem.offsetHeight;
    // Have to duplicate some code from Closure here, because it doesn't
    // make goog.style.getSizeWithDisplay_ or getBoundingRect_ public.
    if (goog.userAgent.WEBKIT && !offsetWidth && !offsetHeight &&
        elem.getBoundingClientRect) {
      // Fall back to calling getBoundingClientRect when offsetWidth or
      // offsetHeight are undefined or are zero in WebKit browsers. This
      // ensures we return the right size for <div>'s with display:inline.
      var clientRect = elem.getBoundingClientRect();
      offsetWidth = clientRect.right - clientRect.left;
      offsetHeight = clientRect.bottom - clientRect.top;
    }
    return new goog.math.Rect(pos.x, pos.y, offsetWidth, offsetHeight);
  }
};


/**
 * If given a <map> or <area> element, finds the corresponding image and client
 * rectangle of the element; otherwise returns null. The return value is an
 * object with 'image' and 'rect' properties. When no image uses the given
 * element, the returned rectangle is present but has zero size.
 *
 * @param {!Element} elem Element to test.
 * @return {?{image: Element, rect: !goog.math.Rect}} Image and rectangle.
 * @private
 */
bot.dom.maybeFindImageMap_ = function(elem) {
  // If not a <map> or <area>, return null indicating so.
  var isMap = bot.dom.isElement(elem, goog.dom.TagName.MAP);
  if (!isMap && !bot.dom.isElement(elem, goog.dom.TagName.AREA)) {
    return null;
  }

  // Get the <map> associated with this element, or null if none.
  var map = isMap ? elem :
      (bot.dom.isElement(elem.parentNode, goog.dom.TagName.MAP) ?
          elem.parentNode : null);

  var image = null, rect = null;
  if (map && map.name) {
    var mapDoc = goog.dom.getOwnerDocument(map);

    // The "//*" XPath syntax can confuse the closure compiler, so we use
    // the "/descendant::*" syntax instead.
    // TODO(user): Try to find a reproducible case for the compiler bug.
    // TODO(user): Restrict to applet, img, input:image, and object nodes.
    var imageXpath = '/descendant::*[@usemap = "#' + map.name + '"]';

    // TODO(user): Break dependency of bot.locators on bot.dom,
    // so bot.locators.findElement can be called here instead.
    image = bot.locators.xpath.single(imageXpath, mapDoc);

    if (image) {
      rect = bot.dom.getClientRect(image);
      if (!isMap && elem.shape.toLowerCase() != 'default') {
        // Shift and crop the relative area rectangle to the map.
        var relRect = bot.dom.getAreaRelativeRect_(elem);
        var relX = Math.min(Math.max(relRect.left, 0), rect.width);
        var relY = Math.min(Math.max(relRect.top, 0), rect.height);
        var w = Math.min(relRect.width, rect.width - relX);
        var h = Math.min(relRect.height, rect.height - relY);
        rect = new goog.math.Rect(relX + rect.left, relY + rect.top, w, h);
      }
    }
  }

  return {image: image, rect: rect || new goog.math.Rect(0, 0, 0, 0)};
};


/**
 * Returns the bounding box around an <area> element relative to its enclosing
 * <map>. Does not apply to <area> elements with shape=='default'.
 *
 * @param {!Element} area Area element.
 * @return {!goog.math.Rect} Bounding box of the area element.
 * @private
 */
bot.dom.getAreaRelativeRect_ = function(area) {
  var shape = area.shape.toLowerCase();
  var coords = area.coords.split(',');
  if (shape == 'rect' && coords.length == 4) {
    var x = coords[0], y = coords[1];
    return new goog.math.Rect(x, y, coords[2] - x, coords[3] - y);
  } else if (shape == 'circle' && coords.length == 3) {
    var centerX = coords[0], centerY = coords[1], radius = coords[2];
    return new goog.math.Rect(centerX - radius, centerY - radius,
                              2 * radius, 2 * radius);
  } else if (shape == 'poly' && coords.length > 2) {
    var minX = coords[0], minY = coords[1], maxX = minX, maxY = minY;
    for (var i = 2; i + 1 < coords.length; i += 2) {
      minX = Math.min(minX, coords[i]);
      maxX = Math.max(maxX, coords[i]);
      minY = Math.min(minY, coords[i + 1]);
      maxY = Math.max(maxY, coords[i + 1]);
    }
    return new goog.math.Rect(minX, minY, maxX - minX, maxY - minY);
  }
  return new goog.math.Rect(0, 0, 0, 0);
};


/**
 * Checks whether the element is currently scrolled into the parent's overflow
 * region, such that the offset given, relative to the top-left corner of the
 * element, is currently in the overflow region.
 *
 * @param {!Element} element The element to check.
 * @param {!goog.math.Coordinate=} opt_coords Coordinate in the element,
 *     relative to the top-left corner of the element, to check. If none are
 *     specified, checks that the center of the element is in in the overflow.
 * @return {boolean} Whether the coordinates specified, relative to the element,
 *     are scrolled in the parent overflow.
 */
bot.dom.isInParentOverflow = function(element, opt_coords) {
  var parent = goog.style.getOffsetParent(element);
  var parentNode = goog.userAgent.GECKO || goog.userAgent.IE ||
      goog.userAgent.OPERA ? bot.dom.getParentElement(element) : parent;

  // Gecko will skip the BODY tag when calling getOffsetParent. However, the
  // combination of the overflow values on the BODY _and_ HTML tags determine
  // whether scroll bars are shown, so we need to guarantee that both values
  // are checked.
  if ((goog.userAgent.GECKO || goog.userAgent.IE || goog.userAgent.OPERA) &&
      bot.dom.isElement(parentNode, goog.dom.TagName.BODY)) {
    parent = parentNode;
  }

  if (parent && (bot.dom.getEffectiveStyle(parent, 'overflow') == 'scroll' ||
                 bot.dom.getEffectiveStyle(parent, 'overflow') == 'auto')) {
    var parentRect = bot.dom.getClientRect(parent);
    var elementRect = bot.dom.getClientRect(element);
    var offsetX, offsetY;
    if (opt_coords) {
      offsetX = opt_coords.x;
      offsetY = opt_coords.y;
    } else {
      offsetX = elementRect.width / 2;
      offsetY = elementRect.height / 2;
    }
    var elementPointX = elementRect.left + offsetX;
    var elementPointY = elementRect.top + offsetY;
    if (elementPointX >= parentRect.left + parentRect.width) {
      return true;
    }
    if (elementPointX <= parentRect.left) {
      return true;
    }
    if (elementPointY >= parentRect.top + parentRect.height) {
      return true;
    }
    if (elementPointY <= parentRect.top) {
      return true;
    }
    return bot.dom.isInParentOverflow(parent);
  }
  return false;
};


/**
 * Trims leading and trailing whitespace from strings, leaving non-breaking
 * space characters in place.
 *
 * @param {string} str The string to trim.
 * @return {string} str without any leading or trailing whitespace characters
 *     except non-breaking spaces.
 * @private
 */
bot.dom.trimExcludingNonBreakingSpaceCharacters_ = function(str) {
  return str.replace(/^[^\S\xa0]+|[^\S\xa0]+$/g, '');
};


/**
 * @param {!Element} elem The element to consider.
 * @return {string} visible text.
 */
bot.dom.getVisibleText = function(elem) {
  var lines = [];
  bot.dom.appendVisibleTextLinesFromElement_(elem, lines);
  lines = goog.array.map(
      lines,
      bot.dom.trimExcludingNonBreakingSpaceCharacters_);
  var joined = lines.join('\n');
  var trimmed = bot.dom.trimExcludingNonBreakingSpaceCharacters_(joined);

  // Replace non-breakable spaces with regular ones.
  return trimmed.replace(/\xa0/g, ' ');
};


/**
 * @param {!Element} elem Element.
 * @param {!Array.<string>} lines Accumulated visible lines of text.
 * @private
 */
bot.dom.appendVisibleTextLinesFromElement_ = function(elem, lines) {
  function currLine() {
    return /** @type {string|undefined} */ (goog.array.peek(lines)) || '';
  }

  // TODO(user): Add case here for textual form elements.
  if (bot.dom.isElement(elem, goog.dom.TagName.BR)) {
    lines.push('');
  } else {
    // TODO: properly handle display:run-in
    var isTD = bot.dom.isElement(elem, goog.dom.TagName.TD);
    var display = bot.dom.getEffectiveStyle(elem, 'display');
    // On some browsers, table cells incorrectly show up with block styles.
    var isBlock = !isTD &&
        !goog.array.contains(bot.dom.INLINE_DISPLAY_BOXES_, display);

    // Add a newline before block elems when there is text on the current line,
    // except when the previous sibling has a display: run-in.
    // Also, do not run-in the previous sibling if this element is floated.

    var previousElementSibling = goog.dom.getPreviousElementSibling(elem);
    var prevDisplay = (previousElementSibling) ?
        bot.dom.getEffectiveStyle(previousElementSibling, 'display') : '';
    // TODO(dawagner): getEffectiveStyle should mask this for us
    var thisFloat = bot.dom.getEffectiveStyle(elem, 'float') ||
        bot.dom.getEffectiveStyle(elem, 'cssFloat') ||
        bot.dom.getEffectiveStyle(elem, 'styleFloat');
    var runIntoThis = prevDisplay == 'run-in' && thisFloat == 'none';
    if (isBlock && !runIntoThis && !goog.string.isEmpty(currLine())) {
      lines.push('');
    }

    // This element may be considered unshown, but have a child that is
    // explicitly shown (e.g. this element has "visibility:hidden").
    // Nevertheless, any text nodes that are direct descendants of this
    // element will not contribute to the visible text.
    var shown = bot.dom.isShown(elem);

    // All text nodes that are children of this element need to know the
    // effective "white-space" and "text-transform" styles to properly
    // compute their contribution to visible text. Compute these values once.
    var whitespace = null, textTransform = null;
    if (shown) {
      whitespace = bot.dom.getEffectiveStyle(elem, 'white-space');
      textTransform = bot.dom.getEffectiveStyle(elem, 'text-transform');
    }

    goog.array.forEach(elem.childNodes, function(node) {
      if (node.nodeType == goog.dom.NodeType.TEXT && shown) {
        var textNode = /** @type {!Text} */ (node);
        bot.dom.appendVisibleTextLinesFromTextNode_(textNode, lines,
            whitespace, textTransform);
      } else if (bot.dom.isElement(node)) {
        var castElem = /** @type {!Element} */ (node);
        bot.dom.appendVisibleTextLinesFromElement_(castElem, lines);
      }
    });

    var line = currLine();

    // Here we differ from standard innerText implementations (if there were
    // such a thing). Usually, table cells are separated by a tab, but we
    // normalize tabs into single spaces.
    if ((isTD || display == 'table-cell') && line &&
        !goog.string.endsWith(line, ' ')) {
      lines[lines.length - 1] += ' ';
    }

    // Add a newline after block elems when there is text on the current line,
    // and the current element isn't marked as run-in.
    if (isBlock && display != 'run-in' && !goog.string.isEmpty(line)) {
      lines.push('');
    }
  }
};


/**
 * Elements with one of these effective "display" styles are treated as inline
 * display boxes and have their visible text appended to the current line.
 * @private {!Array.<string>}
 * @const
 */
bot.dom.INLINE_DISPLAY_BOXES_ = [
  'inline',
  'inline-block',
  'inline-table',
  'none',
  'table-cell',
  'table-column',
  'table-column-group'
];


/**
 * @param {!Text} textNode Text node.
 * @param {!Array.<string>} lines Accumulated visible lines of text.
 * @param {?string} whitespace Parent element's "white-space" style.
 * @param {?string} textTransform Parent element's "text-transform" style.
 * @private
 */
bot.dom.appendVisibleTextLinesFromTextNode_ = function(textNode, lines,
    whitespace, textTransform) {
  // First, replace all zero-width spaces. Do this before regularizing spaces
  // as the zero-width space is, by definition, a space.
  var text = textNode.nodeValue.replace(/\u200b/g, '');

  // Canonicalize the new lines, and then collapse new lines
  // for the whitespace styles that collapse. See:
  // https://developer.mozilla.org/en/CSS/white-space
  text = goog.string.canonicalizeNewlines(text);
  if (whitespace == 'normal' || whitespace == 'nowrap') {
    text = text.replace(/\n/g, ' ');
  }

  // For pre and pre-wrap whitespace styles, convert all breaking spaces to be
  // non-breaking, otherwise, collapse all breaking spaces. Breaking spaces are
  // converted to regular spaces by getVisibleText().
  if (whitespace == 'pre' || whitespace == 'pre-wrap') {
    text = text.replace(/[ \f\t\v\u2028\u2029]/g, '\xa0');
  } else {
    text = text.replace(/[\ \f\t\v\u2028\u2029]+/g, ' ');
  }

  if (textTransform == 'capitalize') {
    text = text.replace(/(^|\s)(\S)/g, function() {
      return arguments[1] + arguments[2].toUpperCase();
    });
  } else if (textTransform == 'uppercase') {
    text = text.toUpperCase();
  } else if (textTransform == 'lowercase') {
    text = text.toLowerCase();
  }

  var currLine = lines.pop() || '';
  if (goog.string.endsWith(currLine, ' ') &&
      goog.string.startsWith(text, ' ')) {
    text = text.substr(1);
  }
  lines.push(currLine + text);
};


/**
 * Gets the opacity of a node (x-browser).
 * This gets the inline style opacity of the node and takes into account the
 * cascaded or the computed style for this node.
 *
 * @param {!Element} elem Element whose opacity has to be found.
 * @return {number} Opacity between 0 and 1.
 */
bot.dom.getOpacity = function(elem) {
  // TODO(bsilverberg): Does this need to deal with rgba colors?
  if (!bot.userAgent.IE_DOC_PRE10) {
    return bot.dom.getOpacityNonIE_(elem);
  } else {
    if (bot.dom.getEffectiveStyle(elem, 'position') == 'relative') {
      // Filter does not apply to non positioned elements.
      return 1;
    }

    var opacityStyle = bot.dom.getEffectiveStyle(elem, 'filter');
    var groups = opacityStyle.match(/^alpha\(opacity=(\d*)\)/) ||
        opacityStyle.match(
        /^progid:DXImageTransform.Microsoft.Alpha\(Opacity=(\d*)\)/);

    if (groups) {
      return Number(groups[1]) / 100;
    } else {
      return 1; // Opaque.
    }
  }
};


/**
 * Implementation of getOpacity for browsers that do support
 * the "opacity" style.
 *
 * @param {!Element} elem Element whose opacity has to be found.
 * @return {number} Opacity between 0 and 1.
 * @private
 */
bot.dom.getOpacityNonIE_ = function(elem) {
  // By default the element is opaque.
  var elemOpacity = 1;

  var opacityStyle = bot.dom.getEffectiveStyle(elem, 'opacity');
  if (opacityStyle) {
    elemOpacity = Number(opacityStyle);
  }

  // Let's apply the parent opacity to the element.
  var parentElement = bot.dom.getParentElement(elem);
  if (parentElement) {
    elemOpacity = elemOpacity * bot.dom.getOpacityNonIE_(parentElement);
  }
  return elemOpacity;
};


/**
 * This function calculates the amount of scrolling necessary to bring the
 * target location into view.
 *
 * @param {number} targetLocation The target location relative to the current
 *     viewport.
 * @param {number} viewportDimension The size of the current viewport.
 * @return {number} Returns the scroll offset necessary to bring the given
 *     target location into view.
 * @private
 */
bot.dom.calculateViewportScrolling_ =
    function(targetLocation, viewportDimension) {

  if (targetLocation >= viewportDimension) {
    // Scroll until the target location appears on the right/bottom side of
    // the viewport.
    return targetLocation - (viewportDimension - 1);
  }

  if (targetLocation < 0) {
    // Scroll until the target location appears on the left/top side of the
    // viewport.
    return targetLocation;
  }

  // The location is already within the viewport. No scrolling necessary.
  return 0;
};


/**
 * This function takes a relative location according to the current viewport. If
 * this location is not visible in the viewport, it scrolls the location into
 * view. The function returns the new relative location after scrolling.
 *
 * @param {!goog.math.Coordinate} targetLocation The target location relative
 *     to (0, 0) coordinate of the viewport.
 * @param {Window=} opt_currentWindow The current browser window.
 * @return {!goog.math.Coordinate} The target location within the viewport
 *     after scrolling.
 */
bot.dom.getInViewLocation =
    function(targetLocation, opt_currentWindow) {
  var currentWindow = opt_currentWindow || bot.getWindow();
  var viewportSize = goog.dom.getViewportSize(currentWindow);

  var xScrolling = bot.dom.calculateViewportScrolling_(
      targetLocation.x,
      viewportSize.width);

  var yScrolling = bot.dom.calculateViewportScrolling_(
      targetLocation.y,
      viewportSize.height);

  var scrollOffset =
      goog.dom.getDomHelper(currentWindow.document).getDocumentScroll();

  if (xScrolling != 0 || yScrolling != 0) {
    currentWindow.scrollBy(xScrolling, yScrolling);
  }

  // It is difficult to determine the size of the web page in some browsers.
  // We check if the scrolling we intended to do really happened. If not we
  // assume that the target location is not on the web page.
  var newScrollOffset =
      goog.dom.getDomHelper(currentWindow.document).getDocumentScroll();

  if ((scrollOffset.x + xScrolling != newScrollOffset.x) ||
      (scrollOffset.y + yScrolling != newScrollOffset.y)) {
    throw new bot.Error(bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS,
        'The target location (' + (targetLocation.x + scrollOffset.x) +
        ', ' + (targetLocation.y + scrollOffset.y) + ') is not on the ' +
        'webpage.');
  }

  var inViewLocation = new goog.math.Coordinate(
      targetLocation.x - xScrolling,
      targetLocation.y - yScrolling);

  // The target location should be within the viewport after scrolling.
  // This is assertion code. We do not expect them ever to become true.
  if (0 > inViewLocation.x || inViewLocation.x >= viewportSize.width) {
    throw new bot.Error(bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS,
        'The target location (' +
        inViewLocation.x + ', ' + inViewLocation.y +
        ') should be within the viewport (' +
        viewportSize.width + ':' + viewportSize.height +
        ') after scrolling.');
  }

  if (0 > inViewLocation.y || inViewLocation.y >= viewportSize.height) {
    throw new bot.Error(bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS,
        'The target location (' +
        inViewLocation.x + ', ' + inViewLocation.y +
        ') should be within the viewport (' +
        viewportSize.width + ':' + viewportSize.height +
        ') after scrolling.');
  }

  return inViewLocation;
};


/**
 * Scrolls the scrollable element so that the region is fully visible.
 * If the region is too large, it will be aligned to the top-left of the
 * scrollable element. The region should be relative to the scrollable
 * element's current scroll position.
 *
 * @param {!goog.math.Rect} region The region to use.
 * @param {!Element} scrollable The scrollable element to scroll.
 * @private
 */
bot.dom.scrollRegionIntoView_ = function(region, scrollable) {
  scrollable.scrollLeft += Math.min(
      region.left, Math.max(region.left - region.width, 0));
  scrollable.scrollTop += Math.min(
      region.top, Math.max(region.top - region.height, 0));
};


/**
 * Scrolls the region of an element into the container's view. If the
 * region is too large to fit in the view, it will be aligned to the
 * top-left of the container.
 *
 * The element and container should be attached to the current document.
 *
 * @param {!Element} elem The element to use.
 * @param {!goog.math.Rect} elemRegion The region relative to the element to be
 *     scrolled into view.
 * @param {!Element} container A container of the given element.
 * @private
 */
bot.dom.scrollElementRegionIntoContainerView_ = function(elem, elemRegion,
                                                         container) {
  // Based largely from goog.style.scrollIntoContainerView.
  var elemPos = goog.style.getPageOffset(elem);
  var containerPos = goog.style.getPageOffset(container);
  var containerBorder = goog.style.getBorderBox(container);

  // Relative pos. of the element's border box to the container's content box.
  var relX = elemPos.x + elemRegion.left - containerPos.x -
             containerBorder.left;
  var relY = elemPos.y + elemRegion.top - containerPos.y - containerBorder.top;

  // How much the element can move in the container.
  var spaceX = container.clientWidth - elemRegion.width;
  var spaceY = container.clientHeight - elemRegion.height;

  bot.dom.scrollRegionIntoView_(new goog.math.Rect(relX, relY, spaceX, spaceY),
                                container);
};


/**
 * Scrolls the element into the client's view. If the element or region is
 * too large to fit in the view, it will be aligned to the top-left of the
 * container.
 *
 * The element should be attached to the current document.
 *
 * @param {!Element} elem The element to use.
 * @param {!goog.math.Rect} elemRegion The region relative to the element to be
 *     scrolled into view.
 */
bot.dom.scrollElementRegionIntoClientView = function(elem, elemRegion) {
  var doc = goog.dom.getOwnerDocument(elem);

  // Scroll the containers.
  for (var container = bot.dom.getParentElement(elem);
       container && container != doc.body && container != doc.documentElement;
       container = bot.dom.getParentElement(container)) {
    bot.dom.scrollElementRegionIntoContainerView_(elem, elemRegion, container);
  }

  // Scroll the actual window.
  var elemPageOffset = goog.style.getPageOffset(elem);

  var viewportSize = goog.dom.getDomHelper(doc).getViewportSize();

  var region = new goog.math.Rect(
      elemPageOffset.x + elemRegion.left - (doc.body ? doc.body.scrollLeft : 0),
      elemPageOffset.y + elemRegion.top - (doc.body ? doc.body.scrollTop : 0),
      viewportSize.width - elemRegion.width,
      viewportSize.height - elemRegion.height);

  bot.dom.scrollRegionIntoView_(region, doc.body || doc.documentElement);
};


/**
 * Scrolls the element into the client's view and returns its position
 * relative to the client viewport. If the element or region is too
 * large to fit in the view, it will be aligned to the top-left of the
 * container.
 *
 * The element should be attached to the current document.
 *
 * @param {!Element} elem The element to use.
 * @param {!goog.math.Rect=} opt_elemRegion The region relative to the element
 *     to be scrolled into view.
 * @return {!goog.math.Coordinate} The coordinate of the element in client
 *     space.
 */
bot.dom.getLocationInView = function(elem, opt_elemRegion) {
  var elemRegion;
  if (opt_elemRegion) {
    elemRegion = new goog.math.Rect(
        opt_elemRegion.left, opt_elemRegion.top,
        opt_elemRegion.width, opt_elemRegion.height);
  } else {
    elemRegion = new goog.math.Rect(0, 0, elem.offsetWidth, elem.offsetHeight);
  }
  bot.dom.scrollElementRegionIntoClientView(elem, elemRegion);

  // This is needed for elements that are split across multiple lines.
  var rect = elem.getClientRects ? elem.getClientRects()[0] : null;
  var elemClientPos = rect ?
      new goog.math.Coordinate(rect.left, rect.top) :
      bot.dom.getClientRect(elem);
  return new goog.math.Coordinate(elemClientPos.x + elemRegion.left,
                                  elemClientPos.y + elemRegion.top);
};


/**
 * Checks whether the element is currently scrolled in to view, such that the
 * offset given, relative to the top-left corner of the element, is currently
 * displayed in the viewport.
 *
 * @param {!Element} element The element to check.
 * @param {!goog.math.Coordinate=} opt_coords Coordinate in the element,
 *     relative to the top-left corner of the element, to check. If none are
 *     specified, checks that any part of the element is in view.
 * @return {boolean} Whether the coordinates specified, relative to the element,
 *     are scrolled in to view.
 */
bot.dom.isScrolledIntoView = function(element, opt_coords) {
  var ownerWindow = goog.dom.getWindow(goog.dom.getOwnerDocument(element));
  var topWindow = ownerWindow.top;
  var elSize = goog.style.getSize(element);

  for (var win = ownerWindow;; win = win.parent) {
    var scroll = goog.dom.getDomHelper(win.document).getDocumentScroll();
    var size = goog.dom.getViewportSize(win);
    var viewportRect = new goog.math.Rect(scroll.x,
                                          scroll.y,
                                          size.width,
                                          size.height);

    var elCoords = goog.style.getFramedPageOffset(element, win);
    var elementRect = new goog.math.Rect(elCoords.x,
                                         elCoords.y,
                                         elSize.width,
                                         elSize.height);
    if (!goog.math.Rect.intersects(viewportRect, elementRect)) {
      return false;
    }
    if (win == topWindow) {
      break;
    }
  }

  var visibleBox = goog.style.getVisibleRectForElement(element);
  if (!visibleBox) {
    return false;
  }
  if (opt_coords) {
    var elementOffset = goog.style.getPageOffset(element);
    var desiredPoint = goog.math.Coordinate.sum(elementOffset, opt_coords);
    return visibleBox.contains(desiredPoint);
  } else {
    var elementBox = goog.style.getBounds(element).toBox();
    return goog.math.Box.intersects(visibleBox, elementBox);
  }
};

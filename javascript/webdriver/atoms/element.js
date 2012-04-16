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
 * @fileoverview Atoms-based implementation of the webelement interface.
 */

goog.provide('webdriver.atoms.element');

goog.require('bot.Keyboard.Keys');
goog.require('bot.action');
goog.require('bot.dom');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.math');
goog.require('goog.string');
goog.require('goog.style');


/**
 * @param {!Element} element The element to use.
 * @return {boolean} Whether the element is checked or selected.
 */
webdriver.atoms.element.isSelected = function(element) {
  // Although this method looks unloved, its compiled form is used by
  // the Chrome and OperaDrivers.
  if (!bot.dom.isSelectable(element)) {
    return false;
  }

  return bot.dom.isSelected(element);
};


/**
 * Get the value of the given property or attribute. If the "attribute" is for
 * a boolean property, we return null in the case where the value is false. If
 * the attribute name is "style" an attempt to convert that style into a string
 * is done.
 *
 * @param {!Element} element The element to use.
 * @param {string} attribute The name of the attribute to look up.
 * @return {?string} The string value of the attribute or property, or null.
 */
webdriver.atoms.element.getAttribute = function(element, attribute) {
  var value = null;
  var name = attribute.toLowerCase();

  if ('style' == attribute.toLowerCase()) {
    value = element.style;

    if (value && !goog.isString(value)) {
      value = value.cssText;
    }

    return (/** @type {?string} */value);
  }

  if ('selected' == name || 'checked' == name &&
      bot.dom.isSelectable(element)) {
    return bot.dom.isSelected(element) ? 'true' : null;
  }

  // Our tests suggest that returning the attribute is desirable for
  // the href attribute of <a> tags and the src attribute of <img> tags,
  // but we normally attempt to get the property value before the attribute.
  var isLink = bot.dom.isElement(element, goog.dom.TagName.A);
  var isImg = bot.dom.isElement(element, goog.dom.TagName.IMG);

  // Although the attribute matters, the property is consistent. Return that in
  // preference to the attribute for links and images.
  if ((isImg && name == 'src') || (isLink && name == 'href')) {
    value = bot.dom.getAttribute(element, name);
    if (value) {
      // We want the full URL if present
      value = bot.dom.getProperty(element, name);
    }
    return (/** @type {?string} */value);
  }

  var property;
  try {
    property = bot.dom.getProperty(element, attribute);
  } catch (e) {
    // Leaves property undefined or null
  }

  // 1- Call getAttribute if getProperty fails,
  // i.e. property is null or undefined.
  // This happens for event handlers in Firefox.
  // For example, calling getProperty for 'onclick' would
  // fail while getAttribute for 'onclick' will succeed and
  // return the JS code of the handler.
  //
  // 2- When property is an object we fall back to the
  // actual attribute instead.
  // See issue http://code.google.com/p/selenium/issues/detail?id=966
  if (!goog.isDefAndNotNull(property) || goog.isObject(property)) {
    value = bot.dom.getAttribute(element, attribute);
  } else {
    value = property;
  }

  // The empty string is a valid return value.
  return goog.isDefAndNotNull(value) ? value.toString() : null;
};


/**
 * Get the location of the element in page space, if it's displayed.
 *
 * @param {!Element} element The element to get the location for.
 * @return {goog.math.Rect} The bounding rectangle of the element.
 */
webdriver.atoms.element.getLocation = function(element) {
  if (!bot.dom.isShown(element)) {
    return null;
  }
  return goog.style.getBounds(element);
};


/**
 * @param {Node} element The element to use.
 * @return {boolean} Whether the element is in the HEAD tag.
 * @private
 */
webdriver.atoms.element.isInHead_ = function(element) {
  while (element) {
    if (element.tagName && element.tagName.toLowerCase() == 'head') {
      return true;
    }
    try {
      element = element.parentNode;
    } catch (e) {
      // Fine. the DOM has dispeared from underneath us
      return false;
    }
  }

  return false;
};


/**
 * @param {!Element} element The element to get the text from.
 * @return {string} The visible text or an empty string.
 */
webdriver.atoms.element.getText = function(element) {
  if (webdriver.atoms.element.isInHead_(element)) {
    var doc = goog.dom.getOwnerDocument(element);
    if (element.tagName.toUpperCase() == goog.dom.TagName.TITLE &&
        goog.dom.getWindow(doc) == bot.window_.top) {
      return goog.string.trim((/** @type {string} */doc.title));
    }
    return '';
  }

  return bot.dom.getVisibleText(element);
};


/**
 * Types keys on the given {@code element} with a virtual keyboard. Converts
 * special characters from the WebDriver JSON wire protocol to the appropriate
 * {@link bot.Keyboard.Key} value.
 *
 * @param {!Element} element The element to type upon.
 * @param {!Array.<string>} keys The keys to type on the element.
 * @see bot.action.type
 * @see http://code.google.com/p/selenium/wiki/JsonWireProtocol
 */
webdriver.atoms.element.type = function(element, keys) {
  // Convert to bot.Keyboard.Key values.
  var convertedSequences = [], current;
  convertedSequences.push(current = []);

  // Collapse into a single string, then iterate over the characters to generate
  // the sequences to type.
  goog.array.forEach(keys.join(''), function(key) {
    if (isWebDriverKey(key)) {
      var webdriverKey = webdriver.atoms.element.type.JSON_TO_KEY_MAP_[key];
      // goog.isNull uses ==, which accepts undefined.
      if (webdriverKey === null) {
        // bot.action.type does not support a "null" key, so we have to
        // terminate the entire sequence to release modifier keys.
        convertedSequences.push(current = []);
      } else if (goog.isDef(webdriverKey)) {
        current.push(webdriverKey);
      }

      throw Error('Unsupported WebDriver key: ' +
          key.charCodeAt(0).toString(16));
    }

    // Handle common aliases.
    switch (key) {
      case '\n':
         current.push(bot.Keyboard.Keys.ENTER);
        break;
      case '\t':
        current.push(bot.Keyboard.Keys.TAB);
        break;
      case '\b':
        current.push(bot.Keyboard.Keys.BACKSPACE);
        break;
    }
    current.push(key);
  });

  goog.array.forEach(convertedSequences, function(sequence) {
    var args = goog.array.concat(element, sequence);
    bot.action.type.apply(null, args);
  });

  function isWebDriverKey(c) {
    return '\uE000' <= c <= '\uE03D';
  }
};


/**
 * Maps JSON wire protocol values to their {@link bot.Keyboard.Key} counterpart.
 * @type {!Object.<bot.Keyboard.Key>}
 * @const
 * @private
 */
webdriver.atoms.element.type.JSON_TO_KEY_MAP_ = {};
goog.scope(function() {
  var map = webdriver.atoms.element.type.JSON_TO_KEY_MAP_;

  // TODO(jleyba): Extract webdriver.Key to its own file so we can depend on it
  // here.
  map['\uE000'] = null;
  map['\uE003'] = bot.Keyboard.Keys.BACKSPACE;
  map['\uE004'] = bot.Keyboard.Keys.TAB;
  map['\uE006'] = bot.Keyboard.Keys.ENTER;
  map['\uE007'] = bot.Keyboard.Keys.ENTER;
  map['\uE008'] = bot.Keyboard.Keys.SHIFT;
  map['\uE009'] = bot.Keyboard.Keys.CONTROL;
  map['\uE00A'] = bot.Keyboard.Keys.ALT;
  map['\uE00B'] = bot.Keyboard.Keys.PAUSE;
  map['\uE00C'] = bot.Keyboard.Keys.ESC;
  map['\uE00D'] = bot.Keyboard.Keys.SPACE;
  map['\uE00E'] = bot.Keyboard.Keys.PAGE_UP;
  map['\uE00F'] = bot.Keyboard.Keys.PAGE_DOWN;
  map['\uE010'] = bot.Keyboard.Keys.END;
  map['\uE011'] = bot.Keyboard.Keys.HOME;
  map['\uE012'] = bot.Keyboard.Keys.LEFT;
  map['\uE013'] = bot.Keyboard.Keys.UP;
  map['\uE014'] = bot.Keyboard.Keys.RIGHT;
  map['\uE015'] = bot.Keyboard.Keys.DOWN;
  map['\uE016'] = bot.Keyboard.Keys.INSERT;
  map['\uE017'] = bot.Keyboard.Keys.DELETE;
  map['\uE018'] = bot.Keyboard.Keys.SEMICOLON;
  map['\uE019'] = bot.Keyboard.Keys.EQUALS;
  map['\uE01A'] = bot.Keyboard.Keys.NUM_ZERO;
  map['\uE01B'] = bot.Keyboard.Keys.NUM_ONE;
  map['\uE01C'] = bot.Keyboard.Keys.NUM_TWO;
  map['\uE01D'] = bot.Keyboard.Keys.NUM_THREE;
  map['\uE01E'] = bot.Keyboard.Keys.NUM_FOUR;
  map['\uE01F'] = bot.Keyboard.Keys.NUM_FIVE;
  map['\uE020'] = bot.Keyboard.Keys.NUM_SIX;
  map['\uE021'] = bot.Keyboard.Keys.NUM_SEVEN;
  map['\uE022'] = bot.Keyboard.Keys.NUM_EIGHT;
  map['\uE023'] = bot.Keyboard.Keys.NUM_NINE;
  map['\uE024'] = bot.Keyboard.Keys.NUM_MULTIPLY;
  map['\uE025'] = bot.Keyboard.Keys.NUM_PLUS;
  map['\uE027'] = bot.Keyboard.Keys.NUM_MINUS;
  map['\uE028'] = bot.Keyboard.Keys.NUM_PERIOD;
  map['\uE029'] = bot.Keyboard.Keys.NUM_DIVISION;
  map['\uE031'] = bot.Keyboard.Keys.F1;
  map['\uE032'] = bot.Keyboard.Keys.F2;
  map['\uE033'] = bot.Keyboard.Keys.F3;
  map['\uE034'] = bot.Keyboard.Keys.F4;
  map['\uE035'] = bot.Keyboard.Keys.F5;
  map['\uE036'] = bot.Keyboard.Keys.F6;
  map['\uE037'] = bot.Keyboard.Keys.F7;
  map['\uE038'] = bot.Keyboard.Keys.F8;
  map['\uE039'] = bot.Keyboard.Keys.F9;
  map['\uE03A'] = bot.Keyboard.Keys.F10;
  map['\uE03B'] = bot.Keyboard.Keys.F11;
  map['\uE03C'] = bot.Keyboard.Keys.F12;
  map['\uE03D'] = bot.Keyboard.Keys.META;
});

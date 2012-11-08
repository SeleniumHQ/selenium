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
goog.require('webdriver.Key');


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
 * Common aliases for properties. This maps names that users use to the correct
 * property name.
 *
 * @const
 * @private
 */
webdriver.atoms.element.PROPERTY_ALIASES_ = {
  'class': 'className',
  'readonly': 'readOnly'
};


/**
 * Used to determine whether we should return a boolean value from getAttribute.
 * These are all extracted from the WHATWG spec:
 *
 *   http://www.whatwg.org/specs/web-apps/current-work/
 *
 * These must all be lower-case.
 *
 * @const
 * @private
 */
webdriver.atoms.element.BOOLEAN_PROPERTIES_ = [
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'compact',
  'complete',
  'controls',
  'declare',
  'defaultchecked',
  'defaultselected',
  'defer',
  'disabled',
  'draggable',
  'ended',
  'formnovalidate',
  'hidden',
  'indeterminate',
  'iscontenteditable',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nohref',
  'noresize',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'paused',
  'pubdate',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'seamless',
  'seeking',
  'selected',
  'spellcheck',
  'truespeed',
  'willvalidate'
];


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

  if (('selected' == name || 'checked' == name) &&
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

  var propName = webdriver.atoms.element.PROPERTY_ALIASES_[attribute] ||
      attribute;
  if (goog.array.contains(webdriver.atoms.element.BOOLEAN_PROPERTIES_, name)) {
    value = !goog.isNull(bot.dom.getAttribute(element, attribute)) ||
        bot.dom.getProperty(element, propName);
    return value ? 'true' : null;
  }

  var property;
  try {
    property = bot.dom.getProperty(element, propName);
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
        goog.dom.getWindow(doc) == bot.getWindow().top) {
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
 * @param {bot.Keyboard=} opt_keyboard Keyboard to use; if not provided,
 *    constructs one.
 * @see bot.action.type
 * @see http://code.google.com/p/selenium/wiki/JsonWireProtocol
 */
webdriver.atoms.element.type = function(element, keys, opt_keyboard) {
  // Convert to bot.Keyboard.Key values.
  /** @type {!Array.<!Array.<(string|!bot.Keyboard.Key)>>} */
  var convertedSequences = [];
  /** @type {!Array.<(string|!bot.Keyboard.Key)>} */
  var current = [];
  convertedSequences.push(current);

  goog.array.forEach(keys, function(sequence) {
    goog.array.forEach(sequence.split(''), function(key) {
      if (isWebDriverKey(key)) {
        var webdriverKey = webdriver.atoms.element.type.JSON_TO_KEY_MAP_[key];
        // goog.isNull uses ==, which accepts undefined.
        if (webdriverKey === null) {
          // bot.action.type does not support a "null" key, so we have to
          // terminate the entire sequence to release modifier keys.
          convertedSequences.push(current = []);
        } else if (goog.isDef(webdriverKey)) {
          current.push(webdriverKey);
        } else {
          throw Error('Unsupported WebDriver key: \\u' +
              key.charCodeAt(0).toString(16));
        }
      } else {
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
          default:
            current.push(key);
            break;
        }
      }
    });
  });

  goog.array.forEach(convertedSequences, function(sequence) {
    bot.action.type(element, sequence, opt_keyboard);
  });

  function isWebDriverKey(c) {
    return '\uE000' <= c && c <= '\uE03D';
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
var key = webdriver.Key;
var botKey = bot.Keyboard.Keys;

map[key.NULL] = null;
map[key.BACK_SPACE] = botKey.BACKSPACE;
map[key.TAB] = botKey.TAB;
map[key.RETURN] = botKey.ENTER;
// This not correct, but most browsers will do the right thing.
map[key.ENTER] = botKey.ENTER;
map[key.SHIFT] = botKey.SHIFT;
map[key.CONTROL] = botKey.CONTROL;
map[key.ALT] = botKey.ALT;
map[key.PAUSE] = botKey.PAUSE;
map[key.ESCAPE] = botKey.ESC;
map[key.SPACE] = botKey.SPACE;
map[key.PAGE_UP] = botKey.PAGE_UP;
map[key.PAGE_DOWN] = botKey.PAGE_DOWN;
map[key.END] = botKey.END;
map[key.HOME] = botKey.HOME;
map[key.LEFT] = botKey.LEFT;
map[key.UP] = botKey.UP;
map[key.RIGHT] = botKey.RIGHT;
map[key.DOWN] = botKey.DOWN;
map[key.INSERT] = botKey.INSERT;
map[key.DELETE] = botKey.DELETE;
map[key.SEMICOLON] = botKey.SEMICOLON;
map[key.EQUALS] = botKey.EQUALS;
map[key.NUMPAD0] = botKey.NUM_ZERO;
map[key.NUMPAD1] = botKey.NUM_ONE;
map[key.NUMPAD2] = botKey.NUM_TWO;
map[key.NUMPAD3] = botKey.NUM_THREE;
map[key.NUMPAD4] = botKey.NUM_FOUR;
map[key.NUMPAD5] = botKey.NUM_FIVE;
map[key.NUMPAD6] = botKey.NUM_SIX;
map[key.NUMPAD7] = botKey.NUM_SEVEN;
map[key.NUMPAD8] = botKey.NUM_EIGHT;
map[key.NUMPAD9] = botKey.NUM_NINE;
map[key.MULTIPLY] = botKey.NUM_MULTIPLY;
map[key.ADD] = botKey.NUM_PLUS;
map[key.SUBTRACT] = botKey.NUM_MINUS;
map[key.DECIMAL] = botKey.NUM_PERIOD;
map[key.DIVIDE] = botKey.NUM_DIVISION;
map[key.SEPARATOR] = botKey.SEPARATOR;
map[key.F1] = botKey.F1;
map[key.F2] = botKey.F2;
map[key.F3] = botKey.F3;
map[key.F4] = botKey.F4;
map[key.F5] = botKey.F5;
map[key.F6] = botKey.F6;
map[key.F7] = botKey.F7;
map[key.F8] = botKey.F8;
map[key.F9] = botKey.F9;
map[key.F10] = botKey.F10;
map[key.F11] = botKey.F11;
map[key.F12] = botKey.F12;
map[key.META] = botKey.META;
});  // goog.scope

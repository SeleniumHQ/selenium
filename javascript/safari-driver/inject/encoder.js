// Copyright 2012 Selenium committers
// Copyright 2012 Software Freedom Conservancy
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
 * @fileoverview Defines utilities for exchanging messages between the
 * sandboxed SafariDriver injected script and its corresponding content page.
 */

goog.provide('safaridriver.inject.Encoder');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.dom');
goog.require('bot.inject');
goog.require('bot.response');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.string');
goog.require('safaridriver.inject.message.Encode');
goog.require('safaridriver.message.Response');
goog.require('webdriver.promise');



/**
 * @param {!safaridriver.message.MessageTarget} messageTarget The message
 *     target to use.
 * @constructor
 */
safaridriver.inject.Encoder = function(messageTarget) {

  /**
   * @type {!Object.<!webdriver.promise.Deferred>}
   * @private
   */
  this.pendingResponses_ = {};

  messageTarget.on(safaridriver.message.Response.TYPE,
      goog.bind(this.onResponse_, this));
};


/**
 * Key used in an object literal to indicate it is the encoded representation of
 * a DOM element. The corresponding property's value will be a CSS selector for
 * the encoded elmeent.
 *
 * <p>Note, this constant is very intentionally initialized to a value other
 * than the standard JSON wire protocol key for WebElements.
 *
 * @type {string}
 * @const
 * @private
 */
safaridriver.inject.Encoder.ENCODED_ELEMENT_KEY_ =
    'ENCODED_' + bot.inject.ELEMENT_KEY;


/**
 * Computes the canonical CSSLocator locator for an element.
 * @param {!Element} element The element to compute a CSS selector for.
 * @return {string} The element's CSS selector.
 * @private
 */
safaridriver.inject.Encoder.getElementCssSelector_ = function(element) {
  var path = '';
  for (var current = element; current;
       current = bot.dom.getParentElement(current)) {
    var index = 1;
    for (var sibling = current.previousSibling; sibling;
         sibling = sibling.previousSibling) {
      if (sibling.nodeType == goog.dom.NodeType.ELEMENT) {
        index++;
      }
    }
    var tmp = current.tagName.toLowerCase();
    if (index > 1) {
      tmp += ':nth-child(' + index + ')';
    }
    if (path == '') {
        path = tmp + path;
    } else {
        path = tmp + ' > ' + path;
    }
  }
  return path;
};


/**
 * Encodes a value so it may be included in a message exchanged between the
 * document and sandboxed injected script. Any DOM element references will
 * be replaced with an object literal whose sole key is t
 * @param {*} value The value to encode.
 * @return {*} The encoded value. Note, when called from the SafariDriver
 *     extension's injected script, this value will _never_ be a
 *     {@link webdriver.promise.Promise}.
 * @throws {Error} If the value is cannot be encoded (e.g. it is a function, or
 *     an array or object with a cyclical reference).
 */
safaridriver.inject.Encoder.prototype.encode = function(value) {
  var type = goog.typeOf(value);
  switch (type) {
    case 'boolean':
    case 'number':
    case 'string':
      return value;

    case 'null':
    case 'undefined':
      return null;

    case 'array':
      return goog.array.map((/** @type {!Array} */value),
          this.encode, this);

    case 'object':
      if (goog.dom.isElement(value)) {
        if (value.ownerDocument !== document) {
          return this.encodeElement_((/** @type {!Element} */value));
        }

        var encoded = {};
        encoded[safaridriver.inject.Encoder.ENCODED_ELEMENT_KEY_] =
            safaridriver.inject.Encoder.getElementCssSelector_(
                (/** @type {!Element} */value));
        return encoded;
      }

      // Check for a NodeList.
      if (goog.isArrayLike(value)) {
        return goog.array.map((/** @type {!goog.array.ArrayLike} */value),
            this.encode, this);
      }

      return goog.object.map((/** @type {!Object} */value),
          this.encode, this);

    case 'function':
      return value.toString();

    default:
      throw Error('Invalid value type: ' + type + ' => ' + value);
  }
};


/**
 * @param {!Element} element The element to encode.
 * @return {!webdriver.promise.Promise} A promise that will resolve to the
 *     JSON representation of a WebElement.
 * @private
 */
safaridriver.inject.Encoder.prototype.encodeElement_ = function(element) {
  var webElement = new webdriver.promise.Deferred();
  var id = goog.string.getRandomString();
  var css = safaridriver.inject.Encoder.getElementCssSelector_(element);
  var message = new safaridriver.inject.message.Encode(id, css);
  var doc = goog.dom.getOwnerDocument(element);
  var win = (/** @type {!Window} */goog.dom.getWindow(doc));
  message.send(win);
  this.pendingResponses_[id] = webElement;
  return webElement.promise;
};


/**
 * Decodes a value. Any object literals whose sole key is
 * {@link safaridriver.inject.Encoder.ENCODED_ELEMENT_KEY_} will be considered
 * an encoded reference to a DOM element. The corresponding value for this key
 * will be used as an XPath selector to locate the element.
 * @param {*} value The value to decode.
 * @return {*} The decoded value.
 * @throws {bot.Error} If an encoded DOM element cannot be located on the page.
 * @throws {Error} If the value is an invalid type, or an array or object with
 *     cyclical references.
 */
safaridriver.inject.Encoder.prototype.decode = function(value) {
  var type = goog.typeOf(value);
  switch (type) {
    case 'boolean':
    case 'number':
    case 'string':
      return value;

    case 'null':
    case 'undefined':
      return null;

    case 'array':
      return goog.array.map((/** @type {!Array} */value),
          this.decode, this);

    case 'object':
      var obj = (/** @type {!Object} */value);
      var keys = Object.keys(obj);
      if (keys.length == 1 &&
          keys[0] === safaridriver.inject.Encoder.ENCODED_ELEMENT_KEY_) {
        var css = value[safaridriver.inject.Encoder.ENCODED_ELEMENT_KEY_];
        var element = bot.getDocument().querySelector(css);
        if (!element) {
          throw new bot.Error(bot.ErrorCode.STALE_ELEMENT_REFERENCE,
              'Unable to locate encoded element: ' + css);
        }
        return element;
      }
      return goog.object.map(obj, this.decode, this);

    case 'function':
    default:
      throw Error('Invalid value type: ' + type + ' => ' + value);
  }
};


/**
 * Handles response messages.
 * @param {!safaridriver.message.Response} message The message.
 * @private
 */
safaridriver.inject.Encoder.prototype.onResponse_ = function(message) {
  if (message.isSameOrigin()) {
    return;
  }

  var promise = this.pendingResponses_[message.getId()];
  if (!promise) {
    return;
  }
  delete this.pendingResponses_[message.getId()];

  var response = message.getResponse();
  try {
    bot.response.checkResponse(response);
    var value = this.decode(response['value']);
    promise.resolve(value);
  } catch (ex) {
    promise.reject(ex);
  }
};

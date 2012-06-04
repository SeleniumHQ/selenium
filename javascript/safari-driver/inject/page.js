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

goog.provide('safaridriver.inject.page');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.dom');
goog.require('bot.inject');
goog.require('bot.locators.xpath');
goog.require('bot.response');
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('safaridriver.console');
goog.require('safaridriver.inject.message.Encode');
goog.require('safaridriver.message');
goog.require('safaridriver.message.Command');
goog.require('safaridriver.message.Load');
goog.require('safaridriver.message.MessageTarget');
goog.require('safaridriver.message.Response');
goog.require('webdriver.CommandName');
goog.require('webdriver.promise');


/**
 * @define {boolean} Whether this script is being used by the extension or has
 *     been injected into the web page.
 */
safaridriver.inject.page.EXTENSION = true;


/**
 * Class name assigned to the SCRIPT element used to insert the compiled form of
 * this script into the web page.
 * @type {string}
 * @const
 * @private
 */
safaridriver.inject.page.SCRIPT_CLASS_NAME_ = 'safari-driver';


/**
 * @type {!goog.debug.Logger}
 * @const
 * @private
 */
safaridriver.inject.page.LOG_ = goog.debug.Logger.getLogger(
    'safaridriver.inject.page.' +
        (safaridriver.inject.page.EXTENSION ? 'extension' : 'webpage'));


/**
 * Initializes this script. When included in the SafariDriver extension, this
 * appends a SCRIPT element to the DOM that loads the page script. When
 * included as the page script, this sends a LOADED message to the injected
 * script, informing it that the page script has been successfully loaded.
 */
safaridriver.inject.page.init = function() {
  var script;
  if (safaridriver.inject.page.EXTENSION) {
    safaridriver.inject.page.LOG_.info('Initializing for extension');

    script = document.createElement('script');
    script.className = safaridriver.inject.page.SCRIPT_CLASS_NAME_;
    script.type = 'text/javascript';
    script.src = safari.extension.baseURI + 'page.js';
    document.documentElement.appendChild(script);
  } else {
    safaridriver.console.init();
    safaridriver.inject.page.LOG_.info('Initializing for page');

    new safaridriver.message.MessageTarget(window)
        .on(safaridriver.message.Command.TYPE,
            safaridriver.inject.page.onCommand_)
        .on(safaridriver.message.Response.TYPE,
            safaridriver.inject.page.onResponse_);

    var message = new safaridriver.message.Load();
    safaridriver.inject.page.LOG_.info('Sending ' + message);
    message.send(window);

    script = document.querySelector(
        'script.' + safaridriver.inject.page.SCRIPT_CLASS_NAME_ +
            ':last-child');
    // If we find the script running this script, remove it.
    if (script) {
      goog.dom.removeNode(script);
    }
  }
};


if (!safaridriver.inject.page.EXTENSION) {
  goog.exportSymbol('init', safaridriver.inject.page.init);
}


/**
 * @type {!Object.<!webdriver.promise.Deferred>}
 * @private
 */
safaridriver.inject.page.pendingResponses_ = {};


/**
 * Handles command messages from the injected script.
 * @param {!safaridriver.message.Command} message The command message.
 * @throws {Error} If the command is not supported by this script.
 * @private
 */
safaridriver.inject.page.onCommand_ = function(message, e) {
  if (message.isSameOrigin() || !safaridriver.inject.message.isFromSelf(e)) {
    return;
  }

  var command = message.getCommand();

  var response = new webdriver.promise.Deferred();
  // When the response is resolved, we want to wrap it up in a message and
  // send it back to the injected script. This does all that.
  response.
      then(function(value) {
        var encodedValue = safaridriver.inject.page.encodeValue(value);
        // If the command result contains any DOM elements from another
        // document, the encoded value will contain promises that will resolve
        // once the owner documents have encoded the elements. Therefore, we
        // must wait for those to resolve.
        return webdriver.promise.fullyResolved(encodedValue);
      }).
      then(bot.response.createResponse, bot.response.createErrorResponse).
      then(function(response) {
        var responseMessage = new safaridriver.message.Response(
            command.getId(), response);
        safaridriver.inject.page.LOG_.info(
            'Sending ' + command.getName() + ' response: ' + responseMessage);
        responseMessage.send(window);
      });

  var handlerFn;
  switch (command.getName()) {
    case webdriver.CommandName.EXECUTE_ASYNC_SCRIPT:
      handlerFn = safaridriver.inject.page.executeAsyncScript_;
      break;

    case webdriver.CommandName.EXECUTE_SCRIPT:
      handlerFn = safaridriver.inject.page.executeScript_;
      break;
  }

  if (handlerFn) {
    handlerFn(command).then(response.resolve, response.reject);
  } else {
    response.reject(Error('Unknown command: ' + command.getName()));
  }
};


/**
 * Handles response messages.
 * @param {!safaridriver.message.Response} message The message.
 * @private
 */
safaridriver.inject.page.onResponse_ = function(message) {
  if (message.isSameOrigin()) {
    return;
  }

  var promise = safaridriver.inject.page.pendingResponses_[message.getId()];
  if (!promise) {
    safaridriver.inject.page.LOG_.warning(
        'Received response to an unknown command: ' + message);
    return;
  }

  var response = message.getResponse();
  try {
    bot.response.checkResponse(response);
    var value = safaridriver.inject.page.decodeValue(response['value']);
    promise.resolve(value);
  } catch (ex) {
    promise.reject(ex);
  }
};


/**
 * Computes the canonical XPath locator for an element.
 * @param {!Element} element The element to compute an XPath expression for.
 * @return {string} The element's XPath locator.
 * @private
 */
safaridriver.inject.page.getElementXPath_ = function(element) {
  var path = '';
  for (var current = element; current;
       current = bot.dom.getParentElement(current)) {
    var index = 1;
    for (var sibling = current.previousSibling; sibling;
        sibling = sibling.previousSibling) {
      if (sibling.nodeType == goog.dom.NodeType.ELEMENT &&
          sibling.tagName == current.tagName) {
        index++;
      }
    }
    var tmp = '/' + current.tagName;
    if (index > 1) {
      tmp += '[' + index + ']';
    }
    path = tmp + path;
  }
  return path;
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
safaridriver.inject.page.ENCODED_ELEMENT_KEY_ =
    'ENCODED_' + bot.inject.ELEMENT_KEY;


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
safaridriver.inject.page.encodeValue = function(value) {
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
          safaridriver.inject.page.encodeValue);

    case 'object':
      if (goog.dom.isElement(value)) {
        if (value.ownerDocument !== document) {
          // When called from an extension, we should never try to encode an
          // element belonging to another document. When called from page
          // content, however, we can ask the element's parent window for its
          // encoded representation.
          if (safaridriver.inject.page.EXTENSION) {
            throw Error('The element does not belong to this document: ' +
                safaridriver.inject.page.getElementXPath_(
                    (/** @type {!Element} */value)));
          }
          return safaridriver.inject.page.encodeElement_(
              (/** @type {!Element} */value));
        }

        var encoded = {};
        encoded[safaridriver.inject.page.ENCODED_ELEMENT_KEY_] =
            safaridriver.inject.page.getElementXPath_(
                (/** @type {!Element} */value));
        return encoded;
      }

      // Check for a NodeList.
      if (goog.isArrayLike(value)) {
        return goog.array.map((/** @type {!goog.array.ArrayLike} */value),
            safaridriver.inject.page.encodeValue);
      }

      return goog.object.map((/** @type {!Object} */value),
          safaridriver.inject.page.encodeValue);

    case 'function':
    default:
      throw Error('Invalid value type: ' + type + ' => ' + value);
  }
};


/**
 * @param {!Element} element The element to encode.
 * @return {!webdriver.promise.Promise} A promise that will resolve to the
 *     JSON representation of a WebElement.
 */
safaridriver.inject.page.encodeElement_ = function(element) {
  var webElement = new webdriver.promise.Deferred();
  var id = goog.string.getRandomString();
  var xpath = safaridriver.inject.page.getElementXPath_(element);
  var message = new safaridriver.inject.message.Encode(id, xpath);
  var doc = goog.dom.getOwnerDocument(element);
  var win = (/** @type {!Window} */goog.dom.getWindow(doc));
  message.send(win);
  safaridriver.inject.page.pendingResponses_[id] = webElement;
  return webElement.promise;
};


/**
 * Decodes a value. Any object literals whose sole key is
 * {@link safaridriver.inject.page.ENCODED_ELEMENT_KEY_} will be considered an
 * encoded reference to a DOM element. The corresponding value for this key will
 * be used as a CSS selector to locate the element.
 * @param {*} value The value to decode.
 * @return {*} The decoded value.
 * @throws {bot.Error} If an encoded DOM element cannot be located on the page.
 * @throws {Error} If the value is an invalid type, or an array or object with
 *     cyclical references.
 */
safaridriver.inject.page.decodeValue = function(value) {
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
          safaridriver.inject.page.decodeValue);

    case 'object':
      var obj = (/** @type {!Object} */value);
      var keys = Object.keys(obj);
      if (keys.length == 1 &&
          keys[0] === safaridriver.inject.page.ENCODED_ELEMENT_KEY_) {
        var xpath = value[safaridriver.inject.page.ENCODED_ELEMENT_KEY_];
        var element = bot.locators.xpath.single(xpath, document);
        if (!element) {
          throw new bot.Error(bot.ErrorCode.STALE_ELEMENT_REFERENCE,
              'Unable to locate encoded element: ' + xpath);
        }
        return element;
      }
      return goog.object.map(obj, safaridriver.inject.page.decodeValue);

    case 'function':
    default:
      throw Error('Invalid value type: ' + type + ' => ' + value);
  }
};


/**
 * Handles an executeScript command.
 * @param {!safaridriver.Command} command The command to execute.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the script result.
 * @private
 */
safaridriver.inject.page.executeScript_ = function(command) {
  var response = new webdriver.promise.Deferred();
  try {
    // TODO: clean-up bot.inject.executeScript so it doesn't pull in so many
    // extra dependencies.
    var fn = new Function(command.getParameter('script'));

    var args = command.getParameter('args');
    args = (/** @type {!Array} */safaridriver.inject.page.decodeValue(args));

    var result = fn.apply(window, args);
    response.resolve(result);
  } catch (ex) {
    response.reject(ex);
  }

  return response.promise;
};


/**
 * Handles an executeAsyncScript command.
 * @param {!safaridriver.Command} command The command to execute.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the script result.
 * @private
 */
safaridriver.inject.page.executeAsyncScript_ = function(command) {
  var response = new webdriver.promise.Deferred();

  try {
    var script = (/** @type {string} */command.getParameter('script'));
    var scriptFn = new Function(script);

    var args = command.getParameter('args');
    args = (/** @type {!Array} */safaridriver.inject.page.decodeValue(args));
    // The last argument for an async script is the callback that triggers the
    // response.
    args.push(function(value) {
      window.clearTimeout(timeoutId);
      if (response.isPending()) {
        response.resolve(value);
      }
    });

    var startTime = goog.now();
    scriptFn.apply(window, args);

    // Register our timeout *after* the function has been invoked. This will
    // ensure we don't timeout on a function that invokes its callback after a
    // 0-based timeout:
    // var scriptFn = function(callback) {
    //   setTimeout(callback, 0);
    // };
    var timeout = (/** @type {number} */command.getParameter('timeout'));
    var timeoutId = window.setTimeout(function() {
      if (response.isPending()) {
        response.reject(new bot.Error(bot.ErrorCode.SCRIPT_TIMEOUT,
            'Timed out waiting for an asynchronous script result after ' +
                (goog.now() - startTime) +  ' ms'));
      }
    }, Math.max(0, timeout));
  } catch (ex) {
    if (response.isPending()) {
      response.reject(ex);
    }
  }

  return response.promise;
};

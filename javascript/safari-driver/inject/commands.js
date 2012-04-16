// Copyright 2012 Software Freedom Conservancy. All Rights Reserved.
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
 * @fileoverview Command handlers used by the SafariDriver's injected script.
 */

goog.provide('safaridriver.inject.commands');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.action');
goog.require('bot.dom');
goog.require('bot.inject');
goog.require('bot.locators');
goog.require('bot.window');
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.net.cookies');
goog.require('goog.style');
goog.require('safaridriver.inject.PageMessenger');
goog.require('webdriver.atoms.element');
goog.require('webdriver.error');
goog.require('webdriver.promise.Deferred');


/**
 * @type {!goog.debug.Logger}
 * @const
 * @private
 */
safaridriver.inject.commands.LOG_ = goog.debug.Logger.getLogger(
    'safaridriver.inject.commands');


/**
 * Loads a new URL in the current page.
 * @param {!safaridriver.Command} command The command object.
 */
safaridriver.inject.commands.loadUrl = function(command) {
  window.location.href = (/** @type {string} */command.getParameter('url'));
  // No need to send a response. The global page should be listening for the
  // navigate event.
};

/** Reloads the current page. */
safaridriver.inject.commands.reloadPage = function() {
  window.location.reload();
  // No need to send a response. The global page should be listening for the
  // navigate event.
};

/**
 * Stub that reports an error that navigating through the browser history does
 * not work for the SafariDriver.
 */
safaridriver.inject.commands.unsupportedHistoryNavigation = function() {
  throw Error('Yikes! Safari history navigation does not work. We can ' +
      'go forward or back, but once we do, we can no longer ' +
      'communicate with the page...');
};

/** @return {string} The document title. */
safaridriver.inject.commands.getTitle = function() {
  return document.title;
};

/** @return {string} A string representation of the current page source. */
safaridriver.inject.commands.getPageSource = function() {
  return new XMLSerializer().serializeToString(document);
};

/**
 * Defines an element locating command.
 * @param {function(!Object, (Document|Element)=):
 *     (Element|!goog.array.ArrayLike.<Element>)} locatorFn The locator function
 *     that should be used.
 * @return {function(!safaridriver.Command): !bot.inject.Response} The locator
 *     command function.
 * @private
 */
safaridriver.inject.commands.findElementCommand_ = function(locatorFn) {
  return function(command) {
    var locator = {};
    locator[command.getParameter('using')] = command.getParameter('value');

    var args = [locator];
    if (command.getParameter('id')) {
      args.push({'ELEMENT': command.getParameter('id')});
    }

    return bot.inject.executeScript(locatorFn, args);
  };
};

/**
 * Locates an element on the page.
 * @param {!safaridriver.Command} command The command object.
 * @return {bot.inject.Response} The command response.
 */
safaridriver.inject.commands.findElement =
    safaridriver.inject.commands.findElementCommand_(bot.locators.findElement);

/**
 * Locates multiple elements on the page.
 * @param {!safaridriver.Command} command The command object.
 * @return {bot.inject.Response} The command response.
 */
safaridriver.inject.commands.findElements =
    safaridriver.inject.commands.findElementCommand_(bot.locators.findElements);

/**
 * Retrieves the element that currently has focus.
 * @return {!bot.inject.Response} The response object.
 */
safaridriver.inject.commands.getActiveElement = function() {
  return (/** @type {!bot.inject.Response} */bot.inject.executeScript(
      bot.dom.getActiveElement, [bot.getWindow()]));
};

/**
 * Adds a new cookie to the page.
 * @param {!safaridriver.Command} command The command object.
 */
safaridriver.inject.commands.addCookie = function(command) {
  var cookie = command.getParameter('cookie');

  // The WebDriver wire protocol defines cookie expiration times in seconds
  // since midnight, January 1, 1970 UTC, but goog.net.Cookies expects them
  // to be in seconds since "right now".
  var maxAge = cookie['expiry'];
  if (goog.isNumber(maxAge)) {
    maxAge = new Date(maxAge) - goog.now();
  }

  // TODO: check whether cookie['domain'] is valid.
  goog.net.cookies.set(cookie['name'], cookie['value'], maxAge,
      cookie['path'], cookie['domain'], cookie['secure']);
};

/**
 * @return {!Array.<{name:string, value:string}>} A list of the cookies visible
 *     to the current page.
 */
safaridriver.inject.commands.getCookies = function() {
  var keys = goog.net.cookies.getKeys();
  return goog.array.map(keys, function(key) {
    return {
      'name': key,
      'value': goog.net.cookies.get(key)
    };
  });
};

safaridriver.inject.commands.deleteCookies = function() {
  goog.net.cookies.clear();
};

/**
 * Deletes a specified cookie.
 * @param {!safaridriver.Command} command The command object.
 */
safaridriver.inject.commands.deleteCookie = function(command) {
  goog.net.cookies.remove((/** @type {string} */command.getParameter('name')));
};

/**
 * Cretes a command that targets a specific DOM element.
 * @param {!Function} handlerFn The actual handler function. The first parameter
 *     should be the Element to target.
 * @param {...string} var_args Any named parameters which should be extracted
 *     and passed as arguments to {@code commandFn}.
 * @return {function(!safaridriver.Command)} The new element command function.
 * @private
 */
safaridriver.inject.commands.elementCommand_ = function(handlerFn, var_args) {
  var keys = goog.array.slice(arguments, 1);
  return function(command) {
    safaridriver.inject.commands.LOG_.info(
        'Parsing element command parameters: ' + JSON.stringify(
            command.getParameters()));

    var element = command.getParameter('id');
    if (!goog.isObject(element)) {
      element = {'ELEMENT': element};
    }
    var args = goog.array.concat(element, goog.array.map(keys, function(key) {
      return command.getParameter(key);
    }));

    safaridriver.inject.commands.LOG_.info(
        'Executing script with args: ' + JSON.stringify(args));
    return bot.inject.executeScript(handlerFn, args);
  };
};

safaridriver.inject.commands.clearElement =
    safaridriver.inject.commands.elementCommand_(bot.action.clear);

safaridriver.inject.commands.clickElement =
    safaridriver.inject.commands.elementCommand_(bot.action.click);

safaridriver.inject.commands.submitElement =
    safaridriver.inject.commands.elementCommand_(bot.action.submit);

safaridriver.inject.commands.getElementAttribute =
    safaridriver.inject.commands.elementCommand_(
        webdriver.atoms.element.getAttribute, 'name');

safaridriver.inject.commands.getElementLocation =
    safaridriver.inject.commands.elementCommand_(goog.style.getPageOffset);

safaridriver.inject.commands.getElementSize =
    safaridriver.inject.commands.elementCommand_(goog.style.getSize);

safaridriver.inject.commands.getElementText =
    safaridriver.inject.commands.elementCommand_(
        webdriver.atoms.element.getText);

safaridriver.inject.commands.getElementTagName =
    safaridriver.inject.commands.elementCommand_(function(el) {
      return el.tagName;
    });

safaridriver.inject.commands.isElementDisplayed =
    safaridriver.inject.commands.elementCommand_(bot.dom.isShown);

safaridriver.inject.commands.isElementEnabled =
    safaridriver.inject.commands.elementCommand_(bot.dom.isEnabled);

safaridriver.inject.commands.isElementSelected =
    safaridriver.inject.commands.elementCommand_(
        webdriver.atoms.element.isSelected);

safaridriver.inject.commands.elementEquals =
    safaridriver.inject.commands.elementCommand_(function(a, b) {
      return a === b;
    }, 'other');

safaridriver.inject.commands.getCssValue =
    safaridriver.inject.commands.elementCommand_(bot.dom.getEffectiveStyle,
        'propertyName');

safaridriver.inject.commands.sendKeysToElement =
    safaridriver.inject.commands.elementCommand_(function(element, keys) {
      // TODO: Handle special keys encoded in the Unicode PUA
      return bot.action.type(element, keys.join(''));
    }, 'value');

safaridriver.inject.commands.getWindowPosition = bot.window.getPosition;

safaridriver.inject.commands.setWindowPosition = function(command) {
  var position = new goog.math.Coordinate(
      command.getParameter('x'), command.getParameter('y'));
  bot.window.setPosition(position);
};

safaridriver.inject.commands.getWindowSize = bot.window.getSize;

safaridriver.inject.commands.setWindowSize = function(command) {
  var size = new goog.math.Size(
      command.getParameter('width'), command.getParameter('height'));
  bot.window.setSize(size);
};


/**
 * Sends
 * @param {!safaridriver.Command} command The command to execute.
 * @param {!safaridriver.inject.PageMessenger} messenger The page messenger to
 *     use.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with the
 *     {@link webdriver.CommandResponse} from the page.
 * @throws {Error} If there is an error while sending the command to the page.
 */
safaridriver.inject.commands.executeScript = function(command, messenger) {
  // Decode the command arguments from WebDriver's wire protocol.
  var sendResult = bot.inject.executeScript(function(args) {
    command.setParameter('args', args);
  }, [command.getParameter('args')]);
  webdriver.error.checkResponse(
      (/** @type {!bot.inject.Response} */sendResult));

  var response = new webdriver.promise.Deferred();

  // When executing async script, the bot.inject.executeAsyncScript atom will
  // detect a page unload event, but the error won't make it back to the
  // global extension before the unload actually occurs. The message must go
  // from web page -> injected script -> extension. Each hop is an async
  // message, so the unload error will get dropped before it makes it to the
  // extension. So, we check for it here.
  window.addEventListener('unload', onunload, false);

  // Send the command using the provided messenger, then encode the response for
  // WebDriver's wire protocol.
  messenger.sendCommand(command).then(function(result) {
    window.removeEventListener('unload', onunload, false);
    if (response.isPending()) {
      response.resolve(bot.inject.wrapValue(result));
    }
  });

  return response.promise;

  function onunload() {
    window.removeEventListener('unload', onunload, false);
    if (response.isPending()) {
      var error = new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
          'Detected a page unload event; script execution does not work ' +
          'across page loads.');
      response.reject(error);
    }
  }
};
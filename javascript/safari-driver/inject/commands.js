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
goog.require('bot.action');
goog.require('bot.dom');
goog.require('bot.inject');
goog.require('bot.locators');
goog.require('bot.window');
goog.require('goog.array');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.net.cookies');
goog.require('goog.style');
goog.require('webdriver.atoms.element');


/**
 * Loads a new URL in the current page.
 * @param {!Object.<*>} parameters The command parameters.
 */
safaridriver.inject.commands.loadUrl = function(parameters) {
  window.location.href = parameters['url'];
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

/** @return {string} A string representation of the current page source. */
safaridriver.inject.commands.getPageSource = function() {
  return new XMLSerializer().serializeToString(document);
};

/**
 * Defines an element locating command.
 * @param {function(!Object, (Document|Element)=):
 *     (Element|!goog.array.ArrayLike.<Element>)} locatorFn The locator function
 *     that should be used.
 * @return {function(!Object):!bot.inject.Response} The locator command
 *     function.
 * @private
 */
safaridriver.inject.commands.findElementCommand_ = function(locatorFn) {
  return function(parameters) {
    var locator = {};
    locator[parameters['using']] = parameters['value'];

    var args = [locator];
    if (parameters['id']) {
      args.push({'ELEMENT': parameters['id']});
    }

    return bot.inject.executeScript(locatorFn, args);
  };
};

/**
 * Locates an element on the page.
 * @param {!Object} parameters The command parameters.
 * @return {bot.inject.Response} The command response.
 */
safaridriver.inject.commands.findElement =
    safaridriver.inject.commands.findElementCommand_(bot.locators.findElement);

/**
 * Locates multiple elements on the page.
 * @param {!Object} parameters The command parameters.
 * @return {bot.inject.Response} The command response.
 */
safaridriver.inject.commands.findElements =
    safaridriver.inject.commands.findElementCommand_(bot.locators.findElements);

/**
 * Retrieves the element that currently has focus.
 * @return {!bot.inject.Response} The response object.
 */
safaridriver.inject.commands.getActiveElement = function() {
  return bot.inject.executeScript(bot.dom.getActiveElement,
      [bot.getWindow()]);
};

/**
 * Adds a new cookie to the page.
 * @param {!Object} parameters The command parameters.
 */
safaridriver.inject.commands.addCookie = function(parameters) {
  var cookie = parameters['cookie'];

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
 * @param {!Object} parameters The command parameters.
 */
safaridriver.inject.commands.deleteCookie = function(parameters) {
  goog.net.cookies.remove(parameters['name']);
};

/**
 * Cretes a command that targets a specific DOM element.
 * @param {!Function} handlerFn The actual handler function. The first parameter
 *     should be the Element to target.
 * @param {...string} var_args Any named parameters which should be extracted
 *     and passed as arguments to {@code commandFn}.
 * @return {function(!Object)} The new element command function.
 * @private
 */
safaridriver.inject.commands.elementCommand_ = function(handlerFn, var_args) {
  var keys = goog.array.slice(arguments, 1);
  return function(parameters) {
    var element = {'ELEMENT': parameters['id']};
    var args = goog.array.concat(element, goog.array.map(keys, function(key) {
      return parameters[key];
    }));
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

safaridriver.inject.commands.setWindowPosition = function(parameters) {
  var position = new goog.math.Coordinate(parameters['x'], parameters['y']);
  bot.window.setPosition(position);
};

safaridriver.inject.commands.getWindowSize = bot.window.getSize;

safaridriver.inject.commands.setWindowSize = function(parameters) {
  var size = new goog.math.Size(parameters['width'], parameters['height']);
  bot.window.setSize(size);
};

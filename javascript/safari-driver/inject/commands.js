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
 * @fileoverview Command handlers used by the SafariDriver's injected script.
 */

goog.provide('safaridriver.inject.commands');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.action');
goog.require('bot.dom');
goog.require('bot.frame');
goog.require('bot.inject');
goog.require('bot.inject.cache');
goog.require('bot.locators');
goog.require('bot.response');
goog.require('bot.window');
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.net.cookies');
goog.require('goog.style');
goog.require('safaridriver.inject.message.Activate');
goog.require('webdriver.atoms.element');
goog.require('webdriver.promise.Deferred');


/**
 * @type {!goog.debug.Logger}
 * @const
 * @private
 */
safaridriver.inject.commands.LOG_ = goog.debug.Logger.getLogger(
    'safaridriver.inject.commands');


/** @return {string} The name of the current window. */
safaridriver.inject.commands.getWindowName = function() {
  return window.name;
};


/** @return {string} The current URL. */
safaridriver.inject.commands.getCurrentUrl = function() {
  return window.location.href;
};


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
 * @return {function(!safaridriver.Command): !bot.response.ResponseObject} The
 *     locator command function.
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
 * @return {!bot.response.ResponseObject} The command response.
 */
safaridriver.inject.commands.findElement =
    safaridriver.inject.commands.findElementCommand_(bot.locators.findElement);


/**
 * Locates multiple elements on the page.
 * @param {!safaridriver.Command} command The command object.
 * @return {bot.response.ResponseObject} The command response.
 */
safaridriver.inject.commands.findElements =
    safaridriver.inject.commands.findElementCommand_(bot.locators.findElements);


/**
 * Retrieves the element that currently has focus.
 * @return {!bot.response.ResponseObject} The response object.
 */
safaridriver.inject.commands.getActiveElement = function() {
  var getActiveElement = goog.partial(bot.dom.getActiveElement, document);
  return (/** @type {!bot.response.ResponseObject} */bot.inject.executeScript(
      getActiveElement, []));
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


/** Deletes all cookies visible to the current page. */
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
 * Ensures the provided command's element is encoded as a WebElement JSON
 * object, as defined by the WebDriver wire protocol.
 * @param {!safaridriver.Command} command The command to modify.
 * @return {!safaridriver.Command} The modified command.
 * @private
 */
safaridriver.inject.commands.prepareElementCommand_ = function(command) {
  var element = command.getParameter('id');
  if (goog.isDef(element) && !goog.isObject(element)) {
    command.setParameter('id', {
      'ELEMENT': element
    });
  }
  return command;
};


/**
 * Creates a command that targets a specific DOM element.
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
    command = safaridriver.inject.commands.prepareElementCommand_(command);
    var element = command.getParameter('id');

    var args = goog.array.concat(element, goog.array.map(keys, function(key) {
      return command.getParameter(key);
    }));

    return bot.inject.executeScript(handlerFn, args);
  };
};


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see bot.action.clear
 */
safaridriver.inject.commands.clearElement =
    safaridriver.inject.commands.elementCommand_(bot.action.clear);


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see bot.action.click
 */
safaridriver.inject.commands.clickElement =
    safaridriver.inject.commands.elementCommand_(bot.action.click);


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see bot.action.submit
 */
safaridriver.inject.commands.submitElement =
    safaridriver.inject.commands.elementCommand_(bot.action.submit);


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see webdriver.atoms.element.getAttribute
 */
safaridriver.inject.commands.getElementAttribute =
    safaridriver.inject.commands.elementCommand_(
        webdriver.atoms.element.getAttribute, 'name');


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see goog.style.getPageOffset
 */
safaridriver.inject.commands.getElementLocation =
    safaridriver.inject.commands.elementCommand_(goog.style.getPageOffset);


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see bot.dom.getLocationInView
 */
safaridriver.inject.commands.getLocationInView =
    safaridriver.inject.commands.elementCommand_(bot.dom.getLocationInView);


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see goog.style.getSize
 */
safaridriver.inject.commands.getElementSize =
    safaridriver.inject.commands.elementCommand_(goog.style.getSize);


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see webdriver.atoms.element.getText
 */
safaridriver.inject.commands.getElementText =
    safaridriver.inject.commands.elementCommand_(
        webdriver.atoms.element.getText);


/**
 * @param {!safaridriver.Command} command The command to execute.
 */
safaridriver.inject.commands.getElementTagName =
    safaridriver.inject.commands.elementCommand_(function(el) {
  return el.tagName;
});


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see bot.dom.isShown
 */
safaridriver.inject.commands.isElementDisplayed =
    safaridriver.inject.commands.elementCommand_(bot.dom.isShown);


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see bot.dom.isEnabled
 */
safaridriver.inject.commands.isElementEnabled =
    safaridriver.inject.commands.elementCommand_(bot.dom.isEnabled);


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see webdriver.atoms.element.isSelected
 */
safaridriver.inject.commands.isElementSelected =
    safaridriver.inject.commands.elementCommand_(
        webdriver.atoms.element.isSelected);


/**
 * @param {!safaridriver.Command} command The command to execute.
 */
safaridriver.inject.commands.elementEquals =
    safaridriver.inject.commands.elementCommand_(function(a, b) {
  return a === b;
}, 'other');


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see bot.dom.getEffectiveStyle
 */
safaridriver.inject.commands.getCssValue =
    safaridriver.inject.commands.elementCommand_(bot.dom.getEffectiveStyle,
        'propertyName');


/**
 * @return {!goog.math.Coordinate} The position of the window.
 * @see bot.window.getPosition
 */
safaridriver.inject.commands.getWindowPosition = function() {
  return bot.window.getPosition();
};


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see bot.window.setPosition
 */
safaridriver.inject.commands.setWindowPosition = function(command) {
  var position = new goog.math.Coordinate(
      (/** @type {number} */ command.getParameter('x')),
      (/** @type {number} */ command.getParameter('y')));
  bot.window.setPosition(position);
};


/**
 * @return {!goog.math.Size} The size of the window.
 * @see bot.window.getSize
 */
safaridriver.inject.commands.getWindowSize = function() {
  return bot.window.getSize();
};


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @see bot.window.setSize
 */
safaridriver.inject.commands.setWindowSize = function(command) {
  var size = new goog.math.Size(
      (/** @type {number} */command.getParameter('width')),
      (/** @type {number} */command.getParameter('height')));
  bot.window.setSize(size);
};


/** Maximizes the window. */
safaridriver.inject.commands.maximizeWindow = function() {
  window.moveTo(0, 0);
  window.resizeTo(window.screen.width, window.screen.height);
};


/**
 * Executes a command in the context of the current page.
 * @param {!safaridriver.Command} command The command to execute.
 * @param {!safaridriver.inject.PageScript} pageScript Object to use to execute
 *     the command in the context of the page under test.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with the
 *     {@link bot.response.ResponseObject} from the page.
 * @throws {Error} If there is an error while sending the command to the page.
 */
safaridriver.inject.commands.executeInPage = function(command, pageScript) {
  command = safaridriver.inject.commands.prepareElementCommand_(command);
  return pageScript.execute(command);
};


/**
 * Locates a frame and sends a message to it to activate itself with the
 * extension. The located frame will be
 * @param {!safaridriver.Command} command The command to execute.
 *     the target of all subsequent commands.
 * @throws {Error} If there is an error whilst locating the frame.
 */
safaridriver.inject.commands.switchToFrame = function(command) {
  var id = command.getParameter('id');
  var frameWindow;
  if (goog.isNull(id)) {
    safaridriver.inject.commands.LOG_.info('Resetting focus to window.top');
    frameWindow = window.top;
  } else if (goog.isString(id)) {
    safaridriver.inject.commands.LOG_.info(
        'Switching to frame by name or ID: ' + id);
    frameWindow = bot.frame.findFrameByNameOrId((/** @type {string} */id));
  } else if (goog.isNumber(id)) {
    safaridriver.inject.commands.LOG_.info(
        'Switching to frame by index: ' + id);
    frameWindow = bot.frame.findFrameByIndex((/** @type {number} */id));
  } else {
    var elementKey = (/** @type {string} */id[bot.inject.ELEMENT_KEY]);
    safaridriver.inject.commands.LOG_.info('Switching to frame by ' +
        'WebElement: ' + elementKey);
    // ID must be a WebElement. Pull it from the cache.
    var frameElement = bot.inject.cache.getElement(elementKey);
    frameWindow = bot.frame.getFrameWindow(
        (/** @type {!(HTMLIFrameElement|HTMLFrameElement)} */frameElement));
  }

  if (!frameWindow) {
    throw new bot.Error(bot.ErrorCode.NO_SUCH_FRAME,
        'Unable to locate frame with ' + JSON.stringify(id));
  }

  // De-activate ourselves. We should no longer respond to commands until
  // we are re-activated.
  safaridriver.inject.Tab.getInstance().setActive(false);

  var message = new safaridriver.inject.message.Activate(command);
  message.send(frameWindow);
};

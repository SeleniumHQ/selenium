// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Defines a pure-JavaScript CommandExecutor implementation.
 */

goog.provide('webdriver.browser.CommandExecutor');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.dom');
goog.require('bot.inject');
goog.require('bot.inject.cache');
goog.require('bot.locators');
goog.require('bot.response');
goog.require('bot.window');
goog.require('goog.Disposable');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.log');
goog.require('webdriver.CommandExecutor');
goog.require('webdriver.CommandName');
goog.require('webdriver.atoms.element');
goog.require('webdriver.promise');



/**
 * A pure JavaScript command executor suitable for use in a browser.
 * @param {!Window} win The window to direct commands to.
 * @constructor
 * @extends {goog.Disposable}
 * @implements {webdriver.CommandExecutor}
 */
webdriver.browser.CommandExecutor = function(win) {
  goog.base(this);

  /** @private {!Window} */
  this.window_ = win;

  /** @private {goog.log.Logger} */
  this.log_ = goog.log.getLogger('webdriver.browser.CommandExecutor');

  /** @private {!goog.events.EventHandler} */
  this.handler_ = new goog.events.EventHandler(this);

  this.listenForUnload_();
};
goog.inherits(webdriver.browser.CommandExecutor, goog.Disposable);


/**
 * A deferred used to track when the window loads. This will be
 * null when the window is not currently loading.
 * @private {webdriver.promise.Deferred}
 */
webdriver.browser.CommandExecutor.prototype.loadingDeferred_ = null;


/**
 * Whether the unload listener is installed.
 * @private {boolean}
 */
webdriver.browser.CommandExecutor.prototype.listening_ = false;


/**
 * The timeout for asynchronous scripts.
 * @private {number}
 */
webdriver.browser.CommandExecutor.prototype.scriptTimeout_ = 0;


/** @override */
webdriver.browser.CommandExecutor.prototype.disposeInternal = function() {
  this.handler_.dispose();
  if (this.loadingDeferred_) {
    this.loadingDeferred_.reject(Error('Executor was disposed'));
    this.loadingDeferred_ = null;
  }
};


/** @override */
webdriver.browser.CommandExecutor.prototype.execute = function(command) {
  if (this.isDisposed()) {
    return webdriver.promise.rejected(Error('Executor was disposed'));
  }

  if (this.window_.closed) {
    return webdriver.promise.rejected(new bot.Error(
        bot.ErrorCode.NO_SUCH_WINDOW, 'The window has closed'));
  }

  var handler = webdriver.browser.CommandExecutor.COMMAND_MAP_[
      command.getName()];
  if (!handler) {
    return webdriver.promise.rejected(new bot.Error(
        bot.ErrorCode.UNKNOWN_COMMAND,
        'Unsupported command: ' + command.getName()));
  }

  var executeCommand = goog.bind(function() {
    goog.log.info(this.log_, 'Executing ' + command.getName());
    try {
      var result = handler.call(this, command);
    } catch (ex) {
      callback(ex);
      return;
    }
    return webdriver.promise.fulfilled(result)
        .then(bot.response.createResponse, bot.response.createErrorResponse);
  }, this);

  if (this.loadingDeferred_) {
    goog.log.info(this.log_, 'Waiting for window to load');
    return this.loadingDeferred_.then(executeCommand);
  } else {
    return executeCommand();
  }
};


/**
 * @private {number}
 * @const
 */
webdriver.browser.CommandExecutor.STATE_CHECK_TIMEOUT_ = 10;


/**
 * Registers an unload listener on the window targeted by this instance.
 * This must be called each time the window loads a new document.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.listenForUnload_ = function() {
  if (!this.listening_ && !this.window_.closed) {
    this.handler_.listenOnce(
        this.window_, goog.events.EventType.UNLOAD, this.onUnload_);
    this.listening_ = true;
  }
};


/** @private */
webdriver.browser.CommandExecutor.prototype.onUnload_ = function() {
  this.listening_ = false;
  goog.log.info(this.log_, 'The window has unloaded');
  if (!this.loadingDeferred_) {
    this.loadingDeferred_ = webdriver.promise.defer(function() {
      throw Error('This Deferred may not be canceled');
    });
  }
  this.checkWindowState_();
};


/** @private */
webdriver.browser.CommandExecutor.prototype.checkWindowState_ = function() {
  setTimeout(goog.bind(check, this),
      webdriver.browser.CommandExecutor.STATE_CHECK_TIMEOUT_);

  /** @this {webdriver.browser.CommandExecutor} */
  function check() {
    if (this.isDisposed()) {
      return;  // Do nothing.
    }

    goog.log.info(this.log_, 'Checking window state');
    this.listenForUnload_();

    // Do not check the readyState if this was called because the window
    // dispatched an unload event.
    if (this.window_.closed ||
        (this.window_.document &&
         this.window_.document.readyState === 'complete')) {
      goog.log.info(this.log_, 'Window is ready');
      if (this.loadingDeferred_) {
        this.loadingDeferred_.fulfill();
        this.loadingDeferred_ = null;
      }
    } else {
      this.checkWindowState_();
    }
  }
};


/**
 * Loads a new URL in the current window.
 * @param {!webdriver.Command} command The command.
 * @return {!webdriver.promise.Promise} A promise that will resolve when the
 *     window has loaded the URL.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.loadUrl_ = function(command) {
  var url = command.getParameter('url');
  goog.log.info(this.log_, 'Loading ' + url);
  var win = this.window_;
  // TODO: Only wait for page load if URL points offsite.
  return this.executeAndWaitForLoad_(function() {
    win.location.href = url;
  });
};


/**
 * Navigates back one page in the browser history.
 * @return {!webdriver.promise.Promise} A promise that will resolve when the
 *     window has finished loading.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.goBack_ = function() {
  goog.log.info(this.log_, 'Navigating backwards');
  var win = this.window_;
  return this.executeAndWaitForLoad_(function() {
    bot.setWindow(win);
    bot.window.back();  // TODO: window should be injectable.
  });
};


/**
 * Navigates back one page in the browser history.
 * @return {!webdriver.promise.Promise} A promise that will resolve when the
 *     window has finished loading.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.goForward_ = function() {
  goog.log.info(this.log_, 'Navigating forwards');
  var win = this.window_;
  return this.executeAndWaitForLoad_(function() {
    bot.setWindow(win);
    bot.window.forward();  // TODO: window should be injectable.
  });
};


/**
 * Navigates back one page in the browser history.
 * @return {!webdriver.promise.Promise} A promise that will resolve when the
 *     window has finished loading.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.refresh_ = function() {
  goog.log.info(this.log_, 'Reloading the current page');
  var win = this.window_;
  return this.executeAndWaitForLoad_(function() {
    win.location.reload();
  });
};


/**
 * @return {string} The window's document's current title.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.getTitle_ = function() {
  return this.window_.document && this.window_.document.title || '';
};


/**
 * Executes a function, then waits for the window to load.
 * @param {function()} fn The function to execute.
 * @return {!webdriver.promise.Promise} A promise that will resolve when the
 *     window has finished loading.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.executeAndWaitForLoad_ =
    function(fn) {
  // TODO: A new page will not actually load if only the hash is changing.
  this.loadingDeferred_ = webdriver.promise.defer(function() {
    throw Error('This Deferred may not be canceled');
  });
  // Allow the command to be cancelled, but not the load wait.
  var d = webdriver.promise.defer();
  this.loadingDeferred_.then(d.fulfill, d.reject);
  fn();
  return d.promise;
};


/**
 * Locates an element on the page.
 * @param {!webdriver.Command} command The command.
 * @return {bot.response.ResponseObject} A response object with the
 *     encoded element.
 * @throws {bot.Error} If the element cannot be found.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.findElement_ = function(
    command) {
  var using = command.getParameter('using');
  var value = command.getParameter('value');
  var locator = {};
  locator[using] = value;

  var root = this.window_.document;
  var id = command.getParameter('id');
  if (id) {
    root = bot.inject.cache.getElement(
        id[bot.inject.ELEMENT_KEY], this.window_.document);
  }

  var el = bot.locators.findElement(locator, root);
  if (el) {
    return bot.response.createResponse(bot.inject.wrapValue(el));
  } else {
    throw new bot.Error(
        bot.ErrorCode.NO_SUCH_ELEMENT,
        'Unable to locate element by ' + using + ': ' + value);
  }
};


/**
 * Locates multiple elements on the page.
 * @param {!webdriver.Command} command The command.
 * @return {bot.response.ResponseObject} A response object with the
 *     encoded elements.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.findElements_ = function(
    command) {
  var using = command.getParameter('using');
  var value = command.getParameter('value');
  var locator = {};
  locator[using] = value;

  var root = this.window_.document;
  var id = command.getParameter('id');
  if (id) {
    root = bot.inject.cache.getElement(
        id[bot.inject.ELEMENT_KEY], this.window_.document);
  }

  var elements = bot.locators.findElements(locator, root);
  return bot.response.createResponse(bot.inject.wrapValue(elements));
};


/**
 * Retrieves the visible text for an element on the page.
 * @param {!webdriver.Command} command The command.
 * @return {string} The visible text.
 * @throws {bot.Error} If the element reference is no longer valid.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.getElementText_ = function(
    command) {
  var id = command.getParameter('id')[bot.inject.ELEMENT_KEY];
  var el = bot.inject.cache.getElement(id, this.window_.document);
  return bot.dom.getVisibleText(el);
};



/**
 * Get the value of the given property or attribute. If the "attribute" is for
 * a boolean property, we return null in the case where the value is false. If
 * the attribute name is "style" an attempt to convert that style into a string
 * is done.
 * @param {!webdriver.Command} command The command.
 * @return {?string} The string value of the attribute or property, or null.
 * @throws {bot.Error} If the element reference is no longer valid.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.getElementAttribute_ = function(
    command) {
  var id = command.getParameter('id')[bot.inject.ELEMENT_KEY];
  var el = bot.inject.cache.getElement(id, this.window_.document);
  return webdriver.atoms.element.getAttribute(
      el, command.getParameter('name'));
};



/**
 * Returns an element's tagName.
 * @param {!webdriver.Command} command The command.
 * @return {string} The element tag name.
 * @throws {bot.Error} If the element reference is no longer valid.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.getElementTagName_ = function(
    command) {
  var id = command.getParameter('id')[bot.inject.ELEMENT_KEY];
  var el = bot.inject.cache.getElement(id, this.window_.document);
  return el.tagName.toLowerCase();
};


/**
 * Clicks on an element.
 * @param {!webdriver.Command} command The command.
 * @throws {bot.Error} If the element reference is no longer valid.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.clickElement_ = function(
    command) {
  var id = command.getParameter('id')[bot.inject.ELEMENT_KEY];
  var el = bot.inject.cache.getElement(id, this.window_.document);
  bot.action.click(el);
};


/**
 * Sends a sequence of key strokes to the target element.
 * @param {!webdriver.Command} command The command.
 * @throws {bot.Error} If the element reference is no longer valid.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.sendKeysToElement_ = function(
    command) {
  var keys = command.getParameter('value');
  var id = command.getParameter('id')[bot.inject.ELEMENT_KEY];
  var el = bot.inject.cache.getElement(id, this.window_.document);
  webdriver.atoms.element.type(el, keys);
};


/**
 * Tests whether an element is displayed on the page.
 * @param {!webdriver.Command} command The command.
 * @return {boolean} Whether the element is displayed.
 * @throws {bot.Error} If the element reference is no longer valid.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.isElementDisplayed_ = function(
    command) {
  var id = command.getParameter('id')[bot.inject.ELEMENT_KEY];
  var el = bot.inject.cache.getElement(id, this.window_.document);
  return bot.dom.isShown(el);
};


/**
 * Executes a user-supplier snippet of JavaScript in the context of the page
 * under test.
 * @param {!webdriver.Command} command The command.
 * @return {bot.response.ResponseObject} The script result.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.executeScript_ = function(
    command) {
  var script = command.getParameter('script');
  var args = command.getParameter('args');
  return bot.inject.executeScript(script, args, false, this.window_);
};


/**
 * Executes a user-supplier snippet of JavaScript in the context of the page
 * under test.
 * @param {!webdriver.Command} command The command.
 * @return {!webdriver.promise.Promise.<bot.response.ResponseObject>} A promise
 *     that will resolve with the script result.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.executeAsyncScript_ = function(
    command) {
  var script = command.getParameter('script');
  var args = command.getParameter('args');
  var d = webdriver.promise.defer();
  bot.inject.executeAsyncScript(
      script, args, this.scriptTimeout_, d.fulfill, false, this.window_);
  return d.promise;
};


/**
 * Adjusts the asynchronous script timeout.
 * @param {!webdriver.Command} command The command.
 * @private
 */
webdriver.browser.CommandExecutor.prototype.setScriptTimeout_ = function(
    command) {
  var timeout = command.getParameter('ms');
  if (!goog.isNumber(timeout)) {
    throw Error('Timeout not a number: ' + timeout);
  }
  this.scriptTimeout_ = timeout;
};


/**
 * @typedef {(function(this: webdriver.browser.CommandExecutor,
 *                     !webdriver.Command)|
 *            function(this: webdriver.browser.CommandExecutor,
 *                     !webdriver.Command): *|
 *            function(this: webdriver.browser.CommandExecutor)|
 *            function(this: webdriver.browser.CommandExecutor): *)}
 */
webdriver.browser.CommandExecutor.Handler;


/**
 * @private {!Object.<!webdriver.CommandName,
 *                    !webdriver.browser.CommandExecutor.Handler>}
 * @const
 */
webdriver.browser.CommandExecutor.COMMAND_MAP_ = {};
goog.scope(function() {
var map = webdriver.browser.CommandExecutor.COMMAND_MAP_;
var proto = webdriver.browser.CommandExecutor.prototype;
var name = webdriver.CommandName;

map[name.QUIT] = goog.Disposable.prototype.dispose;

map[name.GET] = proto.loadUrl_;
map[name.GO_BACK] = proto.goBack_;
map[name.GO_FORWARD] = proto.goForward_;
map[name.REFRESH] = proto.refresh_;
map[name.GET_TITLE] = proto.getTitle_;

// The following commands are intentionally left unsupported.
/*
map[name.GET_WINDOW_HANDLES] = goog.abstractMethod;
map[name.GET_CURRENT_WINDOW_HANDLE] = goog.abstractMethod;
map[name.CLOSE] = goog.abstractMethod;
map[name.SWITCH_TO_WINDOW] = goog.abstractMethod;
*/

map[name.EXECUTE_SCRIPT] = proto.executeScript_;
map[name.EXECUTE_ASYNC_SCRIPT] = proto.executeAsyncScript_;
map[name.SET_SCRIPT_TIMEOUT] = proto.setScriptTimeout_;

map[name.FIND_ELEMENT] = proto.findElement_;
map[name.FIND_ELEMENTS] = proto.findElements_;
map[name.FIND_CHILD_ELEMENT] = proto.findElement_;
map[name.FIND_CHILD_ELEMENTS] = proto.findElements_;

map[name.CLICK_ELEMENT] = proto.clickElement_;
map[name.GET_ELEMENT_ATTRIBUTE] = proto.getElementAttribute_;
map[name.GET_ELEMENT_TEXT] = proto.getElementText_;
map[name.GET_ELEMENT_TAG_NAME] = proto.getElementTagName_;
map[name.SEND_KEYS_TO_ELEMENT] = proto.sendKeysToElement_;
map[name.IS_ELEMENT_DISPLAYED] = proto.isElementDisplayed_;
});  // goog.scope

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
 * @fileoverview Script injected into each page when its DOM has fully loaded.
 */

goog.provide('safaridriver.inject');

goog.require('bot.ErrorCode');
goog.require('bot.locators.xpath');
goog.require('bot.response');
goog.require('goog.debug.Logger');
goog.require('safaridriver.Command');
goog.require('safaridriver.console');
goog.require('safaridriver.inject.commands');
goog.require('safaridriver.inject.message');
goog.require('safaridriver.inject.message.Activate');
goog.require('safaridriver.inject.message.ActivateFrame');
goog.require('safaridriver.inject.message.Encode');
goog.require('safaridriver.inject.message.ReactivateFrame');
goog.require('safaridriver.inject.page');
goog.require('safaridriver.inject.state');
goog.require('safaridriver.message');
goog.require('safaridriver.message.CommandMessage');
goog.require('safaridriver.message.ConnectMessage');
goog.require('safaridriver.message.MessageTarget');
goog.require('safaridriver.message.ResponseMessage');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');
goog.require('webdriver.promise');


/**
 * @type {!goog.debug.Logger}
 * @const
 */
safaridriver.inject.LOG = goog.debug.Logger.getLogger(
    'safaridriver.inject.' + safaridriver.inject.state.FRAME_ID);


/**
 * @type {!Object.<!webdriver.promise.Deferred>}
 * @private
 */
safaridriver.inject.pendingCommands_ = {};


/**
 * A promise that is resolved once the SafariDriver page script has been
 * loaded by the current page.
 * @type {webdriver.promise.Deferred}
 * @private
 */
safaridriver.inject.installedPageScript_ = null;


/** Initializes this injected script. */
safaridriver.inject.init = function() {
  safaridriver.console.init();
  safaridriver.inject.LOG.info(
      'Loaded injected script for: ' + window.location.href +
      ' (is ' + (safaridriver.inject.state.isActive() ? '' : 'not ') +
      'active)');

  new safaridriver.message.MessageTarget(safari.self).
      on(safaridriver.message.CommandMessage.TYPE,
         safaridriver.inject.onCommand_);

  new safaridriver.message.MessageTarget(window).
      on(safaridriver.inject.message.Activate.TYPE,
         safaridriver.inject.onActivate_).
      on(safaridriver.inject.message.ActivateFrame.TYPE,
         safaridriver.inject.onActivateFrame_).
      on(safaridriver.inject.message.ReactivateFrame.TYPE,
         safaridriver.inject.onReactivateFrame_).
      on(safaridriver.message.ConnectMessage.TYPE,
         safaridriver.inject.onConnect_).
      on(safaridriver.inject.message.Encode.TYPE,
         safaridriver.inject.onEncode_).
      on(safaridriver.message.Type.LOAD, safaridriver.inject.onLoad_).
      on(safaridriver.message.ResponseMessage.TYPE,
         safaridriver.inject.onResponse_);

  window.addEventListener('load', function() {
    var message = new safaridriver.message.Message(
        safaridriver.message.Type.LOAD);

    var target = safaridriver.inject.state.IS_TOP
        ? safari.self.tab : window.top;
    message.send(target);
  }, true);

  window.addEventListener('unload', function() {
    if (safaridriver.inject.state.IS_TOP ||
        safaridriver.inject.state.isActive()) {
      var message = new safaridriver.message.Message(
          safaridriver.message.Type.UNLOAD);
      // If we send this message asynchronously, which is the norm, then the
      // page will complete its unload before the message is sent. Use sendSync
      // to ensure the extension gets our message.
      message.sendSync(safari.self.tab);
    }
  }, true);
};


/**
 * Installs a script in the web page that facilitates communication between this
 * sandboxed environment and the web page.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when the
 *     page has been fully initialized.
 * @private
 */
safaridriver.inject.installPageScript_ = function() {
  if (!safaridriver.inject.installedPageScript_) {
    safaridriver.inject.LOG.info('Installing page script');
    safaridriver.inject.installedPageScript_ =
        new webdriver.promise.Deferred();
    safaridriver.inject.page.init();
  }
  return safaridriver.inject.installedPageScript_.promise;
};


/**
 * Responds to an activate message sent from another frame in this window.
 * @param {!safaridriver.inject.message.Activate} message The activate message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.onActivate_ = function(message, e) {
  // Only respond to messages that came from another injected script in a frame
  // belonging to this window.
  if (!message.isSameOrigin() ||
      !safaridriver.inject.message.isFromFrame(e)) {
    return;
  }

  safaridriver.inject.LOG.info(
      'Activating frame for future command handling.');
  safaridriver.inject.state.setActive(true);

  if (safaridriver.inject.state.IS_TOP) {
    var response = bot.response.createResponse(null);
    safaridriver.inject.sendResponse_(message.getCommand(), response);
  } else {
    var activateFrame = new safaridriver.inject.message.ActivateFrame(
        message.getCommand());
    activateFrame.send(window.top);
    // Let top notify the extension that a new frame has been activated.
  }
};


/**
 * @param {!safaridriver.inject.message.ActivateFrame} message The activate
 *     message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.onActivateFrame_ = function(message, e) {
  if (safaridriver.inject.state.IS_TOP &&
      safaridriver.inject.message.isFromFrame(e)) {
    safaridriver.inject.LOG.info('Sub-frame has been activated');
    safaridriver.inject.state.setActiveFrame(e.source);

    var response = bot.response.createResponse(null);
    safaridriver.inject.sendResponse_(message.getCommand(), response);
  }
};


/**
 * @param {!safaridriver.message.Message} message The activate message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.onReactivateFrame_ = function(message, e) {
  if (!safaridriver.inject.state.IS_TOP &&
      safaridriver.inject.message.isFromTop(e)) {
    safaridriver.inject.LOG.fine('Sub-frame has been re-activated');

    safaridriver.inject.state.setActive(true);

    message = new safaridriver.message.Message(safaridriver.message.Type.LOAD);
    message.sendSync(safari.self.tab);
  }
};


/**
 * Forwards connection requests from the content page to the extension.
 * @param {!safaridriver.message.Message} message The connect message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.onConnect_ = function(message, e) {
  if (message.isSameOrigin() ||
      !safaridriver.inject.message.isFromFrame(e)) {
    return;
  }
  safaridriver.inject.LOG.info(
      'Content page has requested a WebDriver client connection to ' +
          message.getUrl());
  message.sendSync(safari.self.tab);
};


/**
 * Responds to load messages.
 * @param {!safaridriver.message.Message} message The message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.onLoad_ = function(message, e) {
  if (message.isSameOrigin()) {
    if (safaridriver.inject.message.isFromFrame(e) &&
        e.source &&
        e.source === safaridriver.inject.state.getActiveFrame()) {
      safaridriver.inject.LOG.info('Active frame has reloaded');

      // Tell the frame that has just finished loading that it was our last
      // activate frame and should reactivate itself.
      var reactivate = new safaridriver.inject.message.ReactivateFrame();
      reactivate.send((/** @type {!Window} */e.source));
    }
  } else if (safaridriver.inject.message.isFromSelf(e) &&
      safaridriver.inject.installedPageScript_ &&
      safaridriver.inject.installedPageScript_.isPending()) {
    safaridriver.inject.installedPageScript_.resolve();
  }
};


/**
 * @param {!safaridriver.inject.message.Encode} message The message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.onEncode_ = function(message, e) {
  if (!e.source) {
    safaridriver.inject.LOG.severe('Not looking up element: ' +
        message.getXPath() + '; no window to respond to!');
    return;
  }

  var result = bot.inject.executeScript(function() {
    var xpath = message.getXPath();
    return bot.locators.xpath.single(xpath, document);
  }, []);

  var response = new safaridriver.message.ResponseMessage(
      message.getId(), (/** @type {!bot.response.ResponseObject} */result));
  response.send(e.source);
};


/**
 * Handles response messages from the page.
 * @param {!safaridriver.message.ResponseMessage} message The message.
 * @param {!MessageEvent} e The original message.
 * @private
 */
safaridriver.inject.onResponse_ = function(message, e) {
  if (message.isSameOrigin() || !safaridriver.inject.message.isFromSelf(e)) {
    return;
  }

  var promise = safaridriver.inject.pendingCommands_[message.getId()];
  if (!promise) {
    safaridriver.inject.LOG.warning(
        'Received response to an unknown command: ' + message);
    return;
  }

  delete safaridriver.inject.pendingCommands_[message.getId()];

  var response = message.getResponse();
  try {
    response['value'] = safaridriver.inject.page.decodeValue(response['value']);
    promise.resolve(response);
  } catch (ex) {
    promise.reject(bot.response.createErrorResponse(ex));
  }
};


/**
 * Command message handler.
 * @param {!safaridriver.message.CommandMessage} message The command message.
 * @private
 */
safaridriver.inject.onCommand_ = function(message) {
  var command = message.getCommand();

  // If we detect an unload event and send a response, and then the command
  // handler _also_ detects the unload and attempts to send a response, avoid
  // sending the response a second time. Hopefully, we'll be smart and not do
  // this, but something could slip through the cracks.
  var sent = false;

  var handler = safaridriver.inject.TOP_COMMAND_MAP_[command.getName()];
  if (handler) {
    if (safaridriver.inject.state.IS_TOP) {
      executeCommand(handler);
    }
  } else if (safaridriver.inject.state.isActive()) {
    handler = safaridriver.inject.COMMAND_MAP_[command.getName()];
    if (handler) {
      executeCommand(handler);
    } else {
      sendError(Error('Unknown command: ' + message));
    }
  }

  function executeCommand(handler) {
    try {
      safaridriver.inject.LOG.info('Executing ' + command);

      window.addEventListener('unload', onUnload, true);

      // Don't schedule through webdriver.promise.Application; just execute the
      // command immediately. We're assuming the global page is scheduling
      // commands and only dispatching one at a time.
      webdriver.promise.when(
          handler(command, safaridriver.inject.sendCommandToPage),
          sendSuccess, sendError);
    } catch (ex) {
      sendError(ex);
    }
  }

  function onUnload() {
    if (command.getName() === webdriver.CommandName.EXECUTE_ASYNC_SCRIPT ||
        command.getName() === webdriver.CommandName.EXECUTE_SCRIPT) {
      var error = new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
          'Detected a page unload event; script execution does not work ' +
              'across page loads.');
      sendError(error);
    } else {
      sendSuccess(null);
    }
  }

  function sendError(error) {
    sendResponse(bot.response.createErrorResponse(error));
  }

  function sendSuccess(value) {
    var response = bot.response.createResponse(value);
    sendResponse(response);
  }

  function sendResponse(response) {
    window.removeEventListener('unload', onUnload, true);
    if (!sent) {
      sent = true;

      // The new frame is always the frame responsible for sending the response
      // to a switchToFrame command - unless the response is an error.
      if (command.getName() != webdriver.CommandName.SWITCH_TO_FRAME ||
          response['status'] != bot.ErrorCode.SUCCESS) {
        safaridriver.inject.sendResponse_(command, response);
      }
    }
  }
};


/**
 * Sends a command response to the extension.
 * @param {!safaridriver.Command} command The command this is a response to.
 * @param {!bot.response.ResponseObject} response The response to send.
 * @private
 */
safaridriver.inject.sendResponse_ = function(command, response) {
  safaridriver.inject.LOG.info('Sending response' +
      '\ncommand:  ' + command +
      '\nresponse: ' + JSON.stringify(response));

  var message = new safaridriver.message.ResponseMessage(command.id, response);
  message.sendSync(safari.self.tab);
};


/**
 * Sends a command message to the page.
 * @param {!safaridriver.Command} command The command to send.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when
 *     a response message has been received.
 */
safaridriver.inject.sendCommandToPage = function(command) {
  return safaridriver.inject.installPageScript_().addCallback(function() {
    var parameters = command.getParameters();
    parameters = (/** @type {!Object.<*>} */
        safaridriver.inject.page.encodeValue(parameters));
    command.setParameters(parameters);

    var message = new safaridriver.message.CommandMessage(command);
    safaridriver.inject.LOG.info('Sending message: ' + message);

    var commandResponse = new webdriver.promise.Deferred();
    safaridriver.inject.pendingCommands_[command.getId()] = commandResponse;
    message.send(window);
    return commandResponse.promise;
  });
};


/**
 * @typedef {(function(!safaridriver.Command, function(!safaridriver.Command))|
 *            function(!safaridriver.Command)|
 *            function())}
 */
safaridriver.inject.CommandHandler;

/**
 * Map of command names that should always be handled by the topmost frame,
 * regardless of whether it is currently active.
 * @type {!Object.<webdriver.CommandName, safaridriver.inject.CommandHandler>}
 * @const
 * @private
 */
safaridriver.inject.TOP_COMMAND_MAP_ = {};


/**
 * Maps command names to the function that handles it.
 * @type {!Object.<webdriver.CommandName, safaridriver.inject.CommandHandler>}
 * @const
 * @private
 */
safaridriver.inject.COMMAND_MAP_ = {};


goog.scope(function() {
  var CommandName = webdriver.CommandName;
  var topMap = safaridriver.inject.TOP_COMMAND_MAP_;
  var map = safaridriver.inject.COMMAND_MAP_;
  var commands = safaridriver.inject.commands;

  topMap[CommandName.GET] = commands.loadUrl;
  topMap[CommandName.REFRESH] = commands.reloadPage;
  topMap[CommandName.GO_BACK] = commands.unsupportedHistoryNavigation;
  topMap[CommandName.GO_FORWARD] = commands.unsupportedHistoryNavigation;
  topMap[CommandName.GET_TITLE] = commands.getTitle;
  // The extension handles window switches. It sends the command to this
  // injected script only as a means of retrieving the window name.
  topMap[CommandName.SWITCH_TO_WINDOW] = commands.getWindowName;

  map[CommandName.GET_CURRENT_URL] = commands.getCurrentUrl;
  map[CommandName.GET_PAGE_SOURCE] = commands.getPageSource;

  map[CommandName.ADD_COOKIE] = commands.addCookie;
  map[CommandName.GET_ALL_COOKIES] = commands.getCookies;
  map[CommandName.DELETE_ALL_COOKIES] = commands.deleteCookies;
  map[CommandName.DELETE_COOKIE] = commands.deleteCookie;

  map[CommandName.FIND_ELEMENT] = commands.findElement;
  map[CommandName.FIND_CHILD_ELEMENT] = commands.findElement;
  map[CommandName.FIND_ELEMENTS] = commands.findElements;
  map[CommandName.FIND_CHILD_ELEMENTS] = commands.findElements;
  map[CommandName.GET_ACTIVE_ELEMENT] = commands.getActiveElement;

  map[CommandName.CLEAR_ELEMENT] = commands.clearElement;
  map[CommandName.CLICK_ELEMENT] = commands.clickElement;
  map[CommandName.SUBMIT_ELEMENT] = commands.submitElement;
  map[CommandName.GET_ELEMENT_ATTRIBUTE] = commands.getElementAttribute;
  map[CommandName.GET_ELEMENT_LOCATION] = commands.getElementLocation;
  map[CommandName.GET_ELEMENT_LOCATION_IN_VIEW] = commands.getLocationInView;
  map[CommandName.GET_ELEMENT_SIZE] = commands.getElementSize;
  map[CommandName.GET_ELEMENT_TEXT] = commands.getElementText;
  map[CommandName.GET_ELEMENT_TAG_NAME] = commands.getElementTagName;
  map[CommandName.IS_ELEMENT_DISPLAYED] = commands.isElementDisplayed;
  map[CommandName.IS_ELEMENT_ENABLED] = commands.isElementEnabled;
  map[CommandName.IS_ELEMENT_SELECTED] = commands.isElementSelected;
  map[CommandName.ELEMENT_EQUALS] = commands.elementEquals;
  map[CommandName.GET_ELEMENT_VALUE_OF_CSS_PROPERTY] = commands.getCssValue;
  map[CommandName.SEND_KEYS_TO_ELEMENT] = commands.sendKeysToElement;

  map[CommandName.GET_WINDOW_POSITION] = commands.getWindowPosition;
  map[CommandName.GET_WINDOW_SIZE] = commands.getWindowSize;
  map[CommandName.SET_WINDOW_POSITION] = commands.setWindowPosition;
  map[CommandName.SET_WINDOW_SIZE] = commands.setWindowSize;

  map[CommandName.EXECUTE_SCRIPT] = commands.executeScript;
  map[CommandName.EXECUTE_ASYNC_SCRIPT] = commands.executeScript;

  map[CommandName.SWITCH_TO_FRAME] = commands.switchToFrame;
});

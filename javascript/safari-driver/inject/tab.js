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
 * @fileoverview Defines the safaridriver.inject.Tab class, which is
 * responsible for coordinating all actions in the injected script.
 */

goog.provide('safaridriver.inject.Tab');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.response');
goog.require('goog.asserts');
goog.require('goog.object');
goog.require('safaridriver.Command');
goog.require('safaridriver.Tab');
goog.require('safaridriver.alert');
goog.require('safaridriver.inject.PageScript');
goog.require('safaridriver.inject.commands');
goog.require('safaridriver.inject.message');
goog.require('safaridriver.inject.message.Activate');
goog.require('safaridriver.inject.message.ActivateFrame');
goog.require('safaridriver.inject.message.ReactivateFrame');
goog.require('safaridriver.message');
goog.require('safaridriver.message.Alert');
goog.require('safaridriver.message.Command');
goog.require('safaridriver.message.Load');
goog.require('safaridriver.message.Message');
goog.require('safaridriver.message.MessageTarget');
goog.require('safaridriver.message.PendingFrame');
goog.require('safaridriver.message.Response');
goog.require('safaridriver.message.Unload');
goog.require('webdriver.CommandName');
goog.require('webdriver.promise');



/**
 * Coordinates all actions in the injected script, including communication with
 * the extension and the injected scripts of other frames. There will be one
 * tab per frame in a window.
 * @constructor
 * @extends {safaridriver.Tab}
 */
safaridriver.inject.Tab = function() {
  goog.base(this, window);
  this.setLogger('safaridriver.inject.' +
      (safaridriver.inject.Tab.IS_TOP ? '_Top_' : 'Frame'));

  /**
   * @type {!safaridriver.inject.PageScript}
   * @private
   */
  this.pageScript_ = new safaridriver.inject.PageScript(this);

  /**
   * Commands that have started execution.
   * @type {Object.<!safaridriver.Command>}
   * @private
   */
  this.pendingCommands_ = {};

  /**
   * Commands that are waiting for the active frame to reload before being
   * executed.
   * @type {!Object.<!safaridriver.Command>}
   * @private
   */
  this.queuedCommands_ = {};
};
goog.inherits(safaridriver.inject.Tab, safaridriver.Tab);
goog.addSingletonGetter(safaridriver.inject.Tab);


/**
 * Whether this tab is for the topmost frame in the window.
 * @type {boolean}
 * @const
 */
safaridriver.inject.Tab.IS_TOP = window === window.top;


/**
 * Whether this script is currently active. Only the top-most frame is
 * considered active upon instantiation.
 * @type {boolean}
 * @see {safaridriver.inject.Tab#isActive}
 * @private
 */
safaridriver.inject.Tab.prototype.isActive_ = safaridriver.inject.Tab.IS_TOP;


/**
 * A reference to the frame that should handle commands sent from the global
 * extension. This value will always be {@code null} when {@link #IS_TOP} is
 * false.
 * @type {Window}
 * @private
 */
safaridriver.inject.Tab.prototype.activeFrame_ = null;


/**
 * Key of the interval used to check whether the active frame has been closed.
 * @type {number}
 * @private
 * @see {#checkFrame_}
 */
safaridriver.inject.Tab.prototype.frameCheckKey_ = 0;


/**
 * Returns whether the window containing this script is active and should
 * respond to commands from the extension's global page.
 *
 * <p>By default, only the top most window is automatically active, as it
 * receives focus first when a new page is loaded. Each sub-frame will be
 * activated in turn as the user switches to them; when a sub-frame is
 * activated, this frame will be deactivated.
 *
 * <p>This is necessary because a window may contain frames that load fully
 * initialize before the top window does. If this happens, the frames will
 * intercept and handle commands from the extension before the appropriate
 * window does.
 *
 * @return {boolean} Whether the context running this script is the active
 *     injected script.
 */
safaridriver.inject.Tab.prototype.isActive = function() {
  return this.isActive_;
};


/**
 * @param {boolean} active Whether this tab should be active.
 */
safaridriver.inject.Tab.prototype.setActive = function(active) {
  this.isActive_ = active;
  if (active) {
    this.activeFrame_ = null;
  }
};


/** Initializes this tab. */
safaridriver.inject.Tab.prototype.init = function() {
  this.log('Loaded injected script for: ' + window.location);

  this.pageScript_.installPageScript();

  var tab = this;
  tab.on(safaridriver.inject.message.Activate.TYPE, tab.onActivate_, tab).
      on(safaridriver.message.Alert.TYPE, tab.onAlert_, tab).
      on(safaridriver.message.Load.TYPE, tab.onLoad_, tab).
      on(safaridriver.inject.message.ReactivateFrame.TYPE,
          tab.onReactivateFrame_, tab);

  if (safaridriver.inject.Tab.IS_TOP) {
    new safaridriver.message.MessageTarget(safari.self).
        on(safaridriver.message.Command.TYPE, tab.onExtensionCommand_, tab);

    tab.on(safaridriver.inject.message.ActivateFrame.TYPE,
        tab.onActivateFrame_, tab);
  } else {
    tab.on(safaridriver.message.Command.TYPE, tab.onFrameCommand_, tab);
  }

  window.addEventListener('load', function() {
    var message = new safaridriver.message.Load(
        !safaridriver.inject.Tab.IS_TOP);

    var target = safaridriver.inject.Tab.IS_TOP ? safari.self.tab : window.top;
    message.send(target);
  }, true);

  window.addEventListener('unload', function() {
    // If there are any pending commands, send those responses before notifying
    // the extension of the unload event.
    goog.object.forEach(tab.pendingCommands_, function(cmd) {
      var response;
      if (cmd.getName() === webdriver.CommandName.EXECUTE_ASYNC_SCRIPT ||
          cmd.getName() === webdriver.CommandName.EXECUTE_SCRIPT) {
        var error = new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
            'Detected a page unload event; script execution does not work ' +
                'across page loads.');
        response = bot.response.createErrorResponse(error);
      } else {
        response = bot.response.createResponse(null);
      }
      tab.sendResponse_(cmd, response);
    });

    if (safaridriver.inject.Tab.IS_TOP || tab.isActive_) {
      var message = new safaridriver.message.Unload(
          !safaridriver.inject.Tab.IS_TOP);
      // If we send this message asynchronously, which is the norm, then the
      // page will complete its unload before the message is sent. Use sendSync
      // to ensure the extension gets our message.
      message.sendSync(safari.self.tab);
    }
  }, true);
};


/**
 * @param {!safaridriver.message.Alert} message The alert message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.Tab.prototype.onAlert_ = function(message, e) {
  if (message.isSameOrigin() || !safaridriver.inject.message.isFromSelf(e)) {
    return;
  }
  // TODO: Fully support alerts. See
  // http://code.google.com/p/selenium/issues/detail?id=3862
  var unexpectedAlert = message.sendSync(safari.self.tab);
  if (!unexpectedAlert) {
    safaridriver.message.Message.setSynchronousMessageResponse('1');
  }

  // Abort any pending commands and point users towards the bug for proper
  // alert handling.
  var alertText = message.getMessage();
  goog.object.forEach(this.pendingCommands_, function(cmd) {
    var response = safaridriver.alert.createResponse(alertText);
    this.sendResponse_(cmd, response);
  }, this);
};


/**
 * Responds to an activate message sent from another frame in this window.
 * @param {!safaridriver.inject.message.Activate} message The activate message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.Tab.prototype.onActivate_ = function(message, e) {
  // Only respond to messages that came from another injected script in a frame
  // belonging to this window.
  if (!message.isSameOrigin() || !safaridriver.inject.message.isFromFrame(e)) {
    return;
  }

  this.log('Activating frame for future command handling.');
  this.isActive_ = true;

  if (safaridriver.inject.Tab.IS_TOP) {
    var response = bot.response.createResponse(null);
    this.sendResponse_(message.getCommand(), response, true);
  } else {
    var activateFrame = new safaridriver.inject.message.ActivateFrame(
        message.getCommand());
    activateFrame.send(window.top);
    // Let top notify the extension that a new frame has been activated.
  }
};


/**
 * Responds to messages from window.top instructing this frame to activate and
 * start handling command messages.
 * @param {!safaridriver.inject.message.ActivateFrame} message The activate
 *     message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.Tab.prototype.onActivateFrame_ = function(message, e) {
  goog.asserts.assert(safaridriver.inject.Tab.IS_TOP);
  if (safaridriver.inject.message.isFromFrame(e)) {
    this.log('Sub-frame has been activated');
    this.activeFrame_ = e.source;
    var response = bot.response.createResponse(null);
    var forceSend = true;
    this.sendResponse_(message.getCommand(), response, forceSend);
  }
};


/**
 * @param {!safaridriver.message.Message} message The activate message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.Tab.prototype.onReactivateFrame_ = function(message, e) {
  if (safaridriver.inject.Tab.IS_TOP) {
    if (e.source === this.activeFrame_) {
      // Descendant frames echo back the reactivate frame message to signal
      // they are ready to receive commands.
      this.notifyReady();
    }
  } else if (safaridriver.inject.message.isFromTop(e)) {
    this.log('Sub-frame has been re-activated');
    this.isActive_ = true;

    // Acknowledge that we have been re-activated by echoing this message back
    // to the top frame.
    message.send(window.top);

    message = new safaridriver.message.Load(true);
    message.sendSync(safari.self.tab);
  }
};


/**
 * Responds to load messages.
 * @param {!safaridriver.message.Message} message The message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.Tab.prototype.onLoad_ = function(message, e) {
  if (message.isSameOrigin()) {
    if (safaridriver.inject.message.isFromFrame(e) &&
        e.source && e.source === this.activeFrame_) {
      this.log('Active frame has reloaded');

      // Tell the frame that has just finished loading that it was our last
      // activate frame and should reactivate itself.
      var reactivate = new safaridriver.inject.message.ReactivateFrame();
      reactivate.send((/** @type {!Window} */e.source));

      // While we've reactivated the frame, we need to wait for it to
      // acknowledge the message (see #onReactivateFrame_) before calling
      // #notifyReady. Otherwise, the commands may be sent to the frame before
      // it knows it should handle them, and we'll end hanging.
    }
  }
};


/**
 * Command message handler.
 * @param {!safaridriver.message.Command} message The command message.
 * @private
 */
safaridriver.inject.Tab.prototype.onExtensionCommand_ = function(message) {
  var command = message.getCommand();
  if (command.getName() in safaridriver.inject.Tab.TOP_COMMAND_MAP_) {
    this.executeCommand_(command, safaridriver.inject.Tab.TOP_COMMAND_MAP_);

  } else if (this.isActive_) {
    this.executeCommand_(command, safaridriver.inject.Tab.COMMAND_MAP_);

  } else {
    goog.asserts.assert(!!this.activeFrame_,
        'There is no active frame to handle the command');

    var hasPendingFrame = new safaridriver.message.PendingFrame().
        sendSync(safari.self.tab);
    if (hasPendingFrame) {
      this.notifyUnready();
      this.log('Waiting for active frame to load before executing command.');
      this.queuedCommands_[command.getId()] = command;

      // If we know right now that the selected frame is no longer valid, go
      // ahead and fail all of our queued commands. Otherwise, start the
      // loop that checks for invalid frames.
      if (!this.activeFrame_ || this.activeFrame_.closed) {
        this.checkFrame_();
      } else if (!this.frameCheckKey_) {
        this.frameCheckKey_ =
            setInterval(goog.bind(this.checkFrame_, this), 250);
        this.whenReady(goog.bind(this.executeQueuedCommands_, this));
      }
    } else {
      message.send((/** @type {!Window} */this.activeFrame_));
    }
  }
};


/** @private */
safaridriver.inject.Tab.prototype.executeQueuedCommands_ = function() {
  clearInterval(this.frameCheckKey_);
  this.frameCheckKey_ = 0;

  goog.object.forEach(this.queuedCommands_, function(command) {
    delete this.queuedCommands_[command.getId()];
    var message = new safaridriver.message.Command(command);
    message.send((/** @type {!Window} */this.activeFrame_));
  }, this);
};


/**
 * Checks that the active frame has not closed. If it has, all queued commands
 * that cannot be handled by the top-frame will be immediately failed.
 * @private
 */
safaridriver.inject.Tab.prototype.checkFrame_ = function() {
  goog.asserts.assert(safaridriver.inject.Tab.IS_TOP,
      'Should only check the state of the active frame from the top frame');

  if (this.activeFrame_ && !this.activeFrame_.closed) {
    return;
  }

  goog.object.forEach(this.queuedCommands_, function(command) {
    delete this.queuedCommands_[command.getId()];

    var response;
    if (command.getName() === webdriver.CommandName.SWITCH_TO_FRAME &&
        goog.isNull(command.getParameter('id'))) {
      this.setActive(true);
      response = bot.response.createResponse(null);

      // Send a load message to the extension to tell it we're no longer
      // waiting on a frame to load.
      var loadMessage = new safaridriver.message.Load();
      loadMessage.send(safari.self.tab);

      // And we're no longer waiting on a frame, so we don't need to keep
      // checking if the frame is still valid.
      clearInterval(this.frameCheckKey_);
      this.frameCheckKey_ = 0;
    } else {
      var error = new bot.Error(bot.ErrorCode.NO_SUCH_FRAME,
          'The currently selected frame has been removed from the DOM; you ' +
          'must select another frame/window before continuing');
      response = bot.response.createErrorResponse(error);
    }
    this.sendResponse_(command, response, true);
  }, this);
};


/**
 * @param {!safaridriver.message.Command} message The command message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.Tab.prototype.onFrameCommand_ = function(message, e) {
  if (message.isSameOrigin() && safaridriver.inject.message.isFromTop(e)) {
    var command = message.getCommand();
    this.executeCommand_(command, safaridriver.inject.Tab.COMMAND_MAP_);
  }
};


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @param {safaridriver.inject.Tab.CommandMap} map The map to use when
 *     retrieving the command handler.
 * @private
 */
safaridriver.inject.Tab.prototype.executeCommand_ = function(command, map) {
  var sendResponse = goog.bind(this.sendResponse_, this, command);
  var handler = map[command.getName()];
  if (handler) {
    try {
      this.log('Executing ' + command);

      this.pendingCommands_[command.getId()] = command;

      // Don't schedule through webdriver.promise.Application; just execute the
      // command immediately. We're assuming the global page is scheduling
      // commands and only dispatching one at a time.
      webdriver.promise.when(
          handler(command, this.pageScript_),
          sendSuccess, sendError);
    } catch (ex) {
      sendError(ex);
    }
  } else {
    sendError(Error('Unknown command: ' + command));
  }

  function sendError(error) {
    sendResponse(bot.response.createErrorResponse(error));
  }

  function sendSuccess(value) {
    var response = bot.response.createResponse(value);
    sendResponse(response);
  }
};


/**
 * Sends a command response to the extension.
 * @param {!safaridriver.Command} command The command this is a response to.
 * @param {!bot.response.ResponseObject} response The response to send.
 * @param {boolean=} opt_force Whether the response should be sent, even if it
 *     is not registered as a pending command.
 * @private
 */
safaridriver.inject.Tab.prototype.sendResponse_ = function(command, response,
    opt_force) {
  var shouldSend = false;
  if (command.getId() in this.pendingCommands_) {
    delete this.pendingCommands_[command.getId()];

    // The new frame is always the frame responsible for sending the response
    // to a switchToFrame command - unless the response is an error.
    shouldSend = command.getName() != webdriver.CommandName.SWITCH_TO_FRAME ||
        response['status'] != bot.ErrorCode.SUCCESS;
  }

  if (shouldSend || !!opt_force) {
    this.log('Sending response' +
        '\ncommand:  ' + command +
        '\nresponse: ' + JSON.stringify(response));

    var message = new safaridriver.message.Response(command.id, response);
    message.sendSync(safari.self.tab);
  }
};


/**
 * @typedef {(function(!safaridriver.Command, !safaridriver.inject.PageScript)|
 *            function(!safaridriver.Command)|
 *            function())}
 */
safaridriver.inject.Tab.CommandHandler;


/**
 * @typedef {!Object.<webdriver.CommandName,
 *                    safaridriver.inject.Tab.CommandHandler>}
 */
safaridriver.inject.Tab.CommandMap;


/**
 * Map of command names that should always be handled by the topmost frame,
 * regardless of whether it is currently active.
 * @type {safaridriver.inject.Tab.CommandMap}
 * @const
 * @private
 */
safaridriver.inject.Tab.TOP_COMMAND_MAP_ = {};


/**
 * Maps command names to the function that handles it.
 * @type {safaridriver.inject.Tab.CommandMap}
 * @const
 * @private
 */
safaridriver.inject.Tab.COMMAND_MAP_ = {};


goog.scope(function() {
var CommandName = webdriver.CommandName;
var topMap = safaridriver.inject.Tab.TOP_COMMAND_MAP_;
var map = safaridriver.inject.Tab.COMMAND_MAP_;
var commands = safaridriver.inject.commands;

topMap[CommandName.GET] = commands.loadUrl;
topMap[CommandName.REFRESH] = commands.reloadPage;
topMap[CommandName.GO_BACK] = commands.unsupportedHistoryNavigation;
topMap[CommandName.GO_FORWARD] = commands.unsupportedHistoryNavigation;
topMap[CommandName.GET_TITLE] = commands.getTitle;
// The extension handles window switches. It sends the command to this
// injected script only as a means of retrieving the window name.
topMap[CommandName.SWITCH_TO_WINDOW] = commands.getWindowName;
topMap[CommandName.GET_WINDOW_POSITION] = commands.getWindowPosition;
topMap[CommandName.GET_WINDOW_SIZE] = commands.getWindowSize;
topMap[CommandName.SET_WINDOW_POSITION] = commands.setWindowPosition;
topMap[CommandName.SET_WINDOW_SIZE] = commands.setWindowSize;
topMap[CommandName.MAXIMIZE_WINDOW] = commands.maximizeWindow;

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
map[CommandName.SEND_KEYS_TO_ELEMENT] = commands.executeInPage;

map[CommandName.EXECUTE_SCRIPT] = commands.executeInPage;
map[CommandName.EXECUTE_ASYNC_SCRIPT] = commands.executeInPage;

map[CommandName.SWITCH_TO_FRAME] = commands.switchToFrame;
});  // goog.scope

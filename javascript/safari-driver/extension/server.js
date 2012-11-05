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

goog.provide('safaridriver.extension.Server');

goog.require('bot.ErrorCode');
goog.require('bot.response');
goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.object');
goog.require('goog.string');
goog.require('safaridriver.Command');
goog.require('safaridriver.alert');
goog.require('safaridriver.extension.commands');
goog.require('safaridriver.message.Command');
goog.require('safaridriver.message.Response');
goog.require('webdriver.CommandName');
goog.require('webdriver.promise');



/**
 * Creates a new WebSocket server that may be used to communicate with a
 * SafariDriver client.
 *
 * <p>Note the name of this class is a bit misleading as it uses a WebSocket
 * to communicate with the client (i.e., the actual HTTP server is run by the
 * client).
 *
 * @param {!safaridriver.extension.Session} session The session associated with
 *     this server.
 * @constructor
 * @implements {webdriver.CommandExecutor}
 * @extends {goog.Disposable}
 */
safaridriver.extension.Server = function(session) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @private
   */
  this.log_ = goog.debug.Logger.getLogger('safaridriver.extension.Server');

  /**
   * @type {!safaridriver.extension.Session}
   * @private
   */
  this.session_ = session;

  /**
   * @type {!webdriver.promise.Deferred}
   * @private
   */
  this.ready_ = new webdriver.promise.Deferred();

  /**
   * @type {!Array.<function()>}
   * @private
   */
  this.disposeCallbacks_ = [];
};
goog.inherits(safaridriver.extension.Server, goog.Disposable);


/**
 * @typedef {(function(!safaridriver.extension.Session, !safaridriver.Command)|
 *            function(!safaridriver.extension.Session))}
 */
safaridriver.extension.Server.CommandHandler;


/**
 * Maps command names to their handler functions.
 * @type {!Object.<webdriver.CommandName,
 *                 safaridriver.extension.Server.CommandHandler>}
 * @const
 * @private
 */
safaridriver.extension.Server.COMMAND_MAP_ = {};
goog.scope(function() {
var CommandName = webdriver.CommandName;
var commands = safaridriver.extension.commands;
var map = safaridriver.extension.Server.COMMAND_MAP_;

// By the time a server is accepting commands, it has already allocated a
// session, so we can treat NEW_SESSION the same as we do DESCRIBE_SESSION.
map[CommandName.NEW_SESSION] = commands.describeSession;
map[CommandName.DESCRIBE_SESSION] = commands.describeSession;

// We can't shutdown Safari from an extension, but we can quietly handle the
// command so we don't return an unknown command error.
map[CommandName.QUIT] = goog.nullFunction;

map[CommandName.CLOSE] = commands.closeTab;
map[CommandName.GET_CURRENT_WINDOW_HANDLE] = commands.getWindowHandle;
map[CommandName.GET_WINDOW_HANDLES] = commands.getWindowHandles;
map[CommandName.GET_CURRENT_URL] = commands.sendCommand;
map[CommandName.GET_TITLE] = commands.sendCommand;
map[CommandName.GET_PAGE_SOURCE] = commands.sendCommand;

map[CommandName.GET] = commands.loadUrl;
map[CommandName.REFRESH] = commands.refresh;
map[CommandName.GO_BACK] = commands.sendCommand;
map[CommandName.GO_FORWARD] = commands.sendCommand;
map[CommandName.GO_BACK] = commands.sendCommand;

map[CommandName.ADD_COOKIE] = commands.sendCommand;
map[CommandName.GET_ALL_COOKIES] = commands.sendCommand;
map[CommandName.DELETE_ALL_COOKIES] = commands.sendCommand;
map[CommandName.DELETE_COOKIE] = commands.sendCommand;

map[CommandName.IMPLICITLY_WAIT] = commands.implicitlyWait;
map[CommandName.FIND_ELEMENT] = commands.findElement;
map[CommandName.FIND_ELEMENTS] = commands.findElement;
map[CommandName.FIND_CHILD_ELEMENT] = commands.findElement;
map[CommandName.FIND_CHILD_ELEMENTS] = commands.findElement;
map[CommandName.GET_ACTIVE_ELEMENT] = commands.sendCommand;

map[CommandName.CLEAR_ELEMENT] = commands.sendCommand;
map[CommandName.CLICK_ELEMENT] = commands.sendCommand;
map[CommandName.SUBMIT_ELEMENT] = commands.sendCommand;
map[CommandName.GET_ELEMENT_TEXT] = commands.sendCommand;
map[CommandName.GET_ELEMENT_TAG_NAME] = commands.sendCommand;
map[CommandName.IS_ELEMENT_SELECTED] = commands.sendCommand;
map[CommandName.IS_ELEMENT_ENABLED] = commands.sendCommand;
map[CommandName.IS_ELEMENT_DISPLAYED] = commands.sendCommand;
map[CommandName.GET_ELEMENT_LOCATION] = commands.sendCommand;
map[CommandName.GET_ELEMENT_LOCATION_IN_VIEW] = commands.sendCommand;
map[CommandName.GET_ELEMENT_SIZE] = commands.sendCommand;
map[CommandName.GET_ELEMENT_ATTRIBUTE] = commands.sendCommand;
map[CommandName.GET_ELEMENT_VALUE_OF_CSS_PROPERTY] = commands.sendCommand;
map[CommandName.ELEMENT_EQUALS] = commands.sendCommand;
map[CommandName.SEND_KEYS_TO_ELEMENT] = commands.sendCommand;

map[CommandName.CLICK] = commands.sendCommand;
map[CommandName.DOUBLE_CLICK] = commands.sendCommand;
map[CommandName.MOUSE_DOWN] = commands.sendCommand;
map[CommandName.MOUSE_UP] = commands.sendCommand;
map[CommandName.MOVE_TO] = commands.sendCommand;
map[CommandName.SEND_KEYS_TO_ACTIVE_ELEMENT] = commands.sendCommand;

map[CommandName.SWITCH_TO_FRAME] = commands.sendCommand;
map[CommandName.SWITCH_TO_WINDOW] = commands.switchToWindow;
map[CommandName.SET_WINDOW_SIZE] = commands.sendWindowCommand;
map[CommandName.SET_WINDOW_POSITION] = commands.sendWindowCommand;
map[CommandName.GET_WINDOW_SIZE] = commands.sendWindowCommand;
map[CommandName.GET_WINDOW_POSITION] = commands.sendWindowCommand;
map[CommandName.MAXIMIZE_WINDOW] = commands.sendWindowCommand;

map[CommandName.EXECUTE_SCRIPT] = commands.sendCommand;
map[CommandName.EXECUTE_ASYNC_SCRIPT] = commands.executeAsyncScript;
map[CommandName.SET_SCRIPT_TIMEOUT] = commands.setScriptTimeout;

map[CommandName.SCREENSHOT] = commands.takeScreenshot;

map[CommandName.ACCEPT_ALERT] = commands.handleNoAlertsPresent;
map[CommandName.DISMISS_ALERT] = commands.handleNoAlertsPresent;
map[CommandName.GET_ALERT_TEXT] = commands.handleNoAlertsPresent;
map[CommandName.SET_ALERT_TEXT] = commands.handleNoAlertsPresent;
});  // goog.scope


/**
 * The WebSocket used by this instance, lazily initialized in {@link #connect}.
 * @type {WebSocket}
 * @private
 */
safaridriver.extension.Server.prototype.webSocket_ = null;


/** @override */
safaridriver.extension.Server.prototype.disposeInternal = function() {
  this.logMessage_('Disposing of server', goog.debug.Logger.Level.FINE);

  if (this.webSocket_) {
    if (this.ready_.isPending()) {
      this.ready_.cancel(Error('Server has been disposed'));
    }
    this.webSocket_.close();
  }

  while (this.disposeCallbacks_.length) {
    var callback = this.disposeCallbacks_.shift();
    callback();
  }

  delete this.disposeCallbacks_;
  delete this.log_;
  delete this.session_;
  delete this.ready_;
  delete this.webSocket_;

  goog.base(this, 'disposeInternal');
};


/** @return {!safaridriver.extension.Session} The session for this server. */
safaridriver.extension.Server.prototype.getSession = function() {
  return this.session_;
};


/**
 * Registers a callback to be called when this server is disposed. If the server
 * has already been disposed, the callback will be invoked immediately.
 * @param {function()} fn The callback function.
 */
safaridriver.extension.Server.prototype.onDispose = function(fn) {
  if (this.isDisposed()) {
    fn();
  } else {
    this.disposeCallbacks_.push(fn);
  }
};


/**
 * Connects to a server.
 * @param {string} url URL to connect to.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when
 *     this server has connected.
 * @throws {Error} If this server has already connected to a server.
 */
safaridriver.extension.Server.prototype.connect = function(url) {
  if (this.isDisposed()) {
    throw Error('This server has been disposed!');
  }

  if (this.webSocket_) {
    throw Error('This server has already connected!');
  }

  this.logMessage_('Connecting to ' + url);
  this.webSocket_ = new WebSocket(url);

  // Register the event handlers.  Note that it is not possible for these
  // callbacks to be missed because it is registered after the web socket is
  // instantiated.  Because of the synchronous nature of JavaScript, this code
  // will execute before the browser creates the resource and makes any calls
  // to these callbacks.
  this.webSocket_.onopen = goog.bind(this.onOpen_, this);
  this.webSocket_.onclose = goog.bind(this.onClose_, this);
  this.webSocket_.onmessage = goog.bind(this.onMessage_, this);
  this.webSocket_.onerror = goog.bind(this.onError_, this);

  return this.ready_.promise;
};


/**
 * Executes a single command once all those received before it have completed.
 * @param {!webdriver.Command} command The command to execute.
 * @param {function(Error, !bot.response.ResponseObject=)=} opt_callback A
 *     callback function for adherence to the {@link webdriver.CommandExecutor}
 *     interface.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with a
 *     {@link bot.response.ResponseObject} object once the command has
 *     completed.
 */
safaridriver.extension.Server.prototype.execute = function(command,
                                                           opt_callback) {
  // Normally command will be an instanceof safaridriver.Command, but it will be
  // a standard webdriver.Command if it came from
  // safaridriver.extension.driver (via the extension builder REPL).
  command = new safaridriver.Command(goog.string.getRandomString(),
      command.getName(), command.getParameters());
  var handler = safaridriver.extension.Server.COMMAND_MAP_[command.getName()];
  if (!handler) {
    this.logMessage_('Unknown command: ' + command.getName(),
        goog.debug.Logger.Level.SEVERE);
    return webdriver.promise.rejected(bot.response.createErrorResponse(
        Error('Unknown command: ' + command.getName())));
  }

  this.logMessage_('Scheduling command: ' + command.getName(),
      goog.debug.Logger.Level.FINER);
  var description = this.session_.getId() + '::' + command.getName();
  var fn = goog.bind(this.executeCommand_, this, command, handler);
  var result = webdriver.promise.Application.getInstance().
      schedule(description, fn).
      then(bot.response.createResponse, bot.response.createErrorResponse).
      addBoth(function(response) {
        this.session_.setCurrentCommand(null);
        return response;
      }, this);

  // If we were given a callback, massage the result to fit the
  // webdriver.CommandExecutor contract.
  if (opt_callback) {
    result.then(bot.response.checkResponse).
        then(goog.partial(opt_callback, null), opt_callback);
  }

  return result;
};


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @param {safaridriver.extension.Server.CommandHandler} handler The command
 *     handler.
 * @return {*} The command result.
 * @private
 */
safaridriver.extension.Server.prototype.executeCommand_ = function(command,
    handler) {
  this.logMessage_('Executing command: ' + command.getName());

  var alertText = this.session_.getUnhandledAlertText();
  if (!goog.isNull(alertText)) {
    this.session_.setUnhandledAlertText(null);
    return safaridriver.alert.createResponse(alertText);
  }

  this.session_.setCurrentCommand(command);
  return handler(this.session_, command);
};


/**
 * @param {string} message The message to log.
 * @param {goog.debug.Logger.Level=} opt_level The level to log the message at;
 *     Defaults to INFO.
 * @private
 */
safaridriver.extension.Server.prototype.logMessage_ = function(message,
    opt_level) {
  this.log_.log(opt_level || goog.debug.Logger.Level.INFO,
      '[' + this.session_.getId() + '] ' + message);
};


/**
 * Called when the WebSocket connection is opened.
 * @private
 */
safaridriver.extension.Server.prototype.onOpen_ = function() {
  this.logMessage_('WebSocket connection established.');
  if (!this.isDisposed() && this.ready_.isPending()) {
    this.ready_.resolve();
  }
};


/**
 * Called when an attempt to open the WebSocket fails or there is a connection
 * failure after a successful connection has been established. Triggers the
 * disposable of this server.
 * @private
 */
safaridriver.extension.Server.prototype.onClose_ = function() {
  this.logMessage_('WebSocket connection was closed.',
      goog.debug.Logger.Level.WARNING);
  if (!this.isDisposed()) {
    if (this.ready_.isPending()) {
      this.ready_.reject(Error('Failed to connect'));
    }
    this.dispose();
  }
};


/**
 * Called when there is a communication error with the WebSocket.
 * @param {!MessageEvent} event The error event.
 * @private
 */
safaridriver.extension.Server.prototype.onError_ = function(event) {
  this.logMessage_('There was an error in the WebSocket: ' + event.data,
      goog.debug.Logger.Level.SEVERE);
};


/**
 * Called when the WebSocket receives a message.
 * @param {!MessageEvent} event The message event.
 * @private
 */
safaridriver.extension.Server.prototype.onMessage_ = function(event) {
  this.logMessage_('Received a message: ' + event.data);

  try {
    var message = safaridriver.message.fromEvent(event);
    if (!message.isType(safaridriver.message.Command.TYPE)) {
      throw Error('Not a command message: ' + message);
    }
  } catch (ex) {
    this.send_(null, bot.response.createErrorResponse(ex));
    return;
  }

  var command = message.getCommand();

  this.execute(command).
      addErrback(bot.response.createErrorResponse).
      addCallback(function(response) {
        this.send_(command, response);
      }, this);
};


/**
 * Sends a response to the client.
 * @param {safaridriver.Command} command The command this is a response to, or
 *     {@code null} if the response indicates a parse error with the command.
 * @param {!bot.response.ResponseObject} response The response to send.
 * @private
 */
safaridriver.extension.Server.prototype.send_ = function(command, response) {
  var id = command ? command.id : '';
  var message = new safaridriver.message.Response(id, response);

  var str = message.toString();

  this.logMessage_('Sending response: ' + str);
  if (!command && response['status'] === bot.ErrorCode.SUCCESS) {
    this.logMessage_('Sending success response with a null command: ' + str,
        goog.debug.Logger.Level.WARNING);
  }

  this.webSocket_.send(str);
};

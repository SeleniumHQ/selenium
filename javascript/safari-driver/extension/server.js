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

goog.provide('safaridriver.extension.Server');

goog.require('bot.ErrorCode');
goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.object');
goog.require('safaridriver.extension.commands');
goog.require('webdriver.CommandName');
goog.require('webdriver.error');
goog.require('webdriver.promise');


/**
 * Creates a new WebSocket server that may be used to communicate with a
 * SafariDriver client.
 *
 * <p>Note the name of this class is a bit misleading as it uses a WebSocket
 * to communicate with the client (i.e., the actual HTTP server is run by the
 * client).
 *
 * @param {!safaridriver.extension.Session} session The session associated with this
 *     server.
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
};
goog.inherits(safaridriver.extension.Server, goog.Disposable);


/**
 * Maps command names to their handler functions.
 * @type {!Object.<(function(!safaridriver.extension.Session, !webdriver.Command)|
 *                  function(!safaridriver.extension.Session))>}
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
  map[CommandName.GET_CURRENT_URL] = commands.getCurrentUrl;
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
  map[CommandName.SEND_KEYS_TO_SESSION] = commands.sendCommand;

  map[CommandName.SWITCH_TO_FRAME] = commands.switchToFrame;
  map[CommandName.SWITCH_TO_WINDOW] = commands.switchToWindow;
  map[CommandName.SET_WINDOW_SIZE] = commands.sendWindowCommand;
  map[CommandName.SET_WINDOW_POSITION] = commands.sendWindowCommand;
  map[CommandName.GET_WINDOW_SIZE] = commands.sendWindowCommand;
  map[CommandName.GET_WINDOW_POSITION] = commands.sendWindowCommand;

  map[CommandName.EXECUTE_SCRIPT] = commands.sendCommand;
  map[CommandName.EXECUTE_ASYNC_SCRIPT] = commands.executeAsyncScript;
  map[CommandName.SET_SCRIPT_TIMEOUT] = commands.setScriptTimeout;

  map[CommandName.SCREENSHOT] = commands.sendCommand;
});


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
 * @param {function(Error, !webdriver.CommandResponse=)=} opt_callback A
 *     callback function for adherence to the {@link webdriver.CommandExecutor}
 *     interface.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with a
 *     {@link webdriver.CommandResponse} object once the command has completed.
 */
safaridriver.extension.Server.prototype.execute = function(command,
                                                           opt_callback) {
  var handler = safaridriver.extension.Server.COMMAND_MAP_[command.getName()];
  if (!handler) {
    this.logMessage_('Unknown command: ' + command.getName(),
        goog.debug.Logger.Level.SEVERE);
    return webdriver.promise.rejected(webdriver.error.createResponse(
        Error('Unknown command: ' + command.getName())));
  }

  this.logMessage_('Scheduling command: ' + command.getName());
  var description = this.session_.getId() + '::' + command.getName();
  var result = webdriver.promise.Application.getInstance().
      schedule(description, goog.bind(function() {
        this.logMessage_('Executing command: ' + command.getName());
        return handler(this.session_, command);
      }, this)).
      then(function(value) {
        return webdriver.error.isResponseObject(value) ? value : {
          'status': bot.ErrorCode.SUCCESS,
          'value': value
        };
      }, webdriver.error.createResponse);

  // If we were given a callback, massage the result to fit the
  // webdriver.CommandExecutor contract.
  if (opt_callback) {
    result.then(webdriver.error.checkResponse).
        then(goog.partial(opt_callback, null), opt_callback);
  }

  return result;
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
    var data = JSON.parse((/** @type {string} */event.data));
    checkHasKey(data, 'id');
    checkHasKey(data, 'name');
  } catch (ex) {
    this.send_(null, webdriver.error.createResponse(ex));
    return;
  }

  var command = new safaridriver.Command(
      data['id'], data['name'], data['parameters'] || {});

  this.execute(command).addCallback(function(response) {
    this.send_(command, response);
  }, this);

  function checkHasKey(data, key) {
    if (!goog.object.containsKey(data, key)) {
      throw Error('Invalid command: missing "' + key + '" key');
    }
  }
};


/**
 * Sends a response to the client.
 * @param {safaridriver.Command} command The command this is a response to, or
 *     {@code null} if the response indicates a parse error with the command.
 * @param {!webdriver.CommandResponse} response The response to send.
 * @private
 */
safaridriver.extension.Server.prototype.send_ = function(command, response) {
  if (command) {
    response['id'] = command.id;
  }

  var str = JSON.stringify(response);

  this.logMessage_('Sending response: ' + str);
  if (!command && response['status'] === bot.ErrorCode.SUCCESS) {
    this.logMessage_('Sending success response with a null command: ' + str,
        goog.debug.Logger.Level.WARNING);
  }

  this.webSocket_.send(str);
};

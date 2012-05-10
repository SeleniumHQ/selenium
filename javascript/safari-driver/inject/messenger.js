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

goog.provide('safaridriver.inject.PageMessenger');

goog.require('bot.response');
goog.require('goog.debug.Logger');
goog.require('safaridriver.inject.page');
goog.require('safaridriver.inject.state');
goog.require('safaridriver.message');
goog.require('webdriver.promise');


/**
 * Handles messages exchanged between this script and the corresponding
 * web page.
 * @constructor
 */
safaridriver.inject.PageMessenger = function() {

  /**
   * @type {!goog.debug.Logger}
   * @private
   */
  this.log_ = goog.debug.Logger.getLogger('safaridriver.inject.PageMessenger');

  /**
   * @type {!Object.<!webdriver.promise.Deferred>}
   * @private
   */
  this.pendingCommands_ = {};
};
goog.addSingletonGetter(safaridriver.inject.PageMessenger);


/**
 * A promise that is resolved once the page messenger has been installed.
 * @type {webdriver.promise.Deferred}
 * @private
 */
safaridriver.inject.PageMessenger.prototype.installed_ = null;


/**
 * Installs a script in the web page that facilitates communication between this
 * sandboxed environment and the web page.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when the
 *     page has been fully initialized.
 */
safaridriver.inject.PageMessenger.prototype.install = function() {
  if (!this.installed_) {
    this.log_.info('Installing page messenger');
    this.installed_ = new webdriver.promise.Deferred();
    safaridriver.inject.page.init();
  }
  return this.installed_.promise;
};


/**
 * Handles messages received from the content page.
 * @param {!MessageEvent} e The message event.
 */
safaridriver.inject.PageMessenger.prototype.onMessage = function(e) {
  this.log_.fine('Received page message: ' + JSON.stringify(e.data));
  try {
    var message = safaridriver.message.Message.fromEvent(e);
  } catch (ex) {
    this.log_.warning('Unable to parse page message: ' + ex +
        '\nOriginal message: ' + JSON.stringify(e.data));
    return;
  }

  // If we've just received an activate message, only acknowledge it if it came
  // from our own context. This indicates another frame has just told us to
  // activate ourselves. Otherwise, ignore messages that are from our own
  // context. How would we receive our own messages?  Simple - when we post a
  // message to the page, in addition to going to the page, it will be posted
  // back on our own window.
  if (message.isType(safaridriver.message.Type.ACTIVATE)) {
    if (message.getOrigin() !== safaridriver.message.ORIGIN) {
      return;
    }
  } else if (message.getOrigin() === safaridriver.message.ORIGIN) {
    return;
  }

  var type = message.getType();
  switch (type) {
    case safaridriver.message.Type.ACTIVATE:
      this.log_.info('Activating frame for future command handling.');
      safaridriver.inject.state.setActive(true);
      message.send(safari.self.tab);
      break;

    case safaridriver.message.Type.CONNECT:
      this.log_.info(
          'Content page has requested a WebDriver client connection to ' +
              message.getUrl());
      message.send(safari.self.tab);
      break;

    case safaridriver.message.Type.ENCODE:
      this.log_.fine('Encoding element for another window');
      this.onEncode_(
          (/** @type {!safaridriver.message.EncodeMessage} */ message),
          e.source);
      break;

    case safaridriver.message.Type.LOAD:
      if (this.installed_ && this.installed_.isPending()) {
        this.installed_.resolve();
      } else {
        this.log_.warning('Received unexpected page ' + type + ' message; ' +
            'ignoring message: ' + message);
      }
      break;

    case safaridriver.message.Type.RESPONSE:
      this.onResponse_(
          (/** @type {!safaridriver.message.ResponseMessage} */ message));
      break;

    default:
      this.log_.fine('Unknown message: ' + message);
      break;
  }
};


/**
 * @param {!safaridriver.message.EncodeMessage} message The message.
 * @param {Window} source The window to respond to.
 * @private
 */
safaridriver.inject.PageMessenger.prototype.onEncode_ = function(message,
    source) {
  if (!source) {
    this.log_.severe('Not looking up element: ' + message.getXPath() +
        '; no window to respond to!');
    return;
  }

  var result = bot.inject.executeScript(function() {
    var xpath = message.getXPath();
    return bot.locators.xpath.single(xpath, document);
  }, []);

  var response = new safaridriver.message.ResponseMessage(
      message.getId(), (/** @type {!bot.response.ResponseObject} */result));
  response.send(source);
};


/**
 * Handles response messages from the page.
 * @param {!safaridriver.message.ResponseMessage} message The message.
 * @private
 */
safaridriver.inject.PageMessenger.prototype.onResponse_ = function(message) {
  var promise = this.pendingCommands_[message.getId()];
  if (!promise) {
    this.log_.warning('Received response to an unknown command: ' + message);
    return;
  }

  var response = message.getResponse();
  try {
    response['value'] = safaridriver.inject.page.decodeValue(response['value']);
    promise.resolve(response);
  } catch (ex) {
    promise.reject(bot.response.createErrorResponse(ex));
  }
};


/**
 * Sends a command message to the page.
 * @param {!safaridriver.Command} command The command to send.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when
 *     a response message has been received.
 */
safaridriver.inject.PageMessenger.prototype.sendCommand = function(command) {
  return this.install().addCallback(function() {
    var parameters = command.getParameters();
    parameters = (/** @type {!Object.<*>} */
        safaridriver.inject.page.encodeValue(parameters));
    command.setParameters(parameters);

    var message = new safaridriver.message.CommandMessage(command);
    this.log_.info('Sending message: ' + message);

    var commandResponse = new webdriver.promise.Deferred();
    this.pendingCommands_[command.getId()] = commandResponse;
    message.send(window);
    return commandResponse.promise;
  }, this);
};

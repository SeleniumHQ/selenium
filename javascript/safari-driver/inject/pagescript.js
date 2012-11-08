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

goog.provide('safaridriver.inject.PageScript');

goog.require('bot.inject');
goog.require('bot.response');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('safaridriver.inject.Encoder');
goog.require('safaridriver.inject.message');
goog.require('safaridriver.message.Command');
goog.require('safaridriver.message.Load');
goog.require('safaridriver.message.Response');
goog.require('webdriver.promise');



/**
 * Injects the page script handler into the page. This handler is used to
 * ensure user scripts from {@link webdriver.CommandName.EXECUTE_SCRIPT} and
 * {@link webdriver.CommandName.EXECUTE_ASYNC_SCRIPT} run in the context of the
 * page under test and not the injected script.
 * @param {!safaridriver.message.MessageTarget} messageTarget The message target
 *     to use for communicating with the page.
 * @constructor
 */
safaridriver.inject.PageScript = function(messageTarget) {

  /**
   * @type {!goog.debug.Logger}
   * @private
   */
  this.log_ = goog.debug.Logger.getLogger(
      'safaridriver.inject.PageScript');

  /**
   * @type {!safaridriver.message.MessageTarget}
   * @private
   */
  this.messageTarget_ = messageTarget;

  /**
   * @type {!safaridriver.inject.Encoder}
   * @private
   */
  this.encoder_ = new safaridriver.inject.Encoder(messageTarget);

  /**
   * @type {!Object.<!webdriver.promise.Deferred>}
   * @private
   */
  this.pendingResponses_ = {};
};


/**
 * A promise that is resolved once the SafariDriver page script has been
 * loaded by the current page.
 * @type {webdriver.promise.Deferred}
 * @private
 */
safaridriver.inject.PageScript.prototype.installedPageScript_ = null;


/**
 * Installs a script in the web page that facilitates communication between this
 * sandboxed environment and the web page.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when the
 *     page has been fully initialized.
 */
safaridriver.inject.PageScript.prototype.installPageScript = function() {
  if (!this.installedPageScript_) {
    this.log_.finer('Installing page script');
    this.installedPageScript_ = new webdriver.promise.Deferred();

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = safari.extension.baseURI + 'page.js';

    var docEl = document.documentElement;
    if (docEl.firstChild) {
      goog.dom.insertSiblingBefore(script, docEl.firstChild);
    } else {
      goog.dom.appendChild(docEl, script);
    }

    var installedPageScript = this.installedPageScript_;

    /**
     * @param {!safaridriver.message.Message} message The message.
     * @param {!MessageEvent} e The original message event.
     */
    var onLoad = function(message, e) {
      if (!message.isSameOrigin() &&
          safaridriver.inject.message.isFromSelf(e)) {
        installedPageScript.resolve();
      }
    };

    this.messageTarget_.
        on(safaridriver.message.Load.TYPE, onLoad).
        on(safaridriver.message.Response.TYPE,
            goog.bind(this.onResponse_, this));
  }
  return this.installedPageScript_.promise;
};


/**
 * Sends a command to the page for execution.
 * @param {!safaridriver.Command} command The command to execute.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when
 *     a response message has been received.
 */
safaridriver.inject.PageScript.prototype.execute = function(command) {
  // Decode the command arguments from WebDriver's wire protocol.
  var decodeResult = bot.inject.executeScript(function(decodedParams) {
    command.setParameters(decodedParams);
  }, [command.getParameters()]);
  bot.response.checkResponse(
      (/** @type {!bot.response.ResponseObject} */decodeResult));

  return this.installPageScript().addCallback(function() {
    var parameters = command.getParameters();
    parameters = (/** @type {!Object.<*>} */this.encoder_.encode(parameters));
    command.setParameters(parameters);

    var message = new safaridriver.message.Command(command);
    this.log_.info('Sending message: ' + message);

    var commandResponse = new webdriver.promise.Deferred();
    this.pendingResponses_[command.getId()] = commandResponse;

    message.send(window);

    return commandResponse.then(function(result) {
      return bot.inject.wrapValue(result);
    });
  }, this);
};


/**
 * @param {!safaridriver.message.Response} message The message.
 * @param {!MessageEvent} e The original message.
 * @private
 */
safaridriver.inject.PageScript.prototype.onResponse_ = function(message, e) {
  if (message.isSameOrigin() || !safaridriver.inject.message.isFromSelf(e)) {
    return;
  }

  var promise = this.pendingResponses_[message.getId()];
  if (!promise) {
    this.log_.warning('Received response to an unknown command: ' + message);
    return;
  }
  delete this.pendingResponses_[message.getId()];

  var response = message.getResponse();
  try {
    response['value'] = this.encoder_.decode(response['value']);
    promise.resolve(response);
  } catch (ex) {
    promise.reject(bot.response.createErrorResponse(ex));
  }
};

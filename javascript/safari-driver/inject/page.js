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
 * @fileoverview Defines utilities for exchanging messages between the
 * sandboxed SafariDriver injected script and its corresponding content page.
 */

goog.provide('safaridriver.inject.page');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.inject');
goog.require('bot.response');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('safaridriver.console');
goog.require('safaridriver.inject.Encoder');
goog.require('safaridriver.inject.message.Encode');
goog.require('safaridriver.message');
goog.require('safaridriver.message.Command');
goog.require('safaridriver.message.Load');
goog.require('safaridriver.message.MessageTarget');
goog.require('safaridriver.message.Response');
goog.require('webdriver.CommandName');
goog.require('webdriver.promise');


/**
 * @type {!goog.debug.Logger}
 * @const
 * @private
 */
safaridriver.inject.page.LOG_ = goog.debug.Logger.getLogger(
    'safaridriver.inject.page');


/**
 * CSS selector used to locate the script tag added to the DOM to load this
 * script. Matches on the expected prefix and suffix for the resource URL.
 * The full URL is randomly generated each time Safari loads the WebDriver
 * extension.
 * @type {string}
 * @const
 * @private
 */
safaridriver.inject.page.SCRIPT_SELECTOR_ =
    'script[src^="safari-extension://org.openqa.selenium"][src$="/page.js"]';


/**
 * @type {!safaridriver.inject.Encoder}
 * @private
 */
safaridriver.inject.page.encoder_;


/**
 * Initializes this script. Removes the script DOM element used to inject it
 * into the page and sends a "load" message to the injected script.
 */
safaridriver.inject.page.init = function() {
  safaridriver.console.init();
  safaridriver.inject.page.LOG_.info('Initializing');

  var messageTarget = new safaridriver.message.MessageTarget(window);
  messageTarget.setLogger(safaridriver.inject.page.LOG_);
  messageTarget.on(safaridriver.message.Command.TYPE,
      safaridriver.inject.page.onCommand_);

  safaridriver.inject.page.encoder_ =
      new safaridriver.inject.Encoder(messageTarget);

  var message = new safaridriver.message.Load();
  safaridriver.inject.page.LOG_.info('Sending ' + message);
  message.send(window);

  var script = document.querySelector(
      safaridriver.inject.page.SCRIPT_SELECTOR_);
  // If we find the script running this script, remove it.
  if (script) {
    goog.dom.removeNode(script);
  } else {
    safaridriver.inject.page.LOG_.warning(
        'Unable to locate SafariDriver script element');
  }
};
goog.exportSymbol('init', safaridriver.inject.page.init);


/**
 * Handles command messages from the injected script.
 * @param {!safaridriver.message.Command} message The command message.
 * @param {!MessageEvent} e The original message event.
 * @throws {Error} If the command is not supported by this script.
 * @private
 */
safaridriver.inject.page.onCommand_ = function(message, e) {
  if (message.isSameOrigin() || !safaridriver.inject.message.isFromSelf(e)) {
    return;
  }

  var command = message.getCommand();

  var response = new webdriver.promise.Deferred();
  // When the response is resolved, we want to wrap it up in a message and
  // send it back to the injected script. This does all that.
  response.
      then(function(value) {
        var encodedValue = safaridriver.inject.page.encoder_.encode(value);
        // If the command result contains any DOM elements from another
        // document, the encoded value will contain promises that will resolve
        // once the owner documents have encoded the elements. Therefore, we
        // must wait for those to resolve.
        return webdriver.promise.fullyResolved(encodedValue);
      }).
      then(bot.response.createResponse, bot.response.createErrorResponse).
      then(function(response) {
        var responseMessage = new safaridriver.message.Response(
            command.getId(), response);
        safaridriver.inject.page.LOG_.info(
            'Sending ' + command.getName() + ' response: ' + responseMessage);
        responseMessage.send(window);
      });

  var handlerFn;
  switch (command.getName()) {
    case webdriver.CommandName.EXECUTE_ASYNC_SCRIPT:
      handlerFn = safaridriver.inject.page.executeAsyncScript_;
      break;

    case webdriver.CommandName.EXECUTE_SCRIPT:
      handlerFn = safaridriver.inject.page.executeScript_;
      break;
  }

  if (handlerFn) {
    handlerFn(command).then(response.resolve, response.reject);
  } else {
    response.reject(Error('Unknown command: ' + command.getName()));
  }
};


/**
 * Handles an executeScript command.
 * @param {!safaridriver.Command} command The command to execute.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the script result.
 * @private
 */
safaridriver.inject.page.executeScript_ = function(command) {
  var response = new webdriver.promise.Deferred();
  try {
    // TODO: clean-up bot.inject.executeScript so it doesn't pull in so many
    // extra dependencies.
    var fn = new Function(command.getParameter('script'));

    var args = command.getParameter('args');
    args = (/** @type {!Array} */safaridriver.inject.page.encoder_.decode(
        args));

    var result = fn.apply(window, args);
    response.resolve(result);
  } catch (ex) {
    response.reject(ex);
  }

  return response.promise;
};


/**
 * Handles an executeAsyncScript command.
 * @param {!safaridriver.Command} command The command to execute.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the script result.
 * @private
 */
safaridriver.inject.page.executeAsyncScript_ = function(command) {
  var response = new webdriver.promise.Deferred();

  try {
    var script = (/** @type {string} */command.getParameter('script'));
    var scriptFn = new Function(script);

    var args = command.getParameter('args');
    args = (/** @type {!Array} */safaridriver.inject.page.encoder_.decode(
        args));
    // The last argument for an async script is the callback that triggers the
    // response.
    args.push(function(value) {
      window.clearTimeout(timeoutId);
      if (response.isPending()) {
        response.resolve(value);
      }
    });

    var startTime = goog.now();
    scriptFn.apply(window, args);

    // Register our timeout *after* the function has been invoked. This will
    // ensure we don't timeout on a function that invokes its callback after a
    // 0-based timeout:
    // var scriptFn = function(callback) {
    //   setTimeout(callback, 0);
    // };
    var timeout = (/** @type {number} */command.getParameter('timeout'));
    var timeoutId = window.setTimeout(function() {
      if (response.isPending()) {
        response.reject(new bot.Error(bot.ErrorCode.SCRIPT_TIMEOUT,
            'Timed out waiting for an asynchronous script result after ' +
                (goog.now() - startTime) +  ' ms'));
      }
    }, Math.max(0, timeout));
  } catch (ex) {
    if (response.isPending()) {
      response.reject(ex);
    }
  }

  return response.promise;
};

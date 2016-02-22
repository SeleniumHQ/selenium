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
 * @fileoverview Defines utilities for exchanging messages between the
 * sandboxed SafariDriver injected script and its corresponding content page.
 */

goog.provide('safaridriver.inject.page');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.response');
goog.require('goog.array');
goog.require('goog.debug.LogManager');
goog.require('goog.log');
goog.require('safaridriver.dom');
goog.require('safaridriver.inject.CommandRegistry');
goog.require('safaridriver.inject.Encoder');
goog.require('safaridriver.inject.message');
goog.require('safaridriver.inject.page.modules');
goog.require('safaridriver.logging.ForwardingHandler');
goog.require('safaridriver.message');
goog.require('safaridriver.message.Alert');
goog.require('safaridriver.message.Command');
goog.require('safaridriver.message.Load');
goog.require('safaridriver.message.MessageTarget');
goog.require('safaridriver.message.Response');
goog.require('webdriver.promise');


/**
 * @private {goog.log.Logger}
 * @const
 */
safaridriver.inject.page.LOG_ = goog.log.getLogger('safaridriver.inject.page');


/**
 * @type {!safaridriver.inject.Encoder}
 */
safaridriver.inject.page.encoder;


/**
 * Initializes this module for exchanging messages with the primary injected
 * script driven by {@link safaridriver.inject.Tab}.
 */
safaridriver.inject.page.init = function() {
  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.INFO);

  // The page script is installed with an empty 'this' object, to avoid
  // polluting the global namespace. But we still want Closure libraries to be
  // able to read the properties of window that would normally be in
  // goog.global, so we copy those into goog.global.
  if (window != goog.global) {
    copyWindowPropertiesTo(goog.global);
  }

  var handler = new safaridriver.logging.ForwardingHandler(window);
  handler.captureConsoleOutput();

  safaridriver.inject.page.modules.init();

  goog.log.fine(safaridriver.inject.page.LOG_,
      'Loaded page script for ' + window.location);

  var messageTarget = new safaridriver.message.MessageTarget(window, true);
  messageTarget.setLogger(safaridriver.inject.page.LOG_);
  messageTarget.on(safaridriver.message.Command.TYPE,
      safaridriver.inject.page.onCommand_);

  safaridriver.inject.page.encoder =
      new safaridriver.inject.Encoder(messageTarget);

  var message = new safaridriver.message.Load(window !== window.top);
  goog.log.fine(safaridriver.inject.page.LOG_,'Sending ' + message);
  message.send(window);

  wrapDialogFunction('alert', safaridriver.inject.page.wrappedAlert_);
  wrapDialogFunction('confirm', safaridriver.inject.page.wrappedConfirm_);
  wrapDialogFunction('prompt', safaridriver.inject.page.wrappedPrompt_);
  safaridriver.dom.call(window, 'addEventListener', 'beforeunload',
      safaridriver.inject.page.onBeforeUnload_, true);

  function wrapDialogFunction(name, newFn) {
    var oldFn = window[name];
    window[name] = newFn;
    window.constructor.prototype[name] = newFn;
    window[name].toString = function() {
      return oldFn.toString();
    };
  }

  function copyWindowPropertiesTo(obj) {
    goog.array.forEach(Object.getOwnPropertyNames(window), function(name) {
      if (!(name in obj)) {
        var descriptor = Object.getOwnPropertyDescriptor(window, name);
        if (descriptor) {
          Object.defineProperty(obj, name, descriptor);
        }
      }
    });
  }
};
goog.exportSymbol('init', safaridriver.inject.page.init);


/**
 * The native dialog functions.
 * @enum {{name: string, fn: !Function}}
 * @private
 */
safaridriver.inject.page.NativeDialog_ = {
  ALERT: {name: 'alert', fn: window.alert},
  BEFOREUNLOAD: {name: 'beforeunload', fn: goog.nullFunction},
  CONFIRM: {name: 'confirm', fn: window.confirm},
  PROMPT: {name: 'prompt', fn: window.prompt}
};


/**
 * Wraps window.alert.
 * @param {...*} var_args The alert arguments.
 * @this {Window}
 * @private
 */
safaridriver.inject.page.wrappedAlert_ = function(var_args) {
  safaridriver.inject.page.sendAlert_(
      safaridriver.inject.page.NativeDialog_.ALERT,
      // Closure's extern definition for window.alert says it takes var_args,
      // but Safari's only accepts a single argument.
      arguments[0]);
};


/**
 * Wraps window.confirm.
 * @param {*} arg The confirm argument.
 * @return {boolean} The confirmation response.
 * @this {Window}
 * @private
 */
safaridriver.inject.page.wrappedConfirm_ = function(arg) {
  return /** @type {boolean} */ (safaridriver.inject.page.sendAlert_(
      safaridriver.inject.page.NativeDialog_.CONFIRM, arg));
};


/**
 * Wraps window.prompt.
 * @param {*} arg The prompt argument.
 * @return {?string} The prompt response.
 * @this {Window}
 * @private
 */
safaridriver.inject.page.wrappedPrompt_ = function(arg) {
  return /** @type {?string} */ (safaridriver.inject.page.sendAlert_(
      safaridriver.inject.page.NativeDialog_.PROMPT, arg));
};


/**
 * Window beforeunload event listener that intercepts calls to user defined
 * window.onbeforeunload functions.
 * @param {Event} event The beforeunload event.
 * @private
 */
safaridriver.inject.page.onBeforeUnload_ = function(event) {
  safaridriver.inject.page.sendAlert_(
      safaridriver.inject.page.NativeDialog_.BEFOREUNLOAD, event);
};


/**
 * @param {!safaridriver.inject.page.NativeDialog_} dialog The dialog
 *     descriptor.
 * @param {...*} var_args The alert function dialogs.
 * @return {?(boolean|string|undefined)} The alert response.
 * @private
 */
safaridriver.inject.page.sendAlert_ = function(dialog, var_args) {
  var args = goog.array.slice(arguments, 1);
  var alertText = args[0] + '';
  var blocksUiThread = true;

  var nativeFn = dialog.fn;
  if (dialog === safaridriver.inject.page.NativeDialog_.BEFOREUNLOAD) {
    // The user onbeforeunload has not actually been called, so we're not at
    // risk of blocking the UI thread yet. We just need to query if it's
    // possible for it to block.
    blocksUiThread = false;
    nativeFn = window.onbeforeunload;
    if (!nativeFn) {
      // window.onbeforeunload not set, nothing more for us to do.
      return null;
    }
  }

  goog.log.fine(safaridriver.inject.page.LOG_, 'Sending alert notification; ' +
      'type: ' + dialog.name + ', text: ' + alertText);

  var message = new safaridriver.message.Alert(alertText, blocksUiThread);
  var ignoreAlert = message.sendSync(window);

  if (ignoreAlert == '1') {
    if (dialog !== safaridriver.inject.page.NativeDialog_.BEFOREUNLOAD) {
      goog.log.fine(safaridriver.inject.page.LOG_, 'Invoking native alert');
      return nativeFn.apply(window, args);
    }
    return null;  // Return and let onbeforeunload be called as usual.
  }

  goog.log.info(safaridriver.inject.page.LOG_, 'Dismissing unexpected alert');
  var response;
  switch (dialog.name) {
    case safaridriver.inject.page.NativeDialog_.BEFOREUNLOAD.name:
      if (nativeFn) {
        // Call the onbeforeunload handler so user logic executes, but clear
        // the real deal so the dialog does not popup and hang the UI thread.
        var ret = nativeFn();
        window.onbeforeunload = null;
        if (goog.isDefAndNotNull(ret)) {
          // Ok, the user's onbeforeunload would block the UI thread so we
          // need to let the extension know about it.
          blocksUiThread = true;
          new safaridriver.message.Alert(ret + '', blocksUiThread).
              sendSync(window);
        }
      }
      break;

    case safaridriver.inject.page.NativeDialog_.CONFIRM.name:
      response = false;
      break;

    case safaridriver.inject.page.NativeDialog_.PROMPT.name:
      response = null;
      break;
  }
  return response;
};


/**
 * Handles command messages from the injected script.
 * @param {!safaridriver.message.Command} message The command message.
 * @param {!MessageEvent.<*>} e The original message event.
 * @throws {Error} If the command is not supported by this script.
 * @private
 */
safaridriver.inject.page.onCommand_ = function(message, e) {
  if (message.isSameOrigin() || !safaridriver.inject.message.isFromSelf(e)) {
    return;
  }

  var command = message.getCommand();
  safaridriver.inject.CommandRegistry.getInstance()
      .execute(command, goog.global)
      // When the response is resolved, we want to wrap it up in a message and
      // send it back to the injected script. This does all that.
      .then(function(value) {
        var encodedValue = safaridriver.inject.page.encoder.encode(value);
        // If the command result contains any DOM elements from another
        // document, the encoded value will contain promises that will resolve
        // once the owner documents have encoded the elements. Therefore, we
        // must wait for those to resolve.
        return webdriver.promise.fullyResolved(encodedValue);
      })
      .then(bot.response.createResponse, bot.response.createErrorResponse)
      .then(function(response) {
        var responseMessage = new safaridriver.message.Response(
            command.getId(), response);
        goog.log.fine(safaridriver.inject.page.LOG_,
            'Sending ' + command.getName() + ' response: ' + responseMessage);
        responseMessage.send(window);
      });
};


/**
 * @param {!Function} fn The function to execute.
 * @param {!Array.<*>} args Function arguments.
 * @return {*} The function result.
 * @throws {Error} If unable to decode the function arguments.
 */
safaridriver.inject.page.execute = function(fn, args) {
  args = /** @type {!Array} */ (safaridriver.inject.Encoder.decode(args));
  return fn.apply(window, args);
};

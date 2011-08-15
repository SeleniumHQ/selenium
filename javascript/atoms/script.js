// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
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

goog.provide('bot.script');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('goog.events');
goog.require('goog.events.EventType');


/**
 * Executes a random snippet of JavaScript that defines the body of a function
 * to invoke.  When executing asynchronous scripts, all timeouts will be
 * scheduled with the window in whose context the script is invoked (this
 * ensures timeouts are in sync with that window's event queue).  Furthermore,
 * asynchronous scripts do not work across new page loads (since the JavaScript
 * context is lost); if an "unload" event is fired while an asynchronous script
 * is executing, the script will be aborted and the {@code onFailure} callback
 * will be invoked.
 *
 * @param {string} script A string defining the body of the function
 *     to invoke.
 * @param {!Array.<*>} args The list of arguments to pass to the script.
 * @param {number} timeout The amount of time, in milliseconds, the script
 *     should be permitted to run. If {@code timeout < 0}, the script will
 *     be considered synchronous and expetected to immediately return a result.
 * @param {function(*)} onSuccess The function to call if the script
 *     succeeds. The function should take a single argument: the script
 *     result.
 * @param {function(!bot.Error)} onFailure The function to call if the script
 *     fails. The function should take a single argument: a bot.Error object
 *     describing the failure.
 * @param {Window=} opt_window The window to execute the script in; defaults
 *     to the current window. Asynchronous scripts will have their timeouts
 *     scheduled with this window. Furthermore, asynchronous scripts will
 *     be aborted if this window fires an unload event.
 */
bot.script.execute = function(script, args, timeout, onSuccess, onFailure,
                              opt_window) {
  var timeoutId, onunloadKey;
  var win = opt_window || window;
  var responseSent = false;

  function sendResponse(status, value) {
    if (!responseSent) {
      responseSent = true;
      goog.events.unlistenByKey(onunloadKey);
      win.clearTimeout(timeoutId);
      if (status != bot.ErrorCode.SUCCESS) {
        var err = new bot.Error(status, value.message);
        err.stack = value.stack;
        onFailure(err);
      } else {
        onSuccess(value);
      }
    }
  }

  function onUnload() {
    sendResponse(bot.ErrorCode.JAVASCRIPT_ERROR,
                 Error('Detected a page unload event; asynchronous script ' +
                       'execution does not work across apge loads.'));
  }

  function onTimeout(startTime) {
    sendResponse(bot.ErrorCode.SCRIPT_TIMEOUT,
                 Error('Timed out waiting for asynchronous script result ' +
                       'after ' + (goog.now() - startTime) + 'ms'));
  }

  var isAsync = timeout >= 0;

  if (isAsync) {
    args.push(function(value) {
      sendResponse(bot.ErrorCode.SUCCESS, value);
    });
    onunloadKey = goog.events.listen(win, goog.events.EventType.UNLOAD,
        onUnload, true);
  }

  var startTime = goog.now();
  try {
    // Try to use the Function type belonging to the window, where available.
    var functionType = win['Function'] || Function;
    var result = new functionType(script).apply(win, args);
    if (isAsync) {
      timeoutId = win.setTimeout(goog.partial(onTimeout, startTime), timeout);
    } else {
      sendResponse(bot.ErrorCode.SUCCESS, result);
    }
  } catch (ex) {
    sendResponse(ex.code || bot.ErrorCode.JAVASCRIPT_ERROR, ex);
  }
};

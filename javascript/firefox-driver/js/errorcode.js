/*
 Copyright 2007-2010 WebDriver committers
 Copyright 2007-2010 Google Inc.
 Portions copyright 2007 ThoughtWorks, Inc

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

goog.provide('ErrorCode');

/**
 * Error codes used by the remote wire protocol.
 * @enum {number}
 */
var ErrorCode = {
  // Keep in sync with codes in org.openqa.selenium.remote.ErrorCodes

  SUCCESS: 0,
  NO_SUCH_ELEMENT: 7,
  NO_SUCH_FRAME: 8,
  UNKNOWN_COMMAND: 9,
  STALE_ELEMENT_REFERENCE: 10,
  ELEMENT_NOT_VISIBLE: 11,
  INVALID_ELEMENT_STATE: 12,
  UNHANDLED_ERROR: 13,
  UNEXPECTED_JAVASCRIPT_ERROR: 17,
  XPATH_LOOKUP_ERROR: 19,
  NO_SUCH_WINDOW: 23,
  INVALID_COOKIE_DOMAIN: 24,
  UNABLE_TO_SET_COOKIE: 25,
  MODAL_DIALOG_OPENED: 26,
  MODAL_DIALOG_OPEN: 27,
  ASYNC_SCRIPT_TIMEOUT: 28,
  INVALID_ELEMENT_COORDINATES: 29,
  IME_NOT_AVAILABLE: 30,
  IME_ENGINE_ACTIVATION_FAILED: 31,
  INVALID_SELECTOR_ERROR: 32
};


/**
 * Converts an Error object to a JSON object compatible with WebDriver's remote
 * wire protocol.
 * @param {Error} ex The thrown error to convert.
 * @return {Object} The converted object.
 */
ErrorCode.toJSON = function(ex) {
  var stackFrames = [];
  var json = {
    'message': ex.message ? ex.message : ex.toString(),
    'stackTrace': stackFrames
  };

  if (ex.stack) {
    var stack = ex.stack.replace(/\s*$/, '').split('\n');

    for (var frame = stack.shift(); frame; frame = stack.shift()) {
      var match = frame.match(/^([a-zA-Z_$][\w]*)?(?:\(.*\))?@(.+)?:(\d*)$/);
      stackFrames.push({
        'methodName': match[1],
        'fileName': match[2],
        'lineNumber': Number(match[3])
      });
    }
  }

  return json;
};

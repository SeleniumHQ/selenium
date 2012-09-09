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

goog.provide('safaridriver.alert');

goog.require('bot.ErrorCode');


/**
 * Creates an error {@link bot.response.ResponseObject} for an opened modal
 * dialog.
 * @param {string} txt The alert text.
 * @return {!bot.response.ResponseObject} The response object.
 */
safaridriver.alert.createResponse = function(txt) {
  return {
    'status': bot.ErrorCode.MODAL_DIALOG_OPENED,
    'value': {
      'message':
          'A modal dialog was opened. The SafariDriver does not support ' +
          'interacting with modal dialogs. To avoid hanging your test, the ' +
          'alert has been dismissed. For more information, see ' +
          'http://code.google.com/p/selenium/issues/detail?id=3862',
      'alert': { 'text': txt }
    }
  };
};

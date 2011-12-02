// Copyright 2011 Software Freedom Conservatory. All Rights Reserved.
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

/** @fileoverview Error utilities for WebDriverJS. */

goog.provide('webdriver.error');

goog.require('bot.Error');
goog.require('bot.ErrorCode');


/**
 * Converts an error value into its JSON representation as defined by the
 * WebDriver wire protocol.
 * @param {*} error The error value to convert.
 * @return {!{status:number, value:!{message:string}}} The converted response.
 * @see http://code.google.com/p/selenium/wiki/JsonWireProtocol#Failed_Commands
 */
webdriver.error.createResponse = function(error) {
  return {
    status: error && error.code || bot.ErrorCode.UNKNOWN_ERROR,
    value: {
      message: error && error.message || error + ''
      // TODO(jleyba): Parse stack trace info.
    }
  };
};


/**
 * Checks that a response object does not define a {@code bot.Error} as defined
 * by the WebDriver wire protocol. If the response object defines an error, it
 * will be thrown. Otherwise, the response will be returned as is.
 *
 * @param {!{status:number, value:*}} responseObj The response object to check.
 * @return {!{status:number, value:*}} The checked response object.
 * @see http://code.google.com/p/selenium/wiki/JsonWireProtocol#Failed_Commands
 */
webdriver.error.checkResponse = function(responseObj) {
  var status = responseObj['status'];
  if (status == bot.ErrorCode.SUCCESS) {
    return responseObj;
  }

  // If status is not defined, assume an unknown error.
  status = status || bot.ErrorCode.UNKNOWN_ERROR;

  var value = responseObj['value'];
  if (!value || !goog.isObject(value)) {
    throw new bot.Error(status, value + '');
  }

  // TODO(jleyba): Handle stack traces.
  throw new bot.Error(status, value['message'] + '');
};

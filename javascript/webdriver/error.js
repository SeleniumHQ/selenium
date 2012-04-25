// Copyright 2011 Software Freedom Conservancy. All Rights Reserved.
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
 * @typedef {{status: bot.ErrorCode, value: (*|{message: string})}}
 */
webdriver.error.ResponseObject;


/**
 * @param {*} value The value to test.
 * @return {boolean} Whether the given value is a response object.
 */
webdriver.error.isResponseObject = function(value) {
  return goog.isObject(value) && goog.isNumber(value['status']);
};


/**
 * Converts an error value into its JSON representation as defined by the
 * WebDriver wire protocol.
 * @param {*} error The error value to convert.
 * @return {!webdriver.error.ResponseObject} The converted response.
 * @see http://code.google.com/p/selenium/wiki/JsonWireProtocol#Failed_Commands
 */
webdriver.error.createResponse = function(error) {
  if (webdriver.error.isResponseObject(error)) {
    return (/** @type {!webdriver.error.ResponseObject} */error);
  }

  var statusCode = error && goog.isNumber(error.code) ? error.code :
      bot.ErrorCode.UNKNOWN_ERROR;
  return {
    'status': (/** @type {bot.ErrorCode} */statusCode),
    'value': {
      'message': error && error.message || error + ''
      // TODO(jleyba): Parse stack trace info.
    }
  };
};


/**
 * Checks that a response object does not define a {@code bot.Error} as defined
 * by the WebDriver wire protocol. If the response object defines an error, it
 * will be thrown. Otherwise, the response will be returned as is.
 *
 * @param {!webdriver.error.ResponseObject} responseObj The response object to
 *     check.
 * @return {!webdriver.error.ResponseObject} The checked response object.
 * @throws {bot.Error} If the response describes an error.
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

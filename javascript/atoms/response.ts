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
 * @fileoverview Utilities for working with WebDriver response objects.
 * @see: https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#responses
 */

import { BotError, ErrorCode } from './error';

/**
 * Type definition for a response object, as defined by the JSON wire protocol.
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#responses
 */
export interface ResponseObject {
  status: ErrorCode;
  value: unknown | { message: string };
}

/**
 * Checks if the given value is a response object.
 * @param value The value to test.
 * @return Whether the given value is a response object.
 */
export function isResponseObject(value: unknown): value is ResponseObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ResponseObject)['status'] === 'number'
  );
}

/**
 * Creates a new success response object with the provided value.
 * @param value The response value.
 * @return The new response object.
 */
export function createResponse(value: unknown): ResponseObject {
  if (isResponseObject(value)) {
    return value;
  }
  return {
    status: ErrorCode.SUCCESS,
    value: value,
  };
}

/**
 * Converts an error value into its JSON representation as defined by the
 * WebDriver wire protocol.
 * @param error The error value to convert.
 * @return The new response object.
 */
export function createErrorResponse(
  error: BotError | Error | unknown
): ResponseObject {
  if (isResponseObject(error)) {
    return error;
  }

  const errorObj = error as { code?: number; message?: string };
  const statusCode =
    errorObj && typeof errorObj.code === 'number'
      ? errorObj.code
      : ErrorCode.UNKNOWN_ERROR;

  return {
    status: statusCode as ErrorCode,
    value: {
      message: ((errorObj && errorObj.message) || error) + '',
    },
  };
}

/**
 * Checks that a response object does not specify an error as defined by the
 * WebDriver wire protocol. If the response object defines an error, it will
 * be thrown. Otherwise, the response will be returned as is.
 * @param responseObj The response object to check.
 * @return The checked response object.
 * @throws BotError If the response describes an error.
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#failed-commands
 */
export function checkResponse(responseObj: ResponseObject): ResponseObject {
  const status = responseObj['status'];
  if (status === ErrorCode.SUCCESS) {
    return responseObj;
  }

  const statusCode = status || ErrorCode.UNKNOWN_ERROR;
  const value = responseObj['value'];

  if (!value || typeof value !== 'object') {
    throw new BotError(statusCode, value + '');
  }

  throw new BotError(
    statusCode,
    (value as { message?: string })['message'] + ''
  );
}

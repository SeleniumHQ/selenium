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
 * Utilities for working with WebDriver response objects as defined by the
 * JSON wire protocol.
 *
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#responses
 */

import { WebDriverError, ErrorCode } from './error';

/**
 * A response object as defined by the JSON wire protocol.
 * Contains a status code and a value (success value or error details).
 */
export interface ResponseObject {
    status: ErrorCode;
    value: unknown | { message: string };
}

/**
 * Tests whether a value is a response object.
 * A response object must be an object with a numeric 'status' property.
 *
 * @param value The value to test
 * @returns true if the value is a valid response object
 *
 * @example
 * isResponseObject({ status: 0, value: 'ok' })      // true
 * isResponseObject({ status: 'error', value: null }) // false
 */
export function isResponseObject(value: unknown): value is ResponseObject {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as Record<string, unknown>)['status'] === 'number'
    );
}

/**
 * Creates a new success response object with the provided value.
 * If the value is already a response object, it is returned as-is.
 *
 * @param value The response value
 * @returns A response object with status SUCCESS
 *
 * @example
 * createResponse('ok')           // { status: 0, value: 'ok' }
 * createResponse(['a', 'b'])     // { status: 0, value: ['a', 'b'] }
 */
export function createResponse(value: unknown): ResponseObject {
    if (isResponseObject(value)) {
        return value;
    }

    return {
        status: ErrorCode.SUCCESS,
        value,
    };
}

/**
 * Converts an error value into a WebDriver response object.
 * Extracts the error code and message for proper protocol representation.
 *
 * @param error The error to convert (WebDriverError, Error, or any value)
 * @returns A response object with error status and message
 *
 * @example
 * const err = new WebDriverError(ErrorCode.NO_SUCH_ELEMENT, 'Element not found');
 * createErrorResponse(err)
 * // { status: 7, value: { message: 'Element not found' } }
 */
export function createErrorResponse(error: unknown): ResponseObject {
    if (isResponseObject(error)) {
        return error;
    }

    // Try to extract error code from error object
    let statusCode = ErrorCode.UNKNOWN_ERROR;
    if (
        error &&
        typeof error === 'object' &&
        typeof (error as Record<string, unknown>).code === 'number'
    ) {
        statusCode = (error as Record<string, unknown>).code as ErrorCode;
    }

    // Try to extract error message
    let message = '';
    if (error && typeof error === 'object' && 'message' in error) {
        message = String((error as Record<string, unknown>).message);
    } else {
        message = String(error);
    }

    return {
        status: statusCode,
        value: {
            message,
        },
    };
}

/**
 * Checks whether a response object indicates success.
 * If the response describes an error (non-zero status), the corresponding
 * WebDriverError is thrown. Otherwise, the response is returned unchanged.
 *
 * @param responseObj The response object to validate
 * @returns The response object if status is SUCCESS
 * @throws {WebDriverError} If the response describes an error
 *
 * @example
 * const response = { status: 0, value: 'ok' };
 * checkResponse(response) // returns the response object
 *
 * const errorResponse = { status: 7, value: { message: 'Not found' } };
 * checkResponse(errorResponse) // throws WebDriverError
 */
export function checkResponse(responseObj: ResponseObject): ResponseObject {
    const status = responseObj.status ?? ErrorCode.UNKNOWN_ERROR;

    if (status === ErrorCode.SUCCESS) {
        return responseObj;
    }

    // Extract error message from value
    const value = responseObj.value;
    let message = '';

    if (value && typeof value === 'object' && 'message' in value) {
        message = String((value as Record<string, unknown>).message);
    } else {
        message = String(value);
    }

    throw new WebDriverError(status, message);
}

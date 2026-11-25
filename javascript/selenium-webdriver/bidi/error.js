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

'use strict'

const error = require('../lib/error')

let typesByCode

// Built on first use: generated/common.js loads every generated domain module, each of
// which loads domain.js, which loads this file.
function types() {
  if (typesByCode) return typesByCode
  // lib/error keeps its code-to-type table private; encodeError is its public inverse.
  const classicByCode = new Map()
  for (const type of Object.values(error)) {
    if (type === error.WebDriverError || type?.prototype instanceof error.WebDriverError) {
      const { error: code } = error.encodeError(new type())
      if (!classicByCode.has(code)) classicByCode.set(code, type)
    }
  }
  // Only BiDi's own codes are typed, so a classic-only code such as 'no such cookie' stays
  // a plain WebDriverError like any other code outside the spec.
  const { ErrorCode } = require('./generated/common')
  typesByCode = new Map(Object.values(ErrorCode).map((code) => [code, classicByCode.get(code) ?? defineType(code)]))
  return typesByCode
}

function defineType(code) {
  const name = code.replace(/(?:^|\s+)(\w)/g, (_, c) => c.toUpperCase()) + 'Error'
  return { [name]: class extends error.WebDriverError {} }[name]
}

/**
 * The error type thrown for a BiDi error code: the WebDriver classic type for a code the
 * two protocols share, a dedicated WebDriverError subclass for any other code in the spec,
 * and WebDriverError itself for a code outside it.
 * @param {string} code A BiDi error code, e.g. 'no such frame'.
 * @return {typeof error.WebDriverError}
 * @see https://www.selenium.dev/documentation/warnings/bidi-implementation/
 * @internal
 */
function errorType(code) {
  return types().get(code) ?? error.WebDriverError
}

/**
 * The error for a BiDi error response.
 * @param {{error: string, message: string, stacktrace: (string|undefined)}} response
 * @return {error.WebDriverError} The error, with the wire code in `code` and the remote
 *     end's stacktrace, if any, in `remoteStacktrace`.
 * @see https://www.selenium.dev/documentation/warnings/bidi-implementation/
 * @internal
 */
function errorFromResponse(response) {
  const Type = errorType(response.error)
  // The code stays in the message so callers matching the earlier untyped message keep working.
  const err = new Type(`${response.error}: ${response.message}`)
  err.code = response.error
  if (typeof response.stacktrace === 'string') {
    err.remoteStacktrace = response.stacktrace
  }
  return err
}

module.exports = { errorType, errorFromResponse }

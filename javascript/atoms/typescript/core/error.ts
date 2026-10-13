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

// WebDriver error codes carried by atoms back across the wire. The injecting
// binding reads `code` off the thrown error to pick the right exception type,
// so these strings are part of the protocol surface, not free text.
export const INVALID_SELECTOR = 'invalid selector'
export const INVALID_ARGUMENT = 'invalid argument'
export const NO_SUCH_ELEMENT = 'no such element'
export const NO_SUCH_FRAME = 'no such frame'
export const NO_SUCH_WINDOW = 'no such window'
export const STALE_ELEMENT_REFERENCE = 'stale element reference'
export const JAVASCRIPT_ERROR = 'javascript error'
export const SCRIPT_TIMEOUT = 'script timeout'
// bot.Error.State.UNKNOWN_ERROR, which bot.ErrorCode.UNKNOWN_ERROR (13) mapped
// onto. The storage atoms raise it when web storage is unavailable.
export const UNKNOWN_ERROR = 'unknown error'

export function botError(code: string, message: string): Error {
  const err = new Error(message)
  ;(err as unknown as Record<string, unknown>)['code'] = code
  return err
}

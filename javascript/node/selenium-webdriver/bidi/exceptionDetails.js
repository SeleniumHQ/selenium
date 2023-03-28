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

class ExceptionDetails {
  constructor(columnNumber, exception, lineNumber, stacktrace, text) {
    this._columnNumber = columnNumber
    this._exception = exception
    this._lineNumber = lineNumber
    this._stacktrace = stacktrace
    this._text = text
  }

  fromJson(input) {
    let columnNumber = null
    let exception = null
    let lineNumber = null
    let stacktrace = null
    let text = null

    if ('columnNumber' in input) {
      columnNumber = input['columnNumber']
    }

    if ('exception' in input) {
      exception = input['exception']
    }

    if ('lineNumber' in input) {
      lineNumber = input['lineNumber']
    }

    if ('stacktrace' in input) {
      stacktrace = input['stacktrace']
    }

    if ('text' in input) {
      text = input['text']
    }

    return new ExceptionDetails(
      columnNumber,
      exception,
      lineNumber,
      stacktrace,
      text
    )
  }

  get columnNumber() {
    return this._columnNumber
  }

  get exception() {
    return this._exception
  }

  get lineNumber() {
    return this._lineNumber
  }

  get stacktrace() {
    return this._stacktrace
  }

  get text() {
    return this._text
  }

  toJson() {
    let toReturn = {}

    toReturn['columnNumber'] = this._columnNumber
    toReturn['exception'] = this._exception
    toReturn['lineNumber'] = this._lineNumber
    toReturn['stacktrace'] = this._stacktrace
    toReturn['text'] = this.text

    return toReturn
  }
}

module.exports = ExceptionDetails

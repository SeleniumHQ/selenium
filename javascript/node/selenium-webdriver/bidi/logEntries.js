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

class BaseLogEntry {
  constructor (level, text, timeStamp, stackTrace) {
    this._level = level
    this._text = text
    this._timeStamp = timeStamp
    this._stackTrace = stackTrace
  }

  get level () {
    return this._level
  }

  get text () {
    return this._text
  }

  get timeStamp () {
    return this._timeStamp
  }

  get stackTrace () {
    return this._stackTrace
  }
}

class GenericLogEntry extends BaseLogEntry {
  constructor (level, text, timeStamp, type, stackTrace) {
    super(level, text, timeStamp, stackTrace)
    this._type = type
  }

  get type () {
    return this._type
  }
}

class ConsoleLogEntry extends GenericLogEntry {
  constructor (level, text, timeStamp, type, method, realm, args, stackTrace) {
    super(level, text, timeStamp, type, stackTrace)
    this._method = method
    this._realm = realm
    this._args = args
  }

  get method () {
    return this._method
  }

  get realm () {
    return this._realm
  }

  get args () {
    return this._args
  }
}

class JavascriptLogEntry extends GenericLogEntry {
  constructor (level, text, timeStamp, type, stackTrace) {
    super(level, text, timeStamp, type, stackTrace)
  }
}

// PUBLIC API

module.exports = {
  BaseLogEntry, GenericLogEntry, ConsoleLogEntry, JavascriptLogEntry,
}

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

class Message {
  constructor(channel, data, source) {
    this._channel = channel
    this._data = data
    this._source = source
  }

  get channel() {
    return this._channel
  }

  get data() {
    return this._data
  }

  get source() {
    return this._source
  }
}

class Source {
  constructor(source) {
    this._browsingContextId = null
    this._realmId = source.realm

    // Browsing context is returned as an optional parameter
    if ('context' in source) {
      this._browsingContextId = source.context
    }
  }

  get browsingContextId() {
    return this._browsingContextId
  }

  get realmId() {
    return this._realmId
  }
}

module.exports = { Message, Source }

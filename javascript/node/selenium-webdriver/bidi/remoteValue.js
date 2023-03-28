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

const { PrimitiveType } = require('./primitiveType')
const { NonPrimitiveType } = require('./nonPrimitiveType')
const { RemoteType } = require('./remoteType')

class RemoteValue {
  constructor(
    type,
    handle = null,
    internalId = null,
    value = null,
    sharedId = null
  ) {
    this._type = type
    this._handle = handle
    this._internalId = internalId
    this._value = value
    this._sharedId = sharedId
  }

  fromJson(input) {
    let type = null
    let handle = null
    let internalId = null
    let value = null
    let sharedId = null

    if ('type' in input) {
      var typeString = input['type']
      if (PrimitiveType.findByName(typeString) != null) {
        type = PrimitiveType.findByName(typeString)
      } else if (NonPrimitiveType.findByName(typeString) != null) {
        type = NonPrimitiveType.findByName(typeString)
      } else {
        type = RemoteType.findByName(typeString)
      }
    }

    if ('handle' in input) {
      handle = input['handle']
    }

    if ('internalId' in input) {
      internalId = input['internalId']
    }

    if ('value' in input) {
      value = input['value']
    }

    if ('sharedId' in input) {
      sharedId = input['sharedId']
    }

    if (value != null) {
      value = deserializeValue(value, type)
    }

    return new RemoteValue(type, handle, internalId, value, sharedId)
  }

  get type() {
    return this._type
  }

  get handle() {
    return this._handle
  }

  get internalId() {
    return this._internalId
  }

  get value() {
    return this._value
  }

  get sharedId() {
    return this._sharedId
  }

  toJson() {
    let toReturn = {}

    toReturn['type'] = this._type
    if (this._handle != null) {
      toReturn['handle'] = this._handle
    }
    if (this._internalId != null) {
      toReturn['internalId'] = this._internalId
    }
    if (this._value != null) {
      toReturn['value'] = this._value
    }
    if (this._sharedId != null) {
      toReturn['sharedId'] = this._sharedId
    }
    return toReturn
  }

  //   deserializeValue(value, type) {
  //     if (NonPrimitiveType.ARRAY === type || NonPrimitiveType.SET === type) {

  //     }
  //   }
}

module.exports = RemoteValue

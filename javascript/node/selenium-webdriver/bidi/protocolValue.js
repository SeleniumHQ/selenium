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

const {
  PrimitiveType,
  NonPrimitiveType,
  RemoteType,
} = require('./protocolType')

const TYPE_CONSTANT = 'type'
const VALUE_CONSTANT = 'value'
const RemoteReferenceType = {
  HANDLE: 'handle',
  SHARED_ID: 'shareId',
}

class LocalValue {
  constructor(type, value = null) {
    if (type === PrimitiveType.UNDEFINED || type === PrimitiveType.NULL) {
      this.type = type
    } else {
      this.type = type
      this.value = value
    }
  }

  static createStringValue(value) {
    return new LocalValue(PrimitiveType.STRING, value)
  }

  static createNumberValue(value) {
    return new LocalValue(PrimitiveType.NUMBER, value)
  }

  static createSpecialNumberValue(value) {
    return new LocalValue(PrimitiveType.SPECIAL_NUMBER, value)
  }

  static createUndefinedValue() {
    return new LocalValue(PrimitiveType.UNDEFINED)
  }

  static createNullValue() {
    return new LocalValue(PrimitiveType.NULL)
  }

  static createBooleanValue(value) {
    return new LocalValue(PrimitiveType.BOOLEAN, value)
  }

  static createBigIntValue(value) {
    return new LocalValue(PrimitiveType.BIGINT, value)
  }

  static createArrayValue(value) {
    return new LocalValue(NonPrimitiveType.ARRAY, value)
  }

  static createDateValue(value) {
    return new LocalValue(NonPrimitiveType.DATE, value)
  }

  static createMapValue(map) {
    let value = []
    Object.entries(map).forEach((entry) => {
      value.push(entry)
    })
    return new LocalValue(NonPrimitiveType.MAP, value)
  }

  static createObjectValue(map) {
    let value = []
    Object.entries(map).forEach((entry) => {
      value.push(entry)
    })
    return new LocalValue(NonPrimitiveType.OBJECT, value)
  }

  static createRegularExpressionValue(value) {
    return new LocalValue(NonPrimitiveType.REGULAR_EXPRESSION, value)
  }

  static createSetValue(value) {
    return new LocalValue(NonPrimitiveType.SET, value)
  }

  toJson() {
    let toReturn = {}
    toReturn[TYPE_CONSTANT] = this.type

    if (
      !(
        this.type === PrimitiveType.NULL ||
        this.type === PrimitiveType.UNDEFINED
      )
    ) {
      toReturn[VALUE_CONSTANT] = this.value
    }
    return toReturn
  }
}

class RemoteValue {
  constructor(remoteValue) {
    this.type = null
    this.handle = null
    this.internalId = null
    this.value = null
    this.sharedId = null

    if ('type' in remoteValue) {
      const typeString = remoteValue['type']
      if (PrimitiveType.findByName(typeString) != null) {
        this.type = PrimitiveType.findByName(typeString)
      } else if (NonPrimitiveType.findByName(typeString) != null) {
        this.type = NonPrimitiveType.findByName(typeString)
      } else {
        this.type = RemoteType.findByName(typeString)
      }
    }

    if ('handle' in remoteValue) {
      this.handle = remoteValue['handle']
    }

    if ('internalId' in remoteValue) {
      this.internalId = remoteValue['internalId']
    }

    if ('value' in remoteValue) {
      this.value = remoteValue['value']
    }

    if ('sharedId' in remoteValue) {
      this.sharedId = remoteValue['sharedId']
    }

    if (this.value != null) {
      this.value = this.deserializeValue(this.value, this.type)
    }
  }

  deserializeValue(value, type) {
    if ([NonPrimitiveType.MAP, NonPrimitiveType.OBJECT].includes(type)) {
      return Object.fromEntries(value)
    } else if (type === NonPrimitiveType.REGULAR_EXPRESSION) {
      return new RegExpValue(value.pattern, value.flags)
    }
    return value
  }
}

class ReferenceValue {
  constructor(handle, shareId) {
    if (handle === RemoteReferenceType.HANDLE) {
      this.handle = shareId
    } else {
      this.handle = handle
      this.shareId = shareId
    }
  }

  asMap() {
    const toReturn = {}
    if (this.handle != null) {
      toReturn[RemoteReferenceType.HANDLE] = this.handle
    }

    if (this.shareId != null) {
      toReturn[RemoteReferenceType.SHARED_ID] = this.shareId
    }

    return toReturn
  }
}

class RegExpValue {
  constructor(pattern, flags = null) {
    this.pattern = pattern
    this.flags = flags
  }
}

module.exports = {
  LocalValue,
  RemoteValue,
  ReferenceValue,
  RemoteReferenceType,
  RegExpValue,
}

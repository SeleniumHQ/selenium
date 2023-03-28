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

const PrimitiveType = require('./primitiveType')
const NonPrimitiveType = require('./nonPrimitiveType')
const SpecialNumberType = require('./specialNumberType')

const TYPE_CONSTANT = 'type'
const VALUE_CONSTANT = 'value'

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
      //   const [k, v] = entry
      value.push(entry)
    })

    console.log('value - \n', value)
    return new LocalValue(NonPrimitiveType.MAP, value)
  }

  static createObjectValue(map) {
    let value = []
    Object.entries(map).forEach((entry) => {
      value.push(entry)
    })
    console.log('value - \n', value)
    return new LocalValue(NonPrimitiveType.OBJECT, value)
  }

  static createRegularExpressionValue(value) {
    return new LocalValue(NonPrimitiveType.REGULAR_EXPRESSION, value)
  }

  static createSetValue(value) {
    return new LocalValue(NonPrimitiveType.SET, value)
  }

  get _type() {
    return this.type
  }

  get _value() {
    return this.value
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
      toReturn[VALUE_CONSTANT] = this._value
    }

    console.log('6. toReturn = \n', toReturn)
    return toReturn
  }
}

module.exports = LocalValue

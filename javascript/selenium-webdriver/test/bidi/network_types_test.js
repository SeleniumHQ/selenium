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

const assert = require('node:assert')
const { BytesValue, Header } = require('selenium-webdriver/bidi/networkTypes')
const { ProvideResponseParameters } = require('selenium-webdriver/bidi/provideResponseParameters')

describe('ProvideResponseParameters with Headers', function () {
  it('should accept headers without throwing asMap error (issue #16339)', function () {
    const bufferStr = Buffer.from(JSON.stringify({})).toString('base64')
    const byteLength = Buffer.byteLength(bufferStr)

    const headers = [
      new Header('content-type', new BytesValue(BytesValue.Type.STRING, 'application/json')),
      new Header('access-control-allow-methods', new BytesValue(BytesValue.Type.STRING, '*')),
      new Header('access-control-allow-origin', new BytesValue(BytesValue.Type.STRING, '*')),
      new Header('content-length', new BytesValue(BytesValue.Type.STRING, byteLength.toString())),
    ]

    const body = new BytesValue(BytesValue.Type.BASE64, bufferStr)

    // This should not throw "TypeError: header.asMap is not a function"
    assert.doesNotThrow(() => {
      new ProvideResponseParameters(1).statusCode(200).body(body).headers(headers).reasonPhrase('OK')
    })
  })

  it('should return correct map structure from asMap', function () {
    const header = new Header('content-type', new BytesValue(BytesValue.Type.STRING, 'application/json'))
    const map = header.asMap()

    assert.strictEqual(map.get('name'), 'content-type')
    assert.deepStrictEqual(map.get('value'), { type: 'string', value: 'application/json' })
  })
})

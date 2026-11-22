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
const firefox = require('selenium-webdriver/firefox')

describe('firefox.ServiceBuilder', function () {
  function argsFor(builder) {
    return builder.setPort(4444).build().args_
  }

  it('lets Firefox choose the websocket port', async function () {
    const args = await argsFor(new firefox.ServiceBuilder('geckodriver'))

    assert.deepStrictEqual(args, ['--port=4444', '--websocket-port=0'])
  })

  it('keeps a user-supplied websocket port', async function () {
    const args = await argsFor(new firefox.ServiceBuilder('geckodriver').addArguments('--websocket-port=1234'))

    assert.deepStrictEqual(args, ['--websocket-port=1234', '--port=4444'])
  })

  it('keeps a user-supplied websocket port given as a separate value', async function () {
    const args = await argsFor(new firefox.ServiceBuilder('geckodriver').addArguments('--websocket-port', '1234'))

    assert.deepStrictEqual(args, ['--websocket-port', '1234', '--port=4444'])
  })

  it('keeps a user-supplied websocket port given as a promise', async function () {
    const args = await argsFor(
      new firefox.ServiceBuilder('geckodriver').addArguments(Promise.resolve('--websocket-port=1234')),
    )

    assert.deepStrictEqual(args, ['--websocket-port=1234', '--port=4444'])
  })

  it('omits the websocket port when connecting to an existing instance', async function () {
    const args = await argsFor(new firefox.ServiceBuilder('geckodriver').addArguments('--connect-existing'))

    assert.deepStrictEqual(args, ['--connect-existing', '--port=4444'])
  })
})

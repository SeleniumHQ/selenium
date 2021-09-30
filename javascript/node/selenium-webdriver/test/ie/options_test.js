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

const assert = require('assert')
const ie = require('../../ie')
const test = require('../../lib/test')
const Capabilities = require('../../lib/capabilities').Capabilities

test.suite(
  function (env) {
    let driver

    describe('Internet Explorer options', function () {
      it('can set fileUploadDialogTimeout', async function () {
        let timeOut = 10000
        let options = new ie.Options().fileUploadDialogTimeout(timeOut)

        driver = await env.builder().setIeOptions(options).build()

        let caps = await driver.getCapabilities()
        caps = caps.map_.get(ie.VENDOR_COMMAND_PREFIX)[
          ie.Key.FILE_UPLOAD_DIALOG_TIMEOUT
        ]
        assert.strictEqual(caps, timeOut)
        await driver.quit()
      })

      it('can set browserAttachTimeout', async function () {
        let timeOut = 10000
        let options = new ie.Options().browserAttachTimeout(timeOut)

        driver = await env.builder().setIeOptions(options).build()

        let caps = await driver.getCapabilities()
        caps = caps.map_.get(ie.VENDOR_COMMAND_PREFIX)[
          ie.Key.BROWSER_ATTACH_TIMEOUT
        ]
        assert.strictEqual(caps, timeOut)
        await driver.quit()
      })

      it('can set elementScrollBehaviour - TOP', async function () {
        let options = new ie.Options().setScrollBehavior(ie.Behavior.TOP)
        driver = await env.builder().setIeOptions(options).build()

        let caps = await driver.getCapabilities()
        caps = caps.map_.get(ie.VENDOR_COMMAND_PREFIX)[
          ie.Key.ELEMENT_SCROLL_BEHAVIOR
        ]
        assert.strictEqual(caps, ie.Behavior.TOP)
        await driver.quit()
      })

      it('can set elementScrollBehaviour - BOTTOM', async function () {
        let options = new ie.Options().setScrollBehavior(ie.Behavior.TOP)
        driver = await env.builder().setIeOptions(options).build()

        let caps = await driver.getCapabilities()
        caps = caps.map_.get(ie.VENDOR_COMMAND_PREFIX)[
          ie.Key.ELEMENT_SCROLL_BEHAVIOR
        ]
        assert.strictEqual(caps, ie.Behavior.TOP)
        await driver.quit()
      })

      it('can set multiple browser-command-line switches', async function () {
        let options = new ie.Options()
        options.addBrowserCommandSwitches('-k')
        options.addBrowserCommandSwitches('-private')
        options.forceCreateProcessApi(true)
        driver = await env.builder().setIeOptions(options).build()

        let caps = await driver.getCapabilities()
        caps = caps.map_.get(ie.VENDOR_COMMAND_PREFIX)[
          ie.Key.BROWSER_COMMAND_LINE_SWITCHES
        ]
        assert.strictEqual(caps, '-k -private')
        await driver.quit()
      })

      it('can set capability', async function () {
        let caps = Capabilities.ie()
        assert.ok(!caps.has('silent'))
        assert.strictEqual(undefined, caps.get('silent'))
        caps.set('silent', true)
        assert.strictEqual(true, caps.get('silent'))
        assert.ok(caps.has('silent'))
      })
    })
  },
  { browsers: ['internet explorer'] }
)

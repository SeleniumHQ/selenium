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
const { DOMAIN_TOKEN } = require('selenium-webdriver/bidi/domain')
const { WebExtension, MozWebExtension } = require('selenium-webdriver/bidi/generated/webextension')

/** A transport that records each command as it would be serialized onto the socket. */
function recordingBidi(result) {
  const frames = []
  return {
    frames,
    send: async (message) => {
      frames.push(JSON.parse(JSON.stringify(message)))
      return { result }
    },
  }
}

describe('Generated vendor (moz) variant of a spec domain', function () {
  const extensionData = { type: 'path', path: '/tmp/ext' }

  it('extends the spec class, which stays free of vendor commands', function () {
    assert.ok(MozWebExtension.prototype instanceof WebExtension)
    assert.strictEqual(WebExtension.prototype.listExtensions, undefined)
  })

  it('leaves the vendor fields off when not given, so the browser applies its own defaults', async function () {
    const bidi = recordingBidi({ extension: 'ext@example.com' })
    await new MozWebExtension(bidi, DOMAIN_TOKEN).install({ extensionData })
    assert.deepStrictEqual(bidi.frames[0].params, { extensionData })
  })

  it('sends vendor fields under their namespaced wire keys', async function () {
    const bidi = recordingBidi({ extension: 'ext@example.com' })
    await new MozWebExtension(bidi, DOMAIN_TOKEN).install({
      extensionData,
      permanent: false,
      allowPrivateBrowsing: true,
    })
    assert.strictEqual(bidi.frames[0].method, 'webExtension.install')
    assert.deepStrictEqual(bidi.frames[0].params, {
      extensionData,
      'moz:permanent': false,
      'moz:allowPrivateBrowsing': true,
    })
  })

  it('adds vendor commands without their namespace in the method name', async function () {
    const bidi = recordingBidi({ extensions: [] })
    await new MozWebExtension(bidi, DOMAIN_TOKEN).listExtensions()
    assert.strictEqual(bidi.frames[0].method, 'webExtension.moz:listExtensions')
  })
})

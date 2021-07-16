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
const fs = require('fs')

const edge = require('../../edge')
const symbols = require('../../lib/symbols')
const test = require('../../lib/test')

describe('edge.Options', function () {
  describe('addArguments', function () {
    it('takes var_args', function () {
      let options = new edge.Options()
      assert.deepStrictEqual(options[symbols.serialize](), {
        browserName: 'MicrosoftEdge',
        'ms:edgeOptions': {},
      })

      options.addArguments('a', 'b')
      assert.deepStrictEqual(options[symbols.serialize](), {
        browserName: 'MicrosoftEdge',
        'ms:edgeOptions': {
          args: ['a', 'b'],
        },
      })
    })

    it('flattens input arrays', function () {
      let options = new edge.Options()
      assert.deepStrictEqual(options[symbols.serialize](), {
        browserName: 'MicrosoftEdge',
        'ms:edgeOptions': {},
      })

      options.addArguments(['a', 'b'], 'c', [1, 2], 3)
      assert.deepStrictEqual(options[symbols.serialize](), {
        browserName: 'MicrosoftEdge',
        'ms:edgeOptions': {
          args: ['a', 'b', 'c', 1, 2, 3],
        },
      })
    })
  })

  describe('addExtensions', function () {
    it('takes var_args', function () {
      let options = new edge.Options()
      assert.strictEqual(options.options_.extensions, undefined)

      options.addExtensions('a', 'b')
      assert.deepStrictEqual(options.options_.extensions, ['a', 'b'])
    })

    it('flattens input arrays', function () {
      let options = new edge.Options()
      assert.strictEqual(options.options_.extensions, undefined)

      options.addExtensions(['a', 'b'], 'c', [1, 2], 3)
      assert.deepStrictEqual(options.options_.extensions, [
        'a',
        'b',
        'c',
        1,
        2,
        3,
      ])
    })
  })

  describe('serialize', function () {
    it('base64 encodes extensions', async function () {
      let expected = fs.readFileSync(__filename, 'base64')
      let wire = new edge.Options()
        .addExtensions(__filename)
        [symbols.serialize]()

      assert.strictEqual(wire['ms:edgeOptions'].extensions.length, 1)
      assert.strictEqual(await wire['ms:edgeOptions'].extensions[0], expected)
    })
  })

  describe('windowTypes', function () {
    it('takes var_args', function () {
      let options = new edge.Options()
      assert.strictEqual(options.options_.windowTypes, undefined)

      options.windowTypes('a', 'b')
      assert.deepStrictEqual(options.options_.windowTypes, ['a', 'b'])
    })

    it('flattens input arrays', function () {
      let options = new edge.Options()
      assert.strictEqual(options.options_.windowTypes, undefined)

      options.windowTypes(['a', 'b'], 'c', [1, 2], 3)
      assert.deepStrictEqual(options.options_.windowTypes, [
        'a',
        'b',
        'c',
        1,
        2,
        3,
      ])
    })
  })
})

test.suite(
  function (env) {
    var driver

    afterEach(function () {
      return driver.quit()
    })

    describe('Edge options', function () {
      it('can start edge with custom args', async function () {
        var options = new edge.Options().addArguments('user-agent=foo;bar')

        driver = await env.builder().setEdgeOptions(options).build()

        await driver.get(test.Pages.ajaxyPage)

        var userAgent = await driver.executeScript(
          'return window.navigator.userAgent'
        )
        assert.strictEqual(userAgent, 'foo;bar')
      })

      it('can start edge with network conditions set', async function () {
        driver = await env.builder().build()
        await driver.get(test.Pages.ajaxyPage)
        await driver.setNetworkConditions({
          offline: true,
          latency: 0,
          download_throughput: 0,
          upload_throughput: 0,
        })
        assert.deepStrictEqual(await driver.getNetworkConditions(), {
          download_throughput: 0,
          latency: 0,
          offline: true,
          upload_throughput: 0,
        })
      })
    })
  },
  { browsers: ['MicrosoftEdge'] }
)

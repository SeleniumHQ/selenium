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

const { ELEMENT, REF, ToolError, describePage, elementFor, onElement, textResult } = require('./common')

const tools = [
  {
    name: 'browser_snapshot',
    description:
      'Snapshot of the current page as an accessibility tree with element refs. Better than a screenshot for deciding what to do next',
    inputSchema: {
      type: 'object',
      properties: {
        all: { type: 'boolean', description: 'Include all visible content and text, not only interactive elements' },
      },
    },
    async run(ctx, { all }) {
      return textResult(await describePage(ctx, { all }))
    },
  },
  {
    name: 'browser_take_screenshot',
    description: 'Take a PNG screenshot of the viewport or of one element. Use browser_snapshot to find refs to act on',
    inputSchema: {
      type: 'object',
      properties: { element: ELEMENT, ref: { ...REF, description: 'Element ref; omit for the viewport' } },
    },
    async run(ctx, { ref }) {
      const driver = await ctx.session.driver()
      let data
      if (ref) {
        const element = await elementFor(ctx, ref)
        data = await onElement(ref, () => element.takeScreenshot())
        await driver.switchTo().defaultContent()
      } else {
        await driver.switchTo().defaultContent()
        data = await driver.takeScreenshot()
      }
      return {
        content: [
          { type: 'text', text: `Screenshot of ${ref || 'the viewport'}` },
          { type: 'image', data, mimeType: 'image/png' },
        ],
      }
    },
  },
  {
    name: 'browser_install',
    description: 'Install the configured browser and its driver, if missing',
    inputSchema: { type: 'object', properties: {} },
    async run(ctx) {
      if (ctx.config.grid) throw new ToolError('The browser runs on the Grid; there is nothing to install locally.')
      const { binaryPaths } = require('selenium-webdriver/common/seleniumManager')
      let paths
      try {
        paths = binaryPaths(['--browser', ctx.config.browser, '--language-binding', 'javascript', '--output', 'json'])
      } catch (e) {
        throw new ToolError(`Selenium Manager could not set up ${ctx.config.browser}: ${e.message}`)
      }
      return textResult(
        [`${ctx.config.browser} is ready.`, `- Browser: ${paths.browserPath}`, `- Driver: ${paths.driverPath}`].join(
          '\n',
        ),
      )
    },
  },
]

module.exports = { tools }

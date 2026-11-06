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

const { textResult } = require('./common')

const LEVELS = ['debug', 'info', 'warning', 'error']

// Events arrive a moment after the page sees a response, so give requests the
// page already finished a chance to show as done rather than pending.
const SETTLE_MS = 1000
const SETTLE_POLL_MS = 50

const STATIC_DESTINATIONS = new Set(['audio', 'font', 'image', 'manifest', 'script', 'style', 'track', 'video'])
const STATIC_MIME = /^(image|font|audio|video)\/|^text\/css\b|javascript/i

/**
 * @param {{destination: string, mimeType: (string|undefined)}} request
 * @return {boolean} whether it fetched a static resource such as an image or script
 */
function isStatic(request) {
  return STATIC_DESTINATIONS.has(request.destination) || STATIC_MIME.test(request.mimeType || '')
}

/**
 * @param {{status: (number|undefined), error: (string|undefined)}} request
 * @return {boolean} whether it finished without an error status
 */
function succeeded(request) {
  return request.status !== undefined && request.status < 400 && !request.error
}

/**
 * @param {{method: string, url: string, status: (number|undefined),
 *     statusText: (string|undefined), error: (string|undefined)}} request
 * @return {string} one line, in the form @playwright/mcp uses
 */
function formatRequest(request) {
  let outcome
  if (request.error) outcome = `failed: ${request.error}`
  else if (request.status === undefined) outcome = 'pending'
  else outcome = `[${request.status}]${request.statusText ? ' ' + request.statusText : ''}`
  return `[${request.method}] ${request.url} => ${outcome}`
}

const tools = [
  {
    name: 'browser_console_messages',
    description: 'Console messages and uncaught errors from the page, oldest first',
    inputSchema: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: LEVELS, description: 'Lowest level to return. Defaults to info' },
      },
    },
    async run(ctx, { level = 'info' }) {
      await ctx.session.driver()
      const min = LEVELS.indexOf(level)
      const messages = ctx.session.consoleMessages.filter((m) => LEVELS.indexOf(m.level) >= min)
      if (!messages.length) return textResult('No console messages.')
      return textResult(messages.map((m) => `[${m.level}] ${m.text}`).join('\n'))
    },
  },
  {
    name: 'browser_network_requests',
    description: 'Network requests since the page was loaded, oldest first',
    inputSchema: {
      type: 'object',
      properties: {
        includeStatic: {
          type: 'boolean',
          description: 'Include successful images, fonts, scripts and stylesheets. Defaults to false',
        },
      },
    },
    async run(ctx, { includeStatic = false }) {
      await ctx.session.driver()
      const pending = () => [...ctx.session.networkRequests.values()].some((r) => r.status === undefined && !r.error)
      for (let waited = 0; waited < SETTLE_MS && pending(); waited += SETTLE_POLL_MS) {
        await new Promise((resolve) => setTimeout(resolve, SETTLE_POLL_MS))
      }
      const requests = [...ctx.session.networkRequests.values()].filter(
        (r) => includeStatic || !isStatic(r) || !succeeded(r),
      )
      if (!requests.length) return textResult('No network requests.')
      return textResult(requests.map(formatRequest).join('\n'))
    },
  },
]

module.exports = { tools, formatRequest, isStatic }

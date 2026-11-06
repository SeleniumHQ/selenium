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

const { ToolError, actionResult, textResult } = require('./common')

/**
 * Adds a scheme to bare hosts so `example.com` works like it does in an
 * address bar.
 *
 * @param {string} url
 * @return {string}
 */
function normalizeUrl(url) {
  const trimmed = String(url).trim()
  // Checked first: "localhost:3000" would otherwise read as a URL scheme.
  if (/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/.test(trimmed)) return `http://${trimmed}`
  // A scheme needs "//" or one of the schemes that never take it; otherwise
  // "example.com:8080" is a host and port.
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) || /^(about|data|javascript|view-source|blob):/i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

function withoutRootDot(host) {
  return host.endsWith('.') ? host.slice(0, -1) : host
}

/**
 * @param {!URL} url
 * @param {string} pattern an origin (https://example.com) or a host,
 *     optionally with a leading wildcard (*.example.com)
 * @return {boolean}
 */
function originMatches(url, pattern) {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(pattern)) {
    try {
      return new URL(pattern).origin === url.origin
    } catch {
      return false
    }
  }
  // example.com. is the same host as example.com, so neither side keeps the root dot.
  const host = withoutRootDot(url.hostname)
  const port = url.port ? `:${url.port}` : ''
  // URL lowercases the host, so the pattern must be too.
  const wanted = pattern.toLowerCase().replace(/\.(?=$|:)/, '')
  if (wanted.startsWith('*.')) {
    const base = wanted.slice(2)
    return host === base || host.endsWith('.' + base)
  }
  return host === wanted || host + port === wanted
}

/**
 * @param {string} url
 * @param {{allowedOrigins: !Array<string>, blockedOrigins: !Array<string>,
 *     allowFileAccess: (boolean|undefined)}} config
 * @throws {ToolError} if the URL is not allowed
 */
function checkOrigin(url, config) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    throw new ToolError(`Not a valid URL: ${url}`)
  }
  if (parsed.href === 'about:blank') return
  if (parsed.protocol === 'file:') {
    // A snapshot would hand the agent the contents of any readable local file.
    if (!config.allowFileAccess) {
      throw new ToolError(
        'file:// URLs are blocked. Start the server with --allow-unrestricted-file-access to allow them.',
      )
    }
    return
  }
  if (parsed.protocol === 'data:') {
    // A data: page has no origin to check against an allow list.
    if (config.allowedOrigins.length) throw new ToolError('data: URLs are not allowed when --allowed-origins is set.')
    return
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ToolError(`Navigation to ${parsed.protocol} URLs is not supported.`)
  }
  if (config.blockedOrigins.some((p) => originMatches(parsed, p))) {
    throw new ToolError(`Navigation to ${parsed.origin} is blocked by --blocked-origins.`)
  }
  if (config.allowedOrigins.length && !config.allowedOrigins.some((p) => originMatches(parsed, p))) {
    throw new ToolError(`Navigation to ${parsed.origin} is not in --allowed-origins.`)
  }
}

async function tabList(driver) {
  const handles = await driver.getAllWindowHandles()
  const current = await driver.getWindowHandle()
  const lines = []
  for (let i = 0; i < handles.length; i++) {
    await driver.switchTo().window(handles[i])
    const marker = handles[i] === current ? ' (current)' : ''
    lines.push(`- ${i}${marker}: ${JSON.stringify(await driver.getTitle())} ${await driver.getCurrentUrl()}`)
  }
  await driver.switchTo().window(current)
  return lines.join('\n')
}

const tools = [
  {
    name: 'browser_navigate',
    description: 'Navigate to a URL',
    inputSchema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'The URL to navigate to' } },
      required: ['url'],
    },
    async run(ctx, { url }) {
      const target = normalizeUrl(url)
      checkOrigin(target, ctx.config)
      const driver = await ctx.session.driver()
      await driver.switchTo().defaultContent()
      // Messages and requests from the previous page would only mislead the agent about this one.
      ctx.session.clearPageLogs()
      await driver.get(target)
      ctx.session.refs.clear()
      return actionResult(ctx, `Navigated to ${target}`)
    },
  },
  {
    name: 'browser_navigate_back',
    description: 'Go back to the previous page',
    inputSchema: { type: 'object', properties: {} },
    async run(ctx) {
      const driver = await ctx.session.driver()
      ctx.session.clearPageLogs()
      await driver.navigate().back()
      ctx.session.refs.clear()
      return actionResult(ctx, 'Navigated back')
    },
  },
  {
    name: 'browser_tabs',
    description: 'List, create, close, or select a browser tab',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'new', 'close', 'select'] },
        index: { type: 'number', description: 'Tab index, for close or select. Defaults to the current tab for close' },
      },
      required: ['action'],
    },
    async run(ctx, { action, index }) {
      const driver = await ctx.session.driver()
      const handles = await driver.getAllWindowHandles()
      const pick = (i) => {
        if (!Number.isInteger(i) || i < 0 || i >= handles.length) {
          throw new ToolError(`No tab at index ${i}; there are ${handles.length}.`)
        }
        return handles[i]
      }
      switch (action) {
        case 'list':
          return textResult(`### Open tabs\n${await tabList(driver)}`)
        case 'new':
          await driver.switchTo().newWindow('tab')
          ctx.session.refs.clear()
          ctx.session.clearPageLogs()
          return actionResult(ctx, 'Opened a new tab')
        case 'select':
          await driver.switchTo().window(pick(index))
          ctx.session.refs.clear()
          ctx.session.clearPageLogs()
          return actionResult(ctx, `Selected tab ${index}`)
        case 'close': {
          const current = await driver.getWindowHandle()
          const target = index === undefined ? current : pick(index)
          if (handles.length === 1) {
            await ctx.session.close()
            return textResult('Closed the last tab; the browser has been closed.')
          }
          await driver.switchTo().window(target)
          await driver.close()
          const remaining = handles.filter((h) => h !== target)
          await driver.switchTo().window(target === current ? remaining[0] : current)
          ctx.session.refs.clear()
          if (target === current) ctx.session.clearPageLogs()
          return actionResult(ctx, `Closed tab ${index === undefined ? handles.indexOf(current) : index}`)
        }
        default:
          throw new ToolError(`Unknown action: ${action}`)
      }
    },
  },
  {
    name: 'browser_resize',
    description: 'Resize the browser window',
    inputSchema: {
      type: 'object',
      properties: {
        width: { type: 'number', description: 'Width in CSS pixels' },
        height: { type: 'number', description: 'Height in CSS pixels' },
      },
      required: ['width', 'height'],
    },
    async run(ctx, { width, height }) {
      for (const [name, value] of Object.entries({ width, height })) {
        if (!Number.isInteger(value) || value <= 0) throw new ToolError(`${name} must be a whole number above 0.`)
      }
      const driver = await ctx.session.driver()
      const rect = await driver.manage().window().setRect({ width, height })
      // A window manager or the screen can cap the size, so report what it became.
      return actionResult(ctx, `Resized the window to ${rect.width}x${rect.height}`)
    },
  },
  {
    name: 'browser_close',
    description: 'Close the browser',
    inputSchema: { type: 'object', properties: {} },
    async run(ctx) {
      await ctx.session.close()
      return textResult('Browser closed. The next browser tool call starts a new one.')
    },
  },
]

module.exports = { tools, checkOrigin, normalizeUrl, originMatches }

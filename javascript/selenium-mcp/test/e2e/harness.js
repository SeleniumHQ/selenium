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

const fs = require('node:fs')
const http = require('node:http')
const path = require('node:path')

const { Client } = require('@modelcontextprotocol/sdk/client/index.js')
const { InMemoryTransport } = require('@modelcontextprotocol/sdk/inMemory.js')

const { createServer } = require('../../lib/server')
const { Session } = require('../../lib/session')

/** The bindings' shared test pages, plus a few pages of our own. */
const ROOTS = {
  '/common/': path.resolve(__dirname, '../../../../common/src/web'),
  '/fixtures/': path.resolve(__dirname, '../fixtures'),
}

const TYPES = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
}

/**
 * Serves the test pages over HTTP; file:// URLs behave differently enough
 * (origins, frames) to make the tests less representative.
 *
 * @return {!Promise<{url: function(string): string, close: function(): !Promise}>}
 */
async function startPageServer() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const prefix = Object.keys(ROOTS).find((p) => pathname.startsWith(p))
    const file = prefix && path.join(ROOTS[prefix], pathname.slice(prefix.length))
    if (!file || !file.startsWith(ROOTS[prefix]) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end('not found')
      return
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  return {
    url: (p) => `http://127.0.0.1:${port}${p}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

/**
 * Starts an MCP server and a client connected to it in memory, configured
 * from the same environment the bindings' browser tests use.
 *
 * @param {!Object=} overrides config overrides
 * @return {!Promise<{client: !Client, session: !Object, call: function(string, !Object=): !Promise<!Object>}>}
 */
async function startMcp(overrides = {}) {
  const config = {
    browser: process.env.SELENIUM_BROWSER || 'chrome',
    headless: true,
    grid: undefined,
    allowedOrigins: [],
    blockedOrigins: [],
    waitTimeoutMs: 2000,
    ...overrides,
  }
  const { server, session } = createServer(config, { session: new Session(config, sessionHooks()) })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  await server.connect(serverTransport)
  const client = new Client({ name: 'selenium-mcp-test', version: '0' })
  await client.connect(clientTransport)

  async function call(name, args = {}) {
    const result = await client.callTool({ name, arguments: args })
    result.text = result.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n')
    return result
  }

  return {
    client,
    session,
    call,
    async close() {
      await session.close()
      await client.close()
    },
  }
}

/**
 * Resolves a path from the environment, which under Bazel is relative to the
 * runfiles tree.
 */
function locate(file) {
  if (fs.existsSync(file)) return file
  // An absolute or relative path that does not exist is a typo, not a runfile.
  const found = path.isAbsolute(file) || file.startsWith('.') ? null : locateInRunfiles(file)
  if (!found) throw new Error(`Unable to find ${file}`)
  return found
}

function locateInRunfiles(file) {
  let runfiles
  try {
    runfiles = require('@bazel/runfiles').runfiles
  } catch {
    return null
  }
  for (const resolve of [(f) => runfiles.resolve(f), (f) => runfiles.resolveWorkspaceRelative(f)]) {
    try {
      return resolve(file)
    } catch {
      // try the next way
    }
  }
  // Pinned browsers live in external repos (e.g. linux_chrome/...), whose
  // runfiles directory is the repo's canonical name, so map the first segment
  // as selenium-webdriver/testing does.
  try {
    const mapping = {}
    for (const line of fs.readFileSync(runfiles.resolve('_repo_mapping'), 'utf8').split('\n')) {
      if (line.startsWith(',')) {
        const [, apparent, canonical] = line.split(',', 3)
        mapping[apparent] = canonical
      }
    }
    const [repo, ...rest] = file.split('/')
    return runfiles.resolve([mapping[repo] || '_main', ...rest].join('/'))
  } catch {
    return null
  }
}

/**
 * Points the session at the browser and driver the build provides
 * (SE_CHROME, SE_CHROMEDRIVER, as for the bindings' own browser tests), so CI
 * does not depend on Selenium Manager downloads. Locally,
 * SELENIUM_MCP_TEST_CHROMEDRIVER names a chromedriver to use even when its
 * version lags the installed Chrome.
 */
function sessionHooks() {
  const pinnedDriver = process.env.SE_CHROMEDRIVER
  const pinnedChrome = process.env.SE_CHROME
  const laggingDriver = process.env.SELENIUM_MCP_TEST_CHROMEDRIVER
  if (!pinnedDriver && !pinnedChrome && !laggingDriver) return {}
  const { Builder } = require('selenium-webdriver')
  const chrome = require('selenium-webdriver/chrome')
  return {
    buildDriver(options) {
      const builder = new Builder().withCapabilities(options)
      if (pinnedChrome) {
        options.setChromeBinaryPath(locate(pinnedChrome))
        options.addArguments('disable-dev-shm-usage', 'no-sandbox')
      }
      if (pinnedDriver) {
        builder.setChromeService(new chrome.ServiceBuilder(locate(pinnedDriver)))
      } else if (laggingDriver) {
        builder.setChromeService(new chrome.ServiceBuilder(laggingDriver).addArguments('--disable-build-check'))
      }
      return builder.build()
    },
  }
}

/**
 * @param {string} snapshot
 * @param {string|!RegExp} line a role and name such as `button "Login"`
 * @return {string} the ref on the first line that matches
 */
function refOf(snapshot, line) {
  const re = line instanceof RegExp ? line : new RegExp(`\\[(\\w+)\\] ${line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
  const match = snapshot.match(re)
  if (!match) throw new Error(`No ${line} in snapshot:\n${snapshot}`)
  return match[1]
}

module.exports = { refOf, startMcp, startPageServer }

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

const { Server } = require('@modelcontextprotocol/sdk/server/index.js')
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js')
const { error } = require('selenium-webdriver')
const logging = require('selenium-webdriver/lib/logging')

const { Session, StartAbandonedError } = require('./session')
const { ToolError } = require('./tools/common')
const { validate } = require('./validate')

const log_ = logging.getLogger('selenium.mcp.server')

/** Tool groups, in the order agents see them. */
const TOOL_GROUPS = [
  require('./tools/inspect').tools,
  require('./tools/navigate').tools,
  require('./tools/interact').tools,
  require('./tools/bidi').tools,
]

/**
 * @return {!Array<!Object>} every v0 tool definition
 */
function allTools() {
  return TOOL_GROUPS.flat()
}

/**
 * @return {string} the package version, or 'dev' when running unstamped
 */
function packageVersion() {
  try {
    return require('../package.json').version || 'dev'
  } catch {
    return 'dev'
  }
}

/**
 * Creates the MCP server. Nothing starts until a tool is called, so listing
 * tools never launches a browser.
 *
 * @param {!Object} config parsed command line, see cli.js
 * @param {{session: (!Session|undefined)}=} deps
 * @return {{server: !Server, session: !Session}}
 */
function createServer(config, deps = {}) {
  const session = deps.session || new Session(config)
  const ctx = { config, session }
  const tools = allTools()
  const byName = new Map(tools.map((t) => [t.name, t]))

  const server = new Server(
    { name: 'selenium-mcp', title: 'Selenium', version: packageVersion() },
    {
      capabilities: { tools: {} },
      instructions:
        'Drives a real browser with Selenium. Call browser_snapshot to see the page; act on elements by their ref, ' +
        'e.g. e12. Action tools return a fresh snapshot, so there is no need to snapshot after each one.',
    },
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params
    const tool = byName.get(name)
    if (!tool) return errorResult(`Unknown tool: ${name}`)
    const problems = validate(tool.inputSchema, args)
    if (problems.length) return errorResult(`Invalid arguments for ${name}: ${problems.join('; ')}`)
    try {
      // Argument values can be passwords the agent is typing, so only their names are logged.
      log_.finer(`${name} (${Object.keys(args).join(', ')})`)
      return await tool.run(ctx, args)
    } catch (e) {
      if (e instanceof ToolError || e instanceof StartAbandonedError) return errorResult(e.message)
      if (session.isSessionGone(e)) {
        log_.warning(
          `the browser went away during ${name}; the next call starts a new one: ${firstLine(e.message || e)}`,
        )
        session.discard()
        return errorResult('The browser is no longer running. The next browser tool call starts a new one.')
      }
      if (e instanceof error.SessionNotCreatedError) {
        log_.warning(`could not start ${config.browser}: ${firstLine(e.message)}`)
        session.reset()
        return errorResult(
          `Could not start ${config.browser}: ${firstLine(e.message)} ` +
            'Run browser_install to let Selenium Manager fetch a matching browser and driver.',
        )
      }
      log_.warning(`${name} failed: ${e.stack || e}`)
      return errorResult(`${name} failed: ${firstLine(e.message || e)}`)
    }
  })

  return { server, session }
}

function firstLine(message) {
  return String(message).split('\n')[0]
}

function errorResult(text) {
  return { content: [{ type: 'text', text }], isError: true }
}

module.exports = { allTools, createServer, packageVersion }

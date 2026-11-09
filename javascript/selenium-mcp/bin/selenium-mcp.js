#!/usr/bin/env node
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

// A CLI owns its exit code, and stdio keeps the event loop alive until it exits.
/* eslint-disable n/no-process-exit */

const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const logging = require('selenium-webdriver/lib/logging')

const { USAGE, parseCommandLine } = require('../lib/cli')
const { createServer, packageVersion } = require('../lib/server')

/**
 * stdout carries the MCP protocol, so every log line must go to stderr.
 */
function logToStderr(levelName) {
  const root = logging.getLogger('')
  root.setLevel(logging.getLevel(levelName.toUpperCase()))
  root.addHandler((entry) => {
    process.stderr.write(`[${entry.level.name}] ${entry.message}\n`)
  })
}

async function main() {
  let config
  try {
    config = parseCommandLine(process.argv.slice(2))
  } catch (e) {
    process.stderr.write(`${e.message}\n\n${USAGE}\n`)
    process.exit(2)
  }
  if (config.help) {
    process.stdout.write(`${USAGE}\n`)
    return
  }
  if (config.version) {
    process.stdout.write(`${packageVersion()}\n`)
    return
  }

  logToStderr(config.logLevel)
  const { server, session } = createServer(config)

  let closing = false
  const shutdown = async () => {
    if (closing) return
    closing = true
    await session.close()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  process.stdin.on('close', shutdown)

  await server.connect(new StdioServerTransport())
}

main().catch((e) => {
  process.stderr.write(`selenium-mcp: ${e.stack || e}\n`)
  process.exit(1)
})

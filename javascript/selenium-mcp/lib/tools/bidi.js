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
]

module.exports = { tools }

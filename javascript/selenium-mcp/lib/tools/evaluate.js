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

const { WebElement, error } = require('selenium-webdriver')

const { ELEMENT, REF, ToolError, elementFor, onElement, textResult } = require('./common')

// Results go back to the agent on every call; past this they cost more than they tell.
const MAX_RESULT_CHARS = 20000

/**
 * @param {*} value a result from executeScript
 * @return {string} the value as JSON, with elements and undefined spelled out
 */
function formatResult(value) {
  if (value === undefined) return 'undefined'
  const json = JSON.stringify(
    value,
    (_key, v) => {
      if (v instanceof WebElement) return '<element>'
      if (v === undefined) return '<undefined>'
      return v
    },
    2,
  )
  if (json === undefined) return String(value)
  if (json.length <= MAX_RESULT_CHARS) return json
  return `${json.slice(0, MAX_RESULT_CHARS)}\n… (${json.length - MAX_RESULT_CHARS} more characters cut)`
}

const tools = [
  {
    name: 'browser_evaluate',
    description: 'Evaluate a JavaScript function on the page or on an element, and return its result as JSON',
    // Arbitrary script can read and change anything the page can, so the user opts in.
    enabled: (config) => !!config.allowEvaluate,
    inputSchema: {
      type: 'object',
      properties: {
        function: {
          type: 'string',
          description: '() => { /* code */ }, or (element) => { /* code */ } when a ref is given',
        },
        element: ELEMENT,
        ref: { ...REF, description: 'Element ref to pass to the function' },
      },
      required: ['function'],
    },
    async run(ctx, { function: fn, ref }) {
      const driver = await ctx.session.driver()
      let element
      if (ref) element = await elementFor(ctx, ref)
      else await driver.switchTo().defaultContent()
      let result
      try {
        // WebDriver waits for a returned promise, so async functions work too.
        result = await onElement(ref, () => driver.executeScript(`return (${fn})(arguments[0])`, element))
      } catch (e) {
        if (e instanceof error.JavascriptError) throw new ToolError(`The function threw: ${firstLine(e.message)}`)
        throw e
      }
      return textResult(`### Result\n${formatResult(result)}`)
    },
  },
]

function firstLine(message) {
  return String(message || '').split('\n')[0]
}

module.exports = { tools, formatResult }

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

/**
 * Checks tool arguments against the small subset of JSON Schema the tool
 * definitions use (object, array, string, number, boolean, enum, required).
 * The MCP SDK passes arguments through unchecked, and a clear message here
 * saves the agent a confusing WebDriver error later.
 *
 * @param {!Object} schema
 * @param {*} value
 * @param {string=} path
 * @return {!Array<string>} problems found; empty when the value is valid
 */
function validate(schema, value, path = 'arguments') {
  const problems = []
  switch (schema.type) {
    case 'object': {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return [`${path} must be an object`]
      }
      for (const key of schema.required || []) {
        if (value[key] === undefined) problems.push(`${path}.${key} is required`)
      }
      for (const [key, sub] of Object.entries(schema.properties || {})) {
        if (value[key] !== undefined) problems.push(...validate(sub, value[key], `${path}.${key}`))
      }
      for (const key of Object.keys(value)) {
        if (!(schema.properties || {})[key]) problems.push(`${path}.${key} is not a known argument`)
      }
      break
    }
    case 'array':
      if (!Array.isArray(value)) return [`${path} must be an array`]
      value.forEach((item, i) => problems.push(...validate(schema.items || {}, item, `${path}[${i}]`)))
      break
    case 'string':
    case 'boolean':
      if (typeof value !== schema.type) return [`${path} must be a ${schema.type}`]
      break
    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) return [`${path} must be a number`]
      break
    default:
      break
  }
  if (schema.enum && !schema.enum.includes(value)) {
    problems.push(`${path} must be one of ${schema.enum.map((v) => JSON.stringify(v)).join(', ')}`)
  }
  return problems
}

module.exports = { validate }

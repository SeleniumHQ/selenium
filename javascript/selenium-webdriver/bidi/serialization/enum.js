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

const { register } = require('./registry')

/**
 * Registers a schema `enum` — a closed set of string values a field may hold.
 * @param {string} name Schema type name, e.g. 'network.InterceptPhase'.
 * @param {string[]} values The enum's valid values.
 * @returns {{kind: 'enum', values: string[], includes: function(unknown): boolean}}
 *   The registered entry, used by validateValue() to check a ref'd value's
 *   membership; also returned so a generator can build a discoverable constant from it.
 */
function defineEnum(name, values) {
  const allowed = new Set(values)
  const entry = { kind: 'enum', values, includes: (value) => allowed.has(value) }
  register(name, entry)
  return entry
}

module.exports = { defineEnum }

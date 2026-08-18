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

const BiDi = require('../bidi')

/**
 * One BiDi connection per driver, kept outside the WebDriver class itself so
 * it isn't a discoverable method on it — see
 * docs/decisions/17670-bidi-implementation-boundaries.md. Not re-exported from
 * the package's public entry point.
 *
 * Stores the in-flight promise, not the resolved connection, so a second
 * concurrent call for the same driver awaits the same creation instead of
 * racing its own and leaking whichever connection loses.
 * @type {WeakMap<object, Promise<BiDi>>}
 */
const connections = new WeakMap()

/**
 * Returns the BiDi connection for `driver`, creating it on first access.
 * @param {object} driver The WebDriver instance to obtain a BiDi connection for.
 * @returns {Promise<BiDi>} A promise resolving to `driver`'s BiDi connection, shared
 *     with any other in-flight or already-resolved call for the same driver.
 */
function getBidiConnection(driver) {
  if (!connections.has(driver)) {
    connections.set(driver, createConnection(driver))
  }
  return connections.get(driver)
}

/**
 * @param {object} driver
 * @returns {Promise<BiDi>}
 */
async function createConnection(driver) {
  const caps = await driver.getCapabilities()
  const webSocketUrl = caps['map_'].get('webSocketUrl')
  if (!webSocketUrl) {
    throw new Error('WebDriver instance must support BiDi protocol')
  }
  return new BiDi(webSocketUrl.replace('localhost', '127.0.0.1'))
}

/**
 * Closes `driver`'s BiDi connection, if one was ever opened. A no-op
 * otherwise — must not lazily create a connection just to close it.
 *
 * Callers (e.g. quit()) invoke this fire-and-forget, so it must never reject:
 * if the original connection attempt itself had failed, `pending` is already
 * rejected and there is nothing live to close.
 * @param {object} driver The WebDriver instance whose BiDi connection should be closed.
 * @returns {Promise<void>} A promise that always resolves, once any open connection
 *     has been closed (or immediately, if none was ever opened).
 */
async function closeBidiConnection(driver) {
  const pending = connections.get(driver)
  if (pending === undefined) {
    return
  }
  connections.delete(driver)
  try {
    const connection = await pending
    await connection.close()
  } catch {
    // Nothing to close — the original connection attempt failed.
  }
}

module.exports = { getBidiConnection, closeBidiConnection }

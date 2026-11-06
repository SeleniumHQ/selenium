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

const assert = require('node:assert')

const { Session } = require('../../lib/session')
const { setSliderValue } = require('../../lib/tools/interact')

/** A driver that records quit() and has no BiDi, so console capture is skipped. */
function fakeDriver() {
  return {
    quits: 0,
    async quit() {
      this.quits++
    },
    // The BiDi connection starts by reading the session's capabilities.
    async getCapabilities() {
      throw new Error('no BiDi in this test')
    },
  }
}

/** Builds that settle only when the test says so, to force each interleaving. */
function controlledBuilds() {
  const pending = []
  const buildDriver = () =>
    new Promise((resolve) => {
      pending.push(() => {
        const driver = fakeDriver()
        resolve(driver)
        return driver
      })
    })
  return { pending, buildDriver }
}

const CONFIG = { browser: 'chrome', headless: true }

describe('Session lifecycle', function () {
  it('hands out the browser only once console and network capture are listening', async function () {
    let listening
    const driver = {
      async quit() {},
      getCapabilities: () =>
        new Promise((_resolve, reject) => {
          listening = () => reject(new Error('no BiDi in this test'))
        }),
    }
    const session = new Session(CONFIG, { buildDriver: async () => driver })
    const starting = session.driver()
    while (!listening) await new Promise((resolve) => setImmediate(resolve))
    assert.strictEqual(session.isOpen, false)
    listening()
    assert.strictEqual(await starting, driver)
    assert.strictEqual(session.isOpen, true)
  })

  it('starts one browser for concurrent callers', async function () {
    const builds = controlledBuilds()
    const session = new Session(CONFIG, builds)
    const first = session.driver()
    const second = session.driver()
    assert.strictEqual(builds.pending.length, 1)
    const driver = builds.pending[0]()
    assert.strictEqual(await first, driver)
    assert.strictEqual(await second, driver)
    assert.strictEqual(session.isOpen, true)
  })

  it('quits a browser that finishes starting after close, without close waiting for it', async function () {
    const builds = controlledBuilds()
    const session = new Session(CONFIG, builds)
    const starting = session.driver()
    await session.close()
    const driver = builds.pending[0]()
    await assert.rejects(starting, /closed while it was starting/)
    assert.strictEqual(driver.quits, 1)
    assert.strictEqual(session.isOpen, false)
  })

  it('keeps a new browser when an abandoned start settles after it', async function () {
    const builds = controlledBuilds()
    const session = new Session(CONFIG, builds)
    const abandoned = session.driver()
    await session.close()
    const fresh = session.driver()
    assert.strictEqual(builds.pending.length, 2)
    const freshDriver = builds.pending[1]()
    assert.strictEqual(await fresh, freshDriver)
    const oldDriver = builds.pending[0]()
    await assert.rejects(abandoned, /closed while it was starting/)
    assert.strictEqual(oldDriver.quits, 1)
    assert.strictEqual(freshDriver.quits, 0)
    assert.strictEqual(await session.driver(), freshDriver)
  })

  it('quits the running browser on close and starts a new one on the next call', async function () {
    const builds = controlledBuilds()
    const session = new Session(CONFIG, builds)
    const starting = session.driver()
    const first = builds.pending[0]()
    await starting
    await session.close()
    assert.strictEqual(first.quits, 1)
    assert.strictEqual(session.isOpen, false)
    const next = session.driver()
    const second = builds.pending[1]()
    assert.strictEqual(await next, second)
  })

  it('stops the driver of a browser that went away, without waiting for it', async function () {
    const builds = controlledBuilds()
    const session = new Session(CONFIG, builds)
    const starting = session.driver()
    const gone = builds.pending[0]()
    await starting
    gone.quit = function () {
      this.quits++
      return new Promise(() => {})
    }
    session.discard()
    assert.strictEqual(gone.quits, 1)
    assert.strictEqual(session.isOpen, false)
  })

  it('waits on close for a discarded browser to finish quitting', async function () {
    const builds = controlledBuilds()
    const session = new Session(CONFIG, builds)
    const starting = session.driver()
    const gone = builds.pending[0]()
    await starting
    let finishQuit
    gone.quit = () => new Promise((resolve) => (finishQuit = resolve))
    session.discard()
    let closed = false
    const closing = session.close().then(() => (closed = true))
    await new Promise((resolve) => setImmediate(resolve))
    assert.strictEqual(closed, false)
    finishQuit()
    await closing
    assert.strictEqual(closed, true)
  })

  it('stops waiting on close for a discarded browser that never quits', async function () {
    const builds = controlledBuilds()
    const session = new Session(CONFIG, { ...builds, discardWaitMs: 20 })
    const starting = session.driver()
    const gone = builds.pending[0]()
    await starting
    gone.quit = () => new Promise(() => {})
    session.discard()
    await session.close()
    assert.strictEqual(session.isOpen, false)
  })
})

describe('setSliderValue', function () {
  it('refuses strings that are not HTML numbers before touching the page', async function () {
    const untouchable = {
      async executeScript() {
        throw new Error('the page must not be touched')
      },
    }
    for (const value of ['0x5', '5.', '1e', '+5', ' 5', '', 'Infinity', 'five']) {
      await assert.rejects(setSliderValue(untouchable, {}, value), /not a number the slider accepts/, value)
    }
  })
})

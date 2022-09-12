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

const assert = require('assert')
const test = require('../lib/test')
const { By } = require('..')
const { UnknownCommandError } = require('../lib/error')

test.suite(function (env) {
  let driver

  before(async function () {
    driver = await env.builder().build()
  })
  after(function () {
    return driver.quit()
  })

  beforeEach(function () {
    return driver.switchTo().defaultContent()
  })

  it('can set size of the current window', async function () {
    await driver.get(test.Pages.echoPage)
    await changeSizeBy(-20, -20)
  })

  it('can set size of the current window from frame', async function () {
    await driver.get(test.Pages.framesetPage)

    const frame = await driver.findElement({ css: 'frame[name="fourth"]' })
    await driver.switchTo().frame(frame)
    await changeSizeBy(-20, -20)
  })

  it('can set size of the current window from iframe', async function () {
    await driver.get(test.Pages.iframePage)

    const frame = await driver.findElement({
      css: 'iframe[name="iframe1-name"]',
    })
    await driver.switchTo().frame(frame)
    await changeSizeBy(-20, -20)
  })

  it('can switch to a new window', async function () {
    await driver.get(test.Pages.xhtmlTestPage)

    await driver.getWindowHandle()
    let originalHandles = await driver.getAllWindowHandles()

    await driver.findElement(By.linkText('Open new window')).click()
    await driver.wait(forNewWindowToBeOpened(originalHandles), 2000)
    assert.strictEqual(await driver.getTitle(), 'XHTML Test Page')

    let newHandle = await getNewWindowHandle(originalHandles)

    await driver.switchTo().window(newHandle)
    assert.strictEqual(await driver.getTitle(), 'We Arrive Here')
  })

  xit('can set the window position of the current window', async function () {
    let { x, y } = await driver.manage().window().getRect()
    let newX = x + 10
    let newY = y + 10

    await driver.manage().window().setRect({
      x: newX,
      y: newY,
      width: 640,
      height: 480,
    })

    await driver.wait(forPositionToBe(newX, newY), 1000)
  })

  xit('can set the window position from a frame', async function () {
    await driver.get(test.Pages.iframePage)

    let frame = await driver.findElement(By.name('iframe1-name'))
    await driver.switchTo().frame(frame)

    let { x, y } = await driver.manage().window().getRect()
    x += 10
    y += 10

    await driver.manage().window().setRect({ width: 640, height: 480, x, y })
    await driver.wait(forPositionToBe(x, y), 1000)
  })

  it('can open a new window', async function () {
    let originalHandles = await driver.getAllWindowHandles()
    let originalHandle = await driver.getWindowHandle()

    let newHandle
    try {
      newHandle = await driver.switchTo().newWindow()
    } catch (ex) {
      if (ex instanceof UnknownCommandError) {
        console.warn(
          Error(
            `${env.browser.name}: aborting test due to unsupported command: ${ex}`
          ).stack
        )
        return
      }
    }

    assert.strictEqual(
      (await driver.getAllWindowHandles()).length,
      originalHandles.length + 1
    )
    assert.notEqual(originalHandle, newHandle)
  })

  async function changeSizeBy(dx, dy) {
    let { width, height } = await driver.manage().window().getRect()
    width += dx
    height += dy

    let rect = await driver.manage().window().setRect({ width, height })
    if (rect.width === width && rect.height === height) {
      return
    }
    return await driver.wait(forSizeToBe(width, height), 1000)
  }

  function forSizeToBe(w, h) {
    return async function () {
      let { width, height } = await driver.manage().window().getRect()
      return width === w && height === h
    }
  }

  function forPositionToBe(x, y) {
    return async function () {
      let position = await driver.manage().window().getRect()
      return (
        position.x === x &&
        // On OSX, the window height may be bumped down 22px for the top
        // status bar.
        // On Linux, Opera's window position will be off by 28px.
        position.y >= y &&
        position.y <= y + 28
      )
    }
  }

  function forNewWindowToBeOpened(originalHandles) {
    return function () {
      return driver.getAllWindowHandles().then(function (currentHandles) {
        return currentHandles.length > originalHandles.length
      })
    }
  }

  function getNewWindowHandle(originalHandles) {
    // Note: this assumes there's just one new window.
    return driver.getAllWindowHandles().then(function (currentHandles) {
      return currentHandles.filter(function (i) {
        return originalHandles.indexOf(i) < 0
      })[0]
    })
  }
})

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
const { Browser, By } = require('selenium-webdriver')
const { Pages, suite, ignore } = require('../../lib/test')
const BrowsingContext = require('selenium-webdriver/bidi/browsingContext')
const until = require('selenium-webdriver/lib/until')
const { Origin, CaptureScreenshotParameters } = require('selenium-webdriver/bidi/captureScreenshotParameters')
const { BoxClipRectangle, ElementClipRectangle } = require('selenium-webdriver/bidi/clipRectangle')
const { CreateContextParameters } = require('selenium-webdriver/bidi/createContextParameters')
const BrowserBiDi = require('selenium-webdriver/bidi/browser')

suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env.builder().build()
    })

    afterEach(async function () {
      await driver.quit()
    })

    describe('Browsing Context', function () {
      let startIndex = 0
      let endIndex = 5
      let pdfMagicNumber = 'JVBER'
      let pngMagicNumber = 'iVBOR'

      it('can create a browsing context for given id', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })
        assert.equal(browsingContext.id, id)
      })

      it('can create a window', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'window',
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can create a window with a reference context', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'window',
          createParameters: new CreateContextParameters().referenceContext(await driver.getWindowHandle()),
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can create a tab with all parameters', async function () {
        const browser = await BrowserBiDi(driver)
        const userContext = await browser.createUserContext()
        const browsingContext = await BrowsingContext(driver, {
          type: 'window',
          createParameters: new CreateContextParameters()
            .referenceContext(await driver.getWindowHandle())
            .background(true)
            .userContext(userContext),
        })
        assert.notEqual(browsingContext.id, null)
        assert.notEqual(browsingContext.id, await driver.getWindowHandle())
      })

      it('can create a tab', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can create a tab with a reference context', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
          referenceContext: new CreateContextParameters().referenceContext(await driver.getWindowHandle()),
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can navigate to a url', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
        })

        let info = await browsingContext.navigate(Pages.logEntryAdded)

        assert.notEqual(browsingContext.id, null)
        assert.notEqual(info.navigationId, null)
        assert(info.url.includes('/bidi/logEntryAdded.html'))
      })

      it('can navigate to a url with readiness state', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
        })

        const info = await browsingContext.navigate(Pages.logEntryAdded, 'complete')

        assert.notEqual(browsingContext.id, null)
        assert.notEqual(info.navigationId, null)
        assert(info.url.includes('/bidi/logEntryAdded.html'))
      })

      it('can get tree with a child', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const parentWindow = await BrowsingContext(driver, {
          browsingContextId: browsingContextId,
        })
        await parentWindow.navigate(Pages.iframePage, 'complete')

        const contextInfo = await parentWindow.getTree()
        assert.equal(contextInfo.children.length, 1)
        assert.equal(contextInfo.id, browsingContextId)
        assert(contextInfo.children[0]['url'].includes('formPage.html'))
      })

      it('can get tree with depth', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const parentWindow = await BrowsingContext(driver, {
          browsingContextId: browsingContextId,
        })
        await parentWindow.navigate(Pages.iframePage, 'complete')

        const contextInfo = await parentWindow.getTree(0)
        assert.equal(contextInfo.children, null)
        assert.equal(contextInfo.id, browsingContextId)
      })

      it('can close a window', async function () {
        const window1 = await BrowsingContext(driver, { type: 'window' })
        const window2 = await BrowsingContext(driver, { type: 'window' })

        await window2.close()

        assert.doesNotThrow(async function () {
          await window1.getTree()
        })
        await assert.rejects(window2.getTree(), { message: 'no such frame' })
      })

      it('can print PDF with total pages', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.printPage)
        const result = await browsingContext.printPage()

        let base64Code = result.data.slice(startIndex, endIndex)
        assert.strictEqual(base64Code, pdfMagicNumber)
      })

      it('can print PDF with all valid parameters', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.printPage)
        const result = await browsingContext.printPage({
          orientation: 'landscape',
          scale: 1,
          background: true,
          width: 30,
          height: 30,
          top: 1,
          bottom: 1,
          left: 1,
          right: 1,
          shrinkToFit: true,
          pageRanges: ['1-2'],
        })

        let base64Code = result.data.slice(startIndex, endIndex)
        assert.strictEqual(base64Code, pdfMagicNumber)
      })

      it('can take screenshot', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        const response = await browsingContext.captureScreenshot()
        const base64code = response.slice(startIndex, endIndex)
        assert.equal(base64code, pngMagicNumber)
      })

      it('can take screenshot with all parameters for box screenshot', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        let captureScreenshotParams = new CaptureScreenshotParameters()
        captureScreenshotParams.origin(Origin.VIEWPORT).clipRectangle(new BoxClipRectangle(5, 5, 10, 10))

        const response = await browsingContext.captureScreenshot(captureScreenshotParams)

        const base64code = response.slice(startIndex, endIndex)
        assert.equal(base64code, pngMagicNumber)
      })

      it('can take screenshot with all parameters for element screenshot', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.formPage)
        const element = await driver.findElement(By.id('checky'))
        const elementId = await element.getId()

        let captureScreenshotParams = new CaptureScreenshotParameters()
        captureScreenshotParams.origin(Origin.VIEWPORT).clipRectangle(new ElementClipRectangle(elementId))

        const response = await browsingContext.captureScreenshot(captureScreenshotParams)

        const base64code = response.slice(startIndex, endIndex)
        assert.equal(base64code, pngMagicNumber)
      })

      it('can take box screenshot', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        const response = await browsingContext.captureBoxScreenshot(5, 5, 10, 10)

        const base64code = response.slice(startIndex, endIndex)
        assert.equal(base64code, pngMagicNumber)
      })

      it('can take element screenshot', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.formPage)
        const element = await driver.findElement(By.id('checky'))
        const elementId = await element.getId()
        const response = await browsingContext.captureElementScreenshot(elementId)

        const base64code = response.slice(startIndex, endIndex)
        assert.equal(base64code, pngMagicNumber)
      })

      it('can activate a browsing context', async function () {
        const id = await driver.getWindowHandle()
        const window1 = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await BrowsingContext(driver, {
          type: 'window',
        })

        const result = await driver.executeScript('return document.hasFocus();')

        assert.equal(result, false)

        await window1.activate()
        const result2 = await driver.executeScript('return document.hasFocus();')

        assert.equal(result2, true)
      })

      it('can handle user prompt', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.alertsPage)

        await driver.findElement(By.id('alert')).click()

        await driver.wait(until.alertIsPresent())

        await browsingContext.handleUserPrompt()

        const result = await driver.getTitle()

        assert.equal(result, 'Testing Alerts')
      })

      it('can accept user prompt', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.alertsPage)

        await driver.findElement(By.id('alert')).click()

        await driver.wait(until.alertIsPresent())

        await browsingContext.handleUserPrompt(true)

        const result = await driver.getTitle()

        assert.equal(result, 'Testing Alerts')
      })

      it('can dismiss user prompt', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.alertsPage)

        await driver.findElement(By.id('alert')).click()

        await driver.wait(until.alertIsPresent())

        await browsingContext.handleUserPrompt(false)

        const result = await driver.getTitle()

        assert.equal(result, 'Testing Alerts')
      })

      it('can pass user text to user prompt', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.userpromptPage)

        await driver.findElement(By.id('alert')).click()

        await driver.wait(until.alertIsPresent())

        const userText = 'Selenium automates browsers'

        await browsingContext.handleUserPrompt(undefined, userText)

        const result = await driver.getPageSource()
        assert.equal(result.includes(userText), true)
      })

      it('can accept user prompt with user text', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.userpromptPage)

        await driver.findElement(By.id('alert')).click()

        await driver.wait(until.alertIsPresent())

        const userText = 'Selenium automates browsers'

        await browsingContext.handleUserPrompt(true, userText)

        const result = await driver.getPageSource()
        assert.equal(result.includes(userText), true)
      })

      it('can dismiss user prompt with user text', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.userpromptPage)

        await driver.findElement(By.id('alert')).click()

        await driver.wait(until.alertIsPresent())

        const userText = 'Selenium automates browsers'

        await browsingContext.handleUserPrompt(false, userText)

        const result = await driver.getPageSource()
        assert.equal(result.includes(userText), false)
      })

      xit('can reload a browsing context', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        const result = await browsingContext.navigate(Pages.logEntryAdded, 'complete')

        await browsingContext.reload()
        assert.equal(result.navigationId, null)
        assert(result.url.includes('/bidi/logEntryAdded.html'))
      })

      it('can reload with readiness state', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        const result = await browsingContext.navigate(Pages.logEntryAdded, 'complete')

        await browsingContext.reload(undefined, 'complete')
        assert.notEqual(result.navigationId, null)
        assert(result.url.includes('/bidi/logEntryAdded.html'))
      })

      it('can set viewport', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.blankPage)

        await browsingContext.setViewport(250, 300)

        const result = await driver.executeScript('return [window.innerWidth, window.innerHeight];')
        assert.equal(result[0], 250)
        assert.equal(result[1], 300)
      })

      ignore(env.browsers(Browser.FIREFOX)).it('can set viewport with device pixel ratio', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await driver.get(Pages.blankPage)

        await browsingContext.setViewport(250, 300, 5)

        const result = await driver.executeScript('return [window.innerWidth, window.innerHeight];')
        assert.equal(result[0], 250)
        assert.equal(result[1], 300)

        const devicePixelRatio = await driver.executeScript('return window.devicePixelRatio;')
        assert.equal(devicePixelRatio, 5)
      })

      it('Get All Top level browsing contexts', async () => {
        const id = await driver.getWindowHandle()
        const window1 = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await BrowsingContext(driver, { type: 'window' })

        const res = await window1.getTopLevelContexts()
        assert.equal(res.length, 2)
      })
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)

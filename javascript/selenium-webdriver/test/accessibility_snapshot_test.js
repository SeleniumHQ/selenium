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

// driver.getAccessibilitySnapshot() and element.getAccessibilitySnapshot()
// (ADR 18205), in a BiDi and in a Classic session: the output must be the same
// whichever protocol the session uses. The shared corpus in
// common/src/web/accessibility is the cross-binding contract: every page is
// snapshotted whole and compared with its recorded tree and text.

const assert = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')
const { Browser, By, error, WebElement } = require('selenium-webdriver')
const { AccessibilityNode } = require('selenium-webdriver')
const { suite, whereIs } = require('../lib/test')
const { locate } = require('../lib/test/resources')

const CORPUS = locate('common/src/web/accessibility')
// The atom records frames as leaves; the binding fills them in, so this page has its own test.
const FRAMES_PAGE = '014-iframe'

function read(file) {
  return fs.readFileSync(path.join(CORPUS, file), 'utf8')
}

const PAGES = JSON.parse(read('index.json')).filter((page) => page !== FRAMES_PAGE)

function engineOf(browserName) {
  const name = (browserName || '').toLowerCase()
  if (name.includes('firefox')) return 'firefox'
  if (name.includes('safari') || name.includes('webkit')) return 'webkit'
  return 'chromium'
}

/**
 * The engine-specific expectation when one is recorded, else the shared one.
 * `form` is '' for the pruned snapshot and '.full' for the unpruned one.
 */
function expected(engine, page, suffix, form = '') {
  const specific = `${page}.expected${form}.${engine}.${suffix}`
  return read(fs.existsSync(path.join(CORPUS, specific)) ? specific : `${page}.expected${form}.${suffix}`)
}

/** The corpus JSON form: every field written, `element` as the element's id. */
async function serialize(node) {
  const out = { role: node.role, name: node.name, description: node.description }
  if (node.value !== undefined) out.value = node.value
  if (node.url !== undefined) out.url = node.url
  out.states = node.states
  if (node.element) out.element = await node.element.getDomAttribute('id')
  out.children = []
  for (const child of node.children) out.children.push(await serialize(child))
  return out
}

function* walk(node) {
  yield node
  for (const child of node.children) yield* walk(child)
}

suite(
  function (env) {
    for (const protocol of ['BiDi', 'Classic']) {
      describe(`getAccessibilitySnapshot over ${protocol}`, function () {
        let driver

        before(async function () {
          const builder = env.builder()
          if (protocol === 'Classic') builder.setCapability('webSocketUrl', false)
          driver = await builder.build()
        })

        after(function () {
          return driver.quit()
        })

        for (const page of PAGES) {
          it(`matches the corpus for ${page}`, async function () {
            await driver.get(whereIs(`accessibility/${page}.html`))
            const engine = engineOf((await driver.getCapabilities()).getBrowserName())

            const tree = await driver.getAccessibilitySnapshot()

            assert.deepStrictEqual(await serialize(tree), JSON.parse(expected(engine, page, 'json')))
            assert.strictEqual(tree.toText() + '\n', expected(engine, page, 'txt'))
          })

          it(`matches the unpruned corpus for ${page}`, async function () {
            await driver.get(whereIs(`accessibility/${page}.html`))
            const engine = engineOf((await driver.getCapabilities()).getBrowserName())

            const tree = await driver.getAccessibilitySnapshot({ interestingOnly: false })

            assert.deepStrictEqual(await serialize(tree), JSON.parse(expected(engine, page, 'json', '.full')))
            assert.strictEqual(tree.toText() + '\n', expected(engine, page, 'txt', '.full'))
          })
        }

        it('a link carries its resolved url', async function () {
          await driver.get(whereIs('accessibility/003-links-and-buttons.html'))

          const tree = await driver.getAccessibilitySnapshot()

          const link = [...walk(tree)].find((node) => node.role === 'link')
          assert.strictEqual(link.url, 'https://example.com/link')
          assert.strictEqual(await link.element.getDomAttribute('href'), link.url)
          assert.strictEqual([...walk(tree)].find((node) => node.role === 'button').url, undefined)
        })

        it('a subtree snapshot can be unpruned too', async function () {
          await driver.get(whereIs('accessibility/010-generic-and-presentation.html'))
          const wrapper = await driver.findElement(By.id('wrap-1'))

          const pruned = await wrapper.getAccessibilitySnapshot()
          const full = await wrapper.getAccessibilitySnapshot({ interestingOnly: false })

          assert.deepStrictEqual(
            pruned.children.map((child) => child.role),
            ['heading', 'text'],
          )
          assert.deepStrictEqual(
            full.children.map((child) => child.role),
            ['generic'],
          )
          assert.strictEqual(await full.children[0].element.getDomAttribute('id'), 'wrap-2')
        })

        it('is rooted at the document', async function () {
          await driver.get(whereIs('accessibility/001-headings-and-landmarks.html'))

          const tree = await driver.getAccessibilitySnapshot()

          assert.ok(tree instanceof AccessibilityNode)
          assert.strictEqual(tree.role, 'document')
          assert.ok(tree.element instanceof WebElement)
          assert.strictEqual(await tree.element.getTagName(), 'html')
        })

        it('returns element references usable for further commands', async function () {
          await driver.get(whereIs('accessibility/003-links-and-buttons.html'))

          const tree = await driver.getAccessibilitySnapshot()

          const button = [...walk(tree)].find((node) => node.role === 'button')
          assert.ok(button, 'the page has buttons')
          assert.ok(['button', 'input', 'a'].includes(await button.element.getTagName()))
          assert.strictEqual(await button.element.getDomAttribute('id'), (await serialize(button)).element)
        })

        it('always produces a node for a subtree root', async function () {
          await driver.get(whereIs('accessibility/005-lists.html'))
          const body = await driver.findElement(By.css('body'))

          const tree = await body.getAccessibilitySnapshot()

          assert.strictEqual(tree.role, 'generic')
          assert.strictEqual(await tree.element.getTagName(), 'body')
          assert.ok([...walk(tree)].some((node) => node.role === 'list'))
        })

        it('snapshots the subtree of a node from an earlier snapshot', async function () {
          await driver.get(whereIs('accessibility/005-lists.html'))
          const firstList = [...walk(await driver.getAccessibilitySnapshot())].find((node) => node.role === 'list')

          const tree = await firstList.element.getAccessibilitySnapshot()

          assert.strictEqual(tree.role, 'list')
          assert.deepStrictEqual(
            tree.children.map((child) => child.role),
            firstList.children.map((child) => child.role),
          )
        })

        it('stitches frames in', async function () {
          await driver.get(whereIs(`accessibility/${FRAMES_PAGE}.html`))

          const tree = await driver.getAccessibilitySnapshot()

          const frames = [...walk(tree)].filter((node) => node.role === 'iframe')
          assert.deepStrictEqual(
            frames.map((frame) => frame.name),
            ['Embedded content', ''],
          )
          for (const frame of frames) {
            assert.strictEqual(frame.children.length, 1, 'a reachable frame carries its document as the one child')
            assert.strictEqual(frame.children[0].role, 'document')
            assert.ok(frame.children[0].element instanceof WebElement)
          }
          // The text form renders the stitched tree; the atom-level expectation stops at the leaves.
          assert.strictEqual(tree.toText().split('- document').length - 1, 3)
          // A reference inside a frame works through classic commands once that frame is current.
          await driver.switchTo().frame(frames[0].element)
          try {
            assert.strictEqual(await frames[0].children[0].element.getTagName(), 'html')
          } finally {
            await driver.switchTo().defaultContent()
          }
        })

        it('carries the document of an iframe taken as the root', async function () {
          await driver.get(whereIs(`accessibility/${FRAMES_PAGE}.html`))
          const frame = await driver.findElement(By.id('frame'))

          const tree = await frame.getAccessibilitySnapshot()

          assert.strictEqual(tree.role, 'iframe')
          assert.strictEqual(tree.name, 'Embedded content')
          assert.deepStrictEqual(
            tree.children.map((child) => child.role),
            ['document'],
          )
        })

        it('snapshots an element inside a frame', async function () {
          await driver.get(whereIs(`accessibility/${FRAMES_PAGE}.html`))
          await driver.switchTo().frame('frame')
          try {
            const body = await driver.findElement(By.css('body'))
            const tree = await body.getAccessibilitySnapshot()
            // The root is the frame's body, not the top document that owns the window.
            assert.strictEqual(tree.role, 'generic')
            assert.strictEqual(tree.name, '')
            assert.strictEqual(await tree.element.getTagName(), 'body')
          } finally {
            await driver.switchTo().defaultContent()
          }
        })

        it('is rooted at the frame the driver switched to', async function () {
          await driver.get(whereIs(`accessibility/${FRAMES_PAGE}.html`))
          await driver.switchTo().frame('frame')
          let tree
          try {
            tree = await driver.getAccessibilitySnapshot()
            assert.strictEqual(tree.role, 'document')
            assert.strictEqual(await tree.element.getTagName(), 'html')
            // Still in the frame: taking a snapshot leaves the current browsing context alone.
            assert.ok(await driver.executeScript('return window !== window.top'))
          } finally {
            await driver.switchTo().defaultContent()
          }
          assert.notStrictEqual(tree.name, 'Frames')
        })

        it('leaves the current browsing context unchanged', async function () {
          await driver.get(whereIs(`accessibility/${FRAMES_PAGE}.html`))

          await driver.getAccessibilitySnapshot()

          assert.ok(await driver.executeScript('return window === window.top'))
          assert.strictEqual(await driver.findElement(By.id('before')).getText(), 'Before the frame')
        })

        it('raises the stale element error for a root from a previous document', async function () {
          await driver.get(whereIs('accessibility/005-lists.html'))
          const body = await driver.findElement(By.css('body'))
          await driver.get(whereIs('accessibility/001-headings-and-landmarks.html'))

          await assert.rejects(body.getAccessibilitySnapshot(), error.StaleElementReferenceError)
        })

        it('raises the stale element error for a detached root', async function () {
          await driver.get(whereIs('accessibility/005-lists.html'))
          const item = await driver.findElement(By.css('li'))
          await driver.executeScript('arguments[0].remove()', item)

          await assert.rejects(item.getAccessibilitySnapshot(), error.StaleElementReferenceError)
        })

        it('is a copy taken at one point in time', async function () {
          await driver.get(whereIs('accessibility/005-lists.html'))
          const before = await driver.getAccessibilitySnapshot()
          await driver.executeScript("document.querySelector('li').textContent = 'changed'")

          const after = await driver.getAccessibilitySnapshot()

          assert.notStrictEqual(before.toText(), after.toText())
          assert.ok(after.toText().includes('changed'))
        })
      })
    }
  },
  // The test environment enables BiDi for these browsers only.
  { browsers: [Browser.CHROME, Browser.EDGE, Browser.FIREFOX] },
)

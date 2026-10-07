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
const fs = require('node:fs')
const path = require('node:path')

// The browsers with Bazel test targets: the keys of BROWSERS in javascript/private/browsers.bzl.
const BAZEL_BROWSERS = ['chrome', 'edge', 'firefox']

const BROWSER_NAMES = {
  'Browser.CHROME': 'chrome',
  "'chrome'": 'chrome',
  'Browser.EDGE': 'edge',
  "'MicrosoftEdge'": 'edge',
  'Browser.FIREFOX': 'firefox',
  "'firefox'": 'firefox',
  'Browser.SAFARI': 'safari',
  "'safari'": 'safari',
  'Browser.INTERNET_EXPLORER': 'internet explorer',
  "'internet explorer'": 'internet explorer',
}

function testFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) return testFiles(file)
    return entry.name.endsWith('_test.js') ? [file] : []
  })
}

/** The Bazel browsers a file's suite() calls run against, or null when it calls no suite(). */
function suiteBrowsers(file) {
  const source = fs.readFileSync(file, 'utf8')
  const suites = source.match(/\bsuite\(/g)?.length ?? 0
  if (suites === 0) return null
  const options = [...source.matchAll(/browsers:\s*\[([^\]]*)\]/g)].map((m) => m[1])
  if (options.length < suites) return BAZEL_BROWSERS

  const names = new Set()
  for (const option of options) {
    for (const token of option.split(',').map((t) => t.trim())) {
      if (!token) continue
      assert.ok(token in BROWSER_NAMES, `${file}: unrecognized browser ${token} in a suite's browsers option`)
      names.add(BROWSER_NAMES[token])
    }
  }
  return BAZEL_BROWSERS.filter((browser) => names.has(browser))
}

function readTestBrowsers() {
  const source = fs.readFileSync('test/test_browsers.bzl', 'utf8')
  const map = new Map()
  for (const [, file, list] of source.matchAll(/"(test\/[^"]+)":\s*\[([^\]]*)\]/g)) {
    map.set(
      file,
      [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]),
    )
  }
  return map
}

describe('test/test_browsers.bzl', function () {
  const testBrowsers = readTestBrowsers()

  it('matches the browsers each test file limits its suite() to', function () {
    const mismatches = []
    for (const file of testFiles('test')) {
      const browsers = suiteBrowsers(file)
      if (browsers === null) continue
      const all = browsers.length === BAZEL_BROWSERS.length
      const listed = testBrowsers.get(file)
      if (all && listed !== undefined) {
        mismatches.push(`${file} runs on every browser; remove its entry`)
      } else if (!all && JSON.stringify(listed) !== JSON.stringify(browsers)) {
        mismatches.push(`${file} should be "${file}": ${JSON.stringify(browsers)}`)
      }
    }
    assert.deepStrictEqual(mismatches, [])
  })

  it('lists only test files that exist', function () {
    const missing = [...testBrowsers.keys()].filter((file) => !fs.existsSync(file))
    assert.deepStrictEqual(missing, [])
  })
})

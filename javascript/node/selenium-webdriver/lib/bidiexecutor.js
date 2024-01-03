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

const Executor = require('./command.js').Executor
const BrowsingContext = require('../bidi/browsingContext')

class BiDiExecutor extends Executor {

  #browsingContextMap = new Map()
  #commandHandlers = new Map()
  #driver
  #currentContext

  // Mapping the page load strategy values used in Classic To BiDi
  // Refer: https://w3c.github.io/webdriver-bidi/#type-browsingContext-ReadinessState
  // Refer: https://www.w3.org/TR/webdriver2/#navigation
  #readinessStateMappings = [
    ["none", "none"],
    ["eager", "interactive"],
    ["normal", "complete"]]
  #readinessStateMap = new Map(this.#readinessStateMappings)

  constructor(driver) {
    super()
    this.#driver = driver
  }

  async init() {
    let windowHandle = await this.#driver.getWindowHandle()

    let parentContext = await BrowsingContext(this.#driver, {
      browsingContextId: windowHandle,
    })

    this.#currentContext = parentContext
    this.#browsingContextMap.set(windowHandle, parentContext)

    this.#commandHandlers.set('get', async (driver, command) => {
      let url = command.getParameter('url')
      let caps = await this.#driver.getCapabilities()
      let pageLoadStrategy = caps['map_'].get('pageLoadStrategy')
      let response = await this.#currentContext.navigate(url, this.#readinessStateMap.get(pageLoadStrategy))

      // Required because W3C Classic sets the current browsing context to current top-level
      // context on navigation
      // This is crucial for tests that:
      // Switch to frame -> find element -> navigate url -> find element (in BiDi it will try to
      // find an element in the frame)
      // But in WebDriver Classic it will try to find the element on the page navigated to
      // So to avoid breaking changes, we need to add this step
      // Refer: Pt 9 of https://www.w3.org/TR/webdriver2/#navigate-to
      // Refer: https://w3c.github.io/webdriver-bidi/#command-browsingContext-navigate

      await driver.switchTo().window(this.#currentContext.id)
      return response
    })

    this.#commandHandlers.set('printPage', async (driver, command) => {
      let response = await this.#currentContext.printPage(command.getParameter('options'))
      return response._data
    })
  }

  async execute(command) {
    let currentWindowHandle = await this.#driver.getWindowHandle()

    let browsingContext
    if (this.#browsingContextMap.has(currentWindowHandle)) {
      browsingContext = this.#browsingContextMap.get(currentWindowHandle)
    } else {
      browsingContext = await BrowsingContext(this.#driver, {
        browsingContextId: currentWindowHandle,
      })
      this.#browsingContextMap.set(currentWindowHandle, browsingContext)
    }

    this.#currentContext = browsingContext

    if (this.#commandHandlers.has(command.getName())) {
      let f = this.#commandHandlers.get(command.getName())
      let value = await f(this.#driver, command)

      // Return value in the expected format
      return value
    } else {
      throw Error(`Command ${command.getName()} not found`)
    }
  }
}

async function getBiDiExecutorInstance(
  driver) {
  let instance = new BiDiExecutor(driver)
  await instance.init()
  return instance
}

module.exports = {
  getBiDiExecutorInstance,
  BiDiExecutor,
}

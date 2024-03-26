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

const { InvalidArgumentError, NoSuchFrameError } = require('../lib/error')
const { BrowsingContextInfo } = require('./browsingContextTypes')
const { SerializationOptions, ReferenceValue, RemoteValue } = require('./protocolValue')
const { WebElement } = require('../lib/webdriver')

class Locator {
  static Type = Object.freeze({
    CSS: 'css',
    INNER_TEXT: 'innerText',
    XPATH: 'xpath',
  })

  #type
  #value
  #ignoreCase
  #matchType
  #maxDepth

  constructor(type, value, ignoreCase = undefined, matchType = undefined, maxDepth = undefined) {
    this.#type = type
    this.#value = value
    this.#ignoreCase = ignoreCase
    this.#matchType = matchType
    this.#maxDepth = maxDepth
  }

  static css(value) {
    return new Locator(Locator.Type.CSS, value)
  }

  static xpath(value) {
    return new Locator(Locator.Type.XPATH, value)
  }

  static innerText(value, ignoreCase = undefined, matchType = undefined, maxDepth = undefined) {
    return new Locator(Locator.Type.INNER_TEXT, value, ignoreCase, matchType, maxDepth)
  }

  toMap() {
    const map = new Map()

    map.set('type', this.#type.toString())
    map.set('value', this.#value)
    map.set('ignoreCase', this.#ignoreCase)
    map.set('matchType', this.#matchType)
    map.set('maxDepth', this.#maxDepth)

    return map
  }
}

class BrowsingContext {
  constructor(driver) {
    this._driver = driver
  }

  /**
   * @returns id
   */
  get id() {
    return this._id
  }

  async init({ browsingContextId, type, referenceContext }) {
    if (!(await this._driver.getCapabilities()).get('webSocketUrl')) {
      throw Error('WebDriver instance must support BiDi protocol')
    }

    if (type !== undefined && !['window', 'tab'].includes(type)) {
      throw Error(`Valid types are 'window' & 'tab'. Received: ${type}`)
    }

    this.bidi = await this._driver.getBidi()
    this._id =
      browsingContextId === undefined
        ? (await this.create(type, referenceContext))['result']['context']
        : browsingContextId
  }

  /**
   * Creates a browsing context for the given type and referenceContext
   */
  async create(type, referenceContext) {
    const params = {
      method: 'browsingContext.create',
      params: {
        type: type,
        referenceContext: referenceContext,
      },
    }
    return await this.bidi.send(params)
  }

  /**
   * @param url the url to navigate to
   * @param readinessState type of readiness state: "none" / "interactive" / "complete"
   * @returns NavigateResult object
   */
  async navigate(url, readinessState = undefined) {
    if (readinessState !== undefined && !['none', 'interactive', 'complete'].includes(readinessState)) {
      throw Error(`Valid readiness states are 'none', 'interactive' & 'complete'. Received: ${readinessState}`)
    }

    const params = {
      method: 'browsingContext.navigate',
      params: {
        context: this._id,
        url: url,
        wait: readinessState,
      },
    }
    const navigateResult = (await this.bidi.send(params))['result']

    return new NavigateResult(navigateResult['url'], navigateResult['navigation'])
  }

  /**
   * @param maxDepth the max depth of the descendents of browsing context tree
   * @returns BrowsingContextInfo object
   */
  async getTree(maxDepth = undefined) {
    const params = {
      method: 'browsingContext.getTree',
      params: {
        root: this._id,
        maxDepth: maxDepth,
      },
    }

    let result = await this.bidi.send(params)
    if ('error' in result) {
      throw Error(result['error'])
    }

    result = result['result']['contexts'][0]
    return new BrowsingContextInfo(result['context'], result['url'], result['children'], result['parent'])
  }

  /**
   * Closes the browsing context
   * @returns {Promise<void>}
   */
  async close() {
    const params = {
      method: 'browsingContext.close',
      params: {
        context: this._id,
      },
    }
    await this.bidi.send(params)
  }

  /**
   * Prints PDF of the webpage
   * @param options print options given by the user
   * @returns PrintResult object
   */
  async printPage(options = {}) {
    let params = {
      method: 'browsingContext.print',
      // Setting default values for parameters
      params: {
        context: this._id,
        background: false,
        margin: {
          bottom: 1.0,
          left: 1.0,
          right: 1.0,
          top: 1.0,
        },
        orientation: 'portrait',
        page: {
          height: 27.94,
          width: 21.59,
        },
        pageRanges: [],
        scale: 1.0,
        shrinkToFit: true,
      },
    }

    // Updating parameter values based on the options passed
    params.params = this._driver.validatePrintPageParams(options, params.params)

    const response = await this.bidi.send(params)
    return new PrintResult(response.result.data)
  }

  async captureScreenshot() {
    let params = {
      method: 'browsingContext.captureScreenshot',
      params: {
        context: this._id,
      },
    }

    const response = await this.bidi.send(params)
    this.checkErrorInScreenshot(response)
    return response['result']['data']
  }

  async captureBoxScreenshot(x, y, width, height) {
    let params = {
      method: 'browsingContext.captureScreenshot',
      params: {
        context: this._id,
        clip: {
          type: 'box',
          x: x,
          y: y,
          width: width,
          height: height,
        },
      },
    }

    console.log(JSON.stringify(params))

    const response = await this.bidi.send(params)
    console.log(JSON.stringify(response))
    this.checkErrorInScreenshot(response)
    return response['result']['data']
  }

  async captureElementScreenshot(sharedId, handle = undefined, scrollIntoView = undefined) {
    let params = {
      method: 'browsingContext.captureScreenshot',
      params: {
        context: this._id,
        clip: {
          type: 'element',
          element: {
            sharedId: sharedId,
            handle: handle,
          },
          scrollIntoView: scrollIntoView,
        },
      },
    }

    const response = await this.bidi.send(params)
    this.checkErrorInScreenshot(response)
    return response['result']['data']
  }

  checkErrorInScreenshot(response) {
    if ('error' in response) {
      const { error, msg } = response

      switch (error) {
        case 'invalid argument':
          throw new InvalidArgumentError(msg)

        case 'no such frame':
          throw new NoSuchFrameError(msg)
      }
    }
  }

  async activate() {
    const params = {
      method: 'browsingContext.activate',
      params: {
        context: this._id,
      },
    }

    let result = await this.bidi.send(params)
    if ('error' in result) {
      throw Error(result['error'])
    }
  }

  async handleUserPrompt(accept = undefined, userText = undefined) {
    const params = {
      method: 'browsingContext.handleUserPrompt',
      params: {
        context: this._id,
        accept: accept,
        userText: userText,
      },
    }

    let result = await this.bidi.send(params)
    if ('error' in result) {
      throw Error(result['error'])
    }
  }

  async reload(ignoreCache = undefined, readinessState = undefined) {
    if (readinessState !== undefined && !['none', 'interactive', 'complete'].includes(readinessState)) {
      throw Error(`Valid readiness states are 'none', 'interactive' & 'complete'. Received: ${readinessState}`)
    }

    const params = {
      method: 'browsingContext.reload',
      params: {
        context: this._id,
        ignoreCache: ignoreCache,
        wait: readinessState,
      },
    }
    const navigateResult = (await this.bidi.send(params))['result']

    return new NavigateResult(navigateResult['url'], navigateResult['navigation'])
  }

  async setViewport(width, height, devicePixelRatio = undefined) {
    const params = {
      method: 'browsingContext.setViewport',
      params: {
        context: this._id,
        viewport: { width: width, height: height },
        devicePixelRatio: devicePixelRatio,
      },
    }
    let result = await this.bidi.send(params)
    if ('error' in result) {
      throw Error(result['error'])
    }
  }

  async traverseHistory(delta) {
    const params = {
      method: 'browsingContext.traverseHistory',
      params: {
        context: this._id,
        delta: delta,
      },
    }
    await this.bidi.send(params)
  }

  async forward() {
    await this.traverseHistory(1)
  }

  async back() {
    await this.traverseHistory(-1)
  }

  async locateNodes(
    locator,
    maxNodeCount = undefined,
    ownership = undefined,
    sandbox = undefined,
    serializationOptions = undefined,
    startNodes = undefined,
  ) {
    if (!(locator instanceof Locator)) {
      throw Error(`Pass in a Locator object. Received: ${locator}`)
    }

    if (serializationOptions !== undefined && !(serializationOptions instanceof SerializationOptions)) {
      throw Error(`Pass in SerializationOptions object. Received: ${serializationOptions} `)
    }

    if (ownership !== undefined && !['root', 'none'].includes(ownership)) {
      throw Error(`Valid types are 'root' and 'none. Received: ${ownership}`)
    }

    if (startNodes !== undefined && !Array.isArray(startNodes)) {
      throw Error(`Pass in an array of ReferenceValue objects. Received: ${startNodes}`)
    }

    if (startNodes !== undefined && Array.isArray(startNodes)) {
      startNodes.forEach((node) => {
        if (!(node instanceof ReferenceValue)) {
          throw Error(`Pass in a ReferenceValue object. Received: ${node}`)
        }
      })
    }

    const params = {
      method: 'browsingContext.locateNodes',
      params: {
        context: this._id,
        locator: Object.fromEntries(locator.toMap()),
        maxNodeCount: maxNodeCount,
        ownership: ownership,
        sandbox: sandbox,
        serializationOptions: serializationOptions,
        startNodes: startNodes,
      },
    }

    let response = await this.bidi.send(params)
    if ('error' in response) {
      throw Error(response['error'])
    }

    const nodes = response.result.nodes
    const remoteValues = []

    nodes.forEach((node) => {
      remoteValues.push(new RemoteValue(node))
    })
    return remoteValues
  }

  async locateNode(
    locator,
    ownership = undefined,
    sandbox = undefined,
    serializationOptions = undefined,
    startNodes = undefined,
  ) {
    const elements = await this.locateNodes(locator, 1, ownership, sandbox, serializationOptions, startNodes)
    return elements[0]
  }

  async locateElement(locator) {
    const elements = await this.locateNodes(locator, 1)
    return new WebElement(this._driver, elements[0].sharedId)
  }

  async locateElements(locator) {
    const elements = await this.locateNodes(locator)

    let webElements = []
    elements.forEach((element) => {
      webElements.push(new WebElement(this._driver, element.sharedId))
    })
    return webElements
  }
}

class NavigateResult {
  constructor(url, navigationId) {
    this._url = url
    this._navigationId = navigationId
  }

  get url() {
    return this._url
  }

  get navigationId() {
    return this._navigationId
  }
}

class PrintResult {
  constructor(data) {
    this._data = data
  }

  get data() {
    return this._data
  }
}

/**
 * initiate browsing context instance and return
 * @param driver
 * @param browsingContextId The browsing context of current window/tab
 * @param type "window" or "tab"
 * @param referenceContext To get a browsing context for this reference if passed
 * @returns {Promise<BrowsingContext>}
 */
async function getBrowsingContextInstance(driver, { browsingContextId, type, referenceContext }) {
  let instance = new BrowsingContext(driver)
  await instance.init({ browsingContextId, type, referenceContext })
  return instance
}

/**
 * API
 * @type {function(*, {*,*,*}): Promise<BrowsingContext>}
 */
module.exports = getBrowsingContextInstance
module.exports.Locator = Locator

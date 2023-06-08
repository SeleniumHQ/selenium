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

const { BrowsingContextInfo } = require('./browsingContextTypes')
class BrowsingContext {
  constructor(driver) {
    this._driver = driver
  }

  async init({ browsingContextId, type, referenceContext }) {
    if (!(await this._driver.getCapabilities()).get('webSocketUrl')) {
      throw Error('WebDriver instance must support BiDi protocol')
    }

    if (type != undefined && !['window', 'tab'].includes(type)) {
      throw Error(`Valid types are 'window' & 'tab'. Received: ${type}`)
    }

    this.bidi = await this._driver.getBidi()
    this._id =
      browsingContextId == undefined
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
   * @returns id
   */
  get id() {
    return this._id
  }

  /**
   * @param url the url to navigate to
   * @param readinessState type of readiness state: "none" / "interactive" / "complete"
   * @returns NavigateResult object
   */
  async navigate(url, readinessState = undefined) {
    if (
      readinessState != undefined &&
      !['none', 'interactive', 'complete'].includes(readinessState)
    ) {
      throw Error(
        `Valid readiness states are 'none', 'interactive' & 'complete'. Received: ${readinessState}`
      )
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

    return new NavigateResult(
      navigateResult['url'],
      navigateResult['navigation']
    )
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
    return new BrowsingContextInfo(
      result['context'],
      result['url'],
      result['children'],
      result['parent']
    )
  }

  /**
   * Closes the browing context
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
async function getBrowsingContextInstance(
  driver,
  { browsingContextId, type, referenceContext }
) {
  let instance = new BrowsingContext(driver)
  await instance.init({ browsingContextId, type, referenceContext })
  return instance
}

/**
 * API
 * @type {function(*, {*,*,*}): Promise<BrowsingContext>}
 */
module.exports = getBrowsingContextInstance

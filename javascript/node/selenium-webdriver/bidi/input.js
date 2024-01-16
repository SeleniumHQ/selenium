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

// type: module added to package.json
// import { WebElement } from '../lib/webdriver'
const { WebElement } = require('../lib/webdriver')

class Input {
  constructor(driver) {
    this._driver = driver
  }

  async init() {
    if (!(await this._driver.getCapabilities()).get('webSocketUrl')) {
      throw Error('WebDriver instance must support BiDi protocol')
    }

    this.bidi = await this._driver.getBidi()
  }

  async perform(browsingContextId, actions) {
    const _actions = await updateActions(actions)

    const command = {
      method: 'input.performActions',
      params: {
        context: browsingContextId,
        actions: _actions,
      },
    }

    let response = await this.bidi.send(command)

    return response
  }

  async release(browsingContextId) {
    const command = {
      method: 'input.releaseActions',
      params: {
        context: browsingContextId,
      },
    }
    return await this.bidi.send(command)
  }
}

async function updateActions(actions) {
  const _actions = []
  for (const action of actions) {
    const sequenceList = action.actions
    let updatedSequenceList = []

    if (action.type === 'pointer' || action.type === 'wheel') {
      for (const sequence of sequenceList) {
        if (
          (sequence.type === 'pointerMove' || sequence.type === 'scroll') &&
          sequence.origin instanceof WebElement
        ) {
          const element = sequence.origin
          const elementId = await element.getId()
          sequence.origin = {
            type: 'element',
            element: { sharedId: elementId },
          }
        }
        updatedSequenceList.push(sequence)
      }

      const updatedAction = { ...action, actions: updatedSequenceList }
      _actions.push(updatedAction)
    } else {
      _actions.push(action)
    }
  }

  return _actions
}

async function getInputInstance(driver) {
  let instance = new Input(driver)
  await instance.init()
  return instance
}

module.exports = getInputInstance

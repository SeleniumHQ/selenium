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

const {
  EvaluateResultType,
  EvaluateResultSuccess,
  EvaluateResultException,
  ExceptionDetails,
} = require('./evaluateResult')
const { RealmInfo } = require('./realmInfo')
const { RemoteValue } = require('./protocolValue')
const { WebDriverError } = require('../lib/error')

class ScriptManager {
  constructor(driver) {
    this._driver = driver
  }

  async init(browsingContextId) {
    if (!(await this._driver.getCapabilities()).get('webSocketUrl')) {
      throw Error('WebDriver instance must support BiDi protocol')
    }

    this.bidi = await this._driver.getBidi()
    this._browsingContextId = browsingContextId
  }

  async disownRealmScript(realmId, handles) {
    const params = {
      method: 'script.disown',
      params: {
        handles: handles,
        target: {
          realm: realmId,
        },
      },
    }

    await this.bidi.send(params)
  }

  async disownBrowsingContextScript(
    browsingContextId,
    handles,
    sandbox = null
  ) {
    const params = {
      method: 'script.disown',
      params: {
        handles: handles,
        target: {
          context: browsingContextId,
        },
      },
    }

    if (sandbox != null) {
      params.params.target['sandbox'] = sandbox
    }

    await this.bidi.send(params)
  }

  async callFunctionInRealm(
    realmId,
    functionDeclaration,
    awaitPromise,
    argumentValueList = null,
    thisParameter = null,
    resultOwnership = null
  ) {
    const params = this.getCallFunctionParams(
      'realm',
      realmId,
      null,
      functionDeclaration,
      awaitPromise,
      argumentValueList,
      thisParameter,
      resultOwnership
    )

    const command = {
      method: 'script.callFunction',
      params,
    }

    let response = await this.bidi.send(command)
    return this.createEvaluateResult(response)
  }

  async callFunctionInBrowsingContext(
    browsingContextId,
    functionDeclaration,
    awaitPromise,
    argumentValueList = null,
    thisParameter = null,
    resultOwnership = null,
    sandbox = null
  ) {
    const params = this.getCallFunctionParams(
      'contextTarget',
      browsingContextId,
      sandbox,
      functionDeclaration,
      awaitPromise,
      argumentValueList,
      thisParameter,
      resultOwnership
    )

    const command = {
      method: 'script.callFunction',
      params,
    }
    const response = await this.bidi.send(command)
    return this.createEvaluateResult(response)
  }

  async evaluateFunctionInRealm(
    realmId,
    expression,
    awaitPromise,
    resultOwnership = null
  ) {
    const params = this.getEvaluateParams(
      'realm',
      realmId,
      null,
      expression,
      awaitPromise,
      resultOwnership
    )

    const command = {
      method: 'script.evaluate',
      params,
    }

    let response = await this.bidi.send(command)
    return this.createEvaluateResult(response)
  }

  async evaluateFunctionInBrowsingContext(
    browsingContextId,
    expression,
    awaitPromise,
    resultOwnership = null,
    sandbox = null
  ) {
    const params = this.getEvaluateParams(
      'contextTarget',
      browsingContextId,
      sandbox,
      expression,
      awaitPromise,
      resultOwnership
    )

    const command = {
      method: 'script.evaluate',
      params,
    }

    let response = await this.bidi.send(command)
    return this.createEvaluateResult(response)
  }

  async addPreloadScript(
    functionDeclaration,
    argumentValueList = [],
    sandbox = null
  ) {
    const params = {
      functionDeclaration: functionDeclaration,
      arguments: argumentValueList,
      sandbox: sandbox,
    }

    const command = {
      method: 'script.addPreloadScript',
      params,
    }

    let response = await this.bidi.send(command)
    return response.result.script
  }

  async removePreloadScript(script) {
    const params = { script: script }
    const command = {
      method: 'script.removePreloadScript',
      params,
    }
    let response = await this.bidi.send(command)
    if ('error' in response) {
      throw new WebDriverError(response.error)
    }
    return response.result
  }

  getCallFunctionParams(
    targetType,
    id,
    sandbox,
    functionDeclaration,
    awaitPromise,
    argumentValueList = null,
    thisParameter = null,
    resultOwnership = null
  ) {
    const params = {
      functionDeclaration: functionDeclaration,
      awaitPromise: awaitPromise,
    }
    if (targetType === 'contextTarget') {
      if (sandbox != null) {
        params['target'] = { context: id, sandbox: sandbox }
      } else {
        params['target'] = { context: id }
      }
    } else {
      params['target'] = { realm: id }
    }

    if (argumentValueList != null) {
      let argumentParams = []
      argumentValueList.forEach((argumentValue) => {
        argumentParams.push(argumentValue.asMap())
      })
      params['arguments'] = argumentParams
    }

    if (thisParameter != null) {
      params['this'] = thisParameter
    }

    if (resultOwnership != null) {
      params['resultOwnership'] = resultOwnership
    }

    return params
  }

  getEvaluateParams(
    targetType,
    id,
    sandbox,
    expression,
    awaitPromise,
    resultOwnership = null
  ) {
    const params = {
      expression: expression,
      awaitPromise: awaitPromise,
    }
    if (targetType === 'contextTarget') {
      if (sandbox != null) {
        params['target'] = { context: id, sandbox: sandbox }
      } else {
        params['target'] = { context: id }
      }
    } else {
      params['target'] = { realm: id }
    }
    if (resultOwnership != null) {
      params['resultOwnership'] = resultOwnership
    }

    return params
  }

  createEvaluateResult(response) {
    const type = response.result.type
    const realmId = response.result.realm
    let evaluateResult

    if (type === EvaluateResultType.SUCCESS) {
      const result = response.result.result
      evaluateResult = new EvaluateResultSuccess(
        realmId,
        new RemoteValue(result)
      )
    } else {
      const exceptionDetails = response.result.exceptionDetails
      evaluateResult = new EvaluateResultException(
        realmId,
        new ExceptionDetails(exceptionDetails)
      )
    }
    return evaluateResult
  }

  realmInfoMapper(realms) {
    const realmsList = []
    realms.forEach((realm) => {
      realmsList.push(RealmInfo.fromJson(realm))
    })
    return realmsList
  }

  async getAllRealms() {
    const command = {
      method: 'script.getRealms',
      params: {},
    }
    let response = await this.bidi.send(command)
    return this.realmInfoMapper(response.result.realms)
  }

  async getRealmsByType(type) {
    const command = {
      method: 'script.getRealms',
      params: { type: type },
    }
    let response = await this.bidi.send(command)
    return this.realmInfoMapper(response.result.realms)
  }

  async getRealmsInBrowsingContext(browsingContext) {
    const command = {
      method: 'script.getRealms',
      params: { context: browsingContext },
    }
    let response = await this.bidi.send(command)
    return this.realmInfoMapper(response.result.realms)
  }

  async getRealmsInBrowsingContextByType(browsingContext, type) {
    const command = {
      method: 'script.getRealms',
      params: { context: browsingContext, type: type },
    }
    let response = await this.bidi.send(command)
    return this.realmInfoMapper(response.result.realms)
  }
}

async function getScriptManagerInstance(browsingContextId, driver) {
  let instance = new ScriptManager(driver)
  await instance.init(browsingContextId)
  return instance
}

module.exports = getScriptManagerInstance

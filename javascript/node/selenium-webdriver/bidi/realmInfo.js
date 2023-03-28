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

const RealmType = require('./realmType')
// const WindowRealmInfo = require('./windowRealmInfo')

class RealmInfo {
  constructor(realmId, origin, realmType) {
    this._realmId = realmId
    this._origin = origin
    this._realmType = realmType
  }

  fromJson(input) {
    let realmId = null
    let origin = null
    let realmType = null
    let browsingContext = null
    let sandbox = null

    if ('type' in input) {
      let typeString = input['type']
      realmType = RealmType.findByName(typeString)
    }

    if ('realm' in input) {
      realmId = input['realm']
    }

    if ('origin' in input) {
      origin = input['origin']
    }

    if ('context' in input) {
      browsingContext = input['context']
    }

    if ('sandbox' in input) {
      sandbox = input['sandbox']
    }

    if (realmType === RealmType.WINDOW) {
      return new WindowRealmInfo(
        realmId,
        origin,
        realmType,
        browsingContext,
        sandbox
      )
    }

    return new RealmInfo(realmId, origin, realmType)
  }

  get realmId() {
    return this._realmId
  }

  get origin() {
    return this._origin
  }

  get realmType() {
    return this._realmType
  }

  toJson() {
    let toReturn = {}
    toReturn['type'] = this._realmType
    toReturn['realm'] = this._realmId
    toReturn['origin'] = this._origin

    return toReturn
  }
}

module.exports = RealmInfo

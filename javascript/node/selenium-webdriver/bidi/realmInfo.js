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

const RealmType = {
  AUDIO_WORKLET: 'audio-worklet',
  DEDICATED_WORKER: 'dedicated-worker',
  PAINT_WORKLET: 'paint-worklet',
  SERVICE_WORKED: 'service-worker',
  SHARED_WORKED: 'shared-worker',
  WINDOW: 'window',
  WORKER: 'worker',
  WORKLET: 'worklet',

  findByName(name) {
    return (
      Object.values(this).find((type) => {
        return typeof type === 'string' && name.toLowerCase() === type.toLowerCase()
      }) || null
    )
  },
}

class RealmInfo {
  constructor(realmId, origin, realmType) {
    this.realmId = realmId
    this.origin = origin
    this.realmType = realmType
  }

  static fromJson(input) {
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
      return new WindowRealmInfo(realmId, origin, realmType, browsingContext, sandbox)
    }

    return new RealmInfo(realmId, origin, realmType)
  }
}

class WindowRealmInfo extends RealmInfo {
  constructor(realmId, origin, realmType, browsingContext, sandbox = null) {
    super(realmId, origin, realmType)
    this.browsingContext = browsingContext
    this.sandbox = sandbox
  }
}

module.exports = {
  RealmInfo,
  RealmType,
  WindowRealmInfo,
}

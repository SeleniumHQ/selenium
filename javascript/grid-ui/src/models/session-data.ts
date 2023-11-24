/*
 * Licensed to the Software Freedom Conservancy (SFC) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The SFC licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import Capabilities from './capabilities'

interface SessionData {
  id: string
  capabilities: string
  browserName: string
  browserVersion: string
  platformName: string
  startTime: string
  uri: string
  nodeId: string
  nodeUri: string
  sessionDurationMillis: number
  slot: any
  vnc: string
  name: string
}

export function createSessionData (
  id: string,
  capabilities: string,
  startTime: string,
  uri: string,
  nodeId: string,
  nodeUri: string,
  sessionDurationMillis: number,
  slot: any,
  origin: string
): SessionData {
  const parsed = JSON.parse(capabilities) as Capabilities
  const browserName = parsed.browserName
  const browserVersion = parsed.browserVersion ?? parsed.version
  const platformName = parsed.platformName ?? parsed.platform
  let vnc: string = parsed['se:vnc'] ?? ''
  if (vnc.length > 0) {
    try {
      const url = new URL(origin)
      const vncUrl = new URL(vnc)
      url.pathname = vncUrl.pathname
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      vnc = url.href
    } catch (error) {
      console.log(error)
    }
  }
  const name: string = parsed['se:name'] ?? id
  return {
    id,
    capabilities,
    browserName,
    browserVersion,
    platformName,
    startTime,
    uri,
    nodeId,
    nodeUri,
    sessionDurationMillis,
    slot,
    vnc,
    name
  }
}

export default SessionData

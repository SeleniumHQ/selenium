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

import OsInfo from './os-info'
import StereotypeInfo from './stereotype-info'

interface NodeInfo {
  /** Node id */
  id: string
  /** Node URI */
  uri: string
  /** Node status (UP, DRAINING, UNAVAILABLE)  */
  status: string
  /** Max. number of concurrent sessions */
  maxSession: number
  /** Number of slots */
  slotCount: number
  /** Number of current sessions */
  sessionCount: number
  /** Grid Node version */
  version: string
  /** Grid Node OS information */
  osInfo: OsInfo
  /** Node stereotypes. */
  slotStereotypes: StereotypeInfo[]
}

export default NodeInfo

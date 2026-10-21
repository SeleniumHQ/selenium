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


#!/usr/bin/env node
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

const { execFileSync } = require('node:child_process')
const { binaryPath } = require('../index.js')

let binary
try {
  binary = binaryPath()
} catch (err) {
  console.error(err.message)
  process.exit(1)
}

// Installing the standalone package is not consent to usage stats, so they are
// opt-in here: SE_AVOID_STATS=false (or se-config.toml) turns them on.
const env = { ...process.env }
if (!env.SE_AVOID_STATS) {
  env.SE_AVOID_STATS = 'true'
}

try {
  execFileSync(binary, process.argv.slice(2), { stdio: 'inherit', env })
} catch (err) {
  process.exit(err.status ?? 1)
}

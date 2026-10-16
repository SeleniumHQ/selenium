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
const path = require('node:path')
const fs = require('node:fs')
const { platform } = require('node:process')

const PLATFORM_PACKAGES = {
  linux: '@selenium/manager-linux-x64',
  darwin: '@selenium/manager-darwin',
  win32: '@selenium/manager-win32',
  cygwin: '@selenium/manager-win32',
}

function getBinaryPath() {
  if (process.env.SE_MANAGER_PATH) {
    return process.env.SE_MANAGER_PATH
  }

  const pkgName = PLATFORM_PACKAGES[platform]
  if (!pkgName) {
    throw new Error(
      `Unsupported platform: ${platform}. ` +
        `Supported: linux, darwin, win32`
    )
  }

  const isWindows = platform === 'win32' || platform === 'cygwin'
  const binaryName = isWindows ? 'selenium-manager.exe' : 'selenium-manager'

  let pkgJsonPath
  try {
    pkgJsonPath = require.resolve(`${pkgName}/package.json`)
  } catch (_) {
    throw new Error(
      `Platform package ${pkgName} is not installed. ` +
        `Run: npm install ${pkgName}`
    )
  }

  const binPath = path.join(path.dirname(pkgJsonPath), 'bin', binaryName)
  if (!fs.existsSync(binPath)) {
    throw new Error(`Binary not found at expected path: ${binPath}`)
  }
  return binPath
}

const binary = getBinaryPath()
try {
  execFileSync(binary, process.argv.slice(2), { stdio: 'inherit' })
} catch (err) {
  process.exit(err.status ?? 1)
}

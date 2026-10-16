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

/**
 * Platform dispatch for the standalone Selenium Manager distribution.
 *
 * The platform packages carry nothing but the binary; resolution lives here so
 * `npx @selenium/manager` and a library calling `binaryPath()` agree on which
 * binary they mean.
 */

const path = require('node:path')
const fs = require('node:fs')
const { platform, arch } = require('node:process')

// Linux is the only platform with a package per architecture: the macOS binary is
// universal and the Windows one is ia32, which runs on x64 and arm64 as well. Keys
// are matched as `${platform}-${arch}` first, then `${platform}`.
const PLATFORM_PACKAGES = {
  'linux-x64': '@selenium/manager-linux-x64',
  'linux-arm64': '@selenium/manager-linux-arm64',
  darwin: '@selenium/manager-darwin',
  win32: '@selenium/manager-win32',
  cygwin: '@selenium/manager-win32',
}

/**
 * Resolves the Selenium Manager binary for the running platform.
 *
 * `SE_MANAGER_PATH` wins when set, matching how every binding already lets users
 * point at a manager they built or vendored themselves.
 *
 * @return {string} the absolute path of the binary.
 * @throws {Error} if the platform is unsupported or its package is missing.
 */
function binaryPath() {
  if (process.env.SE_MANAGER_PATH) {
    return process.env.SE_MANAGER_PATH
  }

  const pkgName = PLATFORM_PACKAGES[`${platform}-${arch}`] ?? PLATFORM_PACKAGES[platform]
  if (!pkgName) {
    throw new Error(`Unsupported platform: ${platform} ${arch}. Supported: linux (x64, arm64), darwin, win32`)
  }

  const isWindows = platform === 'win32' || platform === 'cygwin'
  const binaryName = isWindows ? 'selenium-manager.exe' : 'selenium-manager'

  let pkgJsonPath
  try {
    pkgJsonPath = require.resolve(`${pkgName}/package.json`)
  } catch (_) {
    throw new Error(`Platform package ${pkgName} is not installed. Run: npm install ${pkgName}`)
  }

  const binPath = path.join(path.dirname(pkgJsonPath), 'bin', binaryName)
  if (!fs.existsSync(binPath)) {
    throw new Error(`Binary not found at expected path: ${binPath}`)
  }
  return binPath
}

module.exports = { binaryPath, PLATFORM_PACKAGES }

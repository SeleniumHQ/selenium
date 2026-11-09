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

// Runs binaryPath() in a child process so each case gets its own platform,
// environment and module search path, with packages laid out the way npm
// installs the published platform packages.

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const INDEX = path.join(__dirname, '..', 'index.js')

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'selenium-manager-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  const shim = path.join(root, 'platform-shim.js')
  fs.writeFileSync(
    shim,
    `Object.defineProperty(process, 'platform', { value: process.env.FAKE_PLATFORM })
Object.defineProperty(process, 'arch', { value: process.env.FAKE_ARCH })
`,
  )
  const modules = path.join(root, 'node_modules')
  fs.mkdirSync(modules)
  return { root, shim, modules }
}

function installPackage(modules, name, binary) {
  const dir = path.join(modules, ...name.split('/'))
  fs.mkdirSync(path.join(dir, 'bin'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name }))
  if (binary) {
    fs.writeFileSync(path.join(dir, 'bin', binary), '')
  }
  return path.join(dir, 'bin', binary ?? '')
}

function binaryPath(fx, platform, arch, env = {}) {
  // Inherit the environment: under Bazel, process.execPath is a launcher that
  // needs the JS_BINARY__* variables to find the real node.
  const childEnv = { ...process.env, NODE_PATH: fx.modules, FAKE_PLATFORM: platform, FAKE_ARCH: arch, ...env }
  if (!('SE_MANAGER_PATH' in env)) {
    delete childEnv.SE_MANAGER_PATH
  }
  const result = spawnSync(
    process.execPath,
    ['-r', fx.shim, '-e', `process.stdout.write(require(${JSON.stringify(INDEX)}).binaryPath())`],
    {
      encoding: 'utf8',
      env: childEnv,
    },
  )
  return { path: result.stdout, error: result.stderr, status: result.status }
}

const CASES = [
  ['linux', 'x64', '@selenium/manager-linux-x64', 'selenium-manager'],
  ['linux', 'arm64', '@selenium/manager-linux-arm64', 'selenium-manager'],
  ['darwin', 'x64', '@selenium/manager-darwin', 'selenium-manager'],
  ['darwin', 'arm64', '@selenium/manager-darwin', 'selenium-manager'],
  ['win32', 'ia32', '@selenium/manager-win32-ia32', 'selenium-manager.exe'],
  ['win32', 'x64', '@selenium/manager-win32-ia32', 'selenium-manager.exe'],
  ['win32', 'arm64', '@selenium/manager-win32-ia32', 'selenium-manager.exe'],
]

for (const [platform, arch, pkg, binary] of CASES) {
  test(`${platform} ${arch} resolves the binary in ${pkg}`, (t) => {
    const fx = fixture(t)
    const expected = installPackage(fx.modules, pkg, binary)
    const result = binaryPath(fx, platform, arch)
    assert.equal(result.status, 0, result.error)
    assert.equal(fs.realpathSync(result.path), fs.realpathSync(expected))
  })
}

test('SE_MANAGER_PATH overrides the platform package', (t) => {
  const fx = fixture(t)
  const result = binaryPath(fx, 'linux', 'x64', { SE_MANAGER_PATH: '/opt/selenium-manager' })
  assert.equal(result.status, 0, result.error)
  assert.equal(result.path, '/opt/selenium-manager')
})

test('an unsupported platform lists the supported ones', (t) => {
  const fx = fixture(t)
  const result = binaryPath(fx, 'freebsd', 'x64')
  assert.notEqual(result.status, 0)
  assert.match(result.error, /Unsupported platform: freebsd x64\. Supported: linux \(x64, arm64\), darwin, win32/)
})

test('an unsupported linux architecture is rejected', (t) => {
  const fx = fixture(t)
  const result = binaryPath(fx, 'linux', 'ppc64')
  assert.notEqual(result.status, 0)
  assert.match(result.error, /Unsupported platform: linux ppc64/)
})

test('a missing platform package names the package to install', (t) => {
  const fx = fixture(t)
  const result = binaryPath(fx, 'linux', 'x64')
  assert.notEqual(result.status, 0)
  assert.match(result.error, /Run: npm install @selenium\/manager-linux-x64/)
})

test('a platform package without its binary is reported', (t) => {
  const fx = fixture(t)
  installPackage(fx.modules, '@selenium/manager-linux-x64')
  const result = binaryPath(fx, 'linux', 'x64')
  assert.notEqual(result.status, 0)
  assert.match(result.error, /Binary not found at expected path: .*selenium-manager/)
})

const LAUNCHER = path.join(__dirname, '..', 'bin', 'selenium-manager.js')

// Points SE_MANAGER_PATH at node itself, so the arguments decide what the
// "manager" does and the launcher is exercised without a real binary.
function launch(managerPath, args, env = {}) {
  const childEnv = { ...process.env, SE_MANAGER_PATH: managerPath, ...env }
  if (!('SE_AVOID_STATS' in env)) {
    delete childEnv.SE_AVOID_STATS
  }
  const result = spawnSync(process.execPath, [LAUNCHER, ...args], { encoding: 'utf8', env: childEnv })
  return { stdout: result.stdout, error: result.stderr, status: result.status }
}

test('the launcher passes through the manager exit code', () => {
  const result = launch(process.execPath, ['-e', 'process.exit(3)'])
  assert.equal(result.status, 3, result.error)
})

test('the launcher turns usage stats off unless asked', () => {
  const script = 'process.stdout.write(process.env.SE_AVOID_STATS)'
  assert.equal(launch(process.execPath, ['-e', script]).stdout, 'true')
  assert.equal(launch(process.execPath, ['-e', script], { SE_AVOID_STATS: 'false' }).stdout, 'false')
})

test('a manager that cannot start is reported', () => {
  const missing = path.join(os.tmpdir(), 'no-such-selenium-manager')
  const result = launch(missing, ['--version'])
  assert.equal(result.status, 1)
  assert.match(result.error, /Failed to run .*no-such-selenium-manager: .*ENOENT/)
})

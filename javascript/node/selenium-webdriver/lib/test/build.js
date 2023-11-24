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

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const PROJECT_ROOT = path.normalize(path.join(__dirname, '../../../../..'))
const WORKSPACE_FILE = path.join(PROJECT_ROOT, 'WORKSPACE')

function isDevMode() {
  return fs.existsSync(WORKSPACE_FILE)
}

function checkIsDevMode() {
  if (!isDevMode()) {
    throw Error('Cannot execute build; not running in dev mode')
  }
}

/**
 * Targets that have been previously built.
 * @type {!Object}
 */
let builtTargets = {}

/**
 * @param {!Array.<string>} targets The targets to build.
 * @throws {Error} If not running in dev mode.
 * @constructor
 */
const Build = function (targets) {
  checkIsDevMode()
  this.targets_ = targets
}

/** @private {boolean} */
Build.prototype.cacheResults_ = false

/**
 * Configures this build to only execute if it has not previously been
 * run during the life of the current process.
 * @return {!Build} A self reference.
 */
Build.prototype.onlyOnce = function () {
  this.cacheResults_ = true
  return this
}

/**
 * Executes the build.
 * @return {!Promise} A promise that will be resolved when
 *     the build has completed.
 * @throws {Error} If no targets were specified.
 */
Build.prototype.go = function () {
  let targets = this.targets_
  if (!targets.length) {
    throw Error('No targets specified')
  }

  // Filter out cached results.
  if (this.cacheResults_) {
    targets = targets.filter(function (target) {
      return !Object.prototype.hasOwnProperty.call(builtTargets, target)
    })

    if (!targets.length) {
      return Promise.resolve()
    }
  }

  console.log('\nBuilding', targets.join(' '), '...')

  let cmd,
    args = targets
  if (process.platform === 'win32') {
    cmd = 'cmd.exe'
    args.unshift('/c', path.join(PROJECT_ROOT, 'go.bat'))
  } else {
    cmd = path.join(PROJECT_ROOT, 'go')
  }

  return new Promise((resolve, reject) => {
    spawn(cmd, args, {
      cwd: PROJECT_ROOT,
      env: process.env,
      stdio: ['ignore', process.stdout, process.stderr],
    }).on('exit', function (code, signal) {
      if (code === 0) {
        targets.forEach(function (target) {
          builtTargets[target] = 1
        })
        return resolve()
      }

      let msg = 'Unable to build artifacts'
      if (code) {
        // May be null.
        msg += '; code=' + code
      }
      if (signal) {
        msg += '; signal=' + signal
      }

      reject(Error(msg))
    })
  })
}

// PUBLIC API

exports.isDevMode = isDevMode

/**
 * Creates a build of the listed targets.
 * @param {...string} var_args The targets to build.
 * @return {!Build} The new build.
 * @throws {Error} If not running in dev mode.
 */
exports.of = function (var_args) { // eslint-disable-line
  let targets = Array.prototype.slice.call(arguments, 0)
  return new Build(targets)
}

/**
 * @return {string} Absolute path of the project's root directory.
 * @throws {Error} If not running in dev mode.
 */
exports.projectRoot = function () {
  return PROJECT_ROOT
}

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
const { projectRoot } = require('./build')

// PUBLIC API

/**
 * Locates a test resource.
 * @param {string} filePath The file to locate from the root of the project.
 * @return {string} The full path for the file, if it exists.
 * @throws {Error} If the file does not exist.
 */
exports.locate = function (filePath) {
  const fullPath = path.normalize(path.join(projectRoot(), filePath))
  if (!fs.existsSync(fullPath)) {
    throw Error('File does not exist: ' + filePath)
  }
  return fullPath
}

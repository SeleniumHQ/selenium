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

const {Executor} = require("./command");

const biDiCommands = new Set()
biDiCommands.add('get')

class BiDiDelegator extends Executor {
  #bidiExecutor
  #httpExecutor

  constructor(httpExecutor) {
    super()
    this.#httpExecutor = httpExecutor
  }

  setBidiExecutor(bidiExecutor) {
    this.#bidiExecutor = bidiExecutor
  }

  execute(command) {
    if (this.#bidiExecutor && biDiCommands.has(command.getName())) {
      return this.#bidiExecutor.execute(command)
    } else {
      return this.#httpExecutor.execute(command)
    }
  }
}

module.exports = BiDiDelegator

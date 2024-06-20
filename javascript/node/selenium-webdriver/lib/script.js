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

const logInspector = require('../bidi/logInspector')

class Script {
  #driver
  #logInspector

  constructor(driver) {
    this.#driver = driver
  }

  // This should be done in the constructor.
  // But since it needs to call async methods we cannot do that in the constructor.
  // We can have a separate async method that initialises the Script instance.
  // However, that pattern does not allow chaining the methods as we would like the user to use it.
  // Since it involves awaiting to get the instance and then another await to call the method.
  // Using this allows the user to do this "await driver.script().addJavaScriptErrorHandler(callback)"
  async #init() {
    if (this.#logInspector !== undefined) {
      return
    }
    this.#logInspector = await logInspector(this.#driver)
  }

  async addJavaScriptErrorHandler(callback) {
    await this.#init()
    return await this.#logInspector.onJavascriptException(callback)
  }

  async removeJavaScriptErrorHandler(id) {
    await this.#init()
    await this.#logInspector.removeCallback(id)
  }

  async addConsoleMessageHandler(callback) {
    await this.#init()
    return this.#logInspector.onConsoleEntry(callback)
  }

  async removeConsoleMessageHandler(id) {
    await this.#init()

    await this.#logInspector.removeCallback(id)
  }
}

module.exports = Script

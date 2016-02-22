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

/**
 * @fileoverview Random utility methods for the injected script.
 */

goog.provide('safaridriver.inject.util');

goog.require('bot.response');
goog.require('safaridriver.message.LoadModule');
goog.require('webdriver.promise');


/**
 * Requests the source code for a module from the global extension.
 * @param {string} moduleId ID of the module to load.
 * @param {!(SafariContentBrowserTabProxy|Window)} target The target to send
 *     the load request to.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the module's source code.
 */
safaridriver.inject.util.loadModule = function(moduleId, target) {
  return new webdriver.promise.Promise(function(fulfill, reject) {
    var numAttempts = 0;
    attemptLoad();
    function attemptLoad() {
      var message = new safaridriver.message.LoadModule(moduleId);
      var response = /** @type {bot.response.ResponseObject} */ (
          message.sendSync(target));
      try {
        fulfill(bot.response.checkResponse(response)['value']);
      } catch (ex) {
        numAttempts += 1;
        if (numAttempts == 3) {
          reject(ex);
        } else {
          setTimeout(attemptLoad, 150);
        }
      }
    }
  });
};

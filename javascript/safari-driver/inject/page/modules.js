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
 * @fileoverview Module declarations for the page script.
 */

goog.provide('safaridriver.inject.page.modules');

goog.require('goog.asserts');
goog.require('safaridriver.inject.CommandRegistry');
goog.require('webdriver.CommandName');


/**
 * Module IDs; must be kept in sync with the build files.
 * @enum {string}
 */
safaridriver.inject.page.modules.Id = {
  ELEMENT: 'page_element',
  SCRIPT: 'page_script'
};


/** @private {boolean} */
safaridriver.inject.page.modules.initialized_ = false;


/**
 * Evaluates the first argument to this function, which must be a string. This
 * function does not have any named arguments to avoid potential clashes with
 * the evaluated script. The result of this script is expected to be a function,
 * and is immediately invoked in the scope of {@code goog.global}.
 * @private
 */
safaridriver.inject.page.modules.evalModule_ = goog.bind(function() {
  eval('(' + arguments[0] + ')').call(goog.global);
}, goog.global);


/**
 * Declares, but does not load, the various modules used by the page
 * script.
 */
safaridriver.inject.page.modules.init = function() {
  goog.asserts.assert(!safaridriver.inject.page.modules.initialized_);
  safaridriver.inject.page.modules.initialized_ = true;

  safaridriver.inject.CommandRegistry.getInstance()
      .setMessageTarget(window)
      .setEvalModuleFn(safaridriver.inject.page.modules.evalModule_)
      .declareModule(safaridriver.inject.page.modules.Id.ELEMENT, [
        webdriver.CommandName.SEND_KEYS_TO_ELEMENT
      ])
      .declareModule(safaridriver.inject.page.modules.Id.SCRIPT, [
        webdriver.CommandName.EXECUTE_SCRIPT,
        webdriver.CommandName.EXECUTE_ASYNC_SCRIPT
      ]);
};

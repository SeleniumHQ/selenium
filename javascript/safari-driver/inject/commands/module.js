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
 * @fileoverview Forward declares all of the command modules for the injected
 * script.
 */

goog.provide('safaridriver.inject.commands.module');

goog.require('goog.asserts');
goog.require('safaridriver.inject.CommandRegistry');
goog.require('webdriver.CommandName');


/**
 * The command module ID. This must be kept in sync with the compiled module ID.
 * @type {string}
 * @const
 */
safaridriver.inject.commands.module.ID = 'injected_commands';


/** @private {boolean} */
safaridriver.inject.commands.module.initialized_ = false;


/**
 * Declares, but does not load, the various modules used by the injected
 * script.
 */
safaridriver.inject.commands.module.init = function() {
  goog.asserts.assert(!safaridriver.inject.commands.module.initialized_);
  safaridriver.inject.commands.module.initialized_ = true;

  safaridriver.inject.CommandRegistry.getInstance()
      .setMessageTarget(safari.self.tab)
      .setEvalModuleFn(function(src) {
        var fn = new Function('(' + src + ').call(this)');
        fn.call(goog.global);
      })
      .declareModule(safaridriver.inject.commands.module.ID, [
        webdriver.CommandName.ADD_COOKIE,
        webdriver.CommandName.CLEAR_ELEMENT,
        webdriver.CommandName.CLICK_ELEMENT,
        webdriver.CommandName.DELETE_ALL_COOKIES,
        webdriver.CommandName.DELETE_COOKIE,
        webdriver.CommandName.ELEMENT_EQUALS,
        webdriver.CommandName.FIND_CHILD_ELEMENT,
        webdriver.CommandName.FIND_CHILD_ELEMENTS,
        webdriver.CommandName.FIND_ELEMENT,
        webdriver.CommandName.FIND_ELEMENTS,
        webdriver.CommandName.GET,
        webdriver.CommandName.GET_ACTIVE_ELEMENT,
        webdriver.CommandName.GET_ALL_COOKIES,
        webdriver.CommandName.GET_CURRENT_URL,
        webdriver.CommandName.GET_ELEMENT_ATTRIBUTE,
        webdriver.CommandName.GET_ELEMENT_LOCATION,
        webdriver.CommandName.GET_ELEMENT_LOCATION_IN_VIEW,
        webdriver.CommandName.GET_ELEMENT_SIZE,
        webdriver.CommandName.GET_ELEMENT_TAG_NAME,
        webdriver.CommandName.GET_ELEMENT_TEXT,
        webdriver.CommandName.GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
        webdriver.CommandName.GET_PAGE_SOURCE,
        webdriver.CommandName.GET_TITLE,
        webdriver.CommandName.GET_WINDOW_POSITION,
        webdriver.CommandName.GET_WINDOW_SIZE,
        webdriver.CommandName.GO_BACK,
        webdriver.CommandName.GO_FORWARD,
        webdriver.CommandName.IS_ELEMENT_DISPLAYED,
        webdriver.CommandName.IS_ELEMENT_ENABLED,
        webdriver.CommandName.IS_ELEMENT_SELECTED,
        webdriver.CommandName.MAXIMIZE_WINDOW,
        webdriver.CommandName.REFRESH,
        webdriver.CommandName.SET_WINDOW_POSITION,
        webdriver.CommandName.SET_WINDOW_SIZE,
        webdriver.CommandName.SUBMIT_ELEMENT,
        webdriver.CommandName.SWITCH_TO_FRAME,
        webdriver.CommandName.SWITCH_TO_WINDOW
      ]);
};

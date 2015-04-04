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
 * @fileoverview Utilities for creating {@link webdriver.WebDriver} instances
 * backed by a pure-JavaScript CommandExecutor for use in a browser.
 */

goog.provide('webdriver.browser');

goog.require('goog.userAgent');
goog.require('goog.userAgent.product');
goog.require('webdriver.Browser');
goog.require('webdriver.Capabilities');
goog.require('webdriver.Capability');
goog.require('webdriver.Session');
goog.require('webdriver.WebDriver');
goog.require('webdriver.browser.CommandExecutor');



/**
 * The common name for the current user-agent. This will be the empty if the
 * user-agent is not recognized.
 * @private {string}
 * @const
 */
webdriver.browser.BROWSER_NAME_ = (function() {
  var map = {};
  map[goog.userAgent.product.ANDROID] = webdriver.Browser.ANDROID;
  map[goog.userAgent.product.CHROME] = webdriver.Browser.CHROME;
  map[goog.userAgent.product.FIREFOX] = webdriver.Browser.FIREFOX;
  map[goog.userAgent.IE] = webdriver.Browser.INTERNET_EXPLORER;
  map[goog.userAgent.product.IPAD] = webdriver.Browser.IPAD;
  map[goog.userAgent.product.IPHONE] = webdriver.Browser.IPHONE;
  map[goog.userAgent.product.SAFARI] = webdriver.Browser.SAFARI;
  return map[true] || '';
})();


/**
 * The session ID shared by all pure-JS WebDriver instances.
 * @private {string}
 * @const
 */
webdriver.browser.STATIC_SESSION_ID_ = 'static-session';


/**
 * Creates new WebDriver clients backed by a pure-JavaScript command executor.
 * @param {!Window} win The target window.
 * @param {webdriver.promise.ControlFlow=} opt_flow The flow to
 *     schedule commands through. Defaults to the active flow object.
 * @return {webdriver.WebDriver} The new WebDriver instance.
 */
webdriver.browser.createDriver = function(win, opt_flow) {
  var capabilities = new webdriver.Capabilities().
      set(webdriver.Capability.BROWSER_NAME, webdriver.browser.BROWSER_NAME_);
  var session = new webdriver.Session(
      webdriver.browser.STATIC_SESSION_ID_, capabilities);
  var executor = new webdriver.browser.CommandExecutor(win);
  return new webdriver.WebDriver(session, executor, opt_flow);
};

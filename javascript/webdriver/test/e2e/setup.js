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
 * @fileoverview Common e2e test setup.
 */

goog.provide('webdriver.test.e2e.setup');

goog.require('goog.debug.TextFormatter');
goog.require('goog.dom');
goog.require('goog.log');
goog.require('goog.string');
goog.require('goog.userAgent.product');
goog.require('webdriver.browser');
goog.require('webdriver.testing.assert');
/** @suppress {extraRequire} Bootstraps the test framework. */
goog.require('webdriver.testing.jsunit');


if (window.console) {
  var formatter = new goog.debug.TextFormatter();
  formatter.showAbsoluteTime = false;
  formatter.showExceptionText = true;
  formatter.showSeverityLevel = true;

  goog.log.addHandler(goog.log.getLogger(''), function(logRecord) {
    console.log(goog.string.trimRight(
    formatter.formatRecord(logRecord)));
  });
}

var assert = webdriver.testing.assert;
var container;
var driver;


function shouldRunTests() {
  // Command handlers have only been fine tuned for Chrome.
  return goog.userAgent.product.CHROME;
}

function setUp() {
  container = goog.dom.createElement(goog.dom.TagName.DIV);
  goog.dom.appendChild(goog.dom.getDocument().body, container);

  var frame = goog.dom.createElement(goog.dom.TagName.IFRAME);
  frame.style.width = '600px';
  frame.style.height = '300px';
  goog.dom.appendChild(container, frame);

  var win = goog.dom.getFrameContentWindow(frame);
  driver = webdriver.browser.createDriver(win);
}


function tearDown() {
  driver.quit().thenFinally(function() {
    if (container) {
      goog.dom.removeNode(container);
    }
  });
}

/** @license
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @fileoverview File to include for turnning any HTML page into a WebDriver
 * JSUnit test suite by configuring an onload listener to the body that will
 * instantiate and start the test runner.
 */

goog.provide('webdriver.jsunit');

goog.require('goog.testing.jsunit');
goog.require('webdriver.TestCase');
goog.require('webdriver.asserts');
goog.require('webdriver.factory');


(function() {
  window.onload = function() {
    var test = new webdriver.TestCase(document.title,
        webdriver.factory.createLocalWebDriver);
    test.autoDiscoverTests();
    G_testRunner.initialize(test);
    G_testRunner.execute(test);
  };
})();

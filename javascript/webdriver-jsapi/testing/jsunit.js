// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview File to include for turning any HTML file page into a WebDriver
 * JSUnit test suite by configuring an onload listener to the body that will
 * instantiate and start the test runner.
 */

goog.provide('webdriver.testing.jsunit');
goog.provide('webdriver.testing.jsunit.TestRunner');

goog.require('goog.testing.TestRunner');
goog.require('webdriver.testing.TestCase');


/**
 * Constructs a test runner.
 * @constructor
 * @extends {goog.testing.TestRunner}
 */
webdriver.testing.jsunit.TestRunner = function() {
  goog.base(this);
};
goog.inherits(webdriver.testing.jsunit.TestRunner, goog.testing.TestRunner);


/**
 * Copied from goog.testing.TestRunner.prototype.onComplete_, which has private
 * visibility.
 * @private
 */
webdriver.testing.jsunit.TestRunner.prototype.onComplete_ = function() {
  var log = this.testCase.getReport(true);
  if (this.errors.length > 0) {
    log += '\n' + this.errors.join('\n');
  }

  // Remove all children from the log element.
  var logEl = this.logEl_;
  while (logEl.firstChild) {
    logEl.removeChild(logEl.firstChild);
  }

  this.writeLog(log);
  this.reportResults_();
};


webdriver.testing.jsunit.TestRunner.prototype.reportResults_ = function() {
  var report = {
    'isSuccess': this.isSuccess(),
    'report': this.getReport()
  };

  var xhr = new XMLHttpRequest;
  // TODO(jleyba): /testResults should be configurable.
  xhr.open('POST', '/testResults', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(report));
};


(function() {
  var tr = new webdriver.testing.jsunit.TestRunner();

  // Export our test runner so it can be accessed by Selenium/WebDriver. This
  // will only work if webdriver.WebDriver is using a pure-JavaScript
  // webdriver.CommandExecutor. Otherwise, the JS-client could change the
  // driver's focus to another window or frame and the Java/Python-client
  // wouldn't be able to access this object.
  goog.exportSymbol('G_testRunner', tr);
  goog.exportSymbol('G_testRunner.initialize', tr.initialize);
  goog.exportSymbol('G_testRunner.isInitialized', tr.isInitialized);
  goog.exportSymbol('G_testRunner.isFinished', tr.isFinished);
  goog.exportSymbol('G_testRunner.isSuccess', tr.isSuccess);
  goog.exportSymbol('G_testRunner.getReport', tr.getReport);
  goog.exportSymbol('G_testRunner.getRunTime', tr.getRunTime);
  goog.exportSymbol('G_testRunner.getNumFilesLoaded', tr.getNumFilesLoaded);
  goog.exportSymbol('G_testRunner.setStrict', tr.setStrict);
  goog.exportSymbol('G_testRunner.logTestFailure', tr.logTestFailure);

  // Export debug as a global function for JSUnit compatibility.  This just
  // calls log on the current test case.
  if (!goog.global['debug']) {
    goog.exportSymbol('debug', goog.bind(tr.log, tr));
  }

  var onload = window.onload;
  window.onload = function() {
    // Call any existing onload handlers.
    if (onload) {
      onload();
    }

    var testCase = new webdriver.testing.TestCase(document.title);
    testCase.autoDiscoverTests();

    tr.initialize(testCase);
    tr.execute();
  };
})();

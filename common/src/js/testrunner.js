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
 * @fileoverview A xUnit framework for writing unit tests using the WebDriver
 * JavaScript API.
 * Example Usage:
 * <code>
 * goog.require('webdriver.TestRunner');
 * goog.require('webdriver.factory');
 *
 * function testGoogleSearch(driver) {
 *   driver.get('http://www.google.com');
 *   driver.findElement({name: 'q'}).sendKeys('webdriver');
 *   driver.findElement({name: 'btnG'}).click();
 * }
 *
 * window.onload = function() {
 *   new webdriver.TestRunner(webdriver.factory.createLocalWebDriver).
 *       go();
 * };
 * </code>
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.TestCase');
goog.provide('webdriver.TestResult');
goog.provide('webdriver.TestRunner');

goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('webdriver.WebDriver.EventType');
goog.require('webdriver.factory');
goog.require('webdriver.logging');
goog.require('webdriver.timing');


/**
 * Represents a single test function to be executed by the
 * {@code webdriver.TestRunner}.
 * @param {string} name The name of the test function.
 * @param {function} testFn The test function that will be executed.
 * @constructor
 */
webdriver.TestCase = function(name, testFn) {
  this.name = name;
  this.testFn = testFn;
};


/**
 * Stores the result of a {@code webdriver.TestCase}.
 * @param {webdriver.TestCase} testCase The test this is a result for.
 * @param {boolean} passed Whether the test passed.
 * @param {string} opt_errMsg The error message describing the test failure.
 * @constructor
 */
webdriver.TestResult = function(testCase, passed, opt_errMsg) {
  this.testCase = testCase;
  this.passed = passed;
  this.errMsg = opt_errMsg || '';
};


/**
 * @return {string} A summary of this result.
 */
webdriver.TestResult.prototype.getSummary = function() {
  if (this.passed) {
    return this.testCase.name + ' [PASSED]';
  } else {
    return this.testCase.name + ' [FAILED]\n    ' +
           this.errMsg.replace(/\n/g, '\n    ');
  }
};


/**
 * The actual test runner.  When created, scans the global scope for all test
 * functions (those functions whose name is prefixed with "test").  Once
 * started, the TestRunner will execute each test case and pass a new
 * {@code webdriver.WebDriver} instance to the test for it to issue commands to.
 * The driver will be paused while commands are collected from the test
 * function.  Once resumed, the TestRunner will listen for the driver's
 * {@code IDLE} and {@code ERROR} events to determine when the test is done and
 * what its result was.
 * @param {function} opt_driverFactoryFn The factory function to call for
 *     creating new {@code webdriver.WebDriver} instances. A new instance will
 *     be created for each test case; defaults to
 *     {@code webdriver.factory.createLocalWebDriver}.
 * @param {goog.dom.DomHelper} opt_dom A DomHelper for the content window to
 *     scan for test functions.
 * @constructor
 */
webdriver.TestRunner = function(opt_driverFactoryFn, opt_dom) {

  /**
   * Factory function to call for creating new instances of
   * {@code webdriver.WebDriver}.
   * @type {function}
   * @private
   */
  this.driverFactoryFn_ =
      opt_driverFactoryFn || webdriver.factory.createLocalWebDriver;

  /**
   * DomHelper for the content window to scan for test functions.
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.dom_ = opt_dom || goog.dom.getDomHelper();

  /**
   * Whether this instance has started executing tests.
   * @type {boolean}
   * @private
   */
  this.started_ = false;

  /**
   * Whether this instance has finished executing tests.
   * @type {boolean}
   * @private
   */
  this.finished_ = false;

  /**
   * The tests discovered on the page that will be executed.
   * @type {Array.<webdriver.TestCase>}
   * @private
   */
  this.tests_ = [];

  /**
   * A hash of all known test case names.
   * @type {Object}
   * @private
   */
  this.testNames_ = {};

  /**
   * The index of the test currently running.
   * @type {number}
   * @private
   */
  this.currentTest_ = -1;

  /**
   * Results for the executed tests.
   * @type {Array.<webdriver.TestResult>}
   * @private
   */
  this.results_ = [];

  /**
   * The {@code setUp} function, if any, to call before each test is executed.
   * @type {function}
   * @private
   */
  this.setUpFn_ = null;

  /**
   * The {@code tearDown} function, if any, to call after each test is executed.
   * @type {function}
   * @private
   */
  this.tearDownFn_ = null;

  /**
   * The number of tests that have passed.
   * @type {number}
   * @private
   */
  this.numPassing_ = 0;

  /**
   * DOM element to log results to; lazily initialized in
   * {@code initResultsSection_}.
   * @type {Element}
   * @private
   */
  this.resultsDiv_ = null;

  /**
   * DOM element that logs the current progress of the TestRunner; lazily
   * initialized in {@code initResultsSection_}.
   * @type {Element}
   * @private
   */
  this.headerDiv_ = null;

  /**
   * Element in the progress message showing the number of tests that have
   * passed; lazily initialized in {@code initResultsSection_}.
   * @type {Element}
   * @private
   */
  this.numPassedSpan_ = null;

  /**
   * Element in the progress message showing the number of tests that have yet
   * to be executed; lazily initialized in {@code initResultsSection_}.
   * @type {Element}
   * @private
   */
  this.numPendingSpan_ = null;

  this.findTestFunctions_();
  this.initResultsSection_();
};


webdriver.TestRunner.SINGLETON = null;


webdriver.TestRunner.start = function(factoryFn) {
  if (!webdriver.TestRunner.SINGLETON) {
    webdriver.TestRunner.SINGLETON = new webdriver.TestRunner(factoryFn);
    webdriver.TestRunner.SINGLETON.go();
  }
  return webdriver.TestRunner.SINGLETON;
};
goog.exportSymbol('WD_getTestRunner', webdriver.TestRunner.start);


/**
 * Scans this instance's test window for any global test functions and for the
 * setUp and tearDown functions.
 * @private
 */
webdriver.TestRunner.prototype.findTestFunctions_ = function() {
  webdriver.logging.info('Locating test functions');

  var uri = new goog.Uri(this.dom_.getWindow().location.href);
  var testName = uri.getParameterValue('test');
  var matchFn;
  if (testName) {
    webdriver.logging.info('...searching for test matching "' + testName +'"');
    matchFn = function(prop) {
      return testName == prop;
    };
  } else {
    var testRegex = /^test\w+$/;
    webdriver.logging.info('...searching for tests matching ' + testRegex);
    matchFn = function(prop) {
      return testRegex.test(prop);
    };
  }


  // This won't work on IE.  There's a different way of querying for global
  // functions in IE (of course).
  // TODO(jmleyba): Look it up and make it so.
  var win = this.dom_.getWindow();
  for (var prop in win) {
    if (matchFn(prop) && goog.isFunction(win[prop])) {
      this.tests_.push(new webdriver.TestCase(prop, win[prop]));
      if (prop in this.testNames_) {
        webdriver.logging.error('Duplicate test name found: ' + prop);
      } else {
        this.testNames_[prop] = true;
      }
    }
  }
  webdriver.logging.info('...found ' + this.tests_.length + ' test(s)');

  function getGlobal(name) {
    var fn = goog.global[name];
    return goog.isFunction(fn) ? fn : goog.nullFunction;
  }
  this.setUpPageFn_ = getGlobal('setUpPage');
  this.setUpFn_ = getGlobal('setUp');
  this.tearDownFn_ = getGlobal('tearDown');
  this.tearDownPageFn_ = getGlobal('tearDownPage');
};


/**
 * Initializes the result DOM for reporting results at the top of the page.
 * @private
 */
webdriver.TestRunner.prototype.initResultsSection_ = function() {
  this.resultsDiv_ = this.dom_.createDom('DIV');
  var doc = this.dom_.getDocument();
  if (doc.body.firstChild) {
    goog.dom.insertSiblingBefore(this.resultsDiv_, doc.body.firstChild);
  } else {
    goog.dom.appendChild(doc.body, this.resultsDiv_);
  }

  this.headerDiv_ = this.dom_.createDom('DIV');
  goog.style.setStyle(this.headerDiv_, 'fontFamily', 'Courier;');
  goog.style.setStyle(this.headerDiv_, 'fontSize', '10pt;');
  goog.style.setStyle(this.headerDiv_, 'fontWeight', 'bold');
  goog.dom.appendChild(this.resultsDiv_, this.headerDiv_);

  if (this.tests_.length) {
    this.numPassedSpan_ = this.dom_.createDom('SPAN');
    goog.dom.setTextContent(this.numPassedSpan_, '0');
    goog.dom.appendChild(this.headerDiv_, this.numPassedSpan_);
    goog.dom.appendChild(this.headerDiv_,
        this.dom_.createTextNode('/' + this.tests_.length + ' tests passed ('));

    this.numPendingSpan_ = this.dom_.createDom('SPAN');
    goog.dom.setTextContent(this.numPendingSpan_, this.tests_.length);
    goog.dom.appendChild(this.headerDiv_, this.numPendingSpan_);
    goog.dom.appendChild(this.headerDiv_,
        this.dom_.createTextNode(' tests pending)'));
  } else {
    goog.dom.setTextContent(this.headerDiv_, 'No tests to run');
  }
};


/**
 * Reports a result of a test on the page.
 * @private
 */
webdriver.TestRunner.prototype.reportResult_ = function(result, driver) {
  if (driver) {
    driver.dispose();
  }
  this.errorListener_ = null;
  // TODO(jmleyba): Should quit the driver for remote driver instances.

  this.results_.push(result);

  var resultDiv = this.dom_.createDom('DIV');
  goog.style.setStyle(resultDiv, 'fontFamily', 'Courier');
  goog.style.setStyle(resultDiv, 'fontSize', '9pt');
  if (result.passed) {
    goog.dom.appendChild(this.resultsDiv_, resultDiv);
    if (!this.firstPassing_) {
      this.firstPassing_ = resultDiv;
    }
    this.numPassing_ += 1;
    goog.dom.setTextContent(resultDiv, result.testCase.name + ' [PASSED]');
    goog.style.setStyle(resultDiv, 'color', 'green');
  } else {
    if (this.firstPassing_) {
      goog.dom.insertSiblingBefore(resultDiv, this.firstPassing_);
    } else {
      goog.dom.appendChild(this.resultsDiv_, resultDiv);
    }
    goog.dom.setTextContent(resultDiv, result.testCase.name + ' [FAILED]');
    goog.style.setStyle(resultDiv, 'color', 'red');

    var uri = new goog.Uri(this.dom_.getWindow().location.href);
    uri.getQueryData().clear();
    uri.getQueryData().add('test', result.testCase.name);
    var link = this.dom_.createDom('A', {
      'href': uri.toString()
    });
    goog.dom.setTextContent(link, '(run individually)');
    goog.dom.appendChild(resultDiv, link);


    var reason = this.dom_.createDom('DIV');
    goog.style.setStyle(reason, 'color', 'black');
    goog.dom.appendChild(resultDiv, reason);
    reason.innerHTML = webdriver.logging.jsStringToHtml(result.errMsg);
    webdriver.logging.warn(result.errMsg);
  }

  goog.dom.setTextContent(this.numPassedSpan_, this.numPassing_);
  goog.dom.setTextContent(this.numPendingSpan_,
      (this.tests_.length - this.currentTest_ - 1));
  webdriver.logging.info('scheduling next test');
  webdriver.timing.setTimeout(goog.bind(this.executeNextTest_, this), 0);
};


/**
 * Event handler for when a test pauses the command processing.  Adds a button
 * to the DOM that resumes the driver when clicked.
 * @param {goog.event.Event} e The pause event to handle.  The target of this
 *     event will be the paused {@code webdriver.WebDriver} instance.
 * @private
 */
webdriver.TestRunner.prototype.onPause_ = function(e) {
  this.pausedDriver = e.target;
  if (!this.pausedButton_) {
    this.pausedButton_ = this.dom_.createDom('INPUT', {
      type: 'button',
      style: 'margin-left: 10px',
      value: 'Click to resume'
    });
    this.pausedDiv_ = this.dom_.createDom('DIV', null,
        this.dom_.createTextNode('WebDriver paused'),
        this.pausedButton_);
    goog.style.setStyle(this.pausedDiv_, 'width', '100%');
    goog.style.setStyle(this.pausedDiv_, 'backgroundColor', 'yellow');
    goog.style.setStyle(this.pausedDiv_, 'fontFamily', 'Courier;');
    goog.style.setStyle(this.pausedDiv_, 'fontSize', '10pt;');
    goog.style.setStyle(this.pausedDiv_, 'fontWeight', 'bold');
    goog.dom.insertSiblingAfter(this.pausedDiv_, this.headerDiv_);
  }

  goog.style.setStyle(this.pausedDiv_, 'display', 'block');
  this.pausedButton_.disabled = false;
  goog.events.listenOnce(this.pausedButton_, goog.events.EventType.CLICK,
      function() {
        this.pausedButton_.disabled = true;
        goog.style.setStyle(this.pausedDiv_, 'display', 'none');
        this.pausedDriver.resume();
      }, false, this);
};


/**
 * Kicks off the execution of the tests gathered by this instance.  This is a
 * no-op if this instance has already started.
 */
webdriver.TestRunner.prototype.go = function() {
  if (this.started_) {
    return;
  }
  this.started_ = true;
  this.setUpPageFn_();
  this.executeNextTest_();
};


/**
 * @return {boolean} Whether this instance has finished executing tests.
 */
webdriver.TestRunner.prototype.isFinished = function() {
  return this.finished_;
};


/**
 * @return {number} The current number of passing tests executed by this
 *    runner.
 */
webdriver.TestRunner.prototype.getNumPassed = function() {
  return this.numPassing_;
};


/**
 * @return {number} The number of tests executed by this runner.
 */
webdriver.TestRunner.prototype.getNumTests = function() {
  return this.results_.length;
};


/**
 * @return {string} A summary of all tests that have been completed by this
 *     runner.
 */
webdriver.TestRunner.prototype.getReport = function() {
  if (!this.isFinished()) {
    return null;
  }
  return goog.array.map(this.results_, function(result) {
    return result.getSummary();
  }).join('\n') + '\n';
};


/**
 * Executes the next test.
 * @private
 */
webdriver.TestRunner.prototype.executeNextTest_ = function() {
  this.currentTest_ += 1;
  if (this.currentTest_ >= this.tests_.length) {
    webdriver.logging.info('No more tests');
    this.tearDownPageFn_();
    this.finished_ = true;
    return;
  }

  var test = this.tests_[this.currentTest_];
  var result = new webdriver.TestResult(test, true);

  webdriver.logging.info('>>>>>> Starting ' + test.name);

  var driver;
  try {
    driver = this.driverFactoryFn_();
    var driverError = goog.bind(this.handleDriverError_, this, result);
    goog.events.listen(driver,
        webdriver.WebDriver.EventType.ERROR, driverError);

    driver.newSession(true);
    webdriver.timing.setTimeout(
        goog.bind(this.setUp_, this, result, driver), 0);
  } catch (ex) {
    result.passed = false;
    result.errMsg = ex.message + (ex.stack ? ('\n' + ex.stack) : '');
    this.reportResult_(result, driver);
  }
};


/**
 * Internal method for collecting and executing driver commands before calling
 * the next test phase.
 * @param {webdriver.TestResult} result Result object for the current test.
 * @param {webdriver.WebDriver} driver The WebDriver instance to pass to the
 *     test function.
 * @param {function} commandFn The function to collect driver commands from.
 *     The function should take a single {@code webdriver.WebDriver} argument.
 * @param {function} nextPhase The next phase in the test (e.g. setUp, test,
 *     tearDown).
 * @private
 */
webdriver.TestRunner.prototype.collectAndRunDriverCommands_ = function(
    result, driver, commandFn, nextPhase) {
  try {
    commandFn.apply(result.testCase, [driver]);
    driver.callFunction(nextPhase, this, result, driver);
  } catch (ex) {
    result.passed = false;
    result.errMsg = ex.message + (ex.stack ? ('\n' + ex.stack) : '');
    this.reportResult_(result, driver);
  }
};


/**
 * Executes {@code setUp} if one was found in the global scope.
 * @param {webdriver.TestResult} result Result object for the current test.
 * @param {webdriver.WebDriver} driver The WebDriver instance to pass to the
 *     test function.
 * @private
 */
webdriver.TestRunner.prototype.setUp_ = function(result, driver) {
  this.collectAndRunDriverCommands_(
      result, driver, this.setUpFn_, this.runTest_);
};


/**
 * Executes a test function.
 * @param {webdriver.TestResult} result Result object for the current test.
 * @param {webdriver.WebDriver} driver The WebDriver instance to pass to the
 *     test function.
 * @private
 */
webdriver.TestRunner.prototype.runTest_ = function(result, driver) {
  this.collectAndRunDriverCommands_(
      result, driver, result.testCase.testFn, this.tearDown_);
};


/**
 * Executes {@code tearDown} if one was found in the global scope.
 * @param {webdriver.TestResult} result Result object for the current test.
 * @param {webdriver.WebDriver} driver The WebDriver instance to pass to the
 *     test function.
 * @private
 */
webdriver.TestRunner.prototype.tearDown_ = function(result, driver) {
  this.collectAndRunDriverCommands_(
      result, driver, this.tearDownFn_, this.reportResult_);
};


/**
 * Event handler that fails the current test if {@code webdriver.WebDriver}
 * dispatches an {@code webdriver.WebDriver.EventType.ERROR} event.
 * @param {webdriver.TestResult} result Result object for the current test.
 * @param {goog.events.Event} e The error event whose target should be a
 *     {@code webdriver.WebDriver} instance.
 * @private
 */
webdriver.TestRunner.prototype.handleDriverError_ = function(result, e) {
  result.passed = false;
  var failingCommand = e.target.getPendingCommand();
  var response = failingCommand ? failingCommand.response : null;
  if (response) {
    result.errMsg = response.getErrorMessage();
  } else {
    // Should never happen, but just in case.
    result.errMsg = 'Unknown error!';
  }
  this.reportResult_(result, e.target);
};

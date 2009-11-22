// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Helper class to allow for expected unit test failures.
 *
 */

goog.provide('goog.testing.ExpectedFailures');

goog.require('goog.debug.DivConsole');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.style');
goog.require('goog.testing.JsUnitException');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.asserts');


/**
 * Helper class for allowing some unit tests to fail, particularly designed to
 * mark tests that should be fixed on a given browser.
 *
 * <pre>
 * var expectedFailures = new goog.testing.ExpectedFailures();
 *
 * function tearDown() {
 *   expectedFailures.handleTearDown();
 * }
 *
 * function testSomethingThatBreaksInWebKit() {
 *   expectedFailures.expectFailureFor(goog.userAgent.WEBKIT);
 *
 *   try {
 *     ...
 *     assert(somethingThatFailsInWebKit);
 *     ...
 *   } catch (e) {
 *     expectedFailures.handleException(e);
 *   }
 * }
 * </pre>
 *
 * @constructor
 */
goog.testing.ExpectedFailures = function() {
  goog.testing.ExpectedFailures.setUpConsole_();
  this.reset_();
};


/**
 * The lazily created debugging console.
 * @type {goog.debug.DivConsole?}
 * @private
 */
goog.testing.ExpectedFailures.console_ = null;


/**
 * Logger for the expected failures.
 * @type {goog.debug.Logger}
 * @private
 */
goog.testing.ExpectedFailures.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.testing.ExpectedFailures');


/**
 * Whether or not we are expecting failure.
 * @type {boolean}
 * @private
 */
goog.testing.ExpectedFailures.prototype.expectingFailure_;


/**
 * The string to emit upon an expected failure.
 * @type {string}
 * @private
 */
goog.testing.ExpectedFailures.prototype.failureMessage_;


/**
 * An array of suppressed failures.
 * @type {Array}
 * @private
 */
goog.testing.ExpectedFailures.prototype.suppressedFailures_;


/**
 * Sets up the debug console, if it isn't already set up.
 * @private
 */
goog.testing.ExpectedFailures.setUpConsole_ = function() {
  if (!goog.testing.ExpectedFailures.console_) {
    var xButton = goog.dom.createDom(goog.dom.TagName.DIV, {
        'style': 'position: absolute; border-left:1px solid #333;' +
                 'border-bottom:1px solid #333; right: 0; top: 0; width: 1em;' +
                 'height: 1em; cursor: pointer; background-color: #cde;' +
                 'text-align: center; color: black'
    }, 'X');
    var div = goog.dom.createDom(goog.dom.TagName.DIV, {
      'style': 'position: absolute; border: 1px solid #333; right: 10px;' +
               'top : 10px; width: 400px; display: none'
    }, xButton);
    document.body.appendChild(div);
    goog.events.listen(xButton, goog.events.EventType.CLICK, function() {
      goog.style.showElement(div, false);
    });

    goog.testing.ExpectedFailures.console_ = new goog.debug.DivConsole(div);
    goog.testing.ExpectedFailures.prototype.logger_.addHandler(
        goog.bind(goog.style.showElement, null, div, true));
    goog.testing.ExpectedFailures.prototype.logger_.addHandler(
        goog.bind(goog.testing.ExpectedFailures.console_.addLogRecord,
            goog.testing.ExpectedFailures.console_));
  }
};


/**
 * Register to expect failure for the given condition.  Multiple calls to this
 * function act as a boolean OR.  The first applicable message will be used.
 * @param {boolean} condition Whether to expect failure.
 * @param {string} opt_message Descriptive message of this expected failure.
 */
goog.testing.ExpectedFailures.prototype.expectFailureFor = function(
    condition, opt_message) {
  this.expectingFailure_ = this.expectingFailure_ || condition;
  if (condition) {
    this.failureMessage_ = this.failureMessage_ || opt_message || '';
  }
};


/**
 * Determines if the given exception was expected.
 * @param {Object} ex The exception to check.
 * @return {boolean} Whether the exception was expected.
 */
goog.testing.ExpectedFailures.prototype.isExceptionExpected = function(ex) {
  return this.expectingFailure_ && ex instanceof goog.testing.JsUnitException;
};


/**
 * Handle an exception, suppressing it if it is a unit test failure that we
 * expected.
 * @param {Object} ex The exception to handle.
 */
goog.testing.ExpectedFailures.prototype.handleException = function(ex) {
  if (this.isExceptionExpected(ex)) {
    this.logger_.info('Suppressing test failure in ' +
        goog.testing.TestCase.currentTestName + ':' +
        (this.failureMessage_ ? '\n(' + this.failureMessage_ + ')' : ''),
        ex);
    this.suppressedFailures_.push(ex);
    return;
  }

  // Rethrow the exception if we weren't expecting it or if it is a normal
  // exception.
  throw ex;
};


/**
 * Run the given function, catching any expected failures.
 * @param {Function} func The function to run.
 * @param {boolean} opt_lenient Whether to ignore if the expected failures
 *     didn't occur.  In this case a warning will be logged in handleTearDown.
 */
goog.testing.ExpectedFailures.prototype.run = function(func, opt_lenient) {
  try {
    func();
  } catch (ex) {
    this.handleException(ex);
  }

  if (!opt_lenient && this.expectingFailure_ &&
      !this.suppressedFailures_.length) {
    fail(this.getExpectationMessage_());
  }
};


/**
 * @return {string} A warning describing an expected failure that didn't occur.
 * @private
 */
goog.testing.ExpectedFailures.prototype.getExpectationMessage_ = function() {
  return 'Expected a test failure in \'' +
         goog.testing.TestCase.currentTestName + '\' but the test passed.';
};


/**
 * Handle the tearDown phase of a test, alerting the user if an expected test
 * was not suppressed.
 */
goog.testing.ExpectedFailures.prototype.handleTearDown = function() {
  if (this.expectingFailure_ && !this.suppressedFailures_.length) {
    this.logger_.warning(this.getExpectationMessage_());
  }
  this.reset_();
};


/**
 * Reset internal state.
 * @private
 */
goog.testing.ExpectedFailures.prototype.reset_ = function() {
  this.expectingFailure_ = false;
  this.failureMessage_ = '';
  this.suppressedFailures_ = [];
};

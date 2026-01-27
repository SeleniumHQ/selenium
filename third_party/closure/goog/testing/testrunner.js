/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The test runner is a singleton object that is used to execute
 * a goog.testing.TestCases, display the results, and expose the results to
 * Selenium for automation.  If a TestCase hasn't been registered with the
 * runner by the time window.onload occurs, the testRunner will try to auto-
 * discover JsUnit style test pages.
 *
 * The hooks for selenium are (see http://go/selenium-hook-setup):-
 *  - Boolean G_testRunner.isFinished()
 *  - Boolean G_testRunner.isSuccess()
 *  - String G_testRunner.getReport()
 *  - number G_testRunner.getRunTime()
 *  - Object<string, Array<string>> G_testRunner.getTestResults()
 *
 * Testing code should not have dependencies outside of goog.testing so as to
 * reduce the chance of masking missing dependencies.
 */

goog.setTestOnly('goog.testing.TestRunner');
goog.provide('goog.testing.TestRunner');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.json');
goog.require('goog.testing.TestCase');



/**
 * Construct a test runner.
 *
 * NOTE(user): This is currently pretty weird, I'm essentially trying to
 * create a wrapper that the Selenium test can hook into to query the state of
 * the running test case, while making goog.testing.TestCase general.
 *
 * @constructor
 */
goog.testing.TestRunner = function() {
  'use strict';
  /**
   * Errors that occurred in the window.
   * @type {!Array<string>}
   */
  this.errors = [];

  /**
   * Reference to the active test case.
   * @type {?goog.testing.TestCase}
   */
  this.testCase = null;

  /**
   * Whether the test runner has been initialized yet.
   * @type {boolean}
   */
  this.initialized = false;

  /**
   * Element created in the document to add test results to.
   * @private {?Element}
   */
  this.logEl_ = null;

  /**
   * Function to use when filtering errors.
   * @private {(function(string))?}
   */
  this.errorFilter_ = null;

  /**
   * Whether an empty test case counts as an error.
   * @private {boolean}
   */
  this.strict_ = true;

  /**
   * Store the serializer to avoid it being overwritten by a mock.
   * @private {function(!Object): string}
   */
  this.jsonStringify_ = goog.json.serialize;

  /**
   * An id unique to this runner. Checked by the server during polling to
   * verify that the page was not reloaded.
   * @private {string}
   */
  this.uniqueId_ = ((Math.random() * 1e9) >>> 0) + '-' +
      window.location.pathname.replace(/.*\//, '').replace(/\.html.*$/, '');

  var self = this;
  function onPageHide() {
    self.clearUniqueId();
  }
  window.addEventListener('pagehide', onPageHide);
};

/**
 * The uuid is embedded in the URL search. This function allows us to mock
 * the search in the test.
 * @return {string}
 */
goog.testing.TestRunner.prototype.getSearchString = function() {
  'use strict';
  return window.location.search;
};

/**
 * Returns the unique id for this test page.
 * @return {string}
 */
goog.testing.TestRunner.prototype.getUniqueId = function() {
  'use strict';
  return this.uniqueId_;
};

/**
 * Clears the unique id for this page. The value will hint the reason.
 */
goog.testing.TestRunner.prototype.clearUniqueId = function() {
  'use strict';
  this.uniqueId_ = 'pagehide';
};

/**
 * Initializes the test runner.
 * @param {goog.testing.TestCase} testCase The test case to initialize with.
 */
goog.testing.TestRunner.prototype.initialize = function(testCase) {
  'use strict';
  if (this.testCase && this.testCase.running) {
    throw new Error(
        'The test runner is already waiting for a test to complete');
  }
  this.testCase = testCase;
  this.initialized = true;
};


/**
 * By default, the test runner is strict, and fails if it runs an empty
 * test case.
 * @param {boolean} strict Whether the test runner should fail on an empty
 *     test case.
 */
goog.testing.TestRunner.prototype.setStrict = function(strict) {
  'use strict';
  this.strict_ = strict;
};


/**
 * @return {boolean} Whether the test runner should fail on an empty
 *     test case.
 */
goog.testing.TestRunner.prototype.isStrict = function() {
  'use strict';
  return this.strict_;
};


/**
 * Returns true if the test runner is initialized.
 * Used by Selenium Hooks.
 * @return {boolean} Whether the test runner is active.
 */
goog.testing.TestRunner.prototype.isInitialized = function() {
  'use strict';
  return this.initialized;
};


/**
 * Returns false if the test runner has not finished successfully.
 * Used by Selenium Hooks.
 * @return {boolean} Whether the test runner is not active.
 */
goog.testing.TestRunner.prototype.isFinished = function() {
  'use strict';
  return this.errors.length > 0 || this.isComplete();
};


/**
 * Returns true if the test runner is finished.
 * @return {boolean} True if the test runner started and subsequently completed.
 */
goog.testing.TestRunner.prototype.isComplete = function() {
  'use strict';
  return this.initialized && !!this.testCase && this.testCase.started &&
      !this.testCase.running;
};

/**
 * Returns true if the test case didn't fail.
 * Used by Selenium Hooks.
 * @return {boolean} Whether the current test returned successfully.
 */
goog.testing.TestRunner.prototype.isSuccess = function() {
  'use strict';
  return !this.hasErrors() && !!this.testCase && this.testCase.isSuccess();
};


/**
 * Returns true if the test case runner has errors that were caught outside of
 * the test case.
 * @return {boolean} Whether there were JS errors.
 */
goog.testing.TestRunner.prototype.hasErrors = function() {
  'use strict';
  return this.errors.length > 0;
};


/**
 * Logs an error that occurred.  Used in the case of environment setting up
 * an onerror handler.
 * @param {string} msg Error message.
 */
goog.testing.TestRunner.prototype.logError = function(msg) {
  'use strict';
  if (this.isComplete()) {
    // Once the user has checked their code, subsequent errors can occur
    // because of tearDown actions. For now, log these but do not fail the test.
    this.log('Error after test completed: ' + msg);
    return;
  }
  if (!this.errorFilter_ || this.errorFilter_.call(null, msg)) {
    this.errors.push(msg);
  }
};


/**
 * Log failure in current running test.
 * @param {Error} ex Exception.
 */
goog.testing.TestRunner.prototype.logTestFailure = function(ex) {
  'use strict';
  var testName = /** @type {string} */ (goog.testing.TestCase.currentTestName);
  if (this.testCase) {
    this.testCase.logError(testName, ex);
  } else {
    // NOTE: Do not forget to log the original exception raised.
    throw new Error(
        'Test runner not initialized with a test case. Original ' +
        'exception: ' + ex.message);
  }
};


/**
 * Sets a function to use as a filter for errors.
 * @param {function(string)} fn Filter function.
 */
goog.testing.TestRunner.prototype.setErrorFilter = function(fn) {
  'use strict';
  this.errorFilter_ = fn;
};


/**
 * Returns a report of the test case that ran.
 * Used by Selenium Hooks.
 * @param {boolean=} opt_verbose If true results will include data about all
 *     tests, not just what failed.
 * @return {string} A report summary of the test.
 */
goog.testing.TestRunner.prototype.getReport = function(opt_verbose) {
  'use strict';
  var report = [];
  if (this.testCase) {
    report.push(this.testCase.getReport(opt_verbose));
  }
  if (this.errors.length > 0) {
    report.push('JavaScript errors detected by test runner:');
    report.push.apply(report, this.errors);
    report.push('\n');
  }
  return report.join('\n');
};


/**
 * Returns the amount of time it took for the test to run.
 * Used by Selenium Hooks.
 * @return {number} The run time, in milliseconds.
 */
goog.testing.TestRunner.prototype.getRunTime = function() {
  'use strict';
  return this.testCase ? this.testCase.getRunTime() : 0;
};


/**
 * Returns the number of script files that were loaded in order to run the test.
 * @return {number} The number of script files.
 */
goog.testing.TestRunner.prototype.getNumFilesLoaded = function() {
  'use strict';
  return this.testCase ? this.testCase.getNumFilesLoaded() : 0;
};


/**
 * Executes a test case and prints the results to the window.
 */
goog.testing.TestRunner.prototype.execute = function() {
  'use strict';
  if (!this.testCase) {
    throw new Error(
        'The test runner must be initialized with a test case ' +
        'before execute can be called.');
  }

  if (this.strict_ && this.testCase.getCount() == 0) {
    throw new Error(
        'No tests found in given test case: ' + this.testCase.getName() + '. ' +
        'By default, the test runner fails if a test case has no tests. ' +
        'To modify this behavior, see goog.testing.TestRunner\'s ' +
        'setStrict() method, or G_testRunner.setStrict()');
  }

  this.testCase.addCompletedCallback(goog.bind(this.onComplete_, this));
  if (goog.testing.TestRunner.shouldUsePromises_(this.testCase)) {
    this.testCase.runTestsReturningPromise();
  } else {
    this.testCase.runTests();
  }
};


/**
 * @param {!goog.testing.TestCase} testCase
 * @return {boolean}
 * @private
 */
goog.testing.TestRunner.shouldUsePromises_ = function(testCase) {
  'use strict';
  return testCase.constructor === goog.testing.TestCase;
};


/** @const {string} The ID of the element to log output to. */
goog.testing.TestRunner.TEST_LOG_ID = 'closureTestRunnerLog';


/**
 * Writes the results to the document when the test case completes.
 * @private
 */
goog.testing.TestRunner.prototype.onComplete_ = function() {
  'use strict';
  var log = this.testCase.getReport(true);
  if (this.errors.length > 0) {
    log += '\n' + this.errors.join('\n');
  }

  if (!this.logEl_) {
    var el = document.getElementById(goog.testing.TestRunner.TEST_LOG_ID);
    if (el == null) {
      el = goog.dom.createElement(goog.dom.TagName.DIV);
      el.id = goog.testing.TestRunner.TEST_LOG_ID;
      el.dir = 'ltr';
      document.body.appendChild(el);
    }
    this.logEl_ = el;
  }

  // Highlight the page to indicate the overall outcome.
  this.writeLog(log);

  // TODO(chrishenry): Make this work with multiple test cases (b/8603638).
  var runAgainLink = goog.dom.createElement(goog.dom.TagName.A);
  runAgainLink.style.display = 'inline-block';
  runAgainLink.style.fontSize = 'small';
  runAgainLink.style.marginBottom = '16px';
  runAgainLink.href = '';
  runAgainLink.onclick = goog.bind(function() {
    'use strict';
    this.execute();
    return false;
  }, this);
  runAgainLink.textContent = 'Run again without reloading';
  this.logEl_.appendChild(runAgainLink);
};


/**
 * Writes a nicely formatted log out to the document.
 * @param {string} log The string to write.
 */
goog.testing.TestRunner.prototype.writeLog = function(log) {
  'use strict';
  var lines = log.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var color;
    var isPassed = /PASSED/.test(line);
    var isSkipped = /SKIPPED/.test(line);
    var isFailOrError =
        /FAILED/.test(line) || /ERROR/.test(line) || /NO TESTS RUN/.test(line);
    if (isPassed) {
      color = 'darkgreen';
    } else if (isSkipped) {
      color = 'slategray';
    } else if (isFailOrError) {
      color = 'darkred';
    } else {
      color = '#333';
    }
    var div = goog.dom.createElement(goog.dom.TagName.DIV);
    // Empty divs don't take up any space, use \n to take up space and preserve
    // newlines when copying the logs.
    if (line == '') {
      line = '\n';
    }
    if (line.slice(0, 2) == '> ') {
      // The stack trace may contain links so it has to be interpreted as HTML.
      div.innerHTML = line;
    } else {
      div.appendChild(document.createTextNode(line));
    }

    // Example line we are parsing the test name from:
    // 16:07:49.317  testSomething : PASSED
    var testNameMatch = /\S+\s+(test.*)\s+: (FAILED|ERROR|PASSED)/.exec(line);
    if (testNameMatch) {
      // Build a URL to run the test individually.  If this test was already
      // part of another subset test, we need to overwrite the old runTests
      // query parameter.  We also need to do this without bringing in any
      // extra dependencies, otherwise we could mask missing dependency bugs.
      // We manually encode commas because they are also used to separate test
      // names.
      var newSearch = 'runTests=' +
          encodeURIComponent(testNameMatch[1].replace(/,/g, '%2C'));
      var search = window.location.search;
      if (search) {
        var oldTests = /runTests=([^&]*)/.exec(search);
        if (oldTests) {
          newSearch = search.slice(0, oldTests.index) + newSearch +
              search.slice(oldTests.index + oldTests[0].length);
        } else {
          newSearch = search + '&' + newSearch;
        }
      } else {
        newSearch = '?' + newSearch;
      }
      var href = window.location.href;
      var hash = window.location.hash;
      if (hash && hash.charAt(0) != '#') {
        hash = '#' + hash;
      }
      href = href.split('#')[0].split('?')[0] + newSearch + hash;

      // Add the link.
      var a = goog.dom.createElement(goog.dom.TagName.A);
      a.textContent = '(run individually)';
      a.style.fontSize = '0.8em';
      a.style.color = '#888';
      goog.dom.safe.setAnchorHref(a, href);
      div.appendChild(document.createTextNode(' '));
      div.appendChild(a);
    }

    div.style.color = color;
    div.style.font = 'normal 100% monospace';
    div.style.wordWrap = 'break-word';
    if (i == 0) {
      // Highlight the first line as a header that indicates the test outcome.
      div.style.padding = '20px';
      div.style.marginBottom = '10px';
      if (isPassed) {
        div.style.border = '1px solid ' + color;
        div.style.backgroundColor = '#eeffee';
      } else if (isFailOrError) {
        div.style.border = '5px solid ' + color;
        div.style.backgroundColor = '#ffeeee';
      } else {
        div.style.border = '1px solid black';
        div.style.backgroundColor = '#eeeeee';
      }
    }

    try {
      div.style.whiteSpace = 'pre-wrap';
    } catch (e) {
      // NOTE(brenneman): IE raises an exception when assigning to pre-wrap.
      // Thankfully, it doesn't collapse whitespace when using monospace fonts,
      // so it will display correctly if we ignore the exception.
    }

    if (i < 2) {
      div.style.fontWeight = 'bold';
    }
    this.logEl_.appendChild(div);
  }
};


/**
 * Logs a message to the current test case.
 * @param {string} s The text to output to the log.
 */
goog.testing.TestRunner.prototype.log = function(s) {
  'use strict';
  if (this.testCase) {
    this.testCase.log(s);
  }
};


// TODO(nnaze): Properly handle serving test results when multiple test cases
// are run.
/**
 * @return {Object<string, !Array<!goog.testing.TestCase.IResult>>} A map of
 * test names to a list of test failures (if any) to provide formatted data
 * for the test runner.
 */
goog.testing.TestRunner.prototype.getTestResults = function() {
  'use strict';
  if (this.testCase) {
    return this.testCase.getTestResults();
  }
  return null;
};


/**
 * Returns the test results as json.
 * This is called by the testing infrastructure through G_testrunner.
 * @return {?string} Tests results object.
 */
goog.testing.TestRunner.prototype.getTestResultsAsJson = function() {
  'use strict';
  if (this.testCase) {
    var testCaseResults
        /** {Object<string, !Array<!goog.testing.TestCase.IResult>>} */
        = this.testCase.getTestResults();
    if (this.hasErrors()) {
      var globalErrors = [];
      for (var i = 0; i < this.errors.length; i++) {
        globalErrors.push(
            {source: '', message: this.errors[i], stacktrace: ''});
      }
      // We are writing on our testCase results, but the test is over.
      testCaseResults['globalErrors'] = globalErrors;
    }
    return this.jsonStringify_(testCaseResults);
  }
  return null;
};

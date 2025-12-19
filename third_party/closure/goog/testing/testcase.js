// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A class representing a set of test functions to be run.
 *
 * Testing code should not have dependencies outside of goog.testing so as to
 * reduce the chance of masking missing dependencies.
 *
 * This file does not compile correctly with --collapse_properties. Use
 * --property_renaming=ALL_UNQUOTED instead.
 */

goog.setTestOnly('goog.testing.TestCase');
goog.provide('goog.testing.TestCase');
goog.provide('goog.testing.TestCase.Error');
goog.provide('goog.testing.TestCase.Order');
goog.provide('goog.testing.TestCase.Result');
goog.provide('goog.testing.TestCase.Test');


goog.require('goog.Promise');
goog.require('goog.Thenable');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.object');
goog.require('goog.testing.JsUnitException');
goog.require('goog.testing.asserts');



/**
 * A class representing a JsUnit test case. A TestCase is made up of a number
 * of test functions which can be run. Individual test cases can override the
 * following functions to set up their test environment:
 *   - runTests - completely override the test's runner
 *   - setUpPage - called before any of the test functions are run
 *   - tearDownPage - called after all tests are finished
 *   - setUp - called before each of the test functions
 *   - tearDown - called after each of the test functions
 *   - shouldRunTests - called before a test run, all tests are skipped if it
 *                      returns false. Can be used to disable tests on browsers
 *                      where they aren't expected to pass.
 * <p>
 * TestCase objects are usually constructed by inspecting the global environment
 * to discover functions that begin with the prefix <code>test</code>.
 * (See {@link #autoDiscoverLifecycle} and {@link #autoDiscoverTests}.)
 * </p>
 *
 * <h2>Testing asychronous code with promises</h2>
 *
 * <p>
 * In the simplest cases, the behavior that the developer wants to test
 * is synchronous, and the test functions exercising the behavior execute
 * synchronously. But TestCase can also be used to exercise asynchronous code
 * through the use of <a
 * href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">
 * promises</a>. If a test function returns an object that has a
 * <code>then</code> method defined on it, the test framework switches to an
 * asynchronous execution strategy: the next test function will not begin
 * execution until the returned promise is resolved or rejected. Instead of
 * writing test assertions at the top level inside a test function, the test
 * author chains them on the end of the returned promise. For example:
 * </p>
 * <pre>
 *   function testPromiseBasedAPI() {
 *     return promiseBasedAPI().then(function(value) {
 *       // Will run when the promise resolves, and before the next
 *       // test function begins execution.
 *       assertEquals('foo', value.bar);
 *     });
 *   }
 * </pre>
 * <p>
 * Synchronous and asynchronous tests can be mixed in the same TestCase.
 * Test functions that return an object with a <code>then</code> method are
 * executed asynchronously, and all other test functions are executed
 * synchronously. While this is convenient for test authors (since it doesn't
 * require any explicit configuration for asynchronous tests), it can lead to
 * confusion if the test author forgets to return the promise from the test
 * function. For example:
 * </p>
 * <pre>
 *   function testPromiseBasedAPI() {
 *     // This test should never succeed.
 *     promiseBasedAPI().then(fail, fail);
 *     // Oops! The promise isn't returned to the framework,
 *     // so this test actually does succeed.
 *   }
 * </pre>
 * <p>
 * Since the test framework knows nothing about the promise created
 * in the test function, it will run the function synchronously, record
 * a success, and proceed immediately to the next test function.
 * </p>
 * <p>
 * Promises returned from test functions can time out. If a returned promise
 * is not resolved or rejected within {@link promiseTimeout} milliseconds,
 * the test framework rejects the promise without a timeout error message.
 * Test cases can configure the value of `promiseTimeout` by setting
 * <pre>
 *   goog.testing.TestCase.getActiveTestCase().promiseTimeout = ...
 * </pre>
 * in their `setUpPage` methods.
 * </p>
 *
 * @param {string=} opt_name The name of the test case, defaults to
 *     'Untitled Test Case'.
 * @constructor
 */
goog.testing.TestCase = function(opt_name) {
  /**
   * A name for the test case.
   * @type {string}
   * @private
   */
  this.name_ = opt_name || 'Untitled Test Case';

  /**
   * If the test should be auto discovered via {@link #autoDiscoverTests} when
   * test case is initialized.
   * @type {boolean}
   * @private
   */
  this.shouldAutoDiscoverTests_ = true;

  /**
   * Array of test functions that can be executed.
   * @type {!Array<!goog.testing.TestCase.Test>}
   * @private
   */
  this.tests_ = [];

  /**
   * Set of test names and/or indices to execute, or null if all tests should
   * be executed.
   *
   * Indices are included to allow automation tools to run a subset of the
   * tests without knowing the exact contents of the test file.
   *
   * Indices should only be used with SORTED ordering.
   *
   * Example valid values:
   * <ul>
   * <li>[testName]
   * <li>[testName1, testName2]
   * <li>[2] - will run the 3rd test in the order specified
   * <li>[1,3,5]
   * <li>[testName1, testName2, 3, 5] - will work
   * <ul>
   * @type {?Object}
   * @private
   */
  this.testsToRun_ = null;

  /**
   * A call back for each test.
   * @private {?function(?goog.testing.TestCase.Test, !Array<string>)}
   */
  this.testDone_ = null;

  /**
   * The order to run the auto-discovered tests in.
   * @type {string}
   */
  this.order = goog.testing.TestCase.Order.SORTED;

  /** @private {function(!goog.testing.TestCase.Result)} */
  this.runNextTestCallback_ = goog.nullFunction;

  /**
   * The currently executing test case or null.
   * @private {?goog.testing.TestCase.Test}
   */
  this.curTest_ = null;

  /**
   * Object used to encapsulate the test results.
   * @type {!goog.testing.TestCase.Result}
   * @protected
   * @suppress {underscore|visibility}
   */
  this.result_ = new goog.testing.TestCase.Result(this);

  /**
   * An array of exceptions generated by `assert` statements.
   * @private {!Array<!goog.testing.JsUnitException>}
   */
  this.thrownAssertionExceptions_ = [];

  /**
   * The maximum time in milliseconds a promise returned from a test function
   * may remain pending before the test fails due to timeout.
   * @type {number}
   */
  this.promiseTimeout = 1000;  // 1s

  /**
   * Callbacks that will be executed when the test has finalized.
   * @private {!Array<function()>}
   */
  this.onCompletedCallbacks_ = [];

  /** @type {number|undefined} */
  this.endTime_;

  /** @private {number} */
  this.testsRanSoFar_ = 0;
};


/**
 * The order to run the auto-discovered tests.
 * @enum {string}
 */
goog.testing.TestCase.Order = {
  /**
   * This is browser dependent and known to be different in FF and Safari
   * compared to others.
   */
  NATURAL: 'natural',

  /** Random order. */
  RANDOM: 'random',

  /** Sorted based on the name. */
  SORTED: 'sorted'
};


/**
 * @return {string} The name of the test.
 */
goog.testing.TestCase.prototype.getName = function() {
  return this.name_;
};

/**
 * Returns the current test or null.
 * @return {?goog.testing.TestCase.Test}
 * @protected
 */
goog.testing.TestCase.prototype.getCurrentTest = function() {
  return this.curTest_;
};

/**
 * The maximum amount of time in milliseconds that the test case can take
 * before it is forced to yield and reschedule. This prevents the test runner
 * from blocking the browser and potentially hurting the test harness.
 * @type {number}
 */
goog.testing.TestCase.maxRunTime = 200;


/**
 * Save a reference to `window.setTimeout`, so any code that overrides the
 * default behavior (the MockClock, for example) doesn't affect our runner.
 * @type {function((Function|string), number=, *=): number}
 * @private
 */
goog.testing.TestCase.protectedSetTimeout_ = goog.global.setTimeout;


/**
 * Save a reference to `window.clearTimeout`, so any code that overrides
 * the default behavior (e.g. MockClock) doesn't affect our runner.
 * @type {function((null|number|undefined)): void}
 * @private
 */
goog.testing.TestCase.protectedClearTimeout_ = goog.global.clearTimeout;


/**
 * Save a reference to `window.Date`, so any code that overrides
 * the default behavior doesn't affect our runner.
 * @type {function(new: Date)}
 * @private
 */
goog.testing.TestCase.protectedDate_ = Date;

/**
 * Save a reference to `window.performance`, so any code that overrides
 * the default behavior doesn't affect our runner.
 * @type {?Performance}
 * @private
 */
goog.testing.TestCase.protectedPerformance_ = typeof window !== 'undefined' &&
        window.performance && window.performance.now ?
    performance :
    null;


/**
 * Name of the current test that is running, or null if none is running.
 * @type {?string}
 */
goog.testing.TestCase.currentTestName = null;


/**
 * Avoid a dependency on goog.userAgent and keep our own reference of whether
 * the browser is IE.
 * @type {boolean}
 */
goog.testing.TestCase.IS_IE = typeof opera == 'undefined' &&
    !!goog.global.navigator &&
    goog.global.navigator.userAgent.indexOf('MSIE') != -1;


/**
 * Exception object that was detected before a test runs.
 * @type {*}
 * @protected
 */
goog.testing.TestCase.prototype.exceptionBeforeTest;


/**
 * Whether the test case has ever tried to execute.
 * @type {boolean}
 */
goog.testing.TestCase.prototype.started = false;


/**
 * Whether the test case is running.
 * @type {boolean}
 */
goog.testing.TestCase.prototype.running = false;


/**
 * Timestamp for when the test was started.
 * @type {number}
 * @private
 */
goog.testing.TestCase.prototype.startTime_ = 0;


/**
 * Time since the last batch of tests was started, if batchTime exceeds
 * {@link #maxRunTime} a timeout will be used to stop the tests blocking the
 * browser and a new batch will be started.
 * @type {number}
 * @private
 */
goog.testing.TestCase.prototype.batchTime_ = 0;


/**
 * Pointer to the current test.
 * @type {number}
 * @private
 */
goog.testing.TestCase.prototype.currentTestPointer_ = 0;


/**
 * Adds a new test to the test case.
 * @param {!goog.testing.TestCase.Test} test The test to add.
 */
goog.testing.TestCase.prototype.add = function(test) {
  goog.asserts.assert(test);
  if (this.started) {
    throw new Error(
        'Tests cannot be added after execute() has been called. ' +
        'Test: ' + test.name);
  }

  this.tests_.push(test);
};


/**
 * Creates and adds a new test.
 *
 * Convenience function to make syntax less awkward when not using automatic
 * test discovery.
 *
 * @param {string} name The test name.
 * @param {function()} ref Reference to the test function.
 * @param {!Object=} scope Optional scope that the test function should be
 *     called in.
 * @param {!Array<!Object>=} objChain An array of Objects that may have
 *     additional set up/tear down logic for a particular test.
 */
goog.testing.TestCase.prototype.addNewTest = function(
    name, ref, scope, objChain) {
  this.add(this.createTest(name, ref, scope || this, objChain));
};


/**
 * Sets the tests.
 * @param {!Array<goog.testing.TestCase.Test>} tests A new test array.
 * @protected
 */
goog.testing.TestCase.prototype.setTests = function(tests) {
  this.tests_ = tests;
};


/**
 * Gets the tests.
 * @return {!Array<goog.testing.TestCase.Test>} The test array.
 */
goog.testing.TestCase.prototype.getTests = function() {
  return this.tests_;
};


/**
 * Returns the number of tests contained in the test case.
 * @return {number} The number of tests.
 */
goog.testing.TestCase.prototype.getCount = function() {
  return this.tests_.length;
};


/**
 * Returns the number of tests actually run in the test case, i.e. subtracting
 * any which are skipped.
 * @return {number} The number of un-ignored tests.
 */
goog.testing.TestCase.prototype.getActuallyRunCount = function() {
  return this.testsToRun_ ? goog.object.getCount(this.testsToRun_) : 0;
};


/**
 * Returns the current test and increments the pointer.
 * @return {goog.testing.TestCase.Test} The current test case.
 */
goog.testing.TestCase.prototype.next = function() {
  var test;
  while ((test = this.tests_[this.currentTestPointer_++])) {
    if (!this.testsToRun_ || this.testsToRun_[test.name] ||
        this.testsToRun_[this.currentTestPointer_ - 1]) {
      return test;
    }
  }
  return null;
};


/**
 * Resets the test case pointer, so that next returns the first test.
 */
goog.testing.TestCase.prototype.reset = function() {
  this.currentTestPointer_ = 0;
  this.result_ = new goog.testing.TestCase.Result(this);
};


/**
 * Adds a callback function that should be executed when the tests have
 * completed.
 * @param {function()} fn The callback function.
 */
goog.testing.TestCase.prototype.addCompletedCallback = function(fn) {
  this.onCompletedCallbacks_.push(fn);
};


/**
 * @param {goog.testing.TestCase.Order} order The sort order for running tests.
 */
goog.testing.TestCase.prototype.setOrder = function(order) {
  this.order = order;
};


/**
 * @param {Object<string, boolean>} testsToRun Set of tests to run. Entries in
 *     the set may be test names, like "testFoo", or numeric indices. Only
 *     tests identified by name or by index will be executed.
 */
goog.testing.TestCase.prototype.setTestsToRun = function(testsToRun) {
  this.testsToRun_ = testsToRun;
};


/**
 * Can be overridden in test classes to indicate whether the tests in a case
 * should be run in that particular situation.  For example, this could be used
 * to stop tests running in a particular browser, where browser support for
 * the class under test was absent.
 * @return {boolean} Whether any of the tests in the case should be run.
 */
goog.testing.TestCase.prototype.shouldRunTests = function() {
  return true;
};


/**
 * Executes the tests, yielding asynchronously if execution time exceeds
 * {@link maxRunTime}. There is no guarantee that the test case has finished
 * once this method has returned. To be notified when the test case
 * has finished, use {@link #addCompletedCallback} or
 * {@link #runTestsReturningPromise}.
 */
goog.testing.TestCase.prototype.execute = function() {
  if (!this.prepareForRun_()) {
    return;
  }
  this.groupLogsStart();
  this.log('Starting tests: ' + this.name_);
  this.cycleTests();
};


/**
 * Sets up the internal state of the test case for a run.
 * @return {boolean} If false, preparation failed because the test case
 *     is not supposed to run in the present environment.
 * @private
 */
goog.testing.TestCase.prototype.prepareForRun_ = function() {
  this.started = true;
  this.reset();
  this.startTime_ = this.now();
  this.running = true;
  this.result_.totalCount = this.getCount();
  if (!this.shouldRunTests()) {
    this.log('shouldRunTests() returned false, skipping these tests.');
    this.result_.testSuppressed = true;
    this.finalize();
    return false;
  }
  return true;
};


/**
 * Finalizes the test case, called when the tests have finished executing.
 */
goog.testing.TestCase.prototype.finalize = function() {
  this.saveMessage('Done');

  try {
    this.tearDownPage();
  } catch (e) {
    // Report the error and continue with tests.
    window['onerror'](e.toString(), document.location.href, 0, 0, e);
  }

  this.endTime_ = this.now();
  this.running = false;
  this.result_.runTime = this.endTime_ - this.startTime_;
  this.result_.numFilesLoaded = this.countNumFilesLoaded_();
  this.result_.complete = true;
  this.testsRanSoFar_++;

  this.log(this.result_.getSummary());
  if (this.result_.isSuccess()) {
    this.log('Tests complete');
  } else {
    this.log('Tests Failed');
  }
  goog.array.forEach(this.onCompletedCallbacks_, function(cb) {
    cb();
  });
  this.onCompletedCallbacks_ = [];
  this.groupLogsEnd();
};


/**
 * Saves a message to the result set.
 * @param {string} message The message to save.
 */
goog.testing.TestCase.prototype.saveMessage = function(message) {
  this.result_.messages.push(this.getTimeStamp_() + '  ' + message);
};


/**
 * @return {boolean} Whether the test case is running inside the multi test
 *     runner.
 */
goog.testing.TestCase.prototype.isInsideMultiTestRunner = function() {
  var top = goog.global['top'];
  return top && typeof top['_allTests'] != 'undefined';
};

/**
 * @return {boolean} Whether the test-progress should be logged to the console.
 */
goog.testing.TestCase.prototype.shouldLogTestProgress = function() {
  return !goog.global['skipClosureTestProgress'] &&
      !this.isInsideMultiTestRunner();
};

/**
 * Logs an object to the console, if available.
 * @param {*} val The value to log. Will be ToString'd.
 */
goog.testing.TestCase.prototype.log = function(val) {
  if (this.shouldLogTestProgress() && goog.global.console) {
    if (typeof val == 'string') {
      val = this.getTimeStamp_() + ' : ' + val;
    }
    if (val instanceof Error && val.stack) {
      goog.global.console.log(val.stack);
    } else {
      goog.global.console.log(val);
    }
  }
};


/**
 * Groups the upcoming logs in the same log group
 */
goog.testing.TestCase.prototype.groupLogsStart = function() {
  if (!this.isInsideMultiTestRunner() && goog.global.console &&
      goog.global.console.group) {
    goog.global.console.group(
        'Test #' + (this.testsRanSoFar_ + 1) + ': ' + this.name_);
  }
};


/**
 * Closes the group of the upcoming logs
 */
goog.testing.TestCase.prototype.groupLogsEnd = function() {
  if (!this.isInsideMultiTestRunner() && goog.global.console &&
      goog.global.console.groupEnd) {
    goog.global.console.groupEnd();
  }
};


/**
 * @return {boolean} Whether the test was a success.
 */
goog.testing.TestCase.prototype.isSuccess = function() {
  return !!this.result_ && this.result_.isSuccess();
};


/**
 * Returns a string detailing the results from the test.
 * @param {boolean=} opt_verbose If true results will include data about all
 *     tests, not just what failed.
 * @return {string} The results from the test.
 */
goog.testing.TestCase.prototype.getReport = function(opt_verbose) {
  var rv = [];

  if (this.running) {
    rv.push(this.name_ + ' [RUNNING]');
  } else if (this.result_.runCount == 0) {
    rv.push(this.name_ + ' [NO TESTS RUN]');
  } else {
    var label = this.result_.isSuccess() ? 'PASSED' : 'FAILED';
    rv.push(this.name_ + ' [' + label + ']');
  }

  if (goog.global.location) {
    rv.push(this.trimPath_(goog.global.location.href));
  }

  rv.push(this.result_.getSummary());

  if (opt_verbose) {
    rv.push('.', this.result_.messages.join('\n'));
  } else if (!this.result_.isSuccess()) {
    rv.push(this.result_.errors.join('\n'));
  }

  rv.push(' ');

  return rv.join('\n');
};


/**
 * Returns the test results.
 * @return {!goog.testing.TestCase.Result}
 * @package
 */
goog.testing.TestCase.prototype.getResult = function() {
  return this.result_;
};


/**
 * Returns the amount of time it took for the test to run.
 * @return {number} The run time, in milliseconds.
 */
goog.testing.TestCase.prototype.getRunTime = function() {
  return this.result_.runTime;
};


/**
 * Returns the number of script files that were loaded in order to run the test.
 * @return {number} The number of script files.
 */
goog.testing.TestCase.prototype.getNumFilesLoaded = function() {
  return this.result_.numFilesLoaded;
};


/**
 * Represents a test result.
 * @typedef {{
 *     'source': string,
 *     'message': string,
 *     'stacktrace': string
 * }}
 */
goog.testing.TestCase.IResult;

/**
 * Returns the test results object: a map from test names to a list of test
 * failures (if any exist).
 * @return {!Object<string, !Array<goog.testing.TestCase.IResult>>} Test
 *     results object.
 */
goog.testing.TestCase.prototype.getTestResults = function() {
  var map = {};
  goog.object.forEach(this.result_.resultsByName, function(resultArray, key) {
    // Make sure we only use properties on the actual map
    if (!Object.prototype.hasOwnProperty.call(
            this.result_.resultsByName, key)) {
      return;
    }
    map[key] = [];
    for (var j = 0; j < resultArray.length; j++) {
      map[key].push(resultArray[j].toObject_());
    }
  }, this);
  return map;
};

/**
 * Executes each of the tests, yielding asynchronously if execution time
 * exceeds {@link #maxRunTime}. There is no guarantee that the test case
 * has finished execution once this method has returned.
 * To be notified when the test case has finished execution, use
 * {@link #addCompletedCallback} or {@link #runTestsReturningPromise}.
 *
 * Overridable by the individual test case.  This allows test cases to defer
 * when the test is actually started.  If overridden, finalize must be
 * called by the test to indicate it has finished.
 */
goog.testing.TestCase.prototype.runTests = function() {
  goog.testing.Continuation_.run(this.runSetUpPage_(this.execute));
};


/**
 * Executes each of the tests, returning a promise that resolves with the
 * test results once they are done running.
 * @return {!IThenable<!goog.testing.TestCase.Result>}
 * @final
 * @package
 */
goog.testing.TestCase.prototype.runTestsReturningPromise = function() {
  return new goog.Promise(function(resolve) {
    goog.testing.Continuation_.run(this.runSetUpPage_(function() {
      if (!this.prepareForRun_()) {
        resolve(this.result_);
        return;
      }
      this.groupLogsStart();
      this.log('Starting tests: ' + this.name_);
      this.saveMessage('Start');
      this.batchTime_ = this.now();
      this.runNextTestCallback_ = resolve;
      goog.testing.Continuation_.run(this.runNextTest_());
    }));
  }, this);
};


/**
 * Runs the setUpPage methods.
 * @param {function(this:goog.testing.TestCase)} runTestsFn Callback to invoke
 *     after setUpPage has completed.
 * @return {?goog.testing.Continuation_}
 * @private
 */
goog.testing.TestCase.prototype.runSetUpPage_ = function(runTestsFn) {
  return this.invokeFunction_(this.setUpPage, runTestsFn, function(e) {
    this.exceptionBeforeTest = e;
    runTestsFn.call(this);
  }, 'setUpPage');
};


/**
 * Executes the next test method synchronously or with promises, depending on
 * the test method's return value.
 *
 * If the test method returns a promise, the next test method will run once
 * the promise is resolved or rejected. If the test method does not
 * return a promise, it is assumed to be synchronous, and execution proceeds
 * immediately to the next test method. This means that test cases can run
 * partially synchronously and partially asynchronously, depending on
 * the return values of their test methods. In particular, a test case
 * executes synchronously until the first promise is returned from a
 * test method (or until a resource limit is reached; see
 * {@link finishTestInvocation_}).
 * @return {?goog.testing.Continuation_}
 * @private
 */
goog.testing.TestCase.prototype.runNextTest_ = function() {
  this.curTest_ = this.next();
  if (!this.curTest_ || !this.running) {
    this.finalize();
    return new goog.testing.Continuation_(
        goog.bind(this.runNextTestCallback_, this, this.result_));
  }

  var shouldRunTest = true;
  try {
    shouldRunTest = this.shouldRunTestsHelper_();
  } catch (error) {
    this.curTest_.name = 'shouldRunTests for ' + this.curTest_.name;
    return new goog.testing.Continuation_(
        goog.bind(this.finishTestInvocation_, this, error));
  }

  if (!shouldRunTest) {
    return new goog.testing.Continuation_(
        goog.bind(this.finishTestInvocation_, this));
  }

  this.curTest_.started();
  this.result_.runCount++;
  this.log('Running test: ' + this.curTest_.name);
  if (this.maybeFailTestEarly(this.curTest_)) {
    return new goog.testing.Continuation_(
        goog.bind(this.finishTestInvocation_, this));
  }
  goog.testing.TestCase.currentTestName = this.curTest_.name;
  return this.safeSetUp_();
};


/**
 * @return {boolean}
 * @private
 */
goog.testing.TestCase.prototype.shouldRunTestsHelper_ = function() {
  var objChain =
      this.curTest_.objChain.length ? this.curTest_.objChain : [this];

  for (var i = 0; i < objChain.length; i++) {
    var obj = objChain[i];

    if (!goog.isFunction(obj.shouldRunTests)) {
      return true;
    }

    if (goog.isFunction(obj.shouldRunTests['$cachedResult'])) {
      if (!obj.shouldRunTests['$cachedResult']()) {
        return false;
      }
    }

    var result;
    (function() {
      // Cache the result by storing a function. This way we only call
      // shouldRunTests once per object in the chain. This enforces that people
      // do not attempt to suppress some tests and not others with the same
      // shouldRunTests function.
      try {
        var cached = result = obj.shouldRunTests.call(obj);
        obj.shouldRunTests['$cachedResult'] = function() {
          return cached;
        };
      } catch (error) {
        obj.shouldRunTests['$cachedResult'] = function() {
          throw error;
        };
        throw error;
      }
    })();

    if (!result) {
      this.result_.suppressedTests.push(this.curTest_.name);
      return false;
    }
  }

  return true;
};

/**
 * Runs all the setups associated with a test.
 * @return {?goog.testing.Continuation_}
 * @private
 */
goog.testing.TestCase.prototype.safeSetUp_ = function() {
  var setUps =
      this.curTest_.setUps.length ? this.curTest_.setUps.slice() : [this.setUp];
  return this.safeSetUpHelper_(setUps).call(this);
};

/**
 * Recursively invokes setUp functions.
 * @param {!Array<function()>} setUps
 * @return {function(): ?goog.testing.Continuation_}
 * @private
 */
goog.testing.TestCase.prototype.safeSetUpHelper_ = function(setUps) {
  if (!setUps.length) {
    return this.safeRunTest_;
  }
  return goog.bind(
      this.invokeFunction_, this, setUps.shift(), this.safeSetUpHelper_(setUps),
      this.safeTearDown_, 'setUp');
};

/**
 * Calls the given test function, handling errors appropriately.
 * @return {?goog.testing.Continuation_}
 * @private
 */
goog.testing.TestCase.prototype.safeRunTest_ = function() {
  return this.invokeFunction_(
      goog.bind(this.curTest_.ref, this.curTest_.scope), this.safeTearDown_,
      this.safeTearDown_, this.curTest_.name);
};


/**
 * Calls {@link tearDown}, handling errors appropriately.
 * @param {*=} opt_error Error associated with the test, if any.
 * @return {?goog.testing.Continuation_}
 * @private
 */
goog.testing.TestCase.prototype.safeTearDown_ = function(opt_error) {
  // If the test itself failed, report that before running any tearDown()s.
  if (arguments.length == 1) {
    this.recordError(this.curTest_.name, opt_error);
  }
  var tearDowns = this.curTest_.tearDowns.length ?
      this.curTest_.tearDowns.slice() :
      [this.tearDown];
  return this.safeTearDownHelper_(tearDowns).call(this);
};

/**
 * Recursively invokes tearDown functions.
 * @param {!Array<function()>} tearDowns
 * @return {function(): ?goog.testing.Continuation_}
 * @private
 */
goog.testing.TestCase.prototype.safeTearDownHelper_ = function(tearDowns) {
  if (!tearDowns.length) {
    return this.finishTestInvocation_;
  }
  return goog.bind(
      this.invokeFunction_, this, tearDowns.shift(),
      this.safeTearDownHelper_(tearDowns), this.finishTestInvocation_,
      'tearDown');
};


/**
 * Calls the given `fn`, then calls either `onSuccess` or
 * `onFailure`, either synchronously or using promises, depending on
 * `fn`'s return value.
 *
 * If `fn` throws an exception, `onFailure` is called immediately
 * with the exception.
 *
 * If `fn` returns a promise, and the promise is eventually resolved,
 * `onSuccess` is called with no arguments. If the promise is eventually
 * rejected, `onFailure` is called with the rejection reason.
 *
 * Otherwise, if `fn` neither returns a promise nor throws an exception,
 * `onSuccess` is called immediately with no arguments.
 *
 * `fn`, `onSuccess`, and `onFailure` are all called with
 * the TestCase instance as the method receiver.
 *
 * @param {function()} fn The function to call.
 * @param {function(this:goog.testing.TestCase): (?goog.testing.Continuation_|undefined)} onSuccess
 * @param {function(this:goog.testing.TestCase, *): (?goog.testing.Continuation_|undefined)} onFailure
 * @param {string} fnName Name of the function being invoked e.g. 'setUp'.
 * @return {?goog.testing.Continuation_}
 * @private
 */
goog.testing.TestCase.prototype.invokeFunction_ = function(
    fn, onSuccess, onFailure, fnName) {
  var self = this;
  this.thrownAssertionExceptions_ = [];
  try {
    var retval = fn.call(this);
    if (goog.Thenable.isImplementedBy(retval) ||
        goog.isFunction(retval && retval['then'])) {
      // Resolve Thenable into a proper Promise to avoid hard to debug
      // problems.
      var promise = goog.Promise.resolve(retval);
      promise = this.rejectIfPromiseTimesOut_(
          promise, self.promiseTimeout,
          'Timed out while waiting for a promise returned from ' + fnName +
              ' to resolve. Set goog.testing.TestCase.getActiveTestCase()' +
              '.promiseTimeout to adjust the timeout.');
      promise.then(
          function() {
            self.resetBatchTimeAfterPromise_();
            if (self.thrownAssertionExceptions_.length == 0) {
              goog.testing.Continuation_.run(onSuccess.call(self));
            } else {
              goog.testing.Continuation_.run(onFailure.call(
                  self, self.reportUnpropagatedAssertionExceptions_(fnName)));
            }
          },
          function(e) {
            self.reportUnpropagatedAssertionExceptions_(fnName, e);
            self.resetBatchTimeAfterPromise_();
            goog.testing.Continuation_.run(onFailure.call(self, e));
          });
      return null;
    } else {
      if (this.thrownAssertionExceptions_.length == 0) {
        return new goog.testing.Continuation_(goog.bind(onSuccess, this));
      } else {
        return new goog.testing.Continuation_(goog.bind(
            onFailure, this,
            this.reportUnpropagatedAssertionExceptions_(fnName)));
      }
    }
  } catch (e) {
    this.reportUnpropagatedAssertionExceptions_(fnName, e);
    return new goog.testing.Continuation_(goog.bind(onFailure, this, e));
  }
};


/**
 * Logs all of the exceptions generated from failing assertions, and returns a
 * generic exception informing the user that one or more exceptions were not
 * propagated, causing the test to erroneously pass.
 *
 * This is also called when a test fails so that the user sees swallowed errors.
 * (This can make it much easier to debug failures in callbacks in catch blocks)
 * If the actually-thrown error (that made the test fail) is also a JSUnit error
 * (which will therefore be in this array), it will be silently deduped when the
 * regular failure handler tries to record it again.
 * @param {string} testName The test function's name.
 * @param {*=} actualError The thrown error the made the test fail, if any
 * @return {!goog.testing.JsUnitException}
 * @private
 */
goog.testing.TestCase.prototype.reportUnpropagatedAssertionExceptions_ =
    function(testName, actualError) {
  var extraExceptions = this.thrownAssertionExceptions_.slice();
  // If the actual error isn't a JSUnit exception, it won't be in this array.
  goog.array.remove(extraExceptions, actualError);
  var numExceptions = extraExceptions.length;
  if (numExceptions && actualError) {
    // Don't log this message if the only exception is the actual failure.
    var message =
        numExceptions + ' additional exceptions were swallowed by the test:';
    this.log(message);
    this.saveMessage(message);
  }


  for (var i = 0; i < numExceptions; i++) {
    this.recordError(testName, extraExceptions[i]);
  }

  // Mark the test as failed.
  return new goog.testing.JsUnitException(
      'One or more assertions were raised but not caught by the testing ' +
      'framework. These assertions may have been unintentionally captured ' +
      'by a catch block or a thenCatch resolution of a Promise.');
};


/**
 * Resets the batch run timer. This should only be called after resolving a
 * promise since Promise.then() has an implicit yield.
 * @private
 */
goog.testing.TestCase.prototype.resetBatchTimeAfterPromise_ = function() {
  this.batchTime_ = this.now();
};


/**
 * Finishes up bookkeeping for the current test function, and schedules
 * the next test function to run, either immediately or asychronously.
 * @param {*=} opt_error Optional error resulting from the test invocation.
 * @return {?goog.testing.Continuation_}
 * @private
 */
goog.testing.TestCase.prototype.finishTestInvocation_ = function(opt_error) {
  if (arguments.length == 1) {
    this.recordError(this.curTest_.name, opt_error);
  }

  // If no errors have been recorded for the test, it is a success.
  if (!(this.curTest_.name in this.result_.resultsByName) ||
      !this.result_.resultsByName[this.curTest_.name].length) {
    if (goog.array.indexOf(this.result_.suppressedTests, this.curTest_.name) >=
        0) {
      this.doSkipped(this.curTest_);
    } else {
      this.doSuccess(this.curTest_);
    }
  } else {
    this.doError(this.curTest_);
  }

  goog.testing.TestCase.currentTestName = null;

  // If the test case has consumed too much time or stack space,
  // yield to avoid blocking the browser. Otherwise, proceed to the next test.
  if (this.now() - this.batchTime_ > goog.testing.TestCase.maxRunTime) {
    this.saveMessage('Breaking async');
    this.timeout(goog.bind(this.startNextBatch_, this), 0);
    return null;
  } else {
    return new goog.testing.Continuation_(goog.bind(this.runNextTest_, this));
  }
};


/**
 * Start a new batch to tests after yielding, resetting batchTime and depth.
 * @private
 */
goog.testing.TestCase.prototype.startNextBatch_ = function() {
  this.batchTime_ = this.now();
  goog.testing.Continuation_.run(this.runNextTest_());
};


/**
 * Reorders the tests depending on the `order` field.
 * @private
 */
goog.testing.TestCase.prototype.orderTests_ = function() {
  switch (this.order) {
    case goog.testing.TestCase.Order.RANDOM:
      // Fisher-Yates shuffle
      var i = this.tests_.length;
      while (i > 1) {
        // goog.math.randomInt is inlined to reduce dependencies.
        var j = Math.floor(Math.random() * i);  // exclusive
        i--;
        var tmp = this.tests_[i];
        this.tests_[i] = this.tests_[j];
        this.tests_[j] = tmp;
      }
      break;

    case goog.testing.TestCase.Order.SORTED:
      this.tests_.sort(function(t1, t2) {
        if (t1.name == t2.name) {
          return 0;
        }
        return t1.name < t2.name ? -1 : 1;
      });
      break;

      // Do nothing for NATURAL.
  }
};


/**
 * Gets list of objects that potentially contain test cases. For IE 8 and
 * below, this is the global "this" (for properties set directly on the global
 * this or window) and the RuntimeObject (for global variables and functions).
 * For all other browsers, the array simply contains the global this.
 *
 * @param {string=} opt_prefix An optional prefix. If specified, only get things
 *     under this prefix. Note that the prefix is only honored in IE, since it
 *     supports the RuntimeObject:
 *     http://msdn.microsoft.com/en-us/library/ff521039%28VS.85%29.aspx
 *     TODO: Remove this option.
 * @return {!Array<!Object>} A list of objects that should be inspected.
 */
goog.testing.TestCase.prototype.getGlobals = function(opt_prefix) {
  return goog.testing.TestCase.getGlobals(opt_prefix);
};


/**
 * Gets list of objects that potentially contain test cases. For IE 8 and
 * below, this is the global "this" (for properties set directly on the global
 * this or window) and the RuntimeObject (for global variables and functions).
 * For all other browsers, the array simply contains the global this.
 *
 * @param {string=} opt_prefix An optional prefix. If specified, only get things
 *     under this prefix. Note that the prefix is only honored in IE, since it
 *     supports the RuntimeObject:
 *     http://msdn.microsoft.com/en-us/library/ff521039%28VS.85%29.aspx
 *     TODO: Remove this option.
 * @return {!Array<!Object>} A list of objects that should be inspected.
 */
goog.testing.TestCase.getGlobals = function(opt_prefix) {
  // Look in the global scope for most browsers, on IE we use the little known
  // RuntimeObject which holds references to all globals. We reference this
  // via goog.global so that there isn't an aliasing that throws an exception
  // in Firefox.
  return typeof goog.global['RuntimeObject'] != 'undefined' ?
      [goog.global['RuntimeObject']((opt_prefix || '') + '*'), goog.global] :
      [goog.global];
};


/**
 * @private {?goog.testing.TestCase}
 */
goog.testing.TestCase.activeTestCase_ = null;


/**
 * @return {?goog.testing.TestCase} currently active test case or null if not
 *     test is currently running. Tries the G_testRunner first then the stored
 *     value (when run outside of G_testRunner.
 */
goog.testing.TestCase.getActiveTestCase = function() {
  var gTestRunner = goog.global['G_testRunner'];
  if (gTestRunner && gTestRunner.testCase) {
    return gTestRunner.testCase;
  } else {
    return goog.testing.TestCase.activeTestCase_;
  }
};


/**
 * Calls {@link goog.testing.TestCase.prototype.invalidateAssertionException}
 * on the active test case if it is installed, and logs an error otherwise.
 * @param {!goog.testing.JsUnitException} e The exception object to invalidate.
 * @package
 */
goog.testing.TestCase.invalidateAssertionException = function(e) {
  var testCase = goog.testing.TestCase.getActiveTestCase();
  if (testCase) {
    testCase.invalidateAssertionException(e);
  } else {
    goog.global.console.error(
        'Failed to remove expected exception: no test case is installed.');
  }
};


/**
 * Gets called before any tests are executed.  Can be overridden to set up the
 * environment for the whole test case.
 * @return {!Thenable|undefined}
 */
goog.testing.TestCase.prototype.setUpPage = function() {};


/**
 * Gets called after all tests have been executed.  Can be overridden to tear
 * down the entire test case.
 */
goog.testing.TestCase.prototype.tearDownPage = function() {};


/**
 * Gets called before every goog.testing.TestCase.Test is been executed. Can
 * be overridden to add set up functionality to each test.
 * @return {!Thenable|undefined}
 */
goog.testing.TestCase.prototype.setUp = function() {};


/**
 * Gets called after every goog.testing.TestCase.Test has been executed. Can
 * be overridden to add tear down functionality to each test.
 * @return {!Thenable|undefined}
 */
goog.testing.TestCase.prototype.tearDown = function() {};


/**
 * @return {string} The function name prefix used to auto-discover tests.
 */
goog.testing.TestCase.prototype.getAutoDiscoveryPrefix = function() {
  return 'test';
};


/**
 * @return {number} Time since the last batch of tests was started.
 * @protected
 */
goog.testing.TestCase.prototype.getBatchTime = function() {
  return this.batchTime_;
};


/**
 * @param {number} batchTime Time since the last batch of tests was started.
 * @protected
 */
goog.testing.TestCase.prototype.setBatchTime = function(batchTime) {
  this.batchTime_ = batchTime;
};


/**
 * Creates a `goog.testing.TestCase.Test` from an auto-discovered
 *     function.
 * @param {string} name The name of the function.
 * @param {function()} ref The auto-discovered function.
 * @param {!Object=} scope The scope to attach to the test.
 * @param {!Array<!Object>=} objChain
 * @return {!goog.testing.TestCase.Test} The newly created test.
 * @protected
 */
goog.testing.TestCase.prototype.createTest = function(
    name, ref, scope, objChain) {
  return new goog.testing.TestCase.Test(name, ref, scope, objChain);
};


/**
 * Adds any functions defined on the global object
 * that correspond to lifecycle events for the test case. Overrides
 * setUp, tearDown, setUpPage, tearDownPage, runTests, and shouldRunTests
 * if they are defined on global object.
 */
goog.testing.TestCase.prototype.autoDiscoverLifecycle = function() {
  this.setLifecycleObj(goog.global);
};


// TODO(johnlenz): make this package private
/**
 * Extracts any functions defined on 'obj' that correspond to page lifecycle
 * events (setUpPage, tearDownPage, runTests, shouldRunTests) and add them to
 * on this test case.
 * @param {!Object} obj
 */
goog.testing.TestCase.prototype.setLifecycleObj = function(obj) {
  if (obj['setUp']) {
    this.setUp = goog.bind(obj['setUp'], obj);
  }
  if (obj['tearDown']) {
    this.tearDown = goog.bind(obj['tearDown'], obj);
  }
  if (obj['setUpPage']) {
    this.setUpPage = goog.bind(obj['setUpPage'], obj);
  }
  if (obj['tearDownPage']) {
    this.tearDownPage = goog.bind(obj['tearDownPage'], obj);
  }
  if (obj['runTests']) {
    this.runTests = goog.bind(obj['runTests'], obj);
  }
  if (obj['shouldRunTests']) {
    this.shouldRunTests = goog.bind(obj['shouldRunTests'], obj);
  }
};


// TODO(johnlenz): make this package private
/**
 * @param {!Object} obj  An object from which to extract test and lifecycle
 * methods.
 */
goog.testing.TestCase.prototype.setTestObj = function(obj) {
  // Check any previously added (likely auto-discovered) tests, only one source
  // of discovered test and life-cycle methods is allowed.
  if (this.tests_.length > 0) {
    fail(
        'Test methods have already been configured.\n' +
        'Tests previously found:\n' +
        this.tests_
            .map(function(test) {
              return test.name;
            })
            .join('\n') +
        '\nNew tests found:\n' +
        Object.keys(obj)
            .filter(function(name) {
              return name.startsWith('test');
            })
            .join('\n'));
  }
  this.shouldAutoDiscoverTests_ = false;
  if (obj['getTestName']) {
    this.name_ = obj['getTestName']();
  }
  this.setLifecycleObj(obj);
  this.addTestObj_(obj, '', [this]);
};

/**
 * @param {!Object} obj  An object from which to extract test and lifecycle
 *     methods.
 * @param {string} name
 * @param {!Array<!Object>} objChain List of objects that have methods used
 *     to create tests such as setUp, tearDown.
 * @private
 */
goog.testing.TestCase.prototype.addTestObj_ = function(obj, name, objChain) {
  var regex = new RegExp('^' + this.getAutoDiscoveryPrefix());
  var properties = goog.object.getAllPropertyNames(obj);
  for (var i = 0; i < properties.length; i++) {
    var testName = properties[i];
    if (regex.test(testName)) {
      var testProperty;
      try {
        testProperty = obj[testName];
      } catch (ex) {
        // NOTE(brenneman): When running tests from a file:// URL on Firefox
        // 3.5 for Windows, any reference to goog.global.sessionStorage raises
        // an "Operation is not supported" exception. Ignore any exceptions
        // raised by simply accessing global properties.
        testProperty = null;
      }
      if (name) {
        testName = testName.slice(this.getAutoDiscoveryPrefix().length);
      }
      var fullTestName = name + (testName && name ? '_' : '') + testName;
      if (goog.isFunction(testProperty)) {
        this.addNewTest(fullTestName, testProperty, obj, objChain);
      } else if (goog.isObject(testProperty)) {
        // To prevent infinite loops.
        if (!goog.array.contains(objChain, testProperty)) {
          goog.asserts.assertObject(testProperty);
          var newObjChain = objChain.slice();
          newObjChain.push(testProperty);
          this.addTestObj_(testProperty, fullTestName, newObjChain);
        }
      }
    }
  }
};


/**
 * Adds any functions defined in the global scope that are prefixed with
 * "test" to the test case.
 */
goog.testing.TestCase.prototype.autoDiscoverTests = function() {
  this.autoDiscoverLifecycle();
  var prefix = this.getAutoDiscoveryPrefix();
  var testSources = this.getGlobals(prefix);

  for (var i = 0; i < testSources.length; i++) {
    var testSource = testSources[i];
    this.addTestObj_(testSource, '', [this]);
  }

  this.orderTests_();
};


/**
 * Checks to see if the test should be marked as failed before it is run.
 *
 * If there was an error in setUpPage, we treat that as a failure for all
 * tests and mark them all as having failed.
 *
 * @param {goog.testing.TestCase.Test} testCase The current test case.
 * @return {boolean} Whether the test was marked as failed.
 * @protected
 */
goog.testing.TestCase.prototype.maybeFailTestEarly = function(testCase) {
  if (this.exceptionBeforeTest) {
    // We just use the first error to report an error on a failed test.
    testCase.name = 'setUpPage for ' + testCase.name;
    this.recordError(testCase.name, this.exceptionBeforeTest);
    return true;
  }
  return false;
};


/**
 * Cycles through the tests, yielding asynchronously if the execution time
 * exceeds {@link #maxRunTime}. In particular, there is no guarantee that
 * the test case has finished execution once this method has returned.
 * To be notified when the test case has finished execution, use
 * {@link #addCompletedCallback} or {@link #runTestsReturningPromise}.
 */
goog.testing.TestCase.prototype.cycleTests = function() {
  this.saveMessage('Start');
  this.batchTime_ = this.now();
  if (this.running) {
    this.runNextTestCallback_ = goog.nullFunction;
    // Kick off the tests. runNextTest_ will schedule all of the tests,
    // using a mixture of synchronous and asynchronous strategies.
    goog.testing.Continuation_.run(this.runNextTest_());
  }
};


/**
 * Counts the number of files that were loaded for dependencies that are
 * required to run the test.
 * @return {number} The number of files loaded.
 * @private
 */
goog.testing.TestCase.prototype.countNumFilesLoaded_ = function() {
  var scripts = goog.dom.getElementsByTagName(goog.dom.TagName.SCRIPT);
  var count = 0;
  for (var i = 0, n = scripts.length; i < n; i++) {
    if (scripts[i].src) {
      count++;
    }
  }
  return count;
};


/**
 * Calls a function after a delay, using the protected timeout.
 * @param {Function} fn The function to call.
 * @param {number} time Delay in milliseconds.
 * @return {number} The timeout id.
 * @protected
 */
goog.testing.TestCase.prototype.timeout = function(fn, time) {
  // NOTE: invoking protectedSetTimeout_ as a member of goog.testing.TestCase
  // would result in an Illegal Invocation error. The method must be executed
  // with the global context.
  var protectedSetTimeout = goog.testing.TestCase.protectedSetTimeout_;
  return protectedSetTimeout(fn, time);
};


/**
 * Clears a timeout created by `this.timeout()`.
 * @param {number} id A timeout id.
 * @protected
 */
goog.testing.TestCase.prototype.clearTimeout = function(id) {
  // NOTE: see execution note for protectedSetTimeout above.
  var protectedClearTimeout = goog.testing.TestCase.protectedClearTimeout_;
  protectedClearTimeout(id);
};


/**
 * @return {number} The current time in milliseconds.
 * @protected
 */
goog.testing.TestCase.prototype.now = function() {
  return goog.testing.TestCase.now();
};


/**
 * @return {number} The current time in milliseconds.
 * @protected
 */
goog.testing.TestCase.now = function() {
  // don't use goog.now as some tests override it.
  if (goog.testing.TestCase.protectedPerformance_) {
    return goog.testing.TestCase.protectedPerformance_.now();
  }
  // Fallback for IE8
  // Cannot use "new goog.testing.TestCase.protectedDate_()" due to b/8323223.
  var protectedDate = goog.testing.TestCase.protectedDate_;
  return new protectedDate().getTime();
};


/**
 * Returns the current time.
 * @return {string} HH:MM:SS.
 * @private
 */
goog.testing.TestCase.prototype.getTimeStamp_ = function() {
  // Cannot use "new goog.testing.TestCase.protectedDate_()" due to b/8323223.
  var protectedDate = goog.testing.TestCase.protectedDate_;
  var d = new protectedDate();

  // Ensure millis are always 3-digits
  var millis = '00' + d.getMilliseconds();
  millis = millis.substr(millis.length - 3);

  return this.pad_(d.getHours()) + ':' + this.pad_(d.getMinutes()) + ':' +
      this.pad_(d.getSeconds()) + '.' + millis;
};


/**
 * Pads a number to make it have a leading zero if it's less than 10.
 * @param {number} number The number to pad.
 * @return {string} The resulting string.
 * @private
 */
goog.testing.TestCase.prototype.pad_ = function(number) {
  return number < 10 ? '0' + number : String(number);
};


/**
 * Trims a path to be only that after google3.
 * @param {string} path The path to trim.
 * @return {string} The resulting string.
 * @private
 */
goog.testing.TestCase.prototype.trimPath_ = function(path) {
  return path.substring(path.indexOf('google3') + 8);
};


/**
 * Handles a test that passed.
 * @param {goog.testing.TestCase.Test} test The test that passed.
 * @protected
 */
goog.testing.TestCase.prototype.doSuccess = function(test) {
  this.result_.successCount++;
  // An empty list of error messages indicates that the test passed.
  // If we already have a failure for this test, do not set to empty list.
  if (!(test.name in this.result_.resultsByName)) {
    this.result_.resultsByName[test.name] = [];
  }
  var message = test.name + ' : PASSED';
  this.saveMessage(message);
  this.log(message);
  if (this.testDone_) {
    this.doTestDone_(test, []);
  }
};


/**
 * Handles a test that was skipped.
 * @param {!goog.testing.TestCase.Test} test The test that was skipped.
 * @protected
 */
goog.testing.TestCase.prototype.doSkipped = function(test) {
  this.result_.skipCount++;
  // An empty list of error messages indicates that the test passed.
  // If we already have a failure for this test, do not set to empty list.
  if (!(test.name in this.result_.resultsByName)) {
    this.result_.resultsByName[test.name] = [];
  }
  var message = test.name + ' : SKIPPED';
  this.saveMessage(message);
  this.log(message);
  if (this.testDone_) {
    this.doTestDone_(test, []);
  }
};


/**
 * Records an error that fails the current test, without throwing it.
 *
 * Use this function to implement expect()-style assertion libraries that fail a
 * test without breaking execution (so you can see further failures). Do not use
 * this from normal test code.
 *
 * Please contact js-core-libraries-team@ before using this method.  If it grows
 * popular, we may add an expect() API to Closure.
 *
 * NOTE: If there is no active TestCase, you must throw an error.
 * @param {!Error} error The error to log.  If it is a JsUnitException which has
 *     already been logged, nothing will happen.
 */
goog.testing.TestCase.prototype.recordTestError = function(error) {
  this.recordError(
      this.curTest_ ? this.curTest_.name : '<No active test>', error);
};



/**
 * Records and logs an error from or related to a test.
 * @param {string} testName The name of the test that failed.
 * @param {*} error The exception object associated with the
 *     failure or a string.
 * @protected
 */
goog.testing.TestCase.prototype.recordError = function(testName, error) {
  if (error && error['isJsUnitException'] && error['loggedJsUnitException']) {
    // We already logged this error; don't record it again. This is particularly
    // important for errors from mocks, which are rethrown by $verify, called by
    // tearDown().
    return;
  }

  var err = this.logError(testName, error);
  this.result_.errors.push(err);
  if (testName in this.result_.resultsByName) {
    this.result_.resultsByName[testName].push(err);
  } else {
    this.result_.resultsByName[testName] = [err];
  }

  if (error && error['isJsUnitException']) {
    error['loggedJsUnitException'] = true;
  }
};


/**
 * Handles a test that failed.
 * @param {goog.testing.TestCase.Test} test The test that failed.
 * @protected
 */
goog.testing.TestCase.prototype.doError = function(test) {
  var message = test.name + ' : FAILED';
  this.log(message);
  this.saveMessage(message);

  if (this.testDone_) {
    var results = this.result_.resultsByName[test.name];
    var errMsgs = [];
    for (var i = 0; i < results.length; i++) {
      errMsgs.push(results[i].toString());
    }
    this.doTestDone_(test, errMsgs);
  }
};


/**
 * Makes note of an exception arising from an assertion, and then throws it.
 * If the test otherwise passes (i.e., because something else caught the
 * exception on its way to the test framework), it will be forced to fail.
 * @param {!goog.testing.JsUnitException} e The exception object being thrown.
 * @throws {goog.testing.JsUnitException}
 * @package
 */
goog.testing.TestCase.prototype.raiseAssertionException = function(e) {
  this.thrownAssertionExceptions_.push(e);
  throw e;
};


/**
 * Removes the specified exception from being tracked. This only needs to be
 * called for internal functions that intentionally catch an exception, such
 * as
 * `#assertThrowsJsUnitException`.
 * @param {!goog.testing.JsUnitException} e The exception object to invalidate.
 * @package
 */
goog.testing.TestCase.prototype.invalidateAssertionException = function(e) {
  goog.array.remove(this.thrownAssertionExceptions_, e);
};


/**
 * @param {string} name Failed test name.
 * @param {*} error The exception object associated with the
 *     failure or a string.
 * @return {!goog.testing.TestCase.Error} Error object.
 * @suppress {missingProperties} message and stack properties
 */
goog.testing.TestCase.prototype.logError = function(name, error) {
  var errMsg = null;
  var stack = null;
  if (error) {
    this.log(error);
    if (typeof error === 'string') {
      errMsg = error;
    } else {
      errMsg = error.message || error.description || error.toString();
      stack = error.stack ? error.stack : error['stackTrace'];
    }
  } else {
    errMsg = 'An unknown error occurred';
  }

  if (stack) {
    // The Error class includes the message in the stack. Don't duplicate it.
    stack = stack.replace('Error: ' + errMsg + '\n', 'Error\n');

    // Remove extra goog.testing.TestCase frames from the end.
    stack = stack.replace(
        /\n\s*(\bat\b)?\s*(goog\.labs\.testing\.EnvironmentTestCase_\.)?goog\.testing\.(Continuation_\.(prototype\.)?run|TestCase\.(prototype\.)?(execute|cycleTests|startNextBatch_|safeRunTest_|invokeFunction_?))[^\0]*/m,
        '');
  }
  var err = new goog.testing.TestCase.Error(name, errMsg, stack);

  this.saveMessage(err.toString());

  return err;
};

/**
 * A class representing a single test function.
 * @param {string} name The test name.
 * @param {?function()} ref Reference to the test function or test object.
 * @param {?Object=} scope Optional scope that the test function should be
 *     called in.
 * @param {!Array<?>=} objChain A chain of objects used to populate setUps
 *     and tearDowns.
 * @constructor
 */
goog.testing.TestCase.Test = function(name, ref, scope, objChain) {
  /**
   * The name of the test.
   * @type {string}
   */
  this.name = name;

  /**
   * TODO(user): Rename this to something more clear.
   * Reference to the test function.
   * @type {function()}
   */
  this.ref = ref || function() {};

  /**
   * Scope that the test function should be called in.
   * @type {?Object}
   */
  this.scope = scope || null;

  /**
   * @type {!Array<function()>}
   */
  this.setUps = [];

  /**
   * @type {!Array<function()>}
   */
  this.tearDowns = [];

  /**
   * @type {!Array<?>}
   */
  this.objChain = objChain || [];

  if (objChain) {
    for (var i = 0; i < objChain.length; i++) {
      if (goog.isFunction(objChain[i].setUp)) {
        this.setUps.push(goog.bind(objChain[i].setUp, objChain[i]));
      }
      if (goog.isFunction(objChain[i].tearDown)) {
        this.tearDowns.push(goog.bind(objChain[i].tearDown, objChain[i]));
      }
    }
    this.tearDowns.reverse();
  }

  /**
   * Timestamp just before the test begins execution.
   * @type {number}
   * @private
   */
  this.startTime_;

  /**
   * Timestamp just after the test ends execution.
   * @type {number}
   * @private
   */
  this.stoppedTime_;

  /** @package {boolean|undefined} */
  this.waiting;
};

/**
 * Executes the test function.
 * @package
 */
goog.testing.TestCase.Test.prototype.execute = function() {
  this.ref.call(this.scope);
};

/**
 * Sets the start time
 */
goog.testing.TestCase.Test.prototype.started = function() {
  this.startTime_ = goog.testing.TestCase.now();
};

/**
 * Sets the stop time
 */
goog.testing.TestCase.Test.prototype.stopped = function() {
  this.stoppedTime_ = goog.testing.TestCase.now();
};

/**
 * Returns the runtime for this test function
 * @return {number} milliseconds takenn by the test.
 */
goog.testing.TestCase.Test.prototype.getElapsedTime = function() {
  return this.stoppedTime_ - this.startTime_;
};

/**
 * A class for representing test results.  A bag of public properties.
 * @param {goog.testing.TestCase} testCase The test case that owns this result.
 * @constructor
 * @final
 */
goog.testing.TestCase.Result = function(testCase) {
  /**
   * The test case that owns this result.
   * @type {goog.testing.TestCase}
   * @private
   */
  this.testCase_ = testCase;

  /**
   * Total number of tests that should have been run.
   * @type {number}
   */
  this.totalCount = 0;

  /**
   * Total number of tests that were actually run.
   * @type {number}
   */
  this.runCount = 0;

  /**
   * Number of successful tests.
   * @type {number}
   */
  this.successCount = 0;

  /**
   * Number of tests skipped due to nested shouldRunTests.
   * @type {number}
   */
  this.skipCount = 0;

  /**
   * The amount of time the tests took to run.
   * @type {number}
   */
  this.runTime = 0;

  /**
   * The number of files loaded to run this test.
   * @type {number}
   */
  this.numFilesLoaded = 0;

  /**
   * Whether all tests were suppressed from a top-level shouldRunTests().
   * @type {boolean}
   */
  this.testSuppressed = false;

  /**
   * Which tests were suppressed by shouldRunTests() returning false.
   * @type {!Array<string>}
   */
  this.suppressedTests = [];

  /**
   * Test results for each test that was run. The test name is always added
   * as the key in the map, and the array of strings is an optional list
   * of failure messages. If the array is empty, the test passed. Otherwise,
   * the test failed.
   * @type {!Object<string, !Array<goog.testing.TestCase.Error>>}
   */
  this.resultsByName = {};

  /**
   * Errors encountered while running the test.
   * @type {!Array<goog.testing.TestCase.Error>}
   */
  this.errors = [];

  /**
   * Messages to show the user after running the test.
   * @type {!Array<string>}
   */
  this.messages = [];

  /**
   * Whether the tests have completed.
   * @type {boolean}
   */
  this.complete = false;
};


/**
 * @return {boolean} Whether the test was successful.
 */
goog.testing.TestCase.Result.prototype.isSuccess = function() {
  return this.complete && this.errors.length == 0;
};


/**
 * @return {string} A summary of the tests, including total number of tests that
 *     passed, failed, and the time taken.
 */
goog.testing.TestCase.Result.prototype.getSummary = function() {
  var summary = this.runCount + ' of ' + this.totalCount + ' tests run in ' +
      this.runTime + 'ms.\n';
  if (this.testSuppressed) {
    summary += 'Tests not run because shouldRunTests() returned false.';
  } else {
    var failures = this.totalCount - this.successCount - this.skipCount;
    var suppressionMessage = '';

    if (this.skipCount) {
      suppressionMessage +=
          ', ' + this.skipCount + ' skipped by shouldRunTests()';
    }

    var countOfRunTests = this.testCase_.getActuallyRunCount();
    if (countOfRunTests) {
      failures = countOfRunTests - this.successCount - this.skipCount;
      suppressionMessage += ', ' + (this.totalCount - countOfRunTests) +
          ' suppressed by querystring';
    }
    summary += this.successCount + ' passed, ' + failures + ' failed' +
        suppressionMessage + '.\n' + Math.round(this.runTime / this.runCount) +
        ' ms/test. ' + this.numFilesLoaded + ' files loaded.';
  }

  return summary;
};


/**
 * @param {function(goog.testing.TestCase.Test, !Array<string>)} testDone
 */
goog.testing.TestCase.prototype.setTestDoneCallback = function(testDone) {
  this.testDone_ = testDone;
};


/**
 * @param {goog.testing.TestCase.Test} test
 * @param {!Array<string>} errMsgs
 * @private
 */
goog.testing.TestCase.prototype.doTestDone_ = function(test, errMsgs) {
  test.stopped();
  this.testDone_(test, errMsgs);
};

/**
 * Initializes the TestCase.
 * @param {goog.testing.TestCase} testCase The test case to install.
 * @param {function(goog.testing.TestCase.Test, Array<string>)=} opt_testDone
 *     Called when each test completes.
 */
goog.testing.TestCase.initializeTestCase = function(testCase, opt_testDone) {
  if (opt_testDone) {
    testCase.setTestDoneCallback(opt_testDone);
  }

  if (testCase.shouldAutoDiscoverTests_) {
    testCase.autoDiscoverTests();
  } else {
    // Make sure the tests are still ordered based on provided order.
    testCase.orderTests_();
  }

  if (goog.global.location) {
    var search = goog.global.location.search;
    testCase.setTestsToRun(goog.testing.TestCase.parseRunTests_(search));
  }
  goog.testing.TestCase.activeTestCase_ = testCase;
};


/**
 * Initializes the given test case with the global test runner 'G_testRunner'.
 * @param {goog.testing.TestCase} testCase The test case to install.
 * @param {function(goog.testing.TestCase.Test, Array<string>)=} opt_testDone
 *     Called when each test completes.
 */
goog.testing.TestCase.initializeTestRunner = function(testCase, opt_testDone) {
  goog.testing.TestCase.initializeTestCase(testCase, opt_testDone);

  var gTestRunner = goog.global['G_testRunner'];
  if (gTestRunner) {
    gTestRunner['initialize'](testCase);
  } else {
    throw new Error(
        'G_testRunner is undefined. Please ensure goog.testing.jsunit' +
        ' is included.');
  }
};


/**
 * Parses URL query parameters for the 'runTests' parameter.
 * @param {string} search The URL query string.
 * @return {Object<string, boolean>} A set of test names or test indices to be
 *     run by the test runner.
 * @private
 */
goog.testing.TestCase.parseRunTests_ = function(search) {
  var testsToRun = null;
  var runTestsMatch = search.match(/(?:\?|&)runTests=([^?&]+)/i);
  if (runTestsMatch) {
    testsToRun = {};
    var arr = runTestsMatch[1].split(',');
    for (var i = 0, len = arr.length; i < len; i++) {
      testsToRun[arr[i]] = true;
    }
  }
  return testsToRun;
};


/**
 * Wraps provided promise and returns a new promise which will be rejected
 * if the original promise does not settle within the given timeout.
 * @param {!goog.Promise<T>} promise
 * @param {number} timeoutInMs Number of milliseconds to wait for the promise to
 *     settle before failing it with a timeout error.
 * @param {string} errorMsg Error message to use if the promise times out.
 * @return {!goog.Promise<T>} A promise that will settle with the original
       promise unless the timeout is exceeded.
 *     error.
 * @template T
 * @private
 */
goog.testing.TestCase.prototype.rejectIfPromiseTimesOut_ = function(
    promise, timeoutInMs, errorMsg) {
  var self = this;
  var start = this.now();
  return new goog.Promise(function(resolve, reject) {
    var timeoutId = self.timeout(function() {
      var elapsed = self.now() - start;
      reject(new Error(errorMsg + '\nElapsed time: ' + elapsed + 'ms.'));
    }, timeoutInMs);
    promise.then(resolve, reject);
    var clearTimeout = goog.bind(self.clearTimeout, self, timeoutId);
    promise.then(clearTimeout, clearTimeout);
  });
};



/**
 * A class representing an error thrown by the test
 * @param {string} source The name of the test which threw the error.
 * @param {string} message The error message.
 * @param {string=} opt_stack A string showing the execution stack.
 * @constructor
 * @final
 */
goog.testing.TestCase.Error = function(source, message, opt_stack) {
  /**
   * The name of the test which threw the error.
   * @type {string}
   */
  this.source = source;

  /**
   * Reference to the test function.
   * @type {string}
   */
  this.message = message;

  /**
   * The stack.
   * @type {?string}
   */
  this.stack = null;

  if (opt_stack) {
    this.stack = opt_stack;
  } else {
    // Attempt to capture a stack trace.
    if (Error.captureStackTrace) {
      // See https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi
      Error.captureStackTrace(this, goog.testing.TestCase.Error);
    } else {
      var stack = new Error().stack;
      if (stack) {
        this.stack = stack;
      }
    }
  }
};


/**
 * Returns a string representing the error object.
 * @return {string} A string representation of the error.
 * @override
 */
goog.testing.TestCase.Error.prototype.toString = function() {
  return 'ERROR in ' + this.source + '\n' + this.message +
      (this.stack ? '\n' + this.stack : '');
};

/**
 * Returns an object representing the error suitable for JSON serialization.
 * @return {!goog.testing.TestCase.IResult} An object
 *     representation of the error.
 * @private
 */
goog.testing.TestCase.Error.prototype.toObject_ = function() {
  return {
    'source': this.source,
    'message': this.message,
    'stacktrace': this.stack || ''
  };
};



/**
 * @constructor
 * @param {function(): (?goog.testing.Continuation_|undefined)} fn
 * @private
 */
goog.testing.Continuation_ = function(fn) {
  /** @private @const */
  this.fn_ = fn;
};


/** @param {?goog.testing.Continuation_|undefined} continuation */
goog.testing.Continuation_.run = function(continuation) {
  var fn = continuation && continuation.fn_;
  while (fn) {
    continuation = fn();
    fn = continuation && continuation.fn_;
  }
};

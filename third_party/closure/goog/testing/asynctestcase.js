// Copyright 2009 Google Inc.
//
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

// All Rights Reserved.

/**
 * @fileoverview A class representing a set of test functions that use
 * asynchronous functions that cannot be meaningfully mocked.
 *
 * To create a Google-compatable JsUnit test using this test case, put the
 * following snippet in your test:
 *
 *   var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();
 *
 * To make the test runner wait for your asynchronous behaviour, use:
 *
 *   asyncTestCase.waitForAsync('Waiting for xhr to respond');
 *
 * The next test will not start until the following call is made, or a
 * timeout occurs:
 *
 *   asyncTestCase.continueTesting();
 *
 * There does NOT need to be a 1:1 mapping of waitForAsync calls and
 * continueTesting calls. The next test will be run after a single call to
 * continueTesting is made, as long as there is no subsequent call to
 * waitForAsync in the same thread.
 *
 * Example:
 *   // Returning here would cause the next test to be run.
 *   asyncTestCase.waitForAsync('description 1');
 *   // Returning here would *not* cause the next test to be run.
 *   // Only effect of additional waitForAsync() calls is an updated
 *   // description in the case of a timeout.
 *   asyncTestCase.waitForAsync('updated description');
 *   asyncTestCase.continueTesting();
 *   // Returning here would cause the next test to be run.
 *   asyncTestCase.waitForAsync('just kidding, still running.');
 *   // Returning here would *not* cause the next test to be run.
 *
 * This class supports asynchronous behaviour in all test functions except for
 * tearDownPage. If such support is needed, it can be added.
 *
 * Example Usage:
 *
 *   var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();
 *   // Optionally, set a longer-than-normal step timeout.
 *   asyncTestCase.stepTimeout = 30 * 1000;
 *
 *   function testSetTimeout() {
 *     var step = 0;
 *     function stepCallback() {
 *       step++;
 *       switch (step) {
 *         case 1:
 *           var startTime = goog.now();
 *           asyncTestCase.waitForAsync('step 1');
 *           window.setTimeout(stepCallback, 100);
 *           break;
 *         case 2:
 *           assertTrue('Timeout fired too soon',
 *               goog.now() - startTime >= 100);
 *           asyncTestCase.waitForAsync('step 2');
 *           window.setTimeout(stepCallback, 100);
 *           break;
 *         case 3:
 *           assertTrue('Timeout fired too soon',
 *               goog.now() - startTime >= 200);
 *           asyncTestCase.continueTesting();
 *           break;
 *         default:
 *           fail('Unexpected call to stepCallback');
 *       }
 *     }
 *     stepCallback();
 *   }
 *
 * Known Issues:
 *   IE7 Exceptions:
 *     As the failingtest.html will show, it appears as though ie7 does not
 *     propagate an exception past a function called using the func.call()
 *     syntax. This causes case 3 of the failing tests (exceptions) to show up
 *     as timeouts in IE.
 *   window.onerror:
 *     This seems to catch errors only in ff2/ff3. It does not work in Safari or
 *     IE7. The consequence of this is that exceptions that would have been
 *     caught by window.onerror show up as timeouts.
 *
 */

goog.provide('goog.testing.AsyncTestCase');
goog.provide('goog.testing.AsyncTestCase.ControlBreakingException');

goog.require('goog.testing.TestCase');
goog.require('goog.testing.TestCase.Test');
goog.require('goog.testing.asserts');


/**
 * A test case that is capable of running tests the contain asynchronous logic.
 * @param {string} opt_name A descriptive name for the test case.
 * @extends {goog.testing.TestCase}
 * @constructor
 */
goog.testing.AsyncTestCase = function(opt_name) {
  goog.testing.TestCase.call(this, opt_name);
};
goog.inherits(goog.testing.AsyncTestCase, goog.testing.TestCase);


/**
 * An exception class used solely for control flow.
 * @constructor
 */
goog.testing.AsyncTestCase.ControlBreakingException = function() {};


/**
 * Return value for .toString().
 * @type {string}
 */
goog.testing.AsyncTestCase.ControlBreakingException.TO_STRING =
    '[AsyncTestCase.ControlBreakingException]';


/**
 * Marks this object as a ControlBreakingException
 * @type {boolean}
 */
goog.testing.AsyncTestCase.ControlBreakingException.prototype.
    isControlBreakingException = true;


/** @inheritDoc */
goog.testing.AsyncTestCase.ControlBreakingException.prototype.toString =
    function() {
  // This shows up in the console when the exception is not caught.
  return goog.testing.AsyncTestCase.ControlBreakingException.TO_STRING;
};


/**
 * How long to wait for a single step of a test to complete in milliseconds.
 * A step starts when a call to waitForAsync() is made.
 * @type {number}
 */
goog.testing.AsyncTestCase.prototype.stepTimeout = 1000;


/**
 * How long to wait after a failed test before moving onto the next one.
 * The purpose of this is to allow any pending async callbacks from the failing
 * test to finish up and not cause the next test to fail.
 * @type {number}
 */
goog.testing.AsyncTestCase.prototype.timeToSleepAfterFailure = 500;


/**
 * Turn on extra logging to help debug failing async. tests.
 * @type {boolean}
 * @private
 */
goog.testing.AsyncTestCase.prototype.enableDebugLogs_ = false;


/**
 * A reference to the original asserts.js assert_() function.
 * @private
 */
goog.testing.AsyncTestCase.prototype.origAssert_;


/**
 * A reference to the original asserts.js fail() function.
 * @private
 */
goog.testing.AsyncTestCase.prototype.origFail_;


/**
 * A reference to the original window.onerror function.
 * @type {Function|undefined}
 * @private
 */
goog.testing.AsyncTestCase.prototype.origOnError_;


/**
 * The stage of the test we are currently on.
 * @type {Function|undefined}}
 * @private
 */
goog.testing.AsyncTestCase.prototype.curStepFunc_;


/**
 * The name of the stage of the test we are currently on.
 * @type {string}
 * @private
 */
goog.testing.AsyncTestCase.prototype.curStepName_ = '';


/**
 * The stage of the test we should run next.
 * @type {Function|undefined}
 * @private
 */
goog.testing.AsyncTestCase.prototype.nextStepFunc;


/**
 * The name of the stage of the test we should run next.
 * @type {string}
 * @private
 */
goog.testing.AsyncTestCase.prototype.nextStepName_ = '';


/**
 * The handle to the current setTimeout timer.
 * @type {number|undefined}
 * @private
 */
goog.testing.AsyncTestCase.prototype.timeoutHandle_;


/**
 * Marks if the cleanUp() function has been called for the currently running
 * test.
 * @type {boolean}
 * @private
 */
goog.testing.AsyncTestCase.prototype.cleanedUp_ = false;


/**
 * The currently active test.
 * @type {goog.testing.TestCase.Test|undefined}
 * @private
 */
goog.testing.AsyncTestCase.prototype.activeTest_;


/**
 * A flag to prevent recursive exception handling.
 * @type {boolean}
 * @private
 */
goog.testing.AsyncTestCase.prototype.inException_ = false;


/**
 * Flag used to determine if we can move to the next step in the testing loop.
 * @type {boolean}
 * @private
 */
goog.testing.AsyncTestCase.prototype.isReady_ = true;


/**
 * Flag that tells us if there is a function in the call stack that will make
 * a call to pump_().
 * @type {boolean}
 * @private
 */
goog.testing.AsyncTestCase.prototype.returnWillPump_ = false;


/**
 * The number of times we have thrown a ControlBreakingException so that we
 * know not to complain in our window.onerror handler. In Webkit, window.onerror
 * is not supported, and so this counter will keep going up but we won't care
 * about it.
 * @type {number}
 * @private
 */
goog.testing.AsyncTestCase.prototype.numControlExceptionsExpected_ = 0;


/**
 * Preferred way of creating an AsyncTestCase. Creates one and initializes it
 * with the G_testRunner.
 * @param {string} opt_name A descriptive name for the test case.
 * @return {goog.testing.AsyncTestCase} The created AsyncTestCase.
 */
goog.testing.AsyncTestCase.createAndInstall = function(opt_name) {
  var asyncTestCase = new goog.testing.AsyncTestCase(opt_name);
  asyncTestCase.autoDiscoverTests();
  var gTestRunner = goog.global['G_testRunner'];
  if (gTestRunner) {
    gTestRunner.initialize(asyncTestCase);
  } else {
    throw Error('G_testRunner is undefined. Please ensure goog.testing.jsunit' +
        'is included.');
  }
  return asyncTestCase;
};


/**
 * Informs the testcase not to continue to the next step in the test cycle
 * until continueTesting is called.
 * @param {string} opt_name A description of what we are waiting for.
 */
goog.testing.AsyncTestCase.prototype.waitForAsync = function(opt_name) {
  this.isReady_ = false;
  this.curStepName_ = opt_name || this.curStepName_;

  // Reset the timer that tracks if the async test takes too long.
  this.stopTimeoutTimer_();
  this.startTimeoutTimer_();
};


/**
 * Continue with the next step in the test cycle.
 */
goog.testing.AsyncTestCase.prototype.continueTesting = function() {
  if (!this.isReady_) {
    // We are a potential entry point, so we pump.
    this.isReady_ = true;
    this.stopTimeoutTimer_();
    // Run this in a setTimeout so that the caller has a chance to call
    // waitForAsync() again before we continue.
    this.timeout(goog.bind(this.pump_, this, null), 0);
  }
};


/**
 * Handles an exception thrown by a test.
 * @param {string|Error} opt_e The exception object associated with the
 *     failure or a string.
 * @throws Always throws a ControlBreakingException.
 */
goog.testing.AsyncTestCase.prototype.doAsyncError = function(opt_e) {
  // If we've caught an exception that we threw, then just pass it along. This
  // can happen if doAsyncError() was called from a call to assert and then
  // again by pump_().
  if (opt_e && opt_e.isControlBreakingException) {
    throw opt_e;
  }

  // Prevent another timeout error from triggering for this test step.
  this.stopTimeoutTimer_();

  // doError() uses test.name. Here, we create a dummy test and give it a more
  // helpful name based on the step we're currently on.
  var fakeTestObj = new goog.testing.TestCase.Test(this.curStepName_,
                                                   goog.nullFunction);
  if (this.activeTest_) {
    fakeTestObj.name = this.activeTest_.name + ' [' + fakeTestObj.name + ']';
  }

  // Note: if the test has an error, and then tearDown has an error, they will
  // both be reported.
  this.doError(fakeTestObj, opt_e);

  // This is a potential entry point, so we pump. We also add in a bit of a
  // delay to try and prevent any async behavior from the failed test from
  // causing the next test to fail.
  this.timeout(goog.bind(this.pump_, this, this.doAsyncErrorTearDown_),
      this.timeToSleepAfterFailure);

  // We just caught an exception, so we do not want the code above us on the
  // stack to continue executing. If pump_ is in our call-stack, then it will
  // batch together multiple errors, so we only increment the count if pump_ is
  // not in the stack and let pump_ increment the count when it batches them.
  if (!this.returnWillPump_) {
    this.numControlExceptionsExpected_ += 1;
    this.dbgLog_('doAsynError: numControlExceptionsExpected_ = ' +
        this.numControlExceptionsExpected_ + ' and throwing exception.');
  }

  throw new goog.testing.AsyncTestCase.ControlBreakingException();
};


/**
 * Sets up the test page and then waits until the test case has been marked
 * as ready before executing the tests.
 * @override
 */
goog.testing.AsyncTestCase.prototype.runTests = function() {
  this.hookAssert_();
  this.hookOnError_();

  this.setNextStep_(this.doSetUpPage_, 'setUpPage');
  // We are an entry point, so we pump.
  this.pump_();
};


/**
 * Starts the tests.
 * @override
 */
goog.testing.AsyncTestCase.prototype.cycleTests = function() {
  // We are an entry point, so we pump.
  this.saveMessage('Start')
  this.setNextStep_(this.doIteration_, 'doIteration');
  this.pump_();
};


/**
 * Finalizes the test case, called when the tests have finished executing.
 * @override
 */
goog.testing.AsyncTestCase.prototype.finalize = function() {
  this.unhookAll_();
  this.setNextStep_(null, 'finalized');
  goog.testing.AsyncTestCase.superClass_.finalize.call(this);
};


/**
 * Enables verbose logging of what is happening inside of the AsyncTestCase.
 */
goog.testing.AsyncTestCase.prototype.enableDebugLogging = function() {
  this.enableDebugLogs_ = true;
};


/**
 * Logs the given debug message to the console (when enabled).
 * @param {string} message The message to log.
 * @private
 */
goog.testing.AsyncTestCase.prototype.dbgLog_ = function(message) {
  if (this.enableDebugLogs_) {
    this.log('AsyncTestCase - ' + message);
  }
};


/**
 * Wraps doAsyncError() for when we are sure that the test runner has no user
 * code above it in the stack.
 * @param {string|Error} opt_e The exception object associated with the
 *     failure or a string.
 * @private
 */
goog.testing.AsyncTestCase.prototype.doTopOfStackAsyncError_ =
    function(opt_e) {
  /** @preserveTry */
  try {
    this.doAsyncError(opt_e);
  } catch (e) {
    // We know that we are on the top of the stack, so there is no need to
    // throw this exception in this case.
    if (e.isControlBreakingException) {
      this.numControlExceptionsExpected_ -= 1;
      this.dbgLog_('doTopOfStackAsyncError_: numControlExceptionsExpected_ = ' +
          this.numControlExceptionsExpected_ + ' and catching exception.');
    } else {
      throw e;
    }
  }
};


/**
 * Calls the tearDown function, catching any errors, and then moves on to
 * the next step in the testing cycle.
 * @private
 */
goog.testing.AsyncTestCase.prototype.doAsyncErrorTearDown_ = function() {
  if (this.inException_) {
    // We get here if tearDown is throwing the error.
    // Upon calling continueTesting, the inline function 'doAsyncError' (set
    // below) is run.
    this.continueTesting();
  } else {
    this.inException_ = true;
    this.isReady_ = true;

    // The continue point is different depending on if the error happened in
    // setUpPage() or in setUp()/test*()/tearDown().
    var stepFuncAfterError = this.nextStepFunc_;
    var stepNameAfterError = 'TestCase.execute (after error)';
    if (this.activeTest_) {
      stepFuncAfterError = this.doIteration_;
      stepNameAfterError = 'doIteration (after error)';
    }

    // We must set the next step before calling tearDown.
    this.setNextStep_(function() {
      this.inException_ = false;
      // This is null when an error happens in setUpPage.
      this.setNextStep_(stepFuncAfterError, stepNameAfterError);
    }, 'doAsyncError');

    // Call the test's tearDown().
    if (!this.cleanedUp_) {
      this.cleanedUp_ = true;
      this.tearDown();
    }
  }
};


/**
 * Replaces the asserts.js assert_() and fail() functions with a wrappers to
 * catch the exceptions.
 * @private
 */
goog.testing.AsyncTestCase.prototype.hookAssert_ = function() {
  if (!this.origAssert_) {
    this.origAssert_ = _assert;
    this.origFail_ = fail;
    var self = this;
    _assert = function() {
      /** @preserveTry */
      try {
        self.origAssert_.apply(this, arguments);
      } catch (e) {
        self.dbgLog_('Wrapping failed assert()');
        self.doAsyncError(e);
      }
    };
    fail = function() {
      /** @preserveTry */
      try {
        self.origFail_.apply(this, arguments);
      } catch (e) {
        self.dbgLog_('Wrapping fail()');
        self.doAsyncError(e);
      }
    };
  }
};


/**
 * Sets a window.onerror handler for catching exceptions that happen in async
 * callbacks. Note that as of Safari 3.1, Safari does not support this.
 * @private
 */
goog.testing.AsyncTestCase.prototype.hookOnError_ = function() {
  if (!this.origOnError_) {
    this.origOnError_ = window.onerror;
    var self = this;
    window.onerror = function(error, url, line) {
      // Ignore exceptions that we threw on purpose.
      var cbe =
          goog.testing.AsyncTestCase.ControlBreakingException.TO_STRING;
      if (error.indexOf(cbe) != -1 && self.numControlExceptionsExpected_) {
        self.numControlExceptionsExpected_ -= 1;
        self.dbgLog_('window.onerror: numControlExceptionsExpected_ = ' +
            self.numControlExceptionsExpected_ + ' and ignoring exception. ' +
            error);
        // Tell the browser not to compain about the error.
        return true;
      } else {
        self.dbgLog_('window.onerror caught exception.');
        var message = error + '\nURL: ' + url + '\nLine: ' + line;
        self.doTopOfStackAsyncError_(message);
        // Tell the browser to complain about the error.
        return false;
      }
    };
  }
};


/**
 * Unhooks window.onerror and _assert.
 * @private
 */
goog.testing.AsyncTestCase.prototype.unhookAll_ = function() {
  if (this.origOnError_) {
    window.onerror = this.origOnError_;
    this.origOnError_ = null;
    _assert = this.origAssert_;
    this.origAssert_ = null;
    fail = this.origFail_;
    this.origFail_ = null;
  }
};


/**
 * Enables the timeout timer. This timer fires unless continueTesting is
 * called.
 * @private
 */
goog.testing.AsyncTestCase.prototype.startTimeoutTimer_ = function() {
  if (!this.timeoutHandle_ && this.stepTimeout > 0) {
    this.timeoutHandle_ = this.timeout(goog.bind(function() {
      this.dbgLog_('Timeout timer fired with id ' + this.timeoutHandle_);
      this.timeoutHandle_ = null;

      this.doTopOfStackAsyncError_('Timed out while waiting for ' +
          'continueTesting() to be called.');
    }, this, null), this.stepTimeout);
    this.dbgLog_('Started timeout timer with id ' + this.timeoutHandle_);
  }
};


/**
 * Disables the timeout timer.
 * @private
 */
goog.testing.AsyncTestCase.prototype.stopTimeoutTimer_ = function() {
  if (this.timeoutHandle_) {
    this.dbgLog_('Clearing timeout timer with id ' + this.timeoutHandle_);
    window.clearTimeout(this.timeoutHandle_);
    this.timeoutHandle_ = 0;
  }
};


/**
 * Sets the next function to call in our sequence of async callbacks.
 * @param {Function} func The function that executes the next step.
 * @param {string} name A description of the next step.
 * @private
 */
goog.testing.AsyncTestCase.prototype.setNextStep_ = function(func, name) {
  this.nextStepFunc_ = func && goog.bind(func, this);
  this.nextStepName_ = name;
};


/**
 * Calls the given function, redirecting any exceptions to doAsyncError.
 * @param {Function} func The function to call.
 * @return {boolean} Returns true iff the function threw a
 *     ControlBreakingException.
 * @private
 */
goog.testing.AsyncTestCase.prototype.callTopOfStackFunc_ = function(func) {
  /** @preserveTry */
  try {
    func.call(this);
    return false;
  } catch (e) {
    this.dbgLog_('Caught exception in callTopOfStackFunc_');
    /** @preserveTry */
    try {
      this.doAsyncError(e);
      return false;
    } catch (e2) {
      if (!e2.isControlBreakingException) {
        throw e2;
      }
      return true;
    }
  }
};


/**
 * Calls the next callback when the isReady_ flag is true.
 * @param {Function} opt_doFirst A function to call before pumping.
 * @private
 * @throws Throws a ControlBreakingException if there were any failing steps.
 */
goog.testing.AsyncTestCase.prototype.pump_ = function(opt_doFirst) {
  // If this function is already above us in the call-stack, then we should
  // return rather than pumping in order to minimize call-stack depth.
  if (!this.returnWillPump_) {
    this.batchTime_ = this.now_();
    this.returnWillPump_ = true;
    // If we catch an exception in the step, we don't want to return control
    // to our caller since there may be non-testcase code in our call stack.
    // Eg)
    //   asyncCallback() { fail(1); fail(2); }
    //                       V
    //   - ...
    //   - pump_();
    // We don't want fail(2) to ever be called.
    var shouldThrowAndNotReturn = false;

    if (opt_doFirst) {
      shouldThrowAndNotReturn = this.callTopOfStackFunc_(opt_doFirst);
    }
    // Note: we don't check for this.running here because it is not set to true
    // while executing setUpPage and tearDownPage.
    // Also, if isReady_ is false, then one of two things will happen:
    // 1. Our timeout callback will be called.
    // 2. The tests will call continueTesting(), which will call pump_() again.
    while (this.isReady_ && this.nextStepFunc_ && !shouldThrowAndNotReturn) {
      this.curStepFunc_ = this.nextStepFunc_;
      this.curStepName_ = this.nextStepName_;
      this.nextStepFunc_ = null;
      this.nextStepName_ = '';

      this.dbgLog_('Performing step: ' + this.curStepName_);
      shouldThrowAndNotReturn =
          this.callTopOfStackFunc_(/** @type {Function} */(this.curStepFunc_));

      // If the max run time is exceeded call this function again async so as
      // not to block the browser.
      if (this.now_() - this.batchTime_ > goog.testing.TestCase.MAX_RUN_TIME &&
          !shouldThrowAndNotReturn) {
        this.saveMessage('Breaking async');
        var self = this;
        this.timeout(function() { self.pump_(); }, 100);
        break;
      }
    }
    this.returnWillPump_ = false;
    // See note at top of this function.
    if (shouldThrowAndNotReturn) {
      this.numControlExceptionsExpected_ += 1;
      this.dbgLog_('pump: numControlExceptionsExpected_ = ' +
          this.numControlExceptionsExpected_ + ' and throwing exception.');
      throw new goog.testing.AsyncTestCase.ControlBreakingException();
    }
  } else if (opt_doFirst) {
    opt_doFirst.call(this);
  }
};


/**
 * Sets up the test page and then waits untill the test case has been marked
 * as ready before executing the tests.
 * @private
 */
goog.testing.AsyncTestCase.prototype.doSetUpPage_ = function() {
  this.setNextStep_(this.execute, 'TestCase.execute');
  this.setUpPage();
};


/**
 * Step 1: Move to the next test.
 * @private
 */
goog.testing.AsyncTestCase.prototype.doIteration_ = function() {
  this.activeTest_ = this.next();
  if (this.activeTest_ && this.running) {
    this.result_.runCount++;
    this.setNextStep_(this.doSetUp_, 'setUp');
  } else {
    // All tests done.
    this.finalize();
  }
};


/**
 * Step 2: Call setUp().
 * @private
 */
goog.testing.AsyncTestCase.prototype.doSetUp_ = function() {
  this.log('Running test: ' + this.activeTest_.name);
  this.cleanedUp_ = false;
  this.setNextStep_(this.doExecute_, this.activeTest_.name);
  this.setUp();
};


/**
 * Step 3: Call test.execute().
 * @private
 */
goog.testing.AsyncTestCase.prototype.doExecute_ = function() {
  this.setNextStep_(this.doTearDown_, 'tearDown');
  this.activeTest_.execute();
};


/**
 * Step 4: Call tearDown().
 * @private
 */
goog.testing.AsyncTestCase.prototype.doTearDown_ = function() {
  this.cleanedUp_ = true;
  this.setNextStep_(this.doNext_, 'doNext');
  this.tearDown();
};


/**
 * Step 5: Call doSuccess()
 * @private
 */
goog.testing.AsyncTestCase.prototype.doNext_ = function() {
  this.setNextStep_(this.doIteration_, 'doIteration');
  this.doSuccess(/** @type {goog.testing.TestCase.Test} */(this.activeTest_));
};

// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.labs.testing.Environment');

goog.require('goog.array');
goog.require('goog.debug.Console');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');


/**
 * JsUnit environments allow developers to customize the existing testing
 * lifecycle by hitching additional setUp and tearDown behaviors to tests.
 *
 * Environments will run their setUp steps in the order in which they
 * are instantiated and registered. During tearDown, the environments will
 * unwind the setUp and execute in reverse order.
 *
 * See http://go/jsunit-env for more information.
 */
goog.labs.testing.Environment = goog.defineClass(null, {
  /** @constructor */
  constructor: function() {
    goog.labs.testing.EnvironmentTestCase_.getInstance().
        registerEnvironment_(this);

    /** @type {goog.testing.MockControl} */
    this.mockControl = null;

    /** @type {goog.testing.MockClock} */
    this.mockClock = null;

    /** @private {boolean} */
    this.shouldMakeMockControl_ = false;

    /** @private {boolean} */
    this.shouldMakeMockClock_ = false;

    /** @const {!goog.debug.Console} */
    this.console = goog.labs.testing.Environment.console_;
  },


  /** Runs immediately before the setUpPage phase of JsUnit tests. */
  setUpPage: goog.nullFunction,


  /** Runs immediately after the tearDownPage phase of JsUnit tests. */
  tearDownPage: function() {
    // If we created the mockControl, we'll also tear it down.
    if (this.shouldMakeMockControl_) {
      this.mockControl.$tearDown();
    }
    if (this.shouldMakeMockClock_) {
      this.mockClock.dispose();
    }
  },

  /** Runs immediately before the setUp phase of JsUnit tests. */
  setUp: goog.nullFunction,

  /** Runs immediately after the tearDown phase of JsUnit tests. */
  tearDown: function() {
    // Make sure promises and other stuff that may still be scheduled, get a
    // chance to run (and throw errors).
    if (this.mockClock) {
      for (var i = 0; i < 100; i++) {
        this.mockClock.tick(1000);
      }
      // If we created the mockClock, we'll also dispose it.
      if (this.shouldMakeMockClock_) {
        this.mockClock.reset();
      }
    }
    // Make sure the user did not forget to call $replayAll & $verifyAll in
    // their test. This is a noop if they did.
    // This is important because:
    // - Engineers thinks that not all their tests need to replay and verify.
    //   That lets tests sneak in that call mocks but never replay those calls.
    // - Then some well meaning maintenance engineer wants to update the test
    //   with some new mock, adds a replayAll and BOOM the test fails
    //   because completely unrelated mocks now get replayed.
    if (this.mockControl) {
      this.mockControl.$verifyAll();
      this.mockControl.$replayAll();
      this.mockControl.$verifyAll();
      this.mockControl.$resetAll();
    }
    // Verifying the mockControl may throw, so if cleanup needs to happen,
    // add it further up in the function.
  },


  /**
   * Create a new {@see goog.testing.MockControl} accessible via
   * {@code env.mockControl} for each test. If your test has more than one
   * testing environment, don't call this on more than one of them.
   * @return {goog.labs.testing.Environment} For chaining.
   */
  withMockControl: function() {
    if (!this.shouldMakeMockControl_) {
      this.shouldMakeMockControl_ = true;
      this.mockControl = new goog.testing.MockControl();
    }
    return this;
  },


  /**
   * Create a {@see goog.testing.MockClock} for each test. The clock will be
   * installed (override i.e. setTimeout) by default. It can be accessed
   * using {@code env.mockClock}. If your test has more than one testing
   * environment, don't call this on more than one of them.
   * @return {goog.labs.testing.Environment} For chaining.
   */
  withMockClock: function() {
    if (!this.shouldMakeMockClock_) {
      this.shouldMakeMockClock_ = true;
      this.mockClock = new goog.testing.MockClock(true);
    }
    return this;
  },


  /**
   * Creates a basic strict mock of a {@code toMock}. For more advanced mocking,
   * please use the MockControl directly.
   * @param {Function} toMock
   * @return {!goog.testing.StrictMock}
   */
  mock: function(toMock) {
    if (!this.shouldMakeMockControl_) {
      throw new Error('MockControl not available on this environment. ' +
                      'Call withMockControl if this environment is expected ' +
                      'to contain a MockControl.');
    }
    return this.mockControl.createStrictMock(toMock);
  }
});


/** @private @const {!goog.debug.Console} */
goog.labs.testing.Environment.console_ = new goog.debug.Console();


// Activate logging to the browser's console by default.
goog.labs.testing.Environment.console_.setCapturing(true);



/**
 * An internal TestCase used to hook environments into the JsUnit test runner.
 * Environments cannot be used in conjunction with custom TestCases for JsUnit.
 * @private @final @constructor
 * @extends {goog.testing.TestCase}
 */
goog.labs.testing.EnvironmentTestCase_ = function() {
  goog.labs.testing.EnvironmentTestCase_.base(this, 'constructor');

  /** @private {!Array.<!goog.labs.testing.Environment>}> */
  this.environments_ = [];

  // Automatically install this TestCase when any environment is used in a test.
  goog.testing.TestCase.initializeTestRunner(this);
};
goog.inherits(goog.labs.testing.EnvironmentTestCase_, goog.testing.TestCase);
goog.addSingletonGetter(goog.labs.testing.EnvironmentTestCase_);


/**
 * Override the default global scope discovery of lifecycle functions to prevent
 * overriding the custom environment setUp(Page)/tearDown(Page) logic.
 * @override
 */
goog.labs.testing.EnvironmentTestCase_.prototype.autoDiscoverLifecycle =
    function() {
  if (goog.global['runTests']) {
    this.runTests = goog.bind(goog.global['runTests'], goog.global);
  }
  if (goog.global['shouldRunTests']) {
    this.shouldRunTests = goog.bind(goog.global['shouldRunTests'], goog.global);
  }
};


/**
 * Adds an environment to the JsUnit test.
 * @param {!goog.labs.testing.Environment} env
 * @private
 */
goog.labs.testing.EnvironmentTestCase_.prototype.registerEnvironment_ =
    function(env) {
  this.environments_.push(env);
};


/** @override */
goog.labs.testing.EnvironmentTestCase_.prototype.setUpPage = function() {
  goog.array.forEach(this.environments_, function(env) {
    env.setUpPage();
  });

  // User defined setUpPage method.
  if (goog.global['setUpPage']) {
    goog.global['setUpPage']();
  }
};


/** @override */
goog.labs.testing.EnvironmentTestCase_.prototype.setUp = function() {
  // User defined configure method.
  if (goog.global['configureEnvironment']) {
    goog.global['configureEnvironment']();
  }

  goog.array.forEach(this.environments_, function(env) {
    env.setUp();
  }, this);

  // User defined setUp method.
  if (goog.global['setUp']) {
    goog.global['setUp']();
  }
};


/** @override */
goog.labs.testing.EnvironmentTestCase_.prototype.tearDown = function() {
  var firstException;
  // User defined tearDown method.
  if (goog.global['tearDown']) {
    try {
      goog.global['tearDown']();
    } catch (e) {
      if (!firstException) {
        firstException = e;
      }
    }
  }

  // Execute the tearDown methods for the environment in the reverse order
  // in which they were registered to "unfold" the setUp.
  goog.array.forEachRight(this.environments_, function(env) {
    // For tearDowns between tests make sure they run as much as possible to
    // avoid interference between tests.
    try {
      env.tearDown();
    } catch (e) {
      if (!firstException) {
        firstException = e;
      }
    }
  });
  if (firstException) {
    throw firstException;
  }
};


/** @override */
goog.labs.testing.EnvironmentTestCase_.prototype.tearDownPage = function() {
  // User defined tearDownPage method.
  if (goog.global['tearDownPage']) {
    goog.global['tearDownPage']();
  }

  goog.array.forEachRight(this.environments_, function(env) {
    env.tearDownPage();
  });
};

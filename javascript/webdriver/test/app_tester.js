goog.provide('webdriver.test.AppTester');

goog.require('goog.testing.PropertyReplacer');
goog.require('webdriver.promise.Application');
goog.require('webdriver.test.testutil');


/**
 * @param {!goog.testing.MockClock} clock The clock to use.
 * @constructor
 */
webdriver.test.AppTester = function(clock) {

  /**
   * @type {!goog.testing.MockClock}
   * @private
   */
  this.clock_ = clock;

  /**
   * @type {!goog.testing.PropertyReplacer}
   * @private
   */
  this.stubs_ = new goog.testing.PropertyReplacer();

  /**
   * @type {!webdriver.promise.Application}
   * @private
   */
  this.app_ = new webdriver.promise.Application();

  this.watcher_ = webdriver.test.testutil.callbackPair();
  this.$attachAppListener(this.watcher_);

  var app = this.app_;
  this.stubs_.set(webdriver.promise.Application, 'getInstance', function() {
    return app;
  });
};


webdriver.test.AppTester.prototype.$attachAppListener = function(callbackPair) {
  this.app_.addListener(webdriver.promise.Application.EventType.IDLE,
      callbackPair.callback);
  this.app_.addListener(
      webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION,
      callbackPair.errback);
};


webdriver.test.AppTester.prototype.$removeAppListener = function(callbackPair) {
  this.app_.removeListener(webdriver.promise.Application.EventType.IDLE,
      callbackPair.callback);
  this.app_.removeListener(
      webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION,
      callbackPair.errback);
};


/**
 * Advances the clock so the {@link webdriver.promise.Application}'s event
 * loop will run once.
 * @param {Function=} opt_fn The function to call, if any, after turning the
 *     event loop once.
 * @param {...*} var_args Any arguments that should be passed to the function
 *     after the event loop.
 */
webdriver.test.AppTester.prototype.$turnEventLoop = function(opt_fn, var_args) {
  this.clock_.tick(webdriver.promise.Application.EVENT_LOOP_FREQUENCY);
  if (opt_fn) {
    opt_fn.apply(null, goog.array.slice(arguments, 1));
  }
};


/**
 * Runs the application, turning its event loop until it is expected to have
 * shutdown (as indicated by having no more frames, or no frames with pending
 * tasks).  The application will be expected to either pass or fail based on
 * whether a function is provided for opt_callback or opt_errback (only one
 * may be specfied). If neither callback is provided, the application will be
 * expected to pass.
 * @param {Function=} opt_callback The function to call after the application
 *     passes (if it is expected to pass).
 * @param {Function=} opt_errback The function to call after the application
 *     fails (if it is expected to fail).
 * @param {boolean=} opt_ignoreResult Whether the final outcome of the
 *     application should be ignored.
 */
webdriver.test.AppTester.prototype.$runApplication = function(
    opt_callback, opt_errback, opt_ignoreResult) {
  if ((goog.isFunction(opt_callback) && goog.isDefAndNotNull(opt_errback)) ||
      (goog.isDefAndNotNull(opt_callback) && goog.isFunction(opt_errback))) {
    fail('You may only expect the application to pass or fail, not both!');
  }

  var app = this.app_;
  var isDone = false;
  var self = this;
  var callbacks = webdriver.test.testutil.callbackPair(
      function() {
        isDone = true;
        opt_callback && opt_callback();
      },
      function(e) {
        isDone = true;
        opt_errback && opt_errback(e);
      });

  this.$attachAppListener(callbacks);

  var shouldBeDone = false;
  try {
    while (!isDone) {
      this.$turnEventLoop(
          shouldBeDone ? assertIsDone : determineIfShouldBeDone);
      // If the event loop generated an unhandled promise, it won't be reported
      // until one more turn of the JS event loop, so we need to tick the
      // clock once more. This is necessary for our tests to simulate a real
      // JS environment.
      this.clock_.tick();
    }
  } finally {
    this.$removeAppListener(callbacks);
  }

  if (!opt_ignoreResult) {
    opt_errback ?
        callbacks.assertErrback('App was expected to fail') :
        callbacks.assertCallback('App was not expected to fail');
  }

  function assertIsDone() {
    // Shutdown is done in one extra turn of the event loop.
    self.clock_.tick();
    if (!isDone && !app.activeFrame_) {
      // Not done yet, but there are no frames left.  This can happen if the
      // very first scheduled task was scheduled inside of a promise callback.
      // Turn the event loop one more time; the app should detect that it is now
      // finished and start the shutdown procedure.  Don't recurse here since
      // we could go into an infinite loop if the app is broken.
      self.$turnEventLoop();
      self.clock_.tick();
    }
    assertTrue('Should be done now: ' + app.getSchedule(), isDone);
  }

  function determineIfShouldBeDone() {
    shouldBeDone = !app.activeFrame_;
  }
};


webdriver.test.AppTester.prototype.$assertAppNotRunning = function() {
  this.watcher_.assertEither('App is still running!');
};


webdriver.test.AppTester.prototype.$assertAppIsStillRunning = function() {
  this.watcher_.assertNeither('App should not be done yet');
};


webdriver.test.AppTester.prototype.$tearDown = function() {
  webdriver.test.testutil.consumeTimeouts();
  this.app_.reset();
  this.stubs_.reset();
  this.clock_.dispose();
};


webdriver.test.AppTester.proxyAppCall = function(prototypeFn) {
  return function() {
    return prototypeFn.apply(this.app_, arguments);
  };
};


webdriver.test.AppTester.prototype.schedule =
    webdriver.test.AppTester.proxyAppCall(
        webdriver.promise.Application.prototype.schedule);

webdriver.test.AppTester.prototype.scheduleWait =
    webdriver.test.AppTester.proxyAppCall(
        webdriver.promise.Application.prototype.scheduleWait);

webdriver.test.AppTester.prototype.getHistory =
    webdriver.test.AppTester.proxyAppCall(
        webdriver.promise.Application.prototype.getHistory);

webdriver.test.AppTester.prototype.clearHistory =
    webdriver.test.AppTester.proxyAppCall(
        webdriver.promise.Application.prototype.clearHistory);

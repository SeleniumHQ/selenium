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
 * @fileoverview A test case that uses the WebDriver Javascript API. Each phase
 * of a test (setUp, test function, and tearDown) will be called with an
 * instance of a {@code webdriver.WebDriver} that can be used to schedule
 * commands for controlling the browser (e.g. clicking or typing on an
 * element).
 * <p>
 * Unlike pure JavaScript test frameworks like Selenium, WebDriver controls the
 * browser directly, allowing for more accurate simulation of user actions in a
 * web application.
 * <p>
 * See below for a basic example of using WebDriver to test cut and paste in
 * a contentEditable document.
 * <pre>
 *   goog.require('goog.dom');
 *   goog.require('webdriver.asserts');
 *   goog.require('webdriver.jsunit');
 *
 *   var richTextFrame;
 *
 *   function setUp() {
 *     richTextFrame = goog.dom.$('rtframe');
 *     richTextFrame.contentWindow.document.designMode = 'on';
 *     richTextFrame.contentWindow.document.body.innerHTML = '';
 *   }
 *
 *   function testCutAndPaste(driver) {
 *     driver.switchToFrame('rtframe');
 *     var body = driver.findElement({xpath: '//body'});
 *     body.sendKeys('abc', webdriver.Key.CONTROL, 'axvv');
 *     driver.callFunction(function() {
 *       assertEquals('abcabc',
 *           richTextFrame.contentWindow.document.body.innerHTML);
 *     });
 *   }
 * </pre>
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.TestCase');
goog.provide('webdriver.TestCase.Test');

goog.require('goog.events');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.TestCase.Test');
goog.require('goog.testing.asserts');
goog.require('webdriver.Command');



/**
 * A specialized test case for running jsunit tests with the WebDriver
 * framework. Each phase of a test (setUp, test, and tearDown) will be given an
 * instance of {@code webdriver.WebDriver} that can be used to schedule
 * commands for controlling the browser.
 * @param {string} name The name of the test case.
 * @param {function(): webdriver.WebDriver} driverFactoryFn Factory function to
 *     use for creating {@code webdriver.WebDriver} instances for each test.
 * @extends {goog.testing.TestCase}
 * @constructor
 */
webdriver.TestCase = function(name, driverFactoryFn) {
  goog.testing.TestCase.call(this, name);

  /**
   * Factory function use for creating {@code webdriver.WebDriver}
   * instances for each test.
   * @type {function(): webdriver.WebDriver}
   * @private
   */
  this.driverFactoryFn_ = driverFactoryFn;
};
goog.inherits(webdriver.TestCase, goog.testing.TestCase);


/** @override */
webdriver.TestCase.prototype.cycleTests = function() {
  this.saveMessage('Start');
  this.batchTime_ = this.now_();
  this.startTest_();
};


/**
 * Starts a test.
 * @private
 */
webdriver.TestCase.prototype.startTest_ = function() {
  var test = this.next();
  if (!test || !this.running) {
    this.finalize();  // Tests are done.
    return;
  }

  // TODO(jleyba): result_ should be exposed using a public accessor.
  this.result_.runCount++;
  this.log('Running test: ' + test.name);
  goog.testing.TestCase.currentTestName = test.name;

  var driver;
  try {
    driver = this.driverFactoryFn_();

    // Attach an error handler to record each command failure as an error for
    // the current test. After each error, the currently pending command and
    // all of its subcommands so we can continue the test.
    goog.events.listen(driver, webdriver.Command.ERROR_EVENT,
        function(e) {
//          console.error('error event!');
          var failingCommand = (/** @type {webdriver.Command} */e.target);
//          console.dir(failingCommand);
          if (!failingCommand.getResponse()) {
            // This should never happen, but just in case.
            test.errors.push('Unknown error');
          } else {
            test.errors.push(failingCommand.getResponse().getErrorMessage());
          }
          driver.abortCommand(null);
        }, /*capture=*/false);

    // TODO(jleyba): make this automatic upon creating an instance.
    driver.newSession(true);

    // If setup fails, we don't want to run the test function, so group setup
    // and the test function together in a function command.
    driver.callFunction(function() {
      this.setUp(driver);
      // Wrap the call to the actual test function in a function command. This
      // will ensure all of the commands scheduled in setUp will executed before
      // the test function is called.
      driver.callFunction(function() {
        test.ref.call(test.scope, driver);
      });
    }, this);

    // Call tearDown once all setup and test commands have completed.
    driver.callFunction(function() {
      this.tearDown(driver);
    }, this);

    // Likewise, once tearDown is completely finished, finish the test.
    driver.callFunction(function() {
      this.finishTest_(test, driver);
    }, this);
  } catch (e) {
    test.errors.push(e);
    this.finishTest_(test, driver);
  }
};

/**
 * Completes a test.
 * @param {webdriver.TestCase.Test} test The test to complete.
 * @param {webdriver.WebDriver} driver The driver instance used by the test.
 * @private
 */
webdriver.TestCase.prototype.finishTest_ = function(test, driver) {
  if (driver) {
    driver.dispose();
  }
  goog.testing.TestCase.currentTestName = null;
  var numErrors = test.errors.length;
  if (numErrors) {
    for (var i = 0; i < numErrors; i++) {
      this.doError(test, test.errors[i]);
    }
  } else {
    this.doSuccess(test);
  }
  this.startTest_();  // Start the next test.
};


/** @override */
webdriver.TestCase.prototype.createTestFromAutoDiscoveredFunction =
    function(name, ref) {
  return new webdriver.TestCase.Test(name, ref, goog.global);    
};


/**
 * Represents a single test function that will be run by a
 * {@code webdriver.TestCase}.
 * @param {string} name The test name.
 * @param {function} ref Reference to the test function.
 * @param {Object} opt_scope Optional scope that the test function should be
 *     called in.
 * @constructor
 * @extends {goog.testing.TestCase.Test}
 */
webdriver.TestCase.Test = function(name, ref, opt_scope) {
  goog.testing.TestCase.Test.call(this, name, ref, opt_scope);

  /**
   * The errors that occurred while running this test.
   * @type {Array.<string|Error>}
   */
  this.errors = [];
};
goog.inherits(webdriver.TestCase.Test, goog.testing.TestCase.Test);


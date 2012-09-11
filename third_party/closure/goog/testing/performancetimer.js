// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Performance timer.
 *
 * {@see goog.testing.benchmark} for an easy way to use this functionality.
 *
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.testing.PerformanceTimer');
goog.provide('goog.testing.PerformanceTimer.Task');

goog.require('goog.array');
goog.require('goog.math');



/**
 * Creates a performance timer that runs test functions a number of times to
 * generate timing samples, and provides performance statistics (minimum,
 * maximum, average, and standard deviation).
 * @param {number=} opt_numSamples Number of times to run the test function;
 *     defaults to 10.
 * @param {number=} opt_timeoutInterval Number of milliseconds after which the
 *     test is to be aborted; defaults to 5 seconds (5,000ms).
 * @constructor
 */
goog.testing.PerformanceTimer = function(opt_numSamples, opt_timeoutInterval) {
  /**
   * Number of times the test function is to be run; defaults to 10.
   * @type {number}
   * @private
   */
  this.numSamples_ = opt_numSamples || 10;

  /**
   * Number of milliseconds after which the test is to be aborted; defaults to
   * 5,000ms.
   * @type {number}
   * @private
   */
  this.timeoutInterval_ = opt_timeoutInterval || 5000;

  /**
   * Whether to discard outliers (i.e. the smallest and the largest values)
   * from the sample set before computing statistics.  Defaults to false.
   * @type {boolean}
   * @private
   */
  this.discardOutliers_ = false;
};


/**
 * @return {number} The number of times the test function will be run.
 */
goog.testing.PerformanceTimer.prototype.getNumSamples = function() {
  return this.numSamples_;
};


/**
 * Sets the number of times the test function will be run.
 * @param {number} numSamples Number of times to run the test function.
 */
goog.testing.PerformanceTimer.prototype.setNumSamples = function(numSamples) {
  this.numSamples_ = numSamples;
};


/**
 * @return {number} The number of milliseconds after which the test times out.
 */
goog.testing.PerformanceTimer.prototype.getTimeoutInterval = function() {
  return this.timeoutInterval_;
};


/**
 * Sets the number of milliseconds after which the test times out.
 * @param {number} timeoutInterval Timeout interval in ms.
 */
goog.testing.PerformanceTimer.prototype.setTimeoutInterval = function(
    timeoutInterval) {
  this.timeoutInterval_ = timeoutInterval;
};


/**
 * Sets whether to ignore the smallest and the largest values when computing
 * stats.
 * @param {boolean} discard Whether to discard outlier values.
 */
goog.testing.PerformanceTimer.prototype.setDiscardOutliers = function(discard) {
  this.discardOutliers_ = discard;
};


/**
 * @return {boolean} Whether outlier values are discarded prior to computing
 *     stats.
 */
goog.testing.PerformanceTimer.prototype.isDiscardOutliers = function() {
  return this.discardOutliers_;
};


/**
 * Executes the test function the required number of times (or until the
 * test run exceeds the timeout interval, whichever comes first).  Returns
 * an object containing the following:
 * <pre>
 *   {
 *     'average': average execution time (ms)
 *     'count': number of executions (may be fewer than expected due to timeout)
 *     'maximum': longest execution time (ms)
 *     'minimum': shortest execution time (ms)
 *     'standardDeviation': sample standard deviation (ms)
 *     'total': total execution time (ms)
 *   }
 * </pre>
 *
 * @param {Function} testFn Test function whose performance is to
 *     be measured.
 * @return {Object} Object containing performance stats.
 */
goog.testing.PerformanceTimer.prototype.run = function(testFn) {
  return this.runTask(new goog.testing.PerformanceTimer.Task(
      (/** @type {function()} */ testFn)));
};


/**
 * Executes the test function of the specified task as described in
 * {@code run}. In addition, if specified, the set up and tear down functions of
 * the task are invoked before and after each invocation of the test function.
 * @see goog.testing.PerformanceTimer#run
 * @param {goog.testing.PerformanceTimer.Task} task A task describing the test
 *     function to invoke.
 * @return {Object} Object containing performance stats.
 */
goog.testing.PerformanceTimer.prototype.runTask = function(task) {
  var samples = [];
  var testStart = goog.now();
  var totalRunTime = 0;

  var testFn = task.getTest();
  var setUpFn = task.getSetUp();
  var tearDownFn = task.getTearDown();

  for (var i = 0; i < this.numSamples_ && totalRunTime <= this.timeoutInterval_;
       i++) {
    setUpFn();
    var sampleStart = goog.now();
    testFn();
    var sampleEnd = goog.now();
    tearDownFn();
    samples[i] = sampleEnd - sampleStart;
    totalRunTime = sampleEnd - testStart;
  }

  if (this.discardOutliers_ && samples.length > 2) {
    goog.array.remove(samples, Math.min.apply(null, samples));
    goog.array.remove(samples, Math.max.apply(null, samples));
  }

  return goog.testing.PerformanceTimer.createResults(samples);
};


/**
 * Creates a performance timer results object by analyzing a given array of
 * sample timings.
 * @param {Array.<number>} samples The samples to analyze.
 * @return {Object} Object containing performance stats.
 */
goog.testing.PerformanceTimer.createResults = function(samples) {
  return {
    'average': goog.math.average.apply(null, samples),
    'count': samples.length,
    'maximum': Math.max.apply(null, samples),
    'minimum': Math.min.apply(null, samples),
    'standardDeviation': goog.math.standardDeviation.apply(null, samples),
    'total': goog.math.sum.apply(null, samples)
  };
};



/**
 * A task for the performance timer to measure. Callers can specify optional
 * setUp and tearDown methods to control state before and after each run of the
 * test function.
 * @param {function()} test Test function whose performance is to be measured.
 * @constructor
 */
goog.testing.PerformanceTimer.Task = function(test) {
  /**
   * The test function to time.
   * @type {function()}
   * @private
   */
  this.test_ = test;
};


/**
 * An optional set up function to run before each invocation of the test
 * function.
 * @type {function()}
 * @private
 */
goog.testing.PerformanceTimer.Task.prototype.setUp_ = goog.nullFunction;


/**
 * An optional tear down function to run after each invocation of the test
 * function.
 * @type {function()}
 * @private
 */
goog.testing.PerformanceTimer.Task.prototype.tearDown_ = goog.nullFunction;


/** @return {function()} The test function to time. */
goog.testing.PerformanceTimer.Task.prototype.getTest = function() {
  return this.test_;
};


/**
 * Specifies a set up function to be invoked before each invocation of the test
 * function.
 * @param {function()} setUp The set up function.
 * @return {goog.testing.PerformanceTimer.Task} This task.
 */
goog.testing.PerformanceTimer.Task.prototype.withSetUp = function(setUp) {
  this.setUp_ = setUp;
  return this;
};


/**
 * @return {function()} The set up function or null if none was specified.
 */
goog.testing.PerformanceTimer.Task.prototype.getSetUp = function() {
  return this.setUp_;
};


/**
 * Specifies a tear down function to be invoked after each invocation of the
 * test function.
 * @param {function()} tearDown The tear down function.
 * @return {goog.testing.PerformanceTimer.Task} This task.
 */
goog.testing.PerformanceTimer.Task.prototype.withTearDown = function(tearDown) {
  this.tearDown_ = tearDown;
  return this;
};


/**
 * @return {function()} The tear down function or null if none was specified.
 */
goog.testing.PerformanceTimer.Task.prototype.getTearDown = function() {
  return this.tearDown_;
};

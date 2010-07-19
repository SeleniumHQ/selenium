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
*
 */

goog.provide('goog.testing.PerformanceTimer');

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
  var samples = [];
  var testStart = goog.now();

  for (var i = 0; i < this.numSamples_; i++) {
    var sampleStart = goog.now();
    testFn();
    var sampleEnd = goog.now();
    samples[i] = sampleEnd - sampleStart;
    if (sampleEnd - testStart > this.timeoutInterval_) {
      // Timed out.
      break;
    }
  }

  if (this.discardOutliers_ && samples.length > 2) {
    goog.array.remove(samples, Math.min.apply(null, samples));
    goog.array.remove(samples, Math.max.apply(null, samples));
  }

  return {
    'average': goog.math.average.apply(null, samples),
    'count': i,
    'maximum': Math.max.apply(null, samples),
    'minimum': Math.min.apply(null, samples),
    'standardDeviation': goog.math.standardDeviation.apply(null, samples),
    'total': goog.math.sum.apply(null, samples)
  };
};

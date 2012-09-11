// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A table for showing the results of performance testing.
 *
 * {@see goog.testing.benchmark} for an easy way to use this functionality.
 *
 * @author attila@google.com (Attila Bodis)
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.testing.PerformanceTable');

goog.require('goog.dom');
goog.require('goog.testing.PerformanceTimer');



/**
 * A UI widget that runs performance tests and displays the results.
 * @param {Element} root The element where the table should be attached.
 * @param {goog.testing.PerformanceTimer=} opt_timer A timer to use for
 *     executing functions and profiling them.
 * @param {number=} opt_precision Number of digits of precision to include in
 *     results.  Defaults to 0.
 * @constructor
 */
goog.testing.PerformanceTable = function(root, opt_timer, opt_precision) {
  /**
   * Where the table should be attached.
   * @type {Element}
   * @private
   */
  this.root_ = root;

  /**
   * Number of digits of precision to include in results.
   * Defaults to 0.
   * @type {number}
   * @private
   */
  this.precision_ = opt_precision || 0;

  var timer = opt_timer;
  if (!timer) {
    timer = new goog.testing.PerformanceTimer();
    timer.setNumSamples(5);
    timer.setDiscardOutliers(true);
  }

  /**
   * A timer for running the tests.
   * @type {goog.testing.PerformanceTimer}
   * @private
   */
  this.timer_ = timer;

  this.initRoot_();
};


/**
 * @return {goog.testing.PerformanceTimer} The timer being used.
 */
goog.testing.PerformanceTable.prototype.getTimer = function() {
  return this.timer_;
};


/**
 * Render the initial table.
 * @private
 */
goog.testing.PerformanceTable.prototype.initRoot_ = function() {
  this.root_.innerHTML =
      '<table class="test-results" cellspacing="1">' +
      '  <thead>' +
      '    <tr>' +
      '      <th rowspan="2">Test Description</th>' +
      '      <th rowspan="2">Runs</th>' +
      '      <th colspan="4">Results (ms)</th>' +
      '    </tr>' +
      '    <tr>' +
      '      <th>Average</th>' +
      '      <th>Std Dev</th>' +
      '      <th>Minimum</th>' +
      '      <th>Maximum</th>' +
      '    </tr>' +
      '  </thead>' +
      '  <tbody>' +
      '  </tbody>' +
      '</table>';
};


/**
 * @return {Element} The body of the table.
 * @private
 */
goog.testing.PerformanceTable.prototype.getTableBody_ = function() {
  return this.root_.getElementsByTagName(goog.dom.TagName.TBODY)[0];
};


/**
 * Round to the specified precision.
 * @param {number} num The number to round.
 * @return {string} The rounded number, as a string.
 * @private
 */
goog.testing.PerformanceTable.prototype.round_ = function(num) {
  var factor = Math.pow(10, this.precision_);
  return String(Math.round(num * factor) / factor);
};


/**
 * Run the given function with the performance timer, and show the results.
 * @param {Function} fn The function to run.
 * @param {string=} opt_desc A description to associate with this run.
 */
goog.testing.PerformanceTable.prototype.run = function(fn, opt_desc) {
  this.runTask(
      new goog.testing.PerformanceTimer.Task((/** @type {function()} */ fn)),
      opt_desc);
};


/**
 * Run the given task with the performance timer, and show the results.
 * @param {goog.testing.PerformanceTimer.Task} task The performance timer task
 *     to run.
 * @param {string=} opt_desc A description to associate with this run.
 */
goog.testing.PerformanceTable.prototype.runTask = function(task, opt_desc) {
  var results = this.timer_.runTask(task);
  this.recordResults(results, opt_desc);
};


/**
 * Record a performance timer results object to the performance table. See
 * {@code goog.testing.PerformanceTimer} for details of the format of this
 * object.
 * @param {Object} results The performance timer results object.
 * @param {string=} opt_desc A description to associate with these results.
 */
goog.testing.PerformanceTable.prototype.recordResults = function(
    results, opt_desc) {
  var average = results['average'];
  var standardDeviation = results['standardDeviation'];
  var isSuspicious = average < 0 || standardDeviation > average * .5;
  var resultsRow = goog.dom.createDom('tr', null,
      goog.dom.createDom('td', 'test-description',
          opt_desc || 'No description'),
      goog.dom.createDom('td', 'test-count', String(results['count'])),
      goog.dom.createDom('td', 'test-average', this.round_(average)),
      goog.dom.createDom('td', 'test-standard-deviation',
          this.round_(standardDeviation)),
      goog.dom.createDom('td', 'test-minimum', String(results['minimum'])),
      goog.dom.createDom('td', 'test-maximum', String(results['maximum'])));
  if (isSuspicious) {
    resultsRow.className = 'test-suspicious';
  }
  this.getTableBody_().appendChild(resultsRow);
};


/**
 * Report an error in the table.
 * @param {*} reason The reason for the error.
 */
goog.testing.PerformanceTable.prototype.reportError = function(reason) {
  this.getTableBody_().appendChild(
      goog.dom.createDom('tr', null,
          goog.dom.createDom('td', {'class': 'test-error', 'colSpan': 5},
              String(reason))));
};

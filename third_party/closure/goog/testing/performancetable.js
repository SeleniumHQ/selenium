/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A table for showing the results of performance testing.
 *
 * {@see goog.testing.benchmark} for an easy way to use this functionality.
 */

goog.setTestOnly('goog.testing.PerformanceTable');
goog.provide('goog.testing.PerformanceTable');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.string.Const');
goog.require('goog.testing.PerformanceTimer');



/**
 * A UI widget that runs performance tests and displays the results.
 * @param {Element} root The element where the table should be attached.
 * @param {goog.testing.PerformanceTimer=} opt_timer A timer to use for
 *     executing functions and profiling them.
 * @param {number=} opt_precision Number of digits of precision to include in
 *     results.  Defaults to 0.
 * @param {number=} opt_numSamples The number of samples to take. Defaults to 5.
 * @constructor
 * @final
 */
goog.testing.PerformanceTable = function(
    root, opt_timer, opt_precision, opt_numSamples) {
  'use strict';
  /**
   * Where the table should be attached.
   * @private {Element}
   */
  this.root_ = root;

  /**
   * Number of digits of precision to include in results.
   * Defaults to 0.
   * @private {number}
   */
  this.precision_ = opt_precision || 0;

  var timer = opt_timer;
  if (!timer) {
    timer = new goog.testing.PerformanceTimer();
    timer.setNumSamples(opt_numSamples || 5);
    timer.setDiscardOutliers(true);
  }

  /**
   * A timer for running the tests.
   * @private {goog.testing.PerformanceTimer}
   */
  this.timer_ = timer;

  this.initRoot_();
};


/**
 * @return {goog.testing.PerformanceTimer} The timer being used.
 */
goog.testing.PerformanceTable.prototype.getTimer = function() {
  'use strict';
  return this.timer_;
};


/**
 * Render the initial table.
 * @private
 */
goog.testing.PerformanceTable.prototype.initRoot_ = function() {
  'use strict';
  goog.dom.safe.setInnerHtmlFromConstant(
      goog.asserts.assert(this.root_),
      goog.string.Const.from(
          '<table class="test-results" cellspacing="1">' +
          '  <thead>' +
          '    <tr>' +
          '      <th rowspan="2">Test Description</th>' +
          '      <th rowspan="2">Runs</th>' +
          '      <th colspan="4">Results (ms)</th>' +
          '    </tr>' +
          '    <tr>' +
          '      <th>Average</th>' +
          '      <th>Median</th>' +
          '      <th>Std Dev</th>' +
          '      <th>Minimum</th>' +
          '      <th>Maximum</th>' +
          '    </tr>' +
          '  </thead>' +
          '  <tbody>' +
          '  </tbody>' +
          '</table>'));
};


/**
 * @return {!Element} The body of the table.
 * @private
 */
goog.testing.PerformanceTable.prototype.getTableBody_ = function() {
  'use strict';
  return goog.dom.getElementsByTagName(
      goog.dom.TagName.TBODY, goog.asserts.assert(this.root_))[0];
};


/**
 * Round to the specified precision.
 * @param {number} num The number to round.
 * @return {string} The rounded number, as a string.
 * @private
 */
goog.testing.PerformanceTable.prototype.round_ = function(num) {
  'use strict';
  var factor = Math.pow(10, this.precision_);
  return String(Math.round(num * factor) / factor);
};


/**
 * Run the given function with the performance timer, and show the results.
 * @param {Function} fn The function to run.
 * @param {string=} opt_desc A description to associate with this run.
 */
goog.testing.PerformanceTable.prototype.run = function(fn, opt_desc) {
  'use strict';
  this.runTask(
      new goog.testing.PerformanceTimer.Task(/** @type {function()} */ (fn)),
      opt_desc);
};


/**
 * Run the given task with the performance timer, and show the results.
 * @param {goog.testing.PerformanceTimer.Task} task The performance timer task
 *     to run.
 * @param {string=} opt_desc A description to associate with this run.
 */
goog.testing.PerformanceTable.prototype.runTask = function(task, opt_desc) {
  'use strict';
  var results = this.timer_.runTask(task);
  this.recordResults(results, opt_desc);
};


/**
 * Record a performance timer results object to the performance table. See
 * `goog.testing.PerformanceTimer` for details of the format of this
 * object.
 * @param {Object} results The performance timer results object.
 * @param {string=} opt_desc A description to associate with these results.
 */
goog.testing.PerformanceTable.prototype.recordResults = function(
    results, opt_desc) {
  'use strict';
  var average = results['average'];
  var standardDeviation = results['standardDeviation'];
  var isSuspicious = average < 0 || standardDeviation > average * .5;
  var resultsRow = goog.dom.createDom(
      goog.dom.TagName.TR, null,
      goog.dom.createDom(
          goog.dom.TagName.TD, 'test-description',
          opt_desc || 'No description'),
      goog.dom.createDom(
          goog.dom.TagName.TD, 'test-count', String(results['count'])),
      goog.dom.createDom(
          goog.dom.TagName.TD, 'test-average', this.round_(average)),
      goog.dom.createDom(
          goog.dom.TagName.TD, 'test-median', String(results['median'])),
      goog.dom.createDom(
          goog.dom.TagName.TD, 'test-standard-deviation',
          this.round_(standardDeviation)),
      goog.dom.createDom(
          goog.dom.TagName.TD, 'test-minimum', String(results['minimum'])),
      goog.dom.createDom(
          goog.dom.TagName.TD, 'test-maximum', String(results['maximum'])));
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
  'use strict';
  this.getTableBody_().appendChild(goog.dom.createDom(
      goog.dom.TagName.TR, null,
      goog.dom.createDom(
          goog.dom.TagName.TD, {'class': 'test-error', 'colSpan': 5},
          String(reason))));
};

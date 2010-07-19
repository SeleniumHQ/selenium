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
 * @fileoverview Utility for running multiple test files that utilize the same
 * interface as goog.testing.TestRunner.  Each test is run in series and their
 * results aggregated.  The main usecase for the MultiTestRunner is to allow
 * the testing of all tests in a project locally.
 *
*
 */

goog.provide('goog.testing.MultiTestRunner');
goog.provide('goog.testing.MultiTestRunner.TestFrame');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.functions');
goog.require('goog.string');
goog.require('goog.ui.Component');
goog.require('goog.ui.ServerChart');
goog.require('goog.ui.ServerChart.ChartType');
goog.require('goog.ui.TableSorter');


/**
 * A component for running multiple tests within the browser.
 * @param {goog.dom.DomHelper=} opt_domHelper A DOM helper.
 * @extends {goog.ui.Component}
 * @constructor
 */
goog.testing.MultiTestRunner = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * Array of tests to execute, when combined with the base path this should be
   * a relative path to the test from the page containing the multi testrunner.
   * @type {Array.<string>}
   * @private
   */
  this.allTests_ = [];

  /**
   * Tests that match the filter function.
   * @type {Array.<string>}
   * @private
   */
  this.activeTests_ = [];

  /**
   * An event handler for handling events.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eh_ = new goog.events.EventHandler(this);

  /**
   * A table sorter for the stats.
   * @type {goog.ui.TableSorter}
   * @private
   */
  this.tableSorter_ = new goog.ui.TableSorter(this.dom_);
};
goog.inherits(goog.testing.MultiTestRunner, goog.ui.Component);


/**
 * Default maximimum amount of time to spend at each stage of the test.
 * @type {number}
 */
goog.testing.MultiTestRunner.DEFAULT_TIMEOUT_MS = 45 * 1000;


/**
 * Messages corresponding to the numeric states.
 * @type {Array.<string>}
 */
goog.testing.MultiTestRunner.STATES = [
  'waiting for test runner',
  'initializing tests',
  'waiting for tests to finish'
];


/**
 * The test suite's name.
 * @type {string} name
 * @private
 */
goog.testing.MultiTestRunner.prototype.name_ = '';


/**
 * The base path used to resolve files within the allTests_ array.
 * @type {string}
 * @private
 */
goog.testing.MultiTestRunner.prototype.basePath_ = '';


/**
 * A set of tests that have finished.  All extant keys map to true.
 * @type {Object.<boolean>}
 * @private
 */
goog.testing.MultiTestRunner.prototype.finished_ = null;


/**
 * Whether the report should contain verbose information about the passes.
 * @type {boolean}
 * @private
 */
goog.testing.MultiTestRunner.prototype.verbosePasses_ = false;


/**
 * Whether to hide passing tests completely in the report, makes verbosePasses_
 * obsolete.
 * @type {boolean}
 * @private
 */
goog.testing.MultiTestRunner.prototype.hidePasses_ = false;


/**
 * Flag used to tell the test runner to stop after the current test.
 * @type {boolean}
 * @private
 */
goog.testing.MultiTestRunner.prototype.stopped_ = false;


/**
 * Flag indicating whether the test runner is active.
 * @type {boolean}
 * @private
 */
goog.testing.MultiTestRunner.prototype.active_ = false;


/**
 * Index of the next test to run.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.prototype.startedCount_ = 0;


/**
 * Count of the results received so far.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.prototype.resultCount_ = 0;


/**
 * Number of passes so far.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.prototype.passes_ = 0;


/**
 * Timestamp for the current start time.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.prototype.startTime_ = 0;


/**
 * Only tests whose paths patch this filter function will be
 * executed.
 * @type {function(string): boolean}
 * @private
 */
goog.testing.MultiTestRunner.prototype.filterFn_ = goog.functions.TRUE;


/**
 * Number of milliseconds to wait for loading and initialization steps.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.prototype.timeoutMs_ =
    goog.testing.MultiTestRunner.DEFAULT_TIMEOUT_MS;


/**
 * An array of objects containing stats about the tests.
 * @type {Array.<Object>?}
 * @private
 */
goog.testing.MultiTestRunner.prototype.stats_ = null;


/**
 * Reference to the start button element.
 * @type {Element}
 * @private
 */
goog.testing.MultiTestRunner.prototype.startButtonEl_ = null;


/**
 * Reference to the stop button element.
 * @type {Element}
 * @private
 */
goog.testing.MultiTestRunner.prototype.stopButtonEl_ = null;


/**
 * Reference to the log element.
 * @type {Element}
 * @private
 */
goog.testing.MultiTestRunner.prototype.logEl_ = null;


/**
 * Reference to the report element.
 * @type {Element}
 * @private
 */
goog.testing.MultiTestRunner.prototype.reportEl_ = null;


/**
 * Reference to the stats element.
 * @type {Element}
 * @private
 */
goog.testing.MultiTestRunner.prototype.statsEl_ = null;


/**
 * Reference to the progress bar's element.
 * @type {Element}
 * @private
 */
goog.testing.MultiTestRunner.prototype.progressEl_ = null;


/**
 * Reference to the progress bar's inner row element.
 * @type {Element}
 * @private
 */
goog.testing.MultiTestRunner.prototype.progressRow_ = null;


/**
 * Reference to the log tab.
 * @type {Element}
 * @private
 */
goog.testing.MultiTestRunner.prototype.logTabEl_ = null;


/**
 * Reference to the report tab.
 * @type {Element}
 * @private
 */
goog.testing.MultiTestRunner.prototype.reportTabEl_ = null;


/**
 * Reference to the stats tab.
 * @type {Element}
 * @private
 */
goog.testing.MultiTestRunner.prototype.statsTabEl_ = null;


/**
 * The number of tests to run at a time.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.prototype.poolSize_ = 1;


/**
 * The size of the stats bucket for the number of files loaded histogram.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.prototype.numFilesStatsBucketSize_ = 20;


/**
 * The size of the stats bucket in ms for the run time histogram.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.prototype.runTimeStatsBucketSize_ = 500;


/**
 * Sets the name for the test suite.
 * @param {string} name The suite's name.
 * @return {goog.testing.MultiTestRunner} Instance for chaining.
 */
goog.testing.MultiTestRunner.prototype.setName = function(name) {
  this.name_ = name;
  return this;
};


/**
 * Returns the name for the test suite.
 * @return {string} The name for the test suite.
 */
goog.testing.MultiTestRunner.prototype.getName = function() {
  return this.name_;
};


/**
 * Sets the basepath that tests added using addTests are resolved with.
 * @param {string} path The relative basepath.
 * @return {goog.testing.MultiTestRunner} Instance for chaining.
 */
goog.testing.MultiTestRunner.prototype.setBasePath = function(path) {
  this.basePath_ = path;
  return this;
};


/**
 * Returns the basepath that tests added using addTests are resolved with.
 * @return {string} The basepath that tests added using addTests are resolved
 *     with.
 */
goog.testing.MultiTestRunner.prototype.getBasePath = function() {
  return this.basePath_;
};


/**
 * Sets whether the report should contain verbose information for tests that
 * pass.
 * @param {boolean} verbose Whether report should be verbose.
 * @return {goog.testing.MultiTestRunner} Instance for chaining.
 */
goog.testing.MultiTestRunner.prototype.setVerbosePasses = function(verbose) {
  this.verbosePasses_ = verbose;
  return this;
};


/**
 * Returns whether the report should contain verbose information for tests that
 * pass.
 * @return {boolean} Whether the report should contain verbose information for
 *     tests that pass.
 */
goog.testing.MultiTestRunner.prototype.getVerbosePasses = function() {
  return this.verbosePasses_;
};


/**
 * Sets whether the report should contain passing tests at all, makes
 * setVerbosePasses obsolete.
 * @param {boolean} hide Whether report should not contain passing tests.
 * @return {goog.testing.MultiTestRunner} Instance for chaining.
 */
goog.testing.MultiTestRunner.prototype.setHidePasses = function(hide) {
  this.hidePasses_ = hide;
  return this;
};


/**
 * Returns whether the report should contain passing tests at all, makes
 * setVerbosePasses obsolete.
 * @return {boolean} Whether the report should contain passing tests at all,
 *     makes setVerbosePasses obsolete.
 */
goog.testing.MultiTestRunner.prototype.getHidePasses = function() {
  return this.hidePasses_;
};


/**
 * Sets the bucket sizes for the histograms.
 * @param {number} f Bucket size for num files loaded histogram.
 * @param {number} t Bucket size for run time histogram.
 * @return {goog.testing.MultiTestRunner} Instance for chaining.
 */
goog.testing.MultiTestRunner.prototype.setStatsBucketSizes = function(f, t) {
  this.numFilesStatsBucketSize_ = f;
  this.runTimeStatsBucketSize_ = t;
  return this;
};


/**
 * Sets the number of milliseconds to wait for the page to load, initialize and
 * run the tests.
 * @param {number} timeout Time in milliseconds.
 * @return {goog.testing.MultiTestRunner} Instance for chaining.
 */
goog.testing.MultiTestRunner.prototype.setTimeout = function(timeout) {
  this.timeoutMs_ = timeout;
  return this;
};


/**
 * Returns the number of milliseconds to wait for the page to load, initialize
 * and run the tests.
 * @return {number} The number of milliseconds to wait for the page to load,
 *     initialize and run the tests.
 */
goog.testing.MultiTestRunner.prototype.getTimeout = function() {
  return this.timeoutMs_;
};


/**
 * Sets the number of tests that can be run at the same time. This only improves
 * performance due to the amount of time spent loading the tests.
 * @param {number} size The number of tests to run at a time.
 * @return {goog.testing.MultiTestRunner} Instance for chaining.
 */
goog.testing.MultiTestRunner.prototype.setPoolSize = function(size) {
  this.poolSize_ = size;
  return this;
};


/**
 * Returns the number of tests that can be run at the same time. This only
 * improves performance due to the amount of time spent loading the tests.
 * @return {number} The number of tests that can be run at the same time. This
 *     only improves performance due to the amount of time spent loading the
 *     tests.
 */
goog.testing.MultiTestRunner.prototype.getPoolSize = function() {
  return this.poolSize_;
};


/**
 * Sets a filter function. Only test paths that match the filter function
 * will be executed.
 * @param {function(string): boolean} filterFn Filters test paths.
 * @return {goog.testing.MultiTestRunner} Instance for chaining.
 */
goog.testing.MultiTestRunner.prototype.setFilterFunction = function(filterFn) {
  this.filterFn_ = filterFn;
  return this;
};


/**
 * Returns a filter function. Only test paths that match the filter function
 * will be executed.
 * @return {function(string): boolean} A filter function. Only test paths that
 *     match the filter function will be executed.

 */
goog.testing.MultiTestRunner.prototype.getFilterFunction = function() {
  return this.filterFn_;
};


/**
 * Adds an array of tests to the tests that the test runner should execute.
 * @param {Array.<string>} tests Adds tests to the test runner.
 * @return {goog.testing.MultiTestRunner} Instance for chaining.
 */
goog.testing.MultiTestRunner.prototype.addTests = function(tests) {
  goog.array.extend(this.allTests_, tests);
  return this;
};


/**
 * Returns the list of all tests added to the runner.
 * @return {Array.<string>} The list of all tests added to the runner.
 */
goog.testing.MultiTestRunner.prototype.getAllTests = function() {
  return this.allTests_;
};


/**
 * Returns the list of tests that will be run when start() is called.
 * @return {Array.<string>} The list of tests that will be run when start() is
 *     called.
 */
goog.testing.MultiTestRunner.prototype.getTestsToRun = function() {
  return goog.array.filter(this.allTests_, this.filterFn_);
};


/**
 * Returns a list of tests from runner that have been marked as failed.
 * @return {Array.<string>} A list of tests from runner that have been marked as
 *     failed.
 */
goog.testing.MultiTestRunner.prototype.getTestsThatFailed = function() {
  var stats = this.stats_;
  var failedTests = [];
  if (stats) {
    for (var i = 0, stat; stat = stats[i]; i++) {
      if (!stat.success) {
        failedTests.push(stat.testFile);
      }
    }
  }
  return failedTests;
};

/**
 * Deletes and re-creates the progress table inside the progess element.
 * @private
 */
goog.testing.MultiTestRunner.prototype.resetProgressDom_ = function() {
  goog.dom.removeChildren(this.progressEl_);
  var progressTable = this.dom_.createDom('table');
  var progressTBody = this.dom_.createDom('tbody');
  this.progressRow_ = this.dom_.createDom('tr');
  for (var i = 0; i < this.activeTests_.length; i++) {
    var progressCell = this.dom_.createDom('td');
    this.progressRow_.appendChild(progressCell);
  }
  progressTBody.appendChild(this.progressRow_);
  progressTable.appendChild(progressTBody);
  this.progressEl_.appendChild(progressTable);
};


/** @inheritDoc */
goog.testing.MultiTestRunner.prototype.createDom = function() {
  goog.testing.MultiTestRunner.superClass_.createDom.call(this);
  var el = this.getElement();
  el.className = goog.getCssName('goog-testrunner');

  this.progressEl_ = this.dom_.createDom('div');
  this.progressEl_.className = goog.getCssName('goog-testrunner-progress');
  el.appendChild(this.progressEl_);

  var buttons = this.dom_.createDom('div');
  buttons.className = goog.getCssName('goog-testrunner-buttons');
  this.startButtonEl_ = this.dom_.createDom('button', null, 'Start');
  this.stopButtonEl_ =
      this.dom_.createDom('button', {'disabled': true}, 'Stop');
  buttons.appendChild(this.startButtonEl_);
  buttons.appendChild(this.stopButtonEl_);
  el.appendChild(buttons);

  this.eh_.listen(this.startButtonEl_, 'click',
      this.onStartClicked_);
  this.eh_.listen(this.stopButtonEl_, 'click',
      this.onStopClicked_);

  this.logEl_ = this.dom_.createElement('div');
  this.logEl_.className = goog.getCssName('goog-testrunner-log');
  el.appendChild(this.logEl_);

  this.reportEl_ = this.dom_.createElement('div');
  this.reportEl_.className = goog.getCssName('goog-testrunner-report');
  this.reportEl_.style.display = 'none';
  el.appendChild(this.reportEl_);

  this.statsEl_ = this.dom_.createElement('div');
  this.statsEl_.className = goog.getCssName('goog-testrunner-stats');
  this.statsEl_.style.display = 'none';
  el.appendChild(this.statsEl_);

  this.logTabEl_ = this.dom_.createDom('div', null, 'Log');
  this.logTabEl_.className =
      goog.getCssName('goog-testrunner-logtab goog-testrunner-activetab');
  el.appendChild(this.logTabEl_);

  this.reportTabEl_ = this.dom_.createDom('div', null, 'Report');
  this.reportTabEl_.className = goog.getCssName('goog-testrunner-reporttab');
  el.appendChild(this.reportTabEl_);

  this.statsTabEl_ = this.dom_.createDom('div', null, 'Stats');
  this.statsTabEl_.className = goog.getCssName('goog-testrunner-statstab');
  el.appendChild(this.statsTabEl_);

  this.eh_.listen(this.logTabEl_, 'click', this.onLogTabClicked_);
  this.eh_.listen(this.reportTabEl_, 'click', this.onReportTabClicked_);
  this.eh_.listen(this.statsTabEl_, 'click', this.onStatsTabClicked_);

};


/** @inheritDoc */
goog.testing.MultiTestRunner.prototype.disposeInternal = function() {
  goog.testing.MultiTestRunner.superClass_.disposeInternal.call(this);
  this.tableSorter_.dispose();
  this.eh_.dispose();
  this.startButtonEl_ = null;
  this.stopButtonEl_ = null;
  this.logEl_ = null;
  this.reportEl_ = null;
  this.progressEl_ = null;
  this.logTabEl_ = null;
  this.reportTabEl_ = null;
  this.statsTabEl_ = null;
  this.statsEl_ = null;
};


/**
 * Starts executing the tests.
 */
goog.testing.MultiTestRunner.prototype.start = function() {
  this.startButtonEl_.disabled = true;
  this.stopButtonEl_.disabled = false;
  this.stopped_ = false;
  this.active_ = true;
  this.finished_ = {};
  this.activeTests_ = this.getTestsToRun();
  this.startedCount_ = 0;
  this.resultCount_ = 0;
  this.passes_ = 0;
  this.stats_ = [];
  this.startTime_ = goog.now();

  this.resetProgressDom_();
  goog.dom.removeChildren(this.logEl_);

  this.resetReport_();
  this.clearStats_();
  this.showTab_(0);

  // Ensure the pool isn't too big.
  while (this.getChildCount() > this.poolSize_) {
    this.removeChildAt(0, true).dispose();
  }

  // Start a test in each runner.
  for (var i = 0; i < this.poolSize_; i++) {
    if (i >= this.getChildCount()) {
      var testFrame = new goog.testing.MultiTestRunner.TestFrame(
          this.basePath_, this.timeoutMs_, this.verbosePasses_, this.dom_);
      this.addChild(testFrame, true);
    }
    this.runNextTest_(
        /** @type {goog.testing.MultiTestRunner.TestFrame} */
        (this.getChildAt(i)));
  }
};


/**
 * Logs a message to the log window.
 * @param {string} msg A message to log.
 */
goog.testing.MultiTestRunner.prototype.log = function(msg) {
  if (msg != '.') {
    msg = this.getTimeStamp_() + ' : ' + msg;
  }

  this.logEl_.appendChild(this.dom_.createDom('div', null, msg));

  // Autoscroll if we're near the bottom.
  var top = this.logEl_.scrollTop;
  var height = this.logEl_.scrollHeight - this.logEl_.offsetHeight;
  if (top == 0 || top > height - 50) {
    this.logEl_.scrollTop = height;
  }
};


/**
 * Processes a result returned from a TestFrame.  If there are tests remaining
 * it will trigger the next one to be run, otherwise if there are no tests and
 * all results have been recieved then it will call finish.
 * @param {goog.testing.MultiTestRunner.TestFrame} frame The frame that just
 *     finished.
 */
goog.testing.MultiTestRunner.prototype.processResult = function(frame) {
  var success = frame.isSuccess();
  var report = frame.getReport();
  var test = frame.getTestFile();

  this.stats_.push(frame.getStats());
  this.finished_[test] = true;

  var prefix = success ? '' : '*** FAILURE *** ';
  this.log(prefix +
      this.trimFileName_(test) + ' : ' + (success ? 'Passed' : 'Failed'));

  this.resultCount_++;

  if (success) {
    this.passes_++;
  }

  this.drawProgressSegment_(test, success);
  this.writeCurrentSummary_();
  if (!(success && this.hidePasses_)) {
    this.drawTestResult_(test, success, report);
  }

  if (!this.stopped_ && this.startedCount_ < this.activeTests_.length) {
    this.runNextTest_(frame);
  } else if (this.resultCount_ == this.activeTests_.length) {
    this.finish_();
  }
};


/**
 * Runs the next available test, if there are any left.
 * @param {goog.testing.MultiTestRunner.TestFrame} frame Where to run the test.
 * @private
 */
goog.testing.MultiTestRunner.prototype.runNextTest_ = function(frame) {
  if (this.startedCount_ < this.activeTests_.length) {
    var nextTest = this.activeTests_[this.startedCount_++];
    this.log(this.trimFileName_(nextTest) + ' : Loading');
    frame.runTest(nextTest);
  }
};


/**
 * Handles the test finishing, processing the results and rendering the report.
 * @private
 */
goog.testing.MultiTestRunner.prototype.finish_ = function() {
  if (this.stopped_) {
    this.log('Stopped');
  } else {
    this.log('Finished');
  }

  this.startButtonEl_.disabled = false;
  this.stopButtonEl_.disabled = true;
  this.active_ = false;

  this.showTab_(1);
  this.drawStats_();

  // Remove all the test frames
  while (this.getChildCount() > 0) {
    this.removeChildAt(0, true).disposeInternal();
  }

  // Compute tests that did not finish before the stop button was hit.
  var unfinished = [];
  for (var i = 0; i < this.activeTests_.length; i++) {
    var test = this.activeTests_[i];
    if (!this.finished_[test]) {
      unfinished.push(test);
    }
  }

  if (unfinished.length) {
    this.reportEl_.appendChild(goog.dom.createDom('pre', undefined,
        'Theses tests did not finish:\n' + unfinished.join('\n')));
  }
};


/**
 * Resets the report, clearing out all children and drawing the initial summary.
 * @private
 */
goog.testing.MultiTestRunner.prototype.resetReport_ = function() {
  goog.dom.removeChildren(this.reportEl_);
  var summary = this.dom_.createDom('div');
  summary.className = goog.getCssName('goog-testrunner-progress-summary');
  this.reportEl_.appendChild(summary);
  this.writeCurrentSummary_();
};


/**
 * Draws the stats for the test run.
 * @private
 */
goog.testing.MultiTestRunner.prototype.drawStats_ = function() {
  this.drawFilesHistogram_();

  // Only show time stats if pool size is 1, otherwise times are wrong.
  if (this.poolSize_ == 1) {
    this.drawRunTimePie_();
    this.drawTimeHistogram_();
  }

  this.drawWorstTestsTable_();
};


/**
 * Draws the histogram showing number of files loaded.
 * @private
 */
goog.testing.MultiTestRunner.prototype.drawFilesHistogram_ = function() {
  this.drawStatsHistogram_(
      'numFilesLoaded',
      this.numFilesStatsBucketSize_,
      goog.functions.identity,
      500,
      'Histogram showing distribution of\nnumber of files loaded per test');
};


/**
 * Draws the histogram showing how long each test took to complete.
 * @private
 */
goog.testing.MultiTestRunner.prototype.drawTimeHistogram_ = function() {
  this.drawStatsHistogram_(
      'totalTime',
      this.runTimeStatsBucketSize_,
      function(x) { return x / 1000; },
      500,
      'Histogram showing distribution of\ntime spent running tests in s');
};


/**
 * Draws a stats histogram.
 * @param {string} statsField Field of the stats object to graph.
 * @param {number} bucketSize The size for the histogram's buckets.
 * @param {function(*, ...[*]): *} valueTransformFn Function for transforming
 *     the x-labels value for display.
 * @param {number} width The width in pixels of the graph.
 * @param {string} title The graph's title.
 * @private
 */
goog.testing.MultiTestRunner.prototype.drawStatsHistogram_ = function(
    statsField, bucketSize, valueTransformFn, width, title) {

  var hist = {}, data = [], xlabels = [], ylabels = [];
  var max = 0;
  for (var i = 0; i < this.stats_.length; i++) {
    var num = this.stats_[i][statsField];
    var bucket = Math.floor(num / bucketSize) * bucketSize;
    if (bucket > max) {
      max = bucket;
    }
    if (!hist[bucket]) {
      hist[bucket] = 1;
    } else {
      hist[bucket]++;
    }
  }
  var maxBucketSize = 0;
  for (var i = 0; i <= max; i += bucketSize) {
    xlabels.push(valueTransformFn(i));
    var count = hist[i] || 0;
    if (count > maxBucketSize) {
      maxBucketSize = count;
    }
    data.push(count);
  }
  var diff = Math.max(1, Math.ceil(maxBucketSize / 10));
  for (var i = 0; i <= maxBucketSize; i += diff) {
    ylabels.push(i);
  }
  var chart = new goog.ui.ServerChart(
      goog.ui.ServerChart.ChartType.VERTICAL_STACKED_BAR, width, 250);
  chart.setTitle(title);
  chart.addDataSet(data, 'ff9900');
  chart.setLeftLabels(ylabels);
  chart.setGridY(ylabels.length - 1);
  chart.setXLabels(xlabels);
  chart.render(this.statsEl_);
};


/**
 * Draws a pie chart showing the percentage of time spent running the tests
 * compared to loading them etc.
 * @private
 */
goog.testing.MultiTestRunner.prototype.drawRunTimePie_ = function() {
  var totalTime = 0, runTime = 0;
  for (var i = 0; i < this.stats_.length; i++) {
    var stat = this.stats_[i];
    totalTime += stat.totalTime;
    runTime += stat.runTime;
  }
  var loadTime = totalTime - runTime;
  var pie = new goog.ui.ServerChart(
      goog.ui.ServerChart.ChartType.PIE, 500, 250);
  pie.setMinValue(0);
  pie.setMaxValue(totalTime);
  pie.addDataSet([runTime, loadTime], 'ff9900');
  pie.setXLabels([
      'Test execution (' + runTime + 'ms)',
      'Loading (' + loadTime + 'ms)']);
  pie.render(this.statsEl_);
};


/**
 * Draws a pie chart showing the percentage of time spent running the tests
 * compared to loading them etc.
 * @private
 */
goog.testing.MultiTestRunner.prototype.drawWorstTestsTable_ = function() {
  this.stats_.sort(function(a, b) {
    return b['numFilesLoaded'] - a['numFilesLoaded'];
  });

  var tbody = goog.bind(this.dom_.createDom, this.dom_, 'tbody');
  var thead = goog.bind(this.dom_.createDom, this.dom_, 'thead');
  var tr = goog.bind(this.dom_.createDom, this.dom_, 'tr');
  var th = goog.bind(this.dom_.createDom, this.dom_, 'th');
  var td = goog.bind(this.dom_.createDom, this.dom_, 'td');
  var a = goog.bind(this.dom_.createDom, this.dom_, 'a');

  var head = thead({'style': 'cursor: pointer'},
      tr(null,
          th(null, ' '),
          th(null, 'Test file'),
          th('center', 'Num files loaded'),
          th('center', 'Run time (ms)'),
          th('center', 'Total time (ms)')));
  var body = tbody();
  var table = this.dom_.createDom('table', null, head, body);

  for (var i = 0; i < this.stats_.length; i++) {
    var stat = this.stats_[i];
    body.appendChild(tr(null,
        td('center', String(i + 1)),
        td(null, a(
            {'href': this.basePath_ + stat['testFile'], 'target': '_blank'},
            stat['testFile'])),
        td('center', String(stat['numFilesLoaded'])),
        td('center', String(stat['runTime'])),
        td('center', String(stat['totalTime']))));
  }

  this.statsEl_.appendChild(table);

  this.tableSorter_.setDefaultSortFunction(goog.ui.TableSorter.numericSort);
  this.tableSorter_.setSortFunction(
      1 /* test file name */, goog.ui.TableSorter.alphaSort);
  this.tableSorter_.decorate(table);
};


/**
 * Clears the stats page.
 * @private
 */
goog.testing.MultiTestRunner.prototype.clearStats_ = function() {
  goog.dom.removeChildren(this.statsEl_);
};


/**
 * Updates the report's summary.
 * @private
 */
goog.testing.MultiTestRunner.prototype.writeCurrentSummary_ = function() {
  var total = this.activeTests_.length;
  var executed = this.resultCount_;
  var passes = this.passes_;
  var duration = Math.round((goog.now() - this.startTime_) / 1000);
  var text = executed + ' of ' + total + ' tests executed.<br>' +
      passes + ' passed, ' + (executed - passes) + ' failed.<br>' +
      'Duration: ' + duration + 's.';
  this.reportEl_.firstChild.innerHTML = text;
};


/**
 * Adds a segment to the progress bar.
 * @param {string} title Title for the segment.
 * @param {*} success Whether the segment should indicate a success.
 * @private
 */
goog.testing.MultiTestRunner.prototype.drawProgressSegment_ =
      function(title, success) {
  var part = this.progressRow_.cells[this.resultCount_ - 1];
  part.title = title + ' : ' + (success ? 'SUCCESS' : 'FAILURE');
  part.style.backgroundColor = success ? '#090' : '#900';
};


/**
 * Draws a test result in the report pane.
 * @param {string} test Test name.
 * @param {*} success Whether the test succeeded.
 * @param {string} report The report.
 * @private
 */
goog.testing.MultiTestRunner.prototype.drawTestResult_ = function(
    test, success, report) {
  var text = goog.string.isEmpty(report) ?
      'No report for ' + test + '\n' : report;
  var el = this.dom_.createDom('div');
  text = goog.string.htmlEscape(text).replace(/\n/g, '<br>');
  if (success) {
    el.className = goog.getCssName('goog-testrunner-report-success');
  } else {
    text += '<a href="' + this.basePath_ + test +
        '">Run individually &raquo;</a><br>&nbsp;';
    el.className = goog.getCssName('goog-testrunner-report-failure');
  }
  el.innerHTML = text;
  this.reportEl_.appendChild(el);
};


/**
 * Returns the current timestamp.
 * @return {string} HH:MM:SS.
 * @private
 */
goog.testing.MultiTestRunner.prototype.getTimeStamp_ = function() {
  var d = new Date;
  return goog.string.padNumber(d.getHours(), 2) + ':' +
      goog.string.padNumber(d.getMinutes(), 2) + ':' +
      goog.string.padNumber(d.getSeconds(), 2);
};


/**
 * Trims a filename to be less than 35-characters, ensuring that we do not break
 * a path part.
 * @param {string} name The file name.
 * @return {string} The shortened name.
 * @private
 */
goog.testing.MultiTestRunner.prototype.trimFileName_ = function(name) {
  if (name.length < 35) {
    return name;
  }
  var parts = name.split('/');
  var result = '';
  while (result.length < 35 && parts.length > 0) {
    result = '/' + parts.pop() + result;
  }
  return '...' + result;
};


/**
 * Shows the report and hides the log if the argument is true.
 * @param {number} tab Which tab to show.
 * @private
 */
goog.testing.MultiTestRunner.prototype.showTab_ = function(tab) {
  var activeTabCssClass = goog.getCssName('goog-testrunner-activetab');
  if (tab == 0) {
    this.logEl_.style.display = '';
    goog.dom.classes.add(this.logTabEl_, activeTabCssClass);
  } else {
    this.logEl_.style.display = 'none';
    goog.dom.classes.remove(this.logTabEl_, activeTabCssClass);
  }

  if (tab == 1) {
    this.reportEl_.style.display = '';
    goog.dom.classes.add(this.reportTabEl_, activeTabCssClass);
  } else {
    this.reportEl_.style.display = 'none';
    goog.dom.classes.remove(this.reportTabEl_, activeTabCssClass);
  }

  if (tab == 2) {
    this.statsEl_.style.display = '';
    goog.dom.classes.add(this.statsTabEl_, activeTabCssClass);
  } else {
    this.statsEl_.style.display = 'none';
    goog.dom.classes.remove(this.statsTabEl_, activeTabCssClass);
  }
};


/**
 * Handles the start button being clicked.
 * @param {goog.events.BrowserEvent} e The click event.
 * @private
 */
goog.testing.MultiTestRunner.prototype.onStartClicked_ = function(e) {
  this.start();
};


/**
 * Handles the stop button being clicked.
 * @param {goog.events.BrowserEvent} e The click event.
 * @private
 */
goog.testing.MultiTestRunner.prototype.onStopClicked_ = function(e) {
  this.stopped_ = true;
  this.finish_();
};


/**
 * Handles the log tab being clicked.
 * @param {goog.events.BrowserEvent} e The click event.
 * @private
 */
goog.testing.MultiTestRunner.prototype.onLogTabClicked_ = function(e) {
  this.showTab_(0);
};


/**
 * Handles the log tab being clicked.
 * @param {goog.events.BrowserEvent} e The click event.
 * @private
 */
goog.testing.MultiTestRunner.prototype.onReportTabClicked_ = function(e) {
  this.showTab_(1);
};


/**
 * Handles the stats tab being clicked.
 * @param {goog.events.BrowserEvent} e The click event.
 * @private
 */
goog.testing.MultiTestRunner.prototype.onStatsTabClicked_ = function(e) {
  this.showTab_(2);
};



/**
 * Class used to manage the interaction with a single iframe.
 * @param {string} basePath The base path for tests.
 * @param {number} timeoutMs The time to wait for the test to load and run.
 * @param {boolean} verbosePasses Whether to show results for passes.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional dom helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.testing.MultiTestRunner.TestFrame = function(
    basePath, timeoutMs, verbosePasses, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * Base path where tests should be resolved from.
   * @type {string}
   * @private
   */
  this.basePath_ = basePath;

  /**
   * The timeout for the test.
   * @type {number}
   * @private
   */
  this.timeoutMs_ = timeoutMs;

  /**
   * Whether to show a summary for passing tests.
   * @type {boolean}
   * @private
   */
  this.verbosePasses_ = verbosePasses;

  /**
   * An event handler for handling events.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eh_ = new goog.events.EventHandler(this);

};
goog.inherits(goog.testing.MultiTestRunner.TestFrame, goog.ui.Component);


/**
 * Reference to the iframe.
 * @type {HTMLIFrameElement}
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.iframeEl_ = null;


/**
 * Whether the iframe for the current test has loaded.
 * @type {boolean}
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.iframeLoaded_ = false;


/**
 * The test file being run.
 * @type {string}
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.testFile_ = '';


/**
 * The report returned from the test.
 * @type {string}
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.report_ = '';


/**
 * The total time loading and running the test in milliseconds.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.totalTime_ = 0;


/**
 * The actual runtime of the test in milliseconds.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.runTime_ = 0;


/**
 * The number of files loaded by the test.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.numFilesLoaded_ = 0;


/**
 * Whether the test was successful, null if no result has been returned yet.
 * @type {?boolean}
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.isSuccess_ = null;


/**
 * Timestamp for the when the test was started.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.startTime_ = 0;


/**
 * Timestamp for the last state, used to determine timeouts.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.lastStateTime_ = 0;


/**
 * The state of the active test.
 * @type {number}
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.currentState_ = 0;


/**
 * Disposes the test frame.
 */
goog.testing.MultiTestRunner.TestFrame.prototype.disposeInternal = function() {
  goog.testing.MultiTestRunner.TestFrame.superClass_.disposeInternal.call(this);
  this.dom_.removeNode(this.iframeEl_);
  this.eh_.dispose();
  this.iframeEl_ = null;
};


/**
 * Runs a test file in this test frame.
 * @param {string} testFile The test to run.
 */
goog.testing.MultiTestRunner.TestFrame.prototype.runTest = function(testFile) {
  this.lastStateTime_ = this.startTime_ = goog.now();

  if (!this.iframeEl_) {
    this.createIframe_();
  }

  this.iframeLoaded_ = false;
  this.currentState_ = 0;
  this.isSuccess_ = null;
  this.report_ = '';
  this.testFile_ = testFile;

  try {
    this.iframeEl_.src = this.basePath_ + testFile;
  } catch (e) {
    // Failures will trigger a JS exception on the local file system.
    this.report_ = this.testFile_ + ' failed to load : ' + e.message;
    this.isSuccess_ = false;
    this.finish_();
    return;
  }

  this.checkForCompletion_();
};


/**
 * @return {string} The test file the TestFrame is running.
 */
goog.testing.MultiTestRunner.TestFrame.prototype.getTestFile = function() {
  return this.testFile_;
};


/**
 * @return {Object} Stats about the test run.
 */
goog.testing.MultiTestRunner.TestFrame.prototype.getStats = function() {
  return {
    'testFile': this.testFile_,
    'success': this.isSuccess_,
    'runTime': this.runTime_,
    'totalTime': this.totalTime_,
    'numFilesLoaded': this.numFilesLoaded_
  };
};


/**
 * @return {string} The report for the test run.
 */
goog.testing.MultiTestRunner.TestFrame.prototype.getReport = function() {
  return this.report_;
};


/**
 * @return {?boolean} Whether the test frame had a success.
 */
goog.testing.MultiTestRunner.TestFrame.prototype.isSuccess = function() {
  return this.isSuccess_;
};


/**
 * Handles the TestFrame finishing a single test.
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.finish_ = function() {
  this.totalTime_ = goog.now() - this.startTime_;
  // TODO(user): Fire an event instead?
  if (this.getParent() && this.getParent().processResult) {
    this.getParent().processResult(this);
  }
};


/**
 * Creates an iframe to run the tests in.  For overriding in unit tests.
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.createIframe_ = function() {
  this.iframeEl_ =
      (/** @type {HTMLIFrameElement} */ this.dom_.createDom('iframe'));
  this.getElement().appendChild(this.iframeEl_);
  this.eh_.listen(this.iframeEl_, 'load', this.onIframeLoaded_);
};


/**
 * Handles the iframe loading.
 * @param {goog.events.BrowserEvent} e The load event.
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.onIframeLoaded_ = function(e) {
  this.iframeLoaded_ = true;
};


/**
 * Checks the active test for completion, keeping track of the tests' various
 * execution stages.
 * @private
 */
goog.testing.MultiTestRunner.TestFrame.prototype.checkForCompletion_ =
    function() {
  var js = goog.dom.getFrameContentWindow(this.iframeEl_);
  switch (this.currentState_) {
    case 0:
      if (this.iframeLoaded_ && js['G_testRunner']) {
        this.lastStateTime_ = goog.now();
        this.currentState_++;
      }
      break;
    case 1:
      if (js['G_testRunner']['isInitialized']()) {
        this.lastStateTime_ = goog.now();
        this.currentState_++;
      }
      break;
    case 2:
      if (js['G_testRunner']['isFinished']()) {
        var tr = js['G_testRunner'];
        this.isSuccess_ = tr['isSuccess']();
        this.report_ = tr['getReport'](this.verbosePasses_);
        this.runTime_ = tr['getRunTime']();
        this.numFilesLoaded_ = tr['getNumFilesLoaded']();
        this.finish_();
        return;
      }
  }

  // Check to see if the test has timed out.
  if (goog.now() - this.lastStateTime_ > this.timeoutMs_) {
    this.report_ = this.testFile_ + ' timed out  ' +
        goog.testing.MultiTestRunner.STATES[this.currentState_];
    this.isSuccess_ = false;
    this.finish_();
    return;
  }

  // Check again in 100ms.
  goog.Timer.callOnce(this.checkForCompletion_, 100, this);
};

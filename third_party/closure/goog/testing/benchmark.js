// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.testing.benchmark');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.PerformanceTable');
goog.require('goog.testing.PerformanceTimer');
goog.require('goog.testing.TestCase');


/**
 * Run the benchmarks.
 * @private
 */
goog.testing.benchmark.run_ = function() {
  // Parse the 'times' query parameter if it's set.
  var times = 200;
  var search = window.location.search;
  var timesMatch = search.match(/(?:\?|&)times=([^?&]+)/i);
  if (timesMatch) {
    times = Number(timesMatch[1]);
  }

  var prefix = 'benchmark';

  // First, get the functions.
  var testSources = goog.testing.TestCase.getGlobals();

  var benchmarks = {};
  var names = [];

  for (var i = 0; i < testSources.length; i++) {
    var testSource = testSources[i];
    for (var name in testSource) {
      if ((new RegExp('^' + prefix)).test(name)) {
        var ref;
        try {
          ref = testSource[name];
        } catch (ex) {
          // NOTE(brenneman): When running tests from a file:// URL on Firefox
          // 3.5 for Windows, any reference to window.sessionStorage raises
          // an "Operation is not supported" exception. Ignore any exceptions
          // raised by simply accessing global properties.
          ref = undefined;
        }

        if (goog.isFunction(ref)) {
          benchmarks[name] = ref;
          names.push(name);
        }
      }
    }
  }

  document.body.appendChild(
      goog.dom.createTextNode(
          'Running ' + names.length + ' benchmarks ' + times + ' times each.'));
  document.body.appendChild(goog.dom.createElement(goog.dom.TagName.BR));

  names.sort();

  // Build a table and timer.
  var performanceTimer = new goog.testing.PerformanceTimer(times);
  performanceTimer.setDiscardOutliers(true);

  var performanceTable = new goog.testing.PerformanceTable(document.body,
      performanceTimer, 2);

  // Next, run the benchmarks.
  for (var i = 0; i < names.length; i++) {
    performanceTable.run(benchmarks[names[i]], names[i]);
  }
};


/**
 * Onload handler that runs the benchmarks.
 * @param {Event} e The event object.
 */
window.onload = function(e) {
  goog.testing.benchmark.run_();
};

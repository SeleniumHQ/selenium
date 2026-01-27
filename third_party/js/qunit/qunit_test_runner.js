// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview QUnit test runner adapter for Selenium's Java test harness.
 *
 * This script registers QUnit callbacks to track test execution and exposes
 * a simple API on window.top that the Java ClosureTestStatement can poll
 * to determine when tests are finished and whether they passed.
 */
(function() {
  'use strict';

  var results = {
    finished: false,
    passed: false,
    report: '',
    failures: []
  };

  // Expose the test runner interface on window.top for the Java harness to poll
  window.top.QUnitTestRunner = {
    isFinished: function() {
      return results.finished;
    },
    isSuccess: function() {
      return results.passed;
    },
    getReport: function() {
      return results.report;
    }
  };

  QUnit.on('testEnd', function(testEnd) {
    if (testEnd.status === 'failed') {
      var fullName = testEnd.fullName.join(' > ');
      var errors = testEnd.errors.map(function(err) {
        var msg = err.message || '';
        if (err.actual !== undefined && err.expected !== undefined) {
          msg += '\n  Expected: ' + JSON.stringify(err.expected);
          msg += '\n  Actual: ' + JSON.stringify(err.actual);
        }
        if (err.stack) {
          msg += '\n  Stack: ' + err.stack;
        }
        return msg;
      });
      results.failures.push({
        name: fullName,
        errors: errors
      });
    }
  });

  QUnit.on('runEnd', function(runEnd) {
    results.finished = true;
    results.passed = runEnd.status === 'passed';

    var lines = [];
    lines.push('QUnit Test Results');
    lines.push('==================');
    lines.push('Status: ' + runEnd.status);
    lines.push('Total: ' + runEnd.testCounts.total);
    lines.push('Passed: ' + runEnd.testCounts.passed);
    lines.push('Failed: ' + runEnd.testCounts.failed);
    lines.push('Skipped: ' + runEnd.testCounts.skipped);
    lines.push('Todo: ' + runEnd.testCounts.todo);
    lines.push('Runtime: ' + runEnd.runtime + 'ms');

    if (results.failures.length > 0) {
      lines.push('');
      lines.push('Failures:');
      lines.push('---------');
      results.failures.forEach(function(failure) {
        lines.push('');
        lines.push('Test: ' + failure.name);
        failure.errors.forEach(function(err) {
          lines.push('  ' + err);
        });
      });
    }

    results.report = lines.join('\n');
  });
})();

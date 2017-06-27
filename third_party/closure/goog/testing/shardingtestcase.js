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
 * @fileoverview Utility for sharding tests.
 *
 * Usage instructions:
 * <ol>
 *   <li>Instead of writing your large test in foo_test.html, write it in
 * foo_test_template.html</li>
 *   <li>Add a call to {@code goog.testing.ShardingTestCase.shardByFileName()}
 * near the top of your test, before any test cases or setup methods.</li>
 *   <li>Symlink foo_test_template.html into different sharded test files
 * named foo_1of4_test.html, foo_2of4_test.html, etc, using `ln -s`.</li>
 *   <li>Add the symlinks as foo_1of4_test.html.
 *       In perforce, run the command `g4 add foo_1of4_test.html` followed
 * by `g4 reopen -t symlink foo_1of4_test.html` so that perforce treats the file
 * as a symlink
 *   </li>
 * </ol>
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.setTestOnly('goog.testing.ShardingTestCase');
goog.provide('goog.testing.ShardingTestCase');

goog.require('goog.asserts');
goog.require('goog.testing.TestCase');



/**
 * A test case that runs tests in per-file shards.
 * @param {number} shardIndex Shard index for this page,
 *     <strong>1-indexed</strong>.
 * @param {number} numShards Number of shards to split up test cases into.
 * @param {string=} opt_name The name of the test case.
 * @extends {goog.testing.TestCase}
 * @constructor
 * @final
 */
goog.testing.ShardingTestCase = function(shardIndex, numShards, opt_name) {
  goog.testing.ShardingTestCase.base(this, 'constructor', opt_name);

  goog.asserts.assert(shardIndex > 0, 'Shard index should be positive');
  goog.asserts.assert(numShards > 0, 'Number of shards should be positive');
  goog.asserts.assert(shardIndex <= numShards, 'Shard index out of bounds');

  /**
   * @type {number}
   * @private
   */
  this.shardIndex_ = shardIndex;

  /**
   * @type {number}
   * @private
   */
  this.numShards_ = numShards;
};
goog.inherits(goog.testing.ShardingTestCase, goog.testing.TestCase);


/**
 * Whether we've actually partitioned the tests yet. We may execute twice
 * ('Run again without reloading') without failing.
 * @type {boolean}
 * @private
 */
goog.testing.ShardingTestCase.prototype.sharded_ = false;


/**
 * Installs a runTests global function that goog.testing.JsUnit will use to
 * run tests, which will run a single shard of the tests present on the page.
 * @override
 */
goog.testing.ShardingTestCase.prototype.runTests = function() {
  if (!this.sharded_) {
    var numTests = this.getCount();
    goog.asserts.assert(
        numTests >= this.numShards_,
        'Must have at least as many tests as shards!');
    var shardSize = Math.ceil(numTests / this.numShards_);
    var startIndex = (this.shardIndex_ - 1) * shardSize;
    var endIndex = startIndex + shardSize;
    goog.asserts.assert(
        this.order == goog.testing.TestCase.Order.SORTED,
        'Only SORTED order is allowed for sharded tests');
    this.setTests(this.getTests().slice(startIndex, endIndex));
    this.sharded_ = true;
  }

  // Call original runTests method to execute the tests.
  goog.testing.ShardingTestCase.base(this, 'runTests');
};


/**
 * Shards tests based on the test filename. Assumes that the filename is
 * formatted like 'foo_1of5_test.html'.
 * @param {string=} opt_name A descriptive name for the test case.
 */
goog.testing.ShardingTestCase.shardByFileName = function(opt_name) {
  var path = window.location.pathname;
  var shardMatch = path.match(/_(\d+)of(\d+)_test\.(js|html)/);
  goog.asserts.assert(
      shardMatch, 'Filename must be of the form "foo_1of5_test.{js,html}"');
  var shardIndex = parseInt(shardMatch[1], 10);
  var numShards = parseInt(shardMatch[2], 10);

  var testCase =
      new goog.testing.ShardingTestCase(shardIndex, numShards, opt_name);
  goog.testing.TestCase.initializeTestRunner(testCase);
};

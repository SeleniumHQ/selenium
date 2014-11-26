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
 * @fileoverview Testing utilities for DOM related tests.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.testing.graphics');

goog.require('goog.graphics.Path');
goog.require('goog.testing.asserts');


/**
 * Array mapping numeric segment constant to a descriptive character.
 * @type {Array<string>}
 * @private
 */
goog.testing.graphics.SEGMENT_NAMES_ = function() {
  var arr = [];
  arr[goog.graphics.Path.Segment.MOVETO] = 'M';
  arr[goog.graphics.Path.Segment.LINETO] = 'L';
  arr[goog.graphics.Path.Segment.CURVETO] = 'C';
  arr[goog.graphics.Path.Segment.ARCTO] = 'A';
  arr[goog.graphics.Path.Segment.CLOSE] = 'X';
  return arr;
}();


/**
 * Test if the given path matches the expected array of commands and parameters.
 * @param {Array<string|number>} expected The expected array of commands and
 *     parameters.
 * @param {goog.graphics.Path} path The path to test against.
 */
goog.testing.graphics.assertPathEquals = function(expected, path) {
  var actual = [];
  path.forEachSegment(function(seg, args) {
    actual.push(goog.testing.graphics.SEGMENT_NAMES_[seg]);
    Array.prototype.push.apply(actual, args);
  });
  assertEquals(expected.length, actual.length);
  for (var i = 0; i < expected.length; i++) {
    if (goog.isNumber(expected[i])) {
      assertTrue(goog.isNumber(actual[i]));
      assertRoughlyEquals(expected[i], actual[i], 0.01);
    } else {
      assertEquals(expected[i], actual[i]);
    }
  }
};

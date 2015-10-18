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
 * @fileoverview Additional asserts for testing ControlRenderers.
 *
 * @author mkretzschmar@google.com (Martin Kretzschmar)
 */

goog.provide('goog.testing.ui.rendererasserts');

goog.require('goog.testing.asserts');
goog.require('goog.ui.ControlRenderer');


/**
 * Assert that a control renderer constructor doesn't call getCssClass.
 *
 * @param {function(new:goog.ui.ControlRenderer)} rendererClassUnderTest The
 *     renderer constructor to test.
 */
goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor =
    function(rendererClassUnderTest) {
  var getCssClassCalls = 0;

  /**
   * @constructor
   * @extends {goog.ui.ControlRenderer}
   * @final
   */
  function TestControlRenderer() {
    rendererClassUnderTest.call(this);
  }
  goog.inherits(TestControlRenderer, rendererClassUnderTest);

  /** @override */
  TestControlRenderer.prototype.getCssClass = function() {
    getCssClassCalls++;
    return TestControlRenderer.superClass_.getCssClass.call(this);
  };

  var testControlRenderer = new TestControlRenderer();

  assertEquals('Constructors should not call getCssClass, ' +
      'getCustomRenderer must be able to override it post construction.',
      0, getCssClassCalls);
};

// Copyright 2017 The Closure Library Authors. All Rights Reserved.
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
 * Utilities intended for refactoring legacy code; allows classifying strings
 * into plain text that does not contain HTML and HTML. Please do NOT use in new
 * code.
 */

goog.provide('goog.dom.textAssert');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');

/**
 * Assert that the string is plain text that does not have HTML, i.e. not
 * affected by HTML escaping. Otherwise, this raises an error if assertions are
 * enabled. It does NOT sanitize nor make any change to the input string. It
 * should only be used when the assertion failure is benign, such as printing
 * spurious tags. DO NOT count on this to remove unsafe HTML. It is only meant
 * for legacy refactoring. Please do NOT use in new code.
 * @param {string} text
 * @return {string}
 */
goog.dom.textAssert.assertHtmlFree = function(text) {
  if (goog.asserts.ENABLE_ASSERTS) {
    var elmt = goog.dom.createElement(goog.dom.TagName.BODY);
    elmt.textContent = text;
    goog.asserts.assert(
        elmt.innerHTML == elmt.textContent,
        'String has HTML original: %s, escaped: %s', text, elmt.innerHTML);
  }
  return text;
};

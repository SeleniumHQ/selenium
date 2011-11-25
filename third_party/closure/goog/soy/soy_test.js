// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides test helpers for Soy tests.
 */

goog.provide('goog.soy.testHelper');
goog.setTestOnly('goog.soy.testHelper');

goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.userAgent');



//
// Fake Soy-generated template functions.
//

var example = {};


example.textNodeTemplate = function(opt_data, opt_sb, opt_injectedData) {
  assertNotNull(opt_data);
  assertNotUndefined(opt_data);
  return goog.string.htmlEscape(opt_data.name);
};


example.singleRootTemplate = function(opt_data, opt_sb, opt_injectedData) {
  assertNotNull(opt_data);
  assertNotUndefined(opt_data);
  return '<span>' + goog.string.htmlEscape(opt_data.name) + '</span>';
};


example.multiRootTemplate = function(opt_data, opt_sb, opt_injectedData) {
  assertNotNull(opt_data);
  assertNotUndefined(opt_data);
  return '<div>Hello</div><div>' + goog.string.htmlEscape(opt_data.name) +
      '</div>';
};


example.injectedDataTemplate = function(opt_data, opt_sb, opt_injectedData) {
  assertNotNull(opt_data);
  assertNotUndefined(opt_data);
  return goog.string.htmlEscape(opt_data.name) +
      goog.string.htmlEscape(opt_injectedData.name);
};


example.noDataTemplate = function(opt_data, opt_sb, opt_injectedData) {
  assertNotNull(opt_data);
  assertNotUndefined(opt_data);
  return '<div>Hello</div>';
};


//
// Test helper functions.
//

/**
 * Retrieves the content of document fragment as HTML.
 * @param {Node} fragment The document fragment.
 * @return {string} Content of the document fragment as HTML.
 */
function fragmentToHtml(fragment) {
  var testDiv = goog.dom.createElement(goog.dom.TagName.DIV);
  testDiv.appendChild(fragment);
  return elementToInnerHtml(testDiv);
}


/**
 * Retrieves the content of an element as HTML.
 * @param {Element} elem The element.
 * @return {string} Content of the element as HTML.
 */
function elementToInnerHtml(elem) {
  var innerHtml = elem.innerHTML;
  if (goog.userAgent.IE) {
    innerHtml = innerHtml.replace(/DIV/g, 'div').replace(/\s/g, '');
  }
  return innerHtml;
}

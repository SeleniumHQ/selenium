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

/** @suppress {extraProvide} */
goog.provide('goog.soy.testHelper');
goog.setTestOnly('goog.soy.testHelper');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.soy.data.SanitizedContent');
goog.require('goog.soy.data.SanitizedContentKind');
goog.require('goog.string');
goog.require('goog.userAgent');



/**
 * Instantiable subclass of SanitizedContent.
 *
 * This is a spoof for sanitized content that isn't robust enough to get
 * through Soy's escaping functions but is good enough for the checks here.
 *
 * @constructor
 * @param {string} content The text.
 * @param {goog.soy.data.SanitizedContentKind} kind The kind of safe content.
 * @extends {goog.soy.data.SanitizedContent}
 */
function SanitizedContentSubclass(content, kind) {
  // IMPORTANT! No superclass chaining to avoid exception being thrown.
  this.content = content;
  this.contentKind = kind;
}
goog.inherits(SanitizedContentSubclass, goog.soy.data.SanitizedContent);


function makeSanitizedContent(content, kind) {
  return new SanitizedContentSubclass(content, kind);
}



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


example.sanitizedHtmlTemplate = function(opt_data, opt_sb, opt_injectedData) {
  // Test the SanitizedContent constructor.
  var sanitized = makeSanitizedContent('Hello <b>World</b>',
      goog.soy.data.SanitizedContentKind.HTML);
  sanitized.contentDir = goog.i18n.bidi.Dir.LTR;
  return sanitized;
};


example.sanitizedHtmlAttributesTemplate =
    function(opt_data, opt_sb, opt_injectedData) {
  return makeSanitizedContent('foo="bar"',
      goog.soy.data.SanitizedContentKind.ATTRIBUTES);
};


example.sanitizedCssTemplate =
    function(opt_data, opt_sb, opt_injectedData) {
  return makeSanitizedContent('display:none',
      goog.soy.data.SanitizedContentKind.CSS);
};


example.unsanitizedTextTemplate =
    function(opt_data, opt_sb, opt_injectedData) {
  return makeSanitizedContent('I <3 Puppies & Kittens',
      goog.soy.data.SanitizedContentKind.TEXT);
};


example.templateSpoofingSanitizedContentString =
    function(opt_data, opt_sb, opt_injectedData) {
  return makeSanitizedContent('Hello World',
      // This is to ensure we're using triple-equals against a unique Javascript
      // object.  For example, in Javascript, consider ({}) == '[Object object]'
      // is true.
      goog.soy.data.SanitizedContentKind.HTML.toString());
};


example.tableRowTemplate = function(opt_data, opt_sb, opt_injectedData) {
  return '<tr><td></td></tr>';
};


example.colGroupTemplateCaps = function(opt_data, opt_sb, opt_injectedData) {
  return '<COLGROUP></COLGROUP>';
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

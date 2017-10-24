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
 * @fileoverview Provides utility methods to render soy template.
 * @author chrishenry@google.com (Chris Henry)
 */

goog.provide('goog.soy');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.html.legacyconversions');
goog.require('goog.soy.data.SanitizedContent');
goog.require('goog.soy.data.SanitizedContentKind');
goog.require('goog.string');


/**
 * @define {boolean} Whether to require all Soy templates to be "strict html".
 * Soy templates that use strict autoescaping forbid noAutoescape along with
 * many dangerous directives, and return a runtime type SanitizedContent that
 * marks them as safe.
 *
 * If this flag is enabled, Soy templates will fail to render if a template
 * returns plain text -- indicating it is a non-strict template.
 */
goog.define('goog.soy.REQUIRE_STRICT_AUTOESCAPE', false);


/**
 * Type definition for strict Soy templates. Very useful when passing a template
 * as an argument.
 * @typedef {function(?, null=, ?Object<string, *>=):
 *     !goog.soy.data.SanitizedContent}
 */
goog.soy.StrictTemplate;


/**
 * Type definition for strict Soy HTML templates. Very useful when passing
 * a template as an argument.
 * @typedef {function(?, null=, ?Object<string, *>=):
 *     !goog.soy.data.SanitizedHtml}
 */
goog.soy.StrictHtmlTemplate;


/**
 * Sets the processed template as the innerHTML of an element. It is recommended
 * to use this helper function instead of directly setting innerHTML in your
 * hand-written code, so that it will be easier to audit the code for cross-site
 * scripting vulnerabilities.
 *
 * @param {?Element} element The element whose content we are rendering into.
 * @param {!goog.soy.data.SanitizedContent} templateResult The processed
 *     template of kind HTML or TEXT (which will be escaped).
 * @template ARG_TYPES
 */
goog.soy.renderHtml = function(element, templateResult) {
  element.innerHTML = goog.soy.ensureTemplateOutputHtml_(templateResult);
};


/**
 * Renders a Soy template and then set the output string as
 * the innerHTML of an element. It is recommended to use this helper function
 * instead of directly setting innerHTML in your hand-written code, so that it
 * will be easier to audit the code for cross-site scripting vulnerabilities.
 *
 * @param {Element} element The element whose content we are rendering into.
 * @param {?function(ARG_TYPES, Object<string, *>=):*|
 *     ?function(ARG_TYPES, null=, Object<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @template ARG_TYPES
 */
goog.soy.renderElement = function(
    element, template, opt_templateData, opt_injectedData) {
  // Soy template parameter is only nullable for historical reasons.
  goog.asserts.assert(template, 'Soy template may not be null.');
  element.innerHTML = goog.soy.ensureTemplateOutputHtml_(
      template(
          opt_templateData || goog.soy.defaultTemplateData_, undefined,
          opt_injectedData));
};


/**
 * Renders a Soy template into a single node or a document
 * fragment. If the rendered HTML string represents a single node, then that
 * node is returned (note that this is *not* a fragment, despite them name of
 * the method). Otherwise a document fragment is returned containing the
 * rendered nodes.
 *
 * @param {?function(ARG_TYPES, Object<string, *>=):*|
 *     ?function(ARG_TYPES, null=, Object<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @param {goog.dom.DomHelper=} opt_domHelper The DOM helper used to
 *     create DOM nodes; defaults to {@code goog.dom.getDomHelper}.
 * @return {!Node} The resulting node or document fragment.
 * @template ARG_TYPES
 */
goog.soy.renderAsFragment = function(
    template, opt_templateData, opt_injectedData, opt_domHelper) {
  // Soy template parameter is only nullable for historical reasons.
  goog.asserts.assert(template, 'Soy template may not be null.');
  var dom = opt_domHelper || goog.dom.getDomHelper();
  var output = template(
      opt_templateData || goog.soy.defaultTemplateData_, undefined,
      opt_injectedData);
  var html = goog.soy.ensureTemplateOutputHtml_(output);
  goog.soy.assertFirstTagValid_(html);
  var safeHtml = output instanceof goog.soy.data.SanitizedContent ?
      output.toSafeHtml() :
      goog.html.legacyconversions.safeHtmlFromString(html);
  return dom.safeHtmlToNode(safeHtml);
};


/**
 * Renders a Soy template into a single node. If the rendered
 * HTML string represents a single node, then that node is returned. Otherwise,
 * a DIV element is returned containing the rendered nodes.
 *
 * @param {?function(ARG_TYPES, Object<string, *>=):*|
 *     ?function(ARG_TYPES, null=, Object<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @param {goog.dom.DomHelper=} opt_domHelper The DOM helper used to
 *     create DOM nodes; defaults to {@code goog.dom.getDomHelper}.
 * @return {!Element} Rendered template contents, wrapped in a parent DIV
 *     element if necessary.
 * @template ARG_TYPES
 */
goog.soy.renderAsElement = function(
    template, opt_templateData, opt_injectedData, opt_domHelper) {
  // Soy template parameter is only nullable for historical reasons.
  goog.asserts.assert(template, 'Soy template may not be null.');
  return goog.soy.convertToElement_(
      template(
          opt_templateData || goog.soy.defaultTemplateData_, undefined,
          opt_injectedData),
      opt_domHelper);
};


/**
 * Converts a processed Soy template into a single node. If the rendered
 * HTML string represents a single node, then that node is returned. Otherwise,
 * a DIV element is returned containing the rendered nodes.
 *
 * @param {!goog.soy.data.SanitizedContent} templateResult The processed
 *     template of kind HTML or TEXT (which will be escaped).
 * @param {?goog.dom.DomHelper=} opt_domHelper The DOM helper used to
 *     create DOM nodes; defaults to {@code goog.dom.getDomHelper}.
 * @return {!Element} Rendered template contents, wrapped in a parent DIV
 *     element if necessary.
 */
goog.soy.convertToElement = function(templateResult, opt_domHelper) {
  return goog.soy.convertToElement_(templateResult, opt_domHelper);
};


/**
 * Non-strict version of {@code goog.soy.convertToElement}.
 *
 * @param {*} templateResult The processed template.
 * @param {?goog.dom.DomHelper=} opt_domHelper The DOM helper used to
 *     create DOM nodes; defaults to {@code goog.dom.getDomHelper}.
 * @return {!Element} Rendered template contents, wrapped in a parent DIV
 *     element if necessary.
 * @private
 */
goog.soy.convertToElement_ = function(templateResult, opt_domHelper) {
  var dom = opt_domHelper || goog.dom.getDomHelper();
  var wrapper = dom.createElement(goog.dom.TagName.DIV);
  var html = goog.soy.ensureTemplateOutputHtml_(templateResult);
  goog.soy.assertFirstTagValid_(html);
  wrapper.innerHTML = html;

  // If the template renders as a single element, return it.
  if (wrapper.childNodes.length == 1) {
    var firstChild = wrapper.firstChild;
    if (firstChild.nodeType == goog.dom.NodeType.ELEMENT) {
      return /** @type {!Element} */ (firstChild);
    }
  }

  // Otherwise, return the wrapper DIV.
  return wrapper;
};


/**
 * Ensures the result is "safe" to insert as HTML.
 *
 * Note if the template has non-strict autoescape, the guarantees here are very
 * weak. It is recommended applications switch to requiring strict
 * autoescaping over time by tweaking goog.soy.REQUIRE_STRICT_AUTOESCAPE.
 *
 * In the case the argument is a SanitizedContent object, it either must
 * already be of kind HTML, or if it is kind="text", the output will be HTML
 * escaped.
 *
 * @param {*} templateResult The template result.
 * @return {string} The assumed-safe HTML output string.
 * @private
 */
goog.soy.ensureTemplateOutputHtml_ = function(templateResult) {
  // Allow strings as long as strict autoescaping is not mandated. Note we
  // allow everything that isn't an object, because some non-escaping templates
  // end up returning non-strings if their only print statement is a
  // non-escaped argument, plus some unit tests spoof templates.
  // TODO(gboyer): Track down and fix these cases.
  if (!goog.soy.REQUIRE_STRICT_AUTOESCAPE && !goog.isObject(templateResult)) {
    return String(templateResult);
  }

  // Allow SanitizedContent of kind HTML.
  if (templateResult instanceof goog.soy.data.SanitizedContent) {
    templateResult =
        /** @type {!goog.soy.data.SanitizedContent} */ (templateResult);
    var ContentKind = goog.soy.data.SanitizedContentKind;
    if (templateResult.contentKind === ContentKind.HTML) {
      return goog.asserts.assertString(templateResult.getContent());
    }
    if (templateResult.contentKind === ContentKind.TEXT) {
      // Allow text to be rendered, as long as we escape it. Other content
      // kinds will fail, since we don't know what to do with them.
      // TODO(gboyer): Perhaps also include URI in this case.
      return goog.string.htmlEscape(templateResult.getContent());
    }
  }

  goog.asserts.fail(
      'Soy template output is unsafe for use as HTML: ' + templateResult);

  // In production, return a safe string, rather than failing hard.
  return 'zSoyz';
};


/**
 * Checks that the rendered HTML does not start with an invalid tag that would
 * likely cause unexpected output from renderAsElement or renderAsFragment.
 * See {@link http://www.w3.org/TR/html5/semantics.html#semantics} for reference
 * as to which HTML elements can be parents of each other.
 * @param {string} html The output of a template.
 * @private
 */
goog.soy.assertFirstTagValid_ = function(html) {
  if (goog.asserts.ENABLE_ASSERTS) {
    var matches = html.match(goog.soy.INVALID_TAG_TO_RENDER_);
    goog.asserts.assert(
        !matches, 'This template starts with a %s, which ' +
            'cannot be a child of a <div>, as required by soy internals. ' +
            'Consider using goog.soy.renderElement instead.\nTemplate output: %s',
        matches && matches[0], html);
  }
};


/**
 * A pattern to find templates that cannot be rendered by renderAsElement or
 * renderAsFragment, as these elements cannot exist as the child of a <div>.
 * @type {!RegExp}
 * @private
 */
goog.soy.INVALID_TAG_TO_RENDER_ =
    /^<(body|caption|col|colgroup|head|html|tr|td|th|tbody|thead|tfoot)>/i;


/**
 * Immutable object that is passed into templates that are rendered
 * without any data.
 * @private @const
 */
goog.soy.defaultTemplateData_ = {};

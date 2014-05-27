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

/**
 * @fileoverview Provides a soy renderer that allows registration of
 * injected data ("globals") that will be passed into the rendered
 * templates.
 *
 * There is also an interface {@link goog.soy.InjectedDataSupplier} that
 * user should implement to provide the injected data for a specific
 * application. The injected data format is a JavaScript object:
 * <pre>
 * {'dataKey': 'value', 'otherDataKey': 'otherValue'}
 * </pre>
 *
 * To use injected data, you need to enable the soy-to-js compiler
 * option {@code --isUsingIjData}. The injected data can then be
 * referred to in any soy templates as part of a magic "ij"
 * parameter. For example, {@code $ij.dataKey} will evaluate to
 * 'value' with the above injected data.
 *
 * @author henrywong@google.com (Henry Wong)
 * @author chrishenry@google.com (Chris Henry)
 */

goog.provide('goog.soy.InjectedDataSupplier');
goog.provide('goog.soy.Renderer');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.soy');
goog.require('goog.soy.data.SanitizedContent');
goog.require('goog.soy.data.SanitizedContentKind');



/**
 * Creates a new soy renderer. Note that the renderer will only be
 * guaranteed to work correctly within the document scope provided in
 * the DOM helper.
 *
 * @param {goog.soy.InjectedDataSupplier=} opt_injectedDataSupplier A supplier
 *     that provides an injected data.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper;
 *     defaults to that provided by {@code goog.dom.getDomHelper()}.
 * @constructor
 */
goog.soy.Renderer = function(opt_injectedDataSupplier, opt_domHelper) {
  /**
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  /**
   * @type {goog.soy.InjectedDataSupplier}
   * @private
   */
  this.supplier_ = opt_injectedDataSupplier || null;

  /**
   * Map from template name to the data used to render that template.
   * @type {!goog.soy.Renderer.SavedTemplateRender}
   * @private
   */
  this.savedTemplateRenders_ = [];
};


/**
 * @typedef {Array.<{template: string, data: Object, ijData: Object}>}
 */
goog.soy.Renderer.SavedTemplateRender;


/**
 * Renders a Soy template into a single node or a document fragment.
 * Delegates to {@code goog.soy.renderAsFragment}.
 *
 * @param {null|function(ARG_TYPES, null=, Object.<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @return {!Node} The resulting node or document fragment.
 * @template ARG_TYPES
 */
goog.soy.Renderer.prototype.renderAsFragment = function(template,
                                                        opt_templateData) {
  this.saveTemplateRender_(template, opt_templateData);
  var node = goog.soy.renderAsFragment(template, opt_templateData,
                                       this.getInjectedData_(), this.dom_);
  this.handleRender(node);
  return node;
};


/**
 * Renders a Soy template into a single node. If the rendered HTML
 * string represents a single node, then that node is returned.
 * Otherwise, a DIV element is returned containing the rendered nodes.
 * Delegates to {@code goog.soy.renderAsElement}.
 *
 * @param {null|function(ARG_TYPES, null=, Object.<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @return {!Element} Rendered template contents, wrapped in a parent DIV
 *     element if necessary.
 * @template ARG_TYPES
 */
goog.soy.Renderer.prototype.renderAsElement = function(template,
                                                       opt_templateData) {
  this.saveTemplateRender_(template, opt_templateData);
  var element = goog.soy.renderAsElement(template, opt_templateData,
                                         this.getInjectedData_(), this.dom_);
  this.handleRender(element);
  return element;
};


/**
 * Renders a Soy template and then set the output string as the
 * innerHTML of the given element. Delegates to {@code goog.soy.renderElement}.
 *
 * @param {Element} element The element whose content we are rendering.
 * @param {null|function(ARG_TYPES, null=, Object.<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @template ARG_TYPES
 */
goog.soy.Renderer.prototype.renderElement = function(element, template,
                                                     opt_templateData) {
  this.saveTemplateRender_(template, opt_templateData);
  goog.soy.renderElement(
      element, template, opt_templateData, this.getInjectedData_());
  this.handleRender(element);
};


/**
 * Renders a Soy template and returns the output string.
 * If the template is strict, it must be of kind HTML. To render strict
 * templates of other kinds, use {@code renderText} (for {@code kind="text"}) or
 * {@code renderStrict}.
 *
 * @param {null|function(ARG_TYPES, null=, Object.<string, *>=):*} template
 *     The Soy template to render.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @return {string} The return value of rendering the template directly.
 * @template ARG_TYPES
 */
goog.soy.Renderer.prototype.render = function(template, opt_templateData) {
  var result = template(
      opt_templateData || {}, undefined, this.getInjectedData_());
  goog.asserts.assert(!(result instanceof goog.soy.data.SanitizedContent) ||
      result.contentKind === goog.soy.data.SanitizedContentKind.HTML,
      'render was called with a strict template of kind other than "html"' +
          ' (consider using renderText or renderStrict)');
  this.saveTemplateRender_(template, opt_templateData);
  this.handleRender();
  return String(result);
};


/**
 * Renders a strict Soy template of kind="text" and returns the output string.
 * It is an error to use renderText on non-strict templates, or strict templates
 * of kinds other than "text".
 *
 * @param {null|function(ARG_TYPES, null=, Object.<string, *>=):
 *     goog.soy.data.SanitizedContent} template The Soy template to render.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @return {string} The return value of rendering the template directly.
 * @template ARG_TYPES
 */
goog.soy.Renderer.prototype.renderText = function(template, opt_templateData) {
  var result = template(
      opt_templateData || {}, undefined, this.getInjectedData_());
  goog.asserts.assertInstanceof(result, goog.soy.data.SanitizedContent,
      'renderText cannot be called on a non-strict soy template');
  goog.asserts.assert(
      result.contentKind === goog.soy.data.SanitizedContentKind.TEXT,
      'renderText was called with a template of kind other than "text"');
  this.saveTemplateRender_(template, opt_templateData);
  this.handleRender();
  return String(result);
};


/**
 * Renders a strict Soy template and returns the output SanitizedContent object.
 *
 * @param {null|function(ARG_TYPES, null=, Object.<string, *>=):RETURN_TYPE}
 *     template The Soy template to render.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @param {goog.soy.data.SanitizedContentKind=} opt_kind The output kind to
 *     assert. If null, the template must be of kind="html" (i.e., opt_kind
 *     defaults to goog.soy.data.SanitizedContentKind.HTML).
 * @return {RETURN_TYPE} The SanitizedContent object. This return type is
 *     generic based on the return type of the template, such as
 *     soy.SanitizedHtml.
 * @template ARG_TYPES, RETURN_TYPE
 */
goog.soy.Renderer.prototype.renderStrict = function(
    template, opt_templateData, opt_kind) {
  var result = template(
      opt_templateData || {}, undefined, this.getInjectedData_());
  goog.asserts.assertInstanceof(result, goog.soy.data.SanitizedContent,
      'renderStrict cannot be called on a non-strict soy template');
  goog.asserts.assert(
      result.contentKind ===
          (opt_kind || goog.soy.data.SanitizedContentKind.HTML),
      'renderStrict was called with the wrong kind of template');
  this.saveTemplateRender_(template, opt_templateData);
  this.handleRender();
  return result;
};


/**
 * Renders a strict Soy template of kind="html" and returns the result as
 * a goog.html.SafeHtml object.
 *
 * Rendering a template that is not a strict template of kind="html" results in
 * a runtime error.
 *
 * @param {null|function(ARG_TYPES, null=, Object.<string, *>=):
 *     goog.soy.data.SanitizedContent} template The Soy template to render.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @return {!goog.html.SafeHtml}
 * @template ARG_TYPES
 */
goog.soy.Renderer.prototype.renderSafeHtml = function(
    template, opt_templateData) {
  var result = this.renderStrict(template, opt_templateData);
  return result.toSafeHtml();
};


/**
 * @return {!goog.soy.Renderer.SavedTemplateRender} Saved template data for
 *     the renders that have happened so far.
 */
goog.soy.Renderer.prototype.getSavedTemplateRenders = function() {
  return this.savedTemplateRenders_;
};


/**
 * Observes rendering of templates by this renderer.
 * @param {Node=} opt_node Relevant node, if available. The node may or may
 *     not be in the document, depending on whether Soy is creating an element
 *     or writing into an existing one.
 * @protected
 */
goog.soy.Renderer.prototype.handleRender = goog.nullFunction;


/**
 * Saves information about the current template render for debug purposes.
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object=} opt_templateData The data for the template.
 * @private
 * @suppress {missingProperties} SoyJs compiler adds soyTemplateName to the
 *     template.
 */
goog.soy.Renderer.prototype.saveTemplateRender_ = function(
    template, opt_templateData) {
  if (goog.DEBUG) {
    this.savedTemplateRenders_.push({
      template: template.soyTemplateName,
      data: opt_templateData,
      ijData: this.getInjectedData_()
    });
  }
};


/**
 * Creates the injectedParams map if necessary and calls the configuration
 * service to prepopulate it.
 * @return {Object} The injected params.
 * @private
 */
goog.soy.Renderer.prototype.getInjectedData_ = function() {
  return this.supplier_ ? this.supplier_.getData() : {};
};



/**
 * An interface for a supplier that provides Soy injected data.
 * @interface
 */
goog.soy.InjectedDataSupplier = function() {};


/**
 * Gets the injected data. Implementation may assume that
 * {@code goog.soy.Renderer} will treat the returned data as
 * immutable.  The renderer will call this every time one of its
 * {@code render*} methods is called.
 * @return {Object} A key-value pair representing the injected data.
 */
goog.soy.InjectedDataSupplier.prototype.getData = function() {};

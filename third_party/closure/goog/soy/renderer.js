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

goog.require('goog.dom');
goog.require('goog.soy');



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
};


/**
 * Renders a Soy template into a single node or a document fragment.
 * Delegates to {@code goog.soy.renderAsFragment}.
 *
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object=} opt_templateData The data for the template.
 * @return {!Node} The resulting node or document fragment.
 */
goog.soy.Renderer.prototype.renderAsFragment = function(template,
                                                        opt_templateData) {
  return goog.soy.renderAsFragment(template, opt_templateData,
                                   this.getInjectedData_(), this.dom_);
};


/**
 * Renders a Soy template into a single node. If the rendered HTML
 * string represents a single node, then that node is returned.
 * Otherwise, a DIV element is returned containing the rendered nodes.
 * Delegates to {@code goog.soy.renderAsElement}.
 *
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object=} opt_templateData The data for the template.
 * @return {!Element} Rendered template contents, wrapped in a parent DIV
 *     element if necessary.
 */
goog.soy.Renderer.prototype.renderAsElement = function(template,
                                                       opt_templateData) {
  return goog.soy.renderAsElement(template, opt_templateData,
                                  this.getInjectedData_(), this.dom_);
};


/**
 * Renders a Soy template and then set the output string as the
 * innerHTML of the given element. Delegates to {@code goog.soy.renderElement}.
 *
 * @param {Element} element The element whose content we are rendering.
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object=} opt_templateData The data for the template.
 */
goog.soy.Renderer.prototype.renderElement = function(element, template,
                                                     opt_templateData) {
  goog.soy.renderElement(
      element, template, opt_templateData, this.getInjectedData_());
};


/**
 * Renders a Soy template and returns the output string.
 *
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object=} opt_templateData The data for the template.
 * @return {string} The return value of rendering the template directly.
 */
goog.soy.Renderer.prototype.render = function(template, opt_templateData) {
  return template(opt_templateData || {}, undefined, this.getInjectedData_());
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

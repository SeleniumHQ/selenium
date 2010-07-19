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
 * @fileoverview Renderer for {@link goog.ui.MenuSeparator}s.
 *
*
 */

goog.provide('goog.ui.MenuSeparatorRenderer');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.ui.ControlContent');
goog.require('goog.ui.ControlRenderer');


/**
 * Renderer for menu separators.
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.MenuSeparatorRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(goog.ui.MenuSeparatorRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.MenuSeparatorRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.MenuSeparatorRenderer.CSS_CLASS = goog.getCssName('goog-menuseparator');


/**
 * Returns an empty, styled menu separator DIV.  Overrides {@link
 * goog.ui.ControlRenderer#createDom}.
 * @param {goog.ui.Separator} separator Separator to render.
 * @return {Element} Root element for the separator.
 */
goog.ui.MenuSeparatorRenderer.prototype.createDom = function(separator) {
  return separator.getDomHelper().createDom('div', this.getCssClass());
};


/**
 * Takes an existing element, and decorates it with the separator.  Overrides
 * {@link goog.ui.ControlRenderer#decorate}.
 * @param {goog.ui.Separator} separator Separator to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 */
goog.ui.MenuSeparatorRenderer.prototype.decorate = function(separator,
                                                            element) {
  if (element.tagName == 'HR') {
    // Replace HR with separator.
    var hr = element;
    element = this.createDom(separator);
    goog.dom.insertSiblingBefore(element, hr);
    goog.dom.removeNode(hr);
  } else {
    goog.dom.classes.add(element, this.getCssClass());
  }
  return element;
};


/**
 * Overrides {@link goog.ui.ControlRenderer#setContent} to do nothing, since
 * separators are empty.
 * @param {Element} separator The separator's root element.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to be
 *    set as the separators's content (ignored).
 */
goog.ui.MenuSeparatorRenderer.prototype.setContent = function(separator,
                                                              content) {
  // Do nothing.  Separators are empty.
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 */
goog.ui.MenuSeparatorRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuSeparatorRenderer.CSS_CLASS;
};

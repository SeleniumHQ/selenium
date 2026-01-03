/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renderer for {@link goog.ui.MenuSeparator}s.
 */

goog.provide('goog.ui.MenuSeparatorRenderer');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.ui.ControlRenderer');
goog.requireType('goog.ui.Control');
goog.requireType('goog.ui.ControlContent');



/**
 * Renderer for menu separators.
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.MenuSeparatorRenderer = function() {
  'use strict';
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
 * @param {goog.ui.Control} separator goog.ui.Separator to render.
 * @return {!Element} Root element for the separator.
 * @override
 */
goog.ui.MenuSeparatorRenderer.prototype.createDom = function(separator) {
  'use strict';
  return separator.getDomHelper().createDom(
      goog.dom.TagName.DIV, this.getCssClass());
};


/**
 * Takes an existing element, and decorates it with the separator.  Overrides
 * {@link goog.ui.ControlRenderer#decorate}.
 * @param {goog.ui.Control} separator goog.ui.MenuSeparator to decorate the
 *     element.
 * @param {Element} element Element to decorate.
 * @return {!Element} Decorated element.
 * @override
 */
goog.ui.MenuSeparatorRenderer.prototype.decorate = function(
    separator, element) {
  'use strict';
  // Normally handled in the superclass. But we don't call the superclass.
  if (element.id) {
    separator.setId(element.id);
  }

  if (element.tagName == goog.dom.TagName.HR) {
    // Replace HR with separator.
    var hr = element;
    element = this.createDom(separator);
    goog.dom.insertSiblingBefore(element, hr);
    goog.dom.removeNode(hr);
  } else {
    goog.dom.classlist.add(element, this.getCssClass());
  }
  return element;
};


/**
 * Overrides {@link goog.ui.ControlRenderer#setContent} to do nothing, since
 * separators are empty.
 * @param {Element} separator The separator's root element.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to be
 *    set as the separators's content (ignored).
 * @override
 */
goog.ui.MenuSeparatorRenderer.prototype.setContent = function(
    separator, content) {
  // Do nothing.  Separators are empty.
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.MenuSeparatorRenderer.prototype.getCssClass = function() {
  'use strict';
  return goog.ui.MenuSeparatorRenderer.CSS_CLASS;
};

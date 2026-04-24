/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renderer for toolbar separators.
 */

goog.provide('goog.ui.ToolbarSeparatorRenderer');

goog.require('goog.asserts');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.require('goog.ui.MenuSeparatorRenderer');
goog.requireType('goog.ui.Control');



/**
 * Renderer for toolbar separators.
 * @constructor
 * @extends {goog.ui.MenuSeparatorRenderer}
 */
goog.ui.ToolbarSeparatorRenderer = function() {
  'use strict';
  goog.ui.MenuSeparatorRenderer.call(this);
};
goog.inherits(goog.ui.ToolbarSeparatorRenderer, goog.ui.MenuSeparatorRenderer);
goog.addSingletonGetter(goog.ui.ToolbarSeparatorRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.ToolbarSeparatorRenderer.CSS_CLASS =
    goog.getCssName('goog-toolbar-separator');


/**
 * Returns a styled toolbar separator implemented by the following DOM:
 *
 *    <div class="goog-toolbar-separator goog-inline-block">&nbsp;</div>
 *
 * Overrides {@link goog.ui.MenuSeparatorRenderer#createDom}.
 * @param {goog.ui.Control} separator goog.ui.Separator to render.
 * @return {!Element} Root element for the separator.
 * @override
 */
goog.ui.ToolbarSeparatorRenderer.prototype.createDom = function(separator) {
  'use strict';
  // 00A0 is &nbsp;
  return separator.getDomHelper().createDom(
      goog.dom.TagName.DIV, this.getClassNames(separator).join(' ') + ' ' +
          goog.ui.INLINE_BLOCK_CLASSNAME,
      '\u00A0');
};


/**
 * Takes an existing element, and decorates it with the separator.  Overrides
 * {@link goog.ui.MenuSeparatorRenderer#decorate}.
 * @param {goog.ui.Control} separator goog.ui.Separator to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {!Element} Decorated element.
 * @override
 */
goog.ui.ToolbarSeparatorRenderer.prototype.decorate = function(
    separator, element) {
  'use strict';
  element = goog.ui.ToolbarSeparatorRenderer.superClass_.decorate.call(
      this, separator, element);
  goog.asserts.assert(element);
  goog.dom.classlist.add(element, goog.ui.INLINE_BLOCK_CLASSNAME);
  return element;
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.ToolbarSeparatorRenderer.prototype.getCssClass = function() {
  'use strict';
  return goog.ui.ToolbarSeparatorRenderer.CSS_CLASS;
};

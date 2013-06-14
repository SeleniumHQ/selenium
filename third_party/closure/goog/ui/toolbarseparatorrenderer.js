// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Renderer for toolbar separators.
 *
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.ui.ToolbarSeparatorRenderer');

goog.require('goog.dom.classes');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.require('goog.ui.MenuSeparatorRenderer');



/**
 * Renderer for toolbar separators.
 * @constructor
 * @extends {goog.ui.MenuSeparatorRenderer}
 */
goog.ui.ToolbarSeparatorRenderer = function() {
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
 * <div class="goog-toolbar-separator goog-inline-block">&nbsp;</div>
 * Overrides {@link goog.ui.MenuSeparatorRenderer#createDom}.
 * @param {goog.ui.Control} separator goog.ui.Separator to render.
 * @return {Element} Root element for the separator.
 * @override
 */
goog.ui.ToolbarSeparatorRenderer.prototype.createDom = function(separator) {
  // 00A0 is &nbsp;
  return separator.getDomHelper().createDom('div',
      this.getCssClass() + ' ' + goog.ui.INLINE_BLOCK_CLASSNAME,
      '\u00A0');
};


/**
 * Takes an existing element, and decorates it with the separator.  Overrides
 * {@link goog.ui.MenuSeparatorRenderer#decorate}.
 * @param {goog.ui.Control} separator goog.ui.Separator to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
goog.ui.ToolbarSeparatorRenderer.prototype.decorate = function(separator,
                                                               element) {
  element = goog.ui.ToolbarSeparatorRenderer.superClass_.decorate.call(this,
      separator, element);
  goog.dom.classes.add(element, goog.ui.INLINE_BLOCK_CLASSNAME);
  return element;
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.ToolbarSeparatorRenderer.prototype.getCssClass = function() {
  return goog.ui.ToolbarSeparatorRenderer.CSS_CLASS;
};

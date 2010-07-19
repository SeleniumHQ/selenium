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
 * @fileoverview Default renderer for {@link goog.ui.Tab}s.  Based on the
 * original {@code TabPane} code.
 *
*
 */

goog.provide('goog.ui.TabRenderer');

goog.require('goog.dom.a11y.Role');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.ControlRenderer');



/**
 * Default renderer for {@link goog.ui.Tab}s, based on the {@code TabPane} code.
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.TabRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(goog.ui.TabRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.TabRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.TabRenderer.CSS_CLASS = goog.getCssName('goog-tab');


/**
 * Returns the CSS class name to be applied to the root element of all tabs
 * rendered or decorated using this renderer.
 * @return {string} Renderer-specific CSS class name.
 * @override
 */
goog.ui.TabRenderer.prototype.getCssClass = function() {
  return goog.ui.TabRenderer.CSS_CLASS;
};


/**
 * Returns the ARIA role to be applied to the tab element.
 * See http://wiki/Main/ARIA for more info.
 * @return {goog.dom.a11y.Role} ARIA role.
 * @override
 */
goog.ui.TabRenderer.prototype.getAriaRole = function() {
  return goog.dom.a11y.Role.TAB;
};


/**
 * Returns the tab's contents wrapped in a DIV, with the renderer's own CSS
 * class and additional state-specific classes applied to it.  Creates the
 * following DOM structure:
 * <pre>
 *   <div class="goog-tab" title="Title">Content</div>
 * </pre>
 * @param {goog.ui.Control} tab Tab to render.
 * @return {Element} Root element for the tab.
 * @override
 */
goog.ui.TabRenderer.prototype.createDom = function(tab) {
  var element = goog.ui.TabRenderer.superClass_.createDom.call(this, tab);

  var tooltip = tab.getTooltip();
  if (tooltip) {
    // Only update the element if the tab has a tooltip.
    this.setTooltip(element, tooltip);
  }

  return element;
};


/**
 * Decorates the element with the tab.  Initializes the tab's ID, content,
 * tooltip, and state based on the ID of the element, its title, child nodes,
 * and CSS classes, respectively.  Returns the element.
 * @param {goog.ui.Control} tab Tab to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
goog.ui.TabRenderer.prototype.decorate = function(tab, element) {
  element = goog.ui.TabRenderer.superClass_.decorate.call(this, tab, element);

  var tooltip = this.getTooltip(element);
  if (tooltip) {
    // Only update the tab if the element has a tooltip.
    tab.setTooltipInternal(tooltip);
  }

  // If the tab is selected and hosted in a tab bar, update the tab bar's
  // selection model.
  if (tab.isSelected()) {
    var tabBar = tab.getParent();
    if (tabBar && goog.isFunction(tabBar.setSelectedTab)) {
      // We need to temporarily deselect the tab, so the tab bar can re-select
      // it and thereby correctly initialize its state.  We use the protected
      // setState() method to avoid dispatching useless events.
      tab.setState(goog.ui.Component.State.SELECTED, false);
      tabBar.setSelectedTab(tab);
    }
  }

  return element;
};


/**
 * Takes a tab's root element, and returns its tooltip text, or the empty
 * string if the element has no tooltip.
 * @param {Element} element The tab's root element.
 * @return {string} The tooltip text (empty string if none).
 */
goog.ui.TabRenderer.prototype.getTooltip = function(element) {
  return element.title || '';
};


/**
 * Takes a tab's root element and a tooltip string, and updates the element
 * with the new tooltip.  If the new tooltip is null or undefined, sets the
 * element's title to the empty string.
 * @param {Element} element The tab's root element.
 * @param {string|null|undefined} tooltip New tooltip text (if any).
 */
goog.ui.TabRenderer.prototype.setTooltip = function(element, tooltip) {
  if (element) {
    element.title = tooltip || '';
  }
};

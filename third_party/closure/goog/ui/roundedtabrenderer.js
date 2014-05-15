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
 * @fileoverview Rounded corner tab renderer for {@link goog.ui.Tab}s.
 *
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.ui.RoundedTabRenderer');

goog.require('goog.dom');
goog.require('goog.ui.Tab');
goog.require('goog.ui.TabBar.Location');
goog.require('goog.ui.TabRenderer');
goog.require('goog.ui.registry');



/**
 * Rounded corner tab renderer for {@link goog.ui.Tab}s.
 * @constructor
 * @extends {goog.ui.TabRenderer}
 */
goog.ui.RoundedTabRenderer = function() {
  goog.ui.TabRenderer.call(this);
};
goog.inherits(goog.ui.RoundedTabRenderer, goog.ui.TabRenderer);
goog.addSingletonGetter(goog.ui.RoundedTabRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.RoundedTabRenderer.CSS_CLASS = goog.getCssName('goog-rounded-tab');


/**
 * Returns the CSS class name to be applied to the root element of all tabs
 * rendered or decorated using this renderer.
 * @return {string} Renderer-specific CSS class name.
 * @override
 */
goog.ui.RoundedTabRenderer.prototype.getCssClass = function() {
  return goog.ui.RoundedTabRenderer.CSS_CLASS;
};


/**
 * Creates the tab's DOM structure, based on the containing tab bar's location
 * relative to tab contents.  For example, the DOM for a tab in a tab bar
 * located above tab contents would look like this:
 * <pre>
 *   <div class="goog-rounded-tab" title="...">
 *     <table class="goog-rounded-tab-table">
 *       <tbody>
 *         <tr>
 *           <td nowrap>
 *             <div class="goog-rounded-tab-outer-edge"></div>
 *             <div class="goog-rounded-tab-inner-edge"></div>
 *           </td>
 *         </tr>
 *         <tr>
 *           <td nowrap>
 *             <div class="goog-rounded-tab-caption">Hello, world</div>
 *           </td>
 *         </tr>
 *       </tbody>
 *     </table>
 *   </div>
 * </pre>
 * @param {goog.ui.Control} tab Tab to render.
 * @return {Element} Root element for the tab.
 * @override
 */
goog.ui.RoundedTabRenderer.prototype.createDom = function(tab) {
  return this.decorate(tab,
      goog.ui.RoundedTabRenderer.superClass_.createDom.call(this, tab));
};


/**
 * Decorates the element with the tab.  Overrides the superclass implementation
 * by wrapping the tab's content in a table that implements rounded corners.
 * @param {goog.ui.Control} tab Tab to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
goog.ui.RoundedTabRenderer.prototype.decorate = function(tab, element) {
  var tabBar = tab.getParent();

  if (!this.getContentElement(element)) {
    // The element to be decorated doesn't appear to have the full tab DOM,
    // so we have to create it.
    element.appendChild(this.createTab(tab.getDomHelper(), element.childNodes,
        tabBar.getLocation()));
  }

  return goog.ui.RoundedTabRenderer.superClass_.decorate.call(this, tab,
      element);
};


/**
 * Creates a table implementing a rounded corner tab.
 * @param {goog.dom.DomHelper} dom DOM helper to use for element construction.
 * @param {goog.ui.ControlContent} caption Text caption or DOM structure
 *     to display as the tab's caption.
 * @param {goog.ui.TabBar.Location} location Tab bar location relative to the
 *     tab contents.
 * @return {Element} Table implementing a rounded corner tab.
 * @protected
 */
goog.ui.RoundedTabRenderer.prototype.createTab = function(dom, caption,
    location) {
  var rows = [];

  if (location != goog.ui.TabBar.Location.BOTTOM) {
    // This is a left, right, or top tab, so it needs a rounded top edge.
    rows.push(this.createEdge(dom, /* isTopEdge */ true));
  }
  rows.push(this.createCaption(dom, caption));
  if (location != goog.ui.TabBar.Location.TOP) {
    // This is a left, right, or bottom tab, so it needs a rounded bottom edge.
    rows.push(this.createEdge(dom, /* isTopEdge */ false));
  }

  return dom.createDom('table', {
    'cellPadding': 0,
    'cellSpacing': 0,
    'className': goog.getCssName(this.getStructuralCssClass(), 'table')
  }, dom.createDom('tbody', null, rows));
};


/**
 * Creates a table row implementing the tab caption.
 * @param {goog.dom.DomHelper} dom DOM helper to use for element construction.
 * @param {goog.ui.ControlContent} caption Text caption or DOM structure
 *     to display as the tab's caption.
 * @return {Element} Tab caption table row.
 * @protected
 */
goog.ui.RoundedTabRenderer.prototype.createCaption = function(dom, caption) {
  var baseClass = this.getStructuralCssClass();
  return dom.createDom('tr', null,
      dom.createDom('td', {'noWrap': true},
          dom.createDom('div', goog.getCssName(baseClass, 'caption'),
              caption)));
};


/**
 * Creates a table row implementing a rounded tab edge.
 * @param {goog.dom.DomHelper} dom DOM helper to use for element construction.
 * @param {boolean} isTopEdge Whether to create a top or bottom edge.
 * @return {Element} Rounded tab edge table row.
 * @protected
 */
goog.ui.RoundedTabRenderer.prototype.createEdge = function(dom, isTopEdge) {
  var baseClass = this.getStructuralCssClass();
  var inner = dom.createDom('div', goog.getCssName(baseClass, 'inner-edge'));
  var outer = dom.createDom('div', goog.getCssName(baseClass, 'outer-edge'));
  return dom.createDom('tr', null,
      dom.createDom('td', {'noWrap': true},
          isTopEdge ? [outer, inner] : [inner, outer]));
};


/** @override */
goog.ui.RoundedTabRenderer.prototype.getContentElement = function(element) {
  var baseClass = this.getStructuralCssClass();
  return element && goog.dom.getElementsByTagNameAndClass(
      'div', goog.getCssName(baseClass, 'caption'), element)[0];
};


// Register a decorator factory function for goog.ui.Tabs using the rounded
// tab renderer.
goog.ui.registry.setDecoratorByClassName(goog.ui.RoundedTabRenderer.CSS_CLASS,
    function() {
      return new goog.ui.Tab(null, goog.ui.RoundedTabRenderer.getInstance());
    });

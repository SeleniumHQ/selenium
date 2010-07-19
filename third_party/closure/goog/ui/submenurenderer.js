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
 * @fileoverview Renderer for {@link goog.ui.SubMenu}s.
 *
*
 */

goog.provide('goog.ui.SubMenuRenderer');

goog.require('goog.dom');
goog.require('goog.dom.a11y');
goog.require('goog.dom.a11y.State');
goog.require('goog.dom.classes');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItemRenderer');


/**
 * Default renderer for {@link goog.ui.SubMenu}s.  Each item has the following
 * structure:
 *    <div class="goog-submenu">
 *      ...(menuitem content)...
 *      <div class="goog-menu">
 *        ... (submenu content) ...
 *      </div>
 *    </div>
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */
goog.ui.SubMenuRenderer = function() {
  goog.ui.MenuItemRenderer.call(this);
};
goog.inherits(goog.ui.SubMenuRenderer, goog.ui.MenuItemRenderer);
goog.addSingletonGetter(goog.ui.SubMenuRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.SubMenuRenderer.CSS_CLASS = goog.getCssName('goog-submenu');


/**
 * Overrides {@link goog.ui.MenuItemRenderer#createDom} by adding
 * the additional class 'goog-submenu' to the created element,
 * and passes the element to {@link goog.ui.SubMenuItemRenderer#addArrow_}
 * to add an child element that can be styled to show an arrow.
 * @param {goog.ui.SubMenu} subMenu SubMenu to render.
 * @return {Element} Root element for the item.
 */
goog.ui.SubMenuRenderer.prototype.createDom = function(subMenu) {
  var element = goog.ui.SubMenuRenderer.superClass_.createDom.call(this,
                                                                   subMenu);
  goog.dom.classes.add(element, goog.ui.SubMenuRenderer.CSS_CLASS);
  this.addArrow_(subMenu, element);
  return element;
};


/**
 * Overrides {@link goog.ui.MenuItemRenderer#decorate} by adding
 * the additional class 'goog-submenu' to the decorated element,
 * and passing the element to {@link goog.ui.SubMenuItemRenderer#addArrow_}
 * to add a child element that can be styled to show an arrow.
 * Also searches the element for a child with the class goog-menu. If a
 * matching child element is found, creates a goog.ui.Menu, uses it to
 * decorate the child element, and passes that menu to subMenu.setMenu.
 * @param {goog.ui.SubMenu} subMenu SubMenu to render.
 * @param {Element} element Element to decorate.
 * @return {Element} Root element for the item.
 */
goog.ui.SubMenuRenderer.prototype.decorate = function(subMenu, element) {
  element = goog.ui.SubMenuRenderer.superClass_.decorate.call(
      this, subMenu, element);
  goog.dom.classes.add(element, goog.ui.SubMenuRenderer.CSS_CLASS);
  this.addArrow_(subMenu, element);

  // Search for a child menu and decorate it.
  var childMenuEls = goog.dom.getElementsByTagNameAndClass(
      'div', goog.getCssName('goog-menu'), element);
  if (childMenuEls.length) {
    var childMenu = new goog.ui.Menu(subMenu.getDomHelper());
    var childMenuEl = childMenuEls[0];
    // Hide the menu element before attaching it to the document body; see
    // bug 1089244.
    goog.style.showElement(childMenuEl, false);
    subMenu.getDomHelper().getDocument().body.appendChild(childMenuEl);
    childMenu.decorate(childMenuEl);
    subMenu.setMenu(childMenu, true);
  }
  return element;
};


/**
 * Overrides {@link goog.ui.MenuItemRenderer#initializeDom} to tweak
 * the DOM structure for the span.goog-submenu-arrow element
 * depending on the text direction (LTR or RTL). When the SubMenu is RTL
 * the arrow will be given the additional class of goog-submenu-arrow-rtl,
 * and the arrow will be moved up to be the first child in the SubMenu's
 * element. Otherwise the arrow will have the class goog-submenu-arrow-ltr,
 * and be kept as the last child of the SubMenu's element.
 * @param {goog.ui.SubMenu} subMenu SubMenu whose DOM is to be initialized
 *     as it enters the document.
 */
goog.ui.SubMenuRenderer.prototype.initializeDom = function(subMenu) {
  goog.ui.SubMenuRenderer.superClass_.initializeDom.call(this, subMenu);
  var element = subMenu.getContentElement();
  var arrow = subMenu.getDomHelper().getElementsByTagNameAndClass(
      'span', goog.getCssName('goog-submenu-arrow'), element)[0];
  goog.ui.SubMenuRenderer.setArrowTextContent_(subMenu, arrow);
  if (arrow != element.lastChild) {
    element.appendChild(arrow);
  }
  goog.dom.a11y.setState(subMenu.getElement(), goog.dom.a11y.State.HASPOPUP,
      'true');
};


/**
 * Appends a child node with the class goog.getCssName('goog-submenu-arrow') or
 * 'goog-submenu-arrow-rtl' which can be styled to show an arrow.
 * @param {goog.ui.SubMenu} subMenu SubMenu to render.
 * @param {Element} element Element to decorate.
 * @private
 */
goog.ui.SubMenuRenderer.prototype.addArrow_ = function(subMenu, element) {
  var arrow = subMenu.getDomHelper().createDom('span');
  arrow.className = goog.getCssName('goog-submenu-arrow');
  goog.ui.SubMenuRenderer.setArrowTextContent_(subMenu, arrow);
  this.getContentElement(element).appendChild(arrow);
};


/**
 * The unicode char for a left arrow.
 * @type {string}
 * @private
 */
goog.ui.SubMenuRenderer.LEFT_ARROW_ = '\u25C4';


/**
 * The unicode char for a right arrow.
 * @type {string}
 * @private
 */
goog.ui.SubMenuRenderer.RIGHT_ARROW_ = '\u25BA';


/**
 * Set the text content of an arrow.
 * @param {goog.ui.SubMenu} subMenu The sub menu that owns the arrow.
 * @param {Element} arrow The arrow element.
 * @private
 */
goog.ui.SubMenuRenderer.setArrowTextContent_ = function(subMenu, arrow) {
  // Fix arrow rtl
  var leftArrow = goog.ui.SubMenuRenderer.LEFT_ARROW_;
  var rightArrow = goog.ui.SubMenuRenderer.RIGHT_ARROW_;
  if (subMenu.isRightToLeft()) {
    goog.dom.classes.add(arrow, goog.getCssName('goog-submenu-arrow-rtl'));
    // Unicode character - Black left-pointing pointer iff aligned to end.
    goog.dom.setTextContent(arrow, subMenu.isAlignedToEnd() ?
        leftArrow : rightArrow);
  } else {
    goog.dom.classes.remove(arrow, goog.getCssName('goog-submenu-arrow-rtl'));
    // Unicode character - Black right-pointing pointer iff aligned to end.
    goog.dom.setTextContent(arrow, subMenu.isAlignedToEnd() ?
        rightArrow : leftArrow);
  }
};

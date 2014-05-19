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
 * @fileoverview Renderer for {@link goog.ui.style.app.MenuButton}s and
 * subclasses.
 *
 * @author attila@google.com (Attila Bodis)
 * @author gveen@google.com (Greg Veen)
 */

goog.provide('goog.ui.style.app.MenuButtonRenderer');

goog.require('goog.a11y.aria.Role');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuRenderer');
goog.require('goog.ui.style.app.ButtonRenderer');



/**
 * Renderer for {@link goog.ui.style.app.MenuButton}s.  This implementation
 * overrides {@link goog.ui.style.app.ButtonRenderer#createButton} to insert a
 * dropdown element into the content element after the specified content.
 * @constructor
 * @extends {goog.ui.style.app.ButtonRenderer}
 * @final
 */
goog.ui.style.app.MenuButtonRenderer = function() {
  goog.ui.style.app.ButtonRenderer.call(this);
};
goog.inherits(goog.ui.style.app.MenuButtonRenderer,
    goog.ui.style.app.ButtonRenderer);
goog.addSingletonGetter(goog.ui.style.app.MenuButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.style.app.MenuButtonRenderer.CSS_CLASS =
    goog.getCssName('goog-menu-button');


/**
 * Array of arrays of CSS classes that we want composite classes added and
 * removed for in IE6 and lower as a workaround for lack of multi-class CSS
 * selector support.
 * @type {Array.<Array.<string>>}
 */
goog.ui.style.app.MenuButtonRenderer.IE6_CLASS_COMBINATIONS = [
  [goog.getCssName('goog-button-base-rtl'),
   goog.getCssName('goog-menu-button')],

  [goog.getCssName('goog-button-base-hover'),
   goog.getCssName('goog-menu-button')],

  [goog.getCssName('goog-button-base-focused'),
   goog.getCssName('goog-menu-button')],

  [goog.getCssName('goog-button-base-disabled'),
   goog.getCssName('goog-menu-button')],

  [goog.getCssName('goog-button-base-active'),
   goog.getCssName('goog-menu-button')],

  [goog.getCssName('goog-button-base-open'),
   goog.getCssName('goog-menu-button')],

  [goog.getCssName('goog-button-base-active'),
   goog.getCssName('goog-button-base-open'),
   goog.getCssName('goog-menu-button')]
];


/**
 * Returns the ARIA role to be applied to menu buttons, which
 * have a menu attached to them.
 * @return {goog.a11y.aria.Role} ARIA role.
 * @override
 */
goog.ui.style.app.MenuButtonRenderer.prototype.getAriaRole = function() {
  // If we apply the 'button' ARIA role to the menu button, the
  // screen reader keeps referring to menus as buttons, which
  // might be misleading for the users. Hence the ARIA role
  // 'menu' is assigned.
  return goog.a11y.aria.Role.MENU;
};


/**
 * Takes the button's root element and returns the parent element of the
 * button's contents.  Overrides the superclass implementation by taking
 * the nested DIV structure of menu buttons into account.
 * @param {Element} element Root element of the button whose content element
 *     is to be returned.
 * @return {Element} The button's content element.
 * @override
 */
goog.ui.style.app.MenuButtonRenderer.prototype.getContentElement =
    function(element) {
  return goog.ui.style.app.MenuButtonRenderer.superClass_.getContentElement
      .call(this, element);
};


/**
 * Takes an element, decorates it with the menu button control, and returns
 * the element.  Overrides {@link goog.ui.style.app.ButtonRenderer#decorate} by
 * looking for a child element that can be decorated by a menu, and if it
 * finds one, decorates it and attaches it to the menu button.
 * @param {goog.ui.Control} control goog.ui.MenuButton to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
goog.ui.style.app.MenuButtonRenderer.prototype.decorate =
    function(control, element) {
  var button = /** @type {goog.ui.MenuButton} */ (control);
  // TODO(attila):  Add more robust support for subclasses of goog.ui.Menu.
  var menuElem = goog.dom.getElementsByTagNameAndClass(
      '*', goog.ui.MenuRenderer.CSS_CLASS, element)[0];
  if (menuElem) {
    // Move the menu element directly under the body (but hide it first to
    // prevent flicker; see bug 1089244).
    goog.style.setElementShown(menuElem, false);
    goog.dom.appendChild(goog.dom.getOwnerDocument(menuElem).body, menuElem);

    // Decorate the menu and attach it to the button.
    var menu = new goog.ui.Menu();
    menu.decorate(menuElem);
    button.setMenu(menu);
  }

  // Let the superclass do the rest.
  return goog.ui.style.app.MenuButtonRenderer.superClass_.decorate.call(this,
      button, element);
};


/**
 * Takes a text caption or existing DOM structure, and returns the content and
 * a dropdown arrow element wrapped in a pseudo-rounded-corner box.  Creates
 * the following DOM structure:
 *  <div class="goog-inline-block goog-button-outer-box">
 *    <div class="goog-inline-block goog-button-inner-box">
 *      <div class="goog-button-pos">
 *        <div class="goog-button-top-shadow">&nbsp;</div>
 *        <div class="goog-button-content">
 *          Contents...
 *          <div class="goog-menu-button-dropdown"> </div>
 *        </div>
 *      </div>
 *    </div>
 *  </div>
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to wrap
 *     in a box.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {Element} Pseudo-rounded-corner box containing the content.
 * @override
 */
goog.ui.style.app.MenuButtonRenderer.prototype.createButton = function(content,
    dom) {
  var contentWithDropdown = this.createContentWithDropdown(content, dom);
  return goog.ui.style.app.MenuButtonRenderer.superClass_.createButton.call(
      this, contentWithDropdown, dom);
};


/** @override */
goog.ui.style.app.MenuButtonRenderer.prototype.setContent = function(element,
    content) {
  var dom = goog.dom.getDomHelper(this.getContentElement(element));
  goog.ui.style.app.MenuButtonRenderer.superClass_.setContent.call(
      this, element, this.createContentWithDropdown(content, dom));
};


/**
 * Inserts dropdown element as last child of existing content.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document ineraction.
 * @return {Array.<Node>} DOM structure to be set as the button's content.
 */
goog.ui.style.app.MenuButtonRenderer.prototype.createContentWithDropdown =
    function(content, dom) {
  var caption = dom.createDom('div', null, content, this.createDropdown(dom));
  return goog.array.toArray(caption.childNodes);
};


/**
 * Returns an appropriately-styled DIV containing a dropdown arrow.
 * Creates the following DOM structure:
 *    <div class="goog-menu-button-dropdown"> </div>
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {Element} Dropdown element.
 */
goog.ui.style.app.MenuButtonRenderer.prototype.createDropdown = function(dom) {
  return dom.createDom('div', goog.getCssName(this.getCssClass(), 'dropdown'));
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.style.app.MenuButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.style.app.MenuButtonRenderer.CSS_CLASS;
};


/** @override */
goog.ui.style.app.MenuButtonRenderer.prototype.getIe6ClassCombinations =
    function() {
  return goog.ui.style.app.MenuButtonRenderer.IE6_CLASS_COMBINATIONS;
};

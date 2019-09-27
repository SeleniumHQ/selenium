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
 * @fileoverview Renderer for {@link goog.ui.MenuButton}s and subclasses.
 *
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.ui.MenuButtonRenderer');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.style');
goog.require('goog.ui.CustomButtonRenderer');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuRenderer');



/**
 * Renderer for {@link goog.ui.MenuButton}s.  This implementation overrides
 * {@link goog.ui.CustomButtonRenderer#createButton} to create a separate
 * caption and dropdown element.
 * @constructor
 * @extends {goog.ui.CustomButtonRenderer}
 */
goog.ui.MenuButtonRenderer = function() {
  goog.ui.CustomButtonRenderer.call(this);
};
goog.inherits(goog.ui.MenuButtonRenderer, goog.ui.CustomButtonRenderer);
goog.addSingletonGetter(goog.ui.MenuButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.MenuButtonRenderer.CSS_CLASS = goog.getCssName('goog-menu-button');


/**
 * Takes the button's root element and returns the parent element of the
 * button's contents.  Overrides the superclass implementation by taking
 * the nested DIV structure of menu buttons into account.
 * @param {Element} element Root element of the button whose content element
 *     is to be returned.
 * @return {Element} The button's content element.
 * @override
 */
goog.ui.MenuButtonRenderer.prototype.getContentElement = function(element) {
  return goog.ui.MenuButtonRenderer.superClass_.getContentElement.call(
      this,
      /** @type {Element} */ (element && element.firstChild));
};


/**
 * Takes an element, decorates it with the menu button control, and returns
 * the element.  Overrides {@link goog.ui.CustomButtonRenderer#decorate} by
 * looking for a child element that can be decorated by a menu, and if it
 * finds one, decorates it and attaches it to the menu button.
 * @param {goog.ui.Control} control goog.ui.MenuButton to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
goog.ui.MenuButtonRenderer.prototype.decorate = function(control, element) {
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
  return goog.ui.MenuButtonRenderer.superClass_.decorate.call(
      this, button, element);
};


/**
 * Takes a text caption or existing DOM structure, and returns the content and
 * a dropdown arrow element wrapped in a pseudo-rounded-corner box.  Creates
 * the following DOM structure:
 *
 *    <div class="goog-inline-block goog-menu-button-outer-box">
 *      <div class="goog-inline-block goog-menu-button-inner-box">
 *        <div class="goog-inline-block goog-menu-button-caption">
 *          Contents...
 *        </div>
 *        <div class="goog-inline-block goog-menu-button-dropdown">
 *          &nbsp;
 *        </div>
 *      </div>
 *    </div>
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure
 *     to wrap in a box.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {Element} Pseudo-rounded-corner box containing the content.
 * @override
 */
goog.ui.MenuButtonRenderer.prototype.createButton = function(content, dom) {
  return goog.ui.MenuButtonRenderer.superClass_.createButton.call(
      this, [this.createCaption(content, dom), this.createDropdown(dom)], dom);
};


/**
 * Takes a text caption or existing DOM structure, and returns it wrapped in
 * an appropriately-styled DIV.  Creates the following DOM structure:
 *
 *    <div class="goog-inline-block goog-menu-button-caption">
 *      Contents...
 *    </div>
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure
 *     to wrap in a box.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {Element} Caption element.
 */
goog.ui.MenuButtonRenderer.prototype.createCaption = function(content, dom) {
  return goog.ui.MenuButtonRenderer.wrapCaption(
      content, this.getCssClass(), dom);
};


/**
 * Takes a text caption or existing DOM structure, and returns it wrapped in
 * an appropriately-styled DIV.  Creates the following DOM structure:
 *
 *    <div class="goog-inline-block goog-menu-button-caption">
 *      Contents...
 *    </div>
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure
 *     to wrap in a box.
 * @param {string} cssClass The CSS class for the renderer.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {!Element} Caption element.
 */
goog.ui.MenuButtonRenderer.wrapCaption = function(content, cssClass, dom) {
  return dom.createDom(
      goog.dom.TagName.DIV, goog.ui.INLINE_BLOCK_CLASSNAME + ' ' +
          goog.getCssName(cssClass, 'caption'),
      content);
};


/**
 * Returns an appropriately-styled DIV containing a dropdown arrow element.
 * Creates the following DOM structure:
 *
 *    <div class="goog-inline-block goog-menu-button-dropdown">
 *      &nbsp;
 *    </div>
 *
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {Element} Dropdown element.
 */
goog.ui.MenuButtonRenderer.prototype.createDropdown = function(dom) {
  // 00A0 is &nbsp;
  return dom.createDom(
      goog.dom.TagName.DIV, goog.ui.INLINE_BLOCK_CLASSNAME + ' ' +
          goog.getCssName(this.getCssClass(), 'dropdown'),
      '\u00A0');
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.MenuButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuButtonRenderer.CSS_CLASS;
};

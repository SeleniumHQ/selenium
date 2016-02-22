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
 * @fileoverview Similiar functionality of {@link goog.ui.MenuButtonRenderer},
 * but inherits from {@link goog.ui.FlatButtonRenderer} instead of
 * {@link goog.ui.CustomButtonRenderer}. This creates a simpler menu button
 * that will look more like a traditional <select> menu.
 *
 */

goog.provide('goog.ui.FlatMenuButtonRenderer');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.style');
goog.require('goog.ui.FlatButtonRenderer');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuRenderer');
goog.require('goog.ui.registry');



/**
 * Flat Menu Button renderer. Creates a simpler version of
 * {@link goog.ui.MenuButton} that doesn't look like a button and
 * doesn't have rounded corners. Uses just a <div> and looks more like
 * a traditional <select> element.
 * @constructor
 * @extends {goog.ui.FlatButtonRenderer}
 */
goog.ui.FlatMenuButtonRenderer = function() {
  goog.ui.FlatButtonRenderer.call(this);
};
goog.inherits(goog.ui.FlatMenuButtonRenderer, goog.ui.FlatButtonRenderer);
goog.addSingletonGetter(goog.ui.FlatMenuButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.FlatMenuButtonRenderer.CSS_CLASS =
    goog.getCssName('goog-flat-menu-button');


/**
 * Returns the button's contents wrapped in the following DOM structure:
 *    <div class="goog-inline-block goog-flat-menu-button">
 *        <div class="goog-inline-block goog-flat-menu-button-caption">
 *          Contents...
 *        </div>
 *        <div class="goog-inline-block goog-flat-menu-button-dropdown">
 *          &nbsp;
 *        </div>
 *    </div>
 * Overrides {@link goog.ui.FlatButtonRenderer#createDom}.
 * @param {goog.ui.Control} control Button to render.
 * @return {!Element} Root element for the button.
 * @override
 */
goog.ui.FlatMenuButtonRenderer.prototype.createDom = function(control) {
  var button = /** @type {goog.ui.Button} */ (control);
  var classNames = this.getClassNames(button);
  var attributes = {
    'class': goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + classNames.join(' ')
  };
  var element = button.getDomHelper().createDom(
      goog.dom.TagName.DIV, attributes,
      [this.createCaption(button.getContent(), button.getDomHelper()),
       this.createDropdown(button.getDomHelper())]);
  this.setTooltip(
      element, /** @type {!string}*/ (button.getTooltip()));
  return element;
};


/**
 * Takes the button's root element and returns the parent element of the
 * button's contents.
 * @param {Element} element Root element of the button whose content
 * element is to be returned.
 * @return {Element} The button's content element (if any).
 * @override
 */
goog.ui.FlatMenuButtonRenderer.prototype.getContentElement = function(element) {
  return element && /** @type {Element} */ (element.firstChild);
};


/**
 * Takes an element, decorates it with the menu button control, and returns
 * the element.  Overrides {@link goog.ui.CustomButtonRenderer#decorate} by
 * looking for a child element that can be decorated by a menu, and if it
 * finds one, decorates it and attaches it to the menu button.
 * @param {goog.ui.Control} button Menu button to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
goog.ui.FlatMenuButtonRenderer.prototype.decorate = function(button, element) {
  // TODO(user): MenuButtonRenderer uses the exact same code.
  // Refactor this block to its own module where both can use it.
  var menuElem = goog.dom.getElementsByTagNameAndClass(
      '*', goog.ui.MenuRenderer.CSS_CLASS, element)[0];
  if (menuElem) {
    // Move the menu element directly under the body, but hide it first; see
    // bug 1089244.
    goog.style.setElementShown(menuElem, false);
    button.getDomHelper().getDocument().body.appendChild(menuElem);

    // Decorate the menu and attach it to the button.
    var menu = new goog.ui.Menu();
    menu.decorate(menuElem);
    button.setMenu(menu);
  }

  // Add the caption if it's not already there.
  var captionElem = goog.dom.getElementsByTagNameAndClass(
      '*', goog.getCssName(this.getCssClass(), 'caption'), element)[0];
  if (!captionElem) {
    element.appendChild(
        this.createCaption(element.childNodes, button.getDomHelper()));
  }

  // Add the dropdown icon if it's not already there.
  var dropdownElem = goog.dom.getElementsByTagNameAndClass(
      '*', goog.getCssName(this.getCssClass(), 'dropdown'), element)[0];
  if (!dropdownElem) {
    element.appendChild(this.createDropdown(button.getDomHelper()));
  }

  // Let the superclass do the rest.
  return goog.ui.FlatMenuButtonRenderer.superClass_.decorate.call(this, button,
      element);
};


/**
 * Takes a text caption or existing DOM structure, and returns it wrapped in
 * an appropriately-styled DIV.  Creates the following DOM structure:
 *    <div class="goog-inline-block goog-flat-menu-button-caption">
 *      Contents...
 *    </div>
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to wrap
 *     in a box.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {Element} Caption element.
 */
goog.ui.FlatMenuButtonRenderer.prototype.createCaption = function(content,
                                                                  dom) {
  return dom.createDom(goog.dom.TagName.DIV,
      goog.ui.INLINE_BLOCK_CLASSNAME + ' ' +
      goog.getCssName(this.getCssClass(), 'caption'), content);
};


/**
 * Returns an appropriately-styled DIV containing a dropdown arrow element.
 * Creates the following DOM structure:
 *    <div class="goog-inline-block goog-flat-menu-button-dropdown">
 *      &nbsp;
 *    </div>
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {!Element} Dropdown element.
 */
goog.ui.FlatMenuButtonRenderer.prototype.createDropdown = function(dom) {
  // 00A0 is &nbsp;
  return dom.createDom(goog.dom.TagName.DIV, {
    'class': goog.ui.INLINE_BLOCK_CLASSNAME + ' ' +
        goog.getCssName(this.getCssClass(), 'dropdown'),
    'aria-hidden': true
  }, '\u00A0');
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.FlatMenuButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.FlatMenuButtonRenderer.CSS_CLASS;
};


// Register a decorator factory function for Flat Menu Buttons.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.FlatMenuButtonRenderer.CSS_CLASS,
    function() {
      // Uses goog.ui.MenuButton, but with FlatMenuButtonRenderer.
      return new goog.ui.MenuButton(null, null,
          goog.ui.FlatMenuButtonRenderer.getInstance());
    });

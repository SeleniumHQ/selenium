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
 * @fileoverview Renderer for {@link goog.ui.ColorMenuButton}s.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.ui.ColorMenuButtonRenderer');

goog.require('goog.asserts');
goog.require('goog.color');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.ui.MenuButtonRenderer');
goog.require('goog.userAgent');



/**
 * Renderer for {@link goog.ui.ColorMenuButton}s.
 * @constructor
 * @extends {goog.ui.MenuButtonRenderer}
 */
goog.ui.ColorMenuButtonRenderer = function() {
  goog.ui.MenuButtonRenderer.call(this);
};
goog.inherits(goog.ui.ColorMenuButtonRenderer, goog.ui.MenuButtonRenderer);
goog.addSingletonGetter(goog.ui.ColorMenuButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.ColorMenuButtonRenderer.CSS_CLASS =
    goog.getCssName('goog-color-menu-button');


/**
 * Overrides the superclass implementation by wrapping the caption text or DOM
 * structure in a color indicator element.  Creates the following DOM structure:
 *   <div class="goog-inline-block goog-menu-button-caption">
 *     <div class="goog-color-menu-button-indicator">
 *       Contents...
 *     </div>
 *   </div>
 * The 'goog-color-menu-button-indicator' style should be defined to have a
 * bottom border of nonzero width and a default color that blends into its
 * background.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {Element} Caption element.
 * @override
 */
goog.ui.ColorMenuButtonRenderer.prototype.createCaption = function(
    content, dom) {
  return goog.ui.ColorMenuButtonRenderer.superClass_.createCaption.call(
      this, goog.ui.ColorMenuButtonRenderer.wrapCaption(content, dom), dom);
};


/**
 * Wrap a caption in a div with the color-menu-button-indicator CSS class.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {!Element} Caption element.
 */
goog.ui.ColorMenuButtonRenderer.wrapCaption = function(content, dom) {
  return dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(goog.ui.ColorMenuButtonRenderer.CSS_CLASS, 'indicator'),
      content);
};


/**
 * Takes a color menu button control's root element and a value object
 * (which is assumed to be a color), and updates the button's DOM to reflect
 * the new color.  Overrides {@link goog.ui.ButtonRenderer#setValue}.
 * @param {Element} element The button control's root element (if rendered).
 * @param {*} value New value; assumed to be a color spec string.
 * @override
 */
goog.ui.ColorMenuButtonRenderer.prototype.setValue = function(element, value) {
  if (element) {
    goog.ui.ColorMenuButtonRenderer.setCaptionValue(
        this.getContentElement(element), value);
  }
};


/**
 * Takes a control's content element and a value object (which is assumed
 * to be a color), and updates its DOM to reflect the new color.
 * @param {Element} caption A content element of a control.
 * @param {*} value New value; assumed to be a color spec string.
 */
goog.ui.ColorMenuButtonRenderer.setCaptionValue = function(caption, value) {
  // Assume that the caption's first child is the indicator.
  if (caption && caption.firstChild) {
    // Normalize the value to a hex color spec or null (otherwise setting
    // borderBottomColor will cause a JS error on IE).
    var hexColor;

    var strValue = /** @type {string} */ (value);
    hexColor = strValue && goog.color.isValidColor(strValue) ?
        goog.color.parse(strValue).hex :
        null;

    // Stupid IE6/7 doesn't do transparent borders.
    // TODO(attila): Add user-agent version check when IE8 comes out...
    caption.firstChild.style.borderBottomColor =
        hexColor || (goog.userAgent.IE ? '' : 'transparent');
  }
};


/**
 * Initializes the button's DOM when it enters the document.  Overrides the
 * superclass implementation by making sure the button's color indicator is
 * initialized.
 * @param {goog.ui.Control} button goog.ui.ColorMenuButton whose DOM is to be
 *     initialized as it enters the document.
 * @override
 */
goog.ui.ColorMenuButtonRenderer.prototype.initializeDom = function(button) {
  var buttonElement = button.getElement();
  goog.asserts.assert(buttonElement);
  this.setValue(buttonElement, button.getValue());
  goog.dom.classlist.add(
      buttonElement, goog.ui.ColorMenuButtonRenderer.CSS_CLASS);
  goog.ui.ColorMenuButtonRenderer.superClass_.initializeDom.call(this, button);
};

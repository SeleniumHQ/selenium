/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renderer for {@link goog.ui.ColorMenuButton}s.
 */

goog.provide('goog.ui.ColorMenuButtonRenderer');

goog.require('goog.asserts');
goog.require('goog.color');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.ui.MenuButtonRenderer');
goog.requireType('goog.dom.DomHelper');
goog.requireType('goog.ui.Control');
goog.requireType('goog.ui.ControlContent');



/**
 * Renderer for {@link goog.ui.ColorMenuButton}s.
 * @constructor
 * @extends {goog.ui.MenuButtonRenderer}
 */
goog.ui.ColorMenuButtonRenderer = function() {
  'use strict';
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
 *
 *    <div class="goog-inline-block goog-menu-button-caption">
 *      <div class="goog-color-menu-button-indicator">
 *        Contents...
 *      </div>
 *    </div>
 *
 * The 'goog-color-menu-button-indicator' style should be defined to have a
 * bottom border of nonzero width and a default color that blends into its
 * background.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {!Element} Caption element.
 * @override
 */
goog.ui.ColorMenuButtonRenderer.prototype.createCaption = function(
    content, dom) {
  'use strict';
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
  'use strict';
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
  'use strict';
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
  'use strict';
  // Assume that the caption's first child is the indicator.
  if (caption && caption.firstChild) {
    // Normalize the value to a hex color spec or null (otherwise setting
    // borderBottomColor will cause a JS error on IE).
    var hexColor;

    var strValue = /** @type {string} */ (value);
    hexColor = strValue && goog.color.isValidColor(strValue) ?
        goog.color.parse(strValue).hex :
        null;

    /** @suppress {strictMissingProperties} Added to tighten compiler checks */
    caption.firstChild.style.borderBottomColor = hexColor || 'transparent';
  }
};


/**
 * Initializes the button's DOM when it enters the document.  Overrides the
 * superclass implementation by making sure the button's color indicator is
 * initialized.
 * @param {goog.ui.Control} button goog.ui.ColorMenuButton whose DOM is to be
 *     initialized as it enters the document.
 * @override
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.ColorMenuButtonRenderer.prototype.initializeDom = function(button) {
  'use strict';
  var buttonElement = button.getElement();
  goog.asserts.assert(buttonElement);
  this.setValue(buttonElement, button.getValue());
  goog.dom.classlist.add(
      buttonElement, goog.ui.ColorMenuButtonRenderer.CSS_CLASS);
  goog.ui.ColorMenuButtonRenderer.superClass_.initializeDom.call(this, button);
};

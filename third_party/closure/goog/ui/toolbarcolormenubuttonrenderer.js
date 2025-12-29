/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A toolbar-style renderer for {@link goog.ui.ColorMenuButton}.
 */

goog.provide('goog.ui.ToolbarColorMenuButtonRenderer');

goog.require('goog.asserts');
goog.require('goog.dom.classlist');
goog.require('goog.ui.ColorMenuButtonRenderer');
goog.require('goog.ui.MenuButtonRenderer');
goog.require('goog.ui.ToolbarMenuButtonRenderer');
goog.requireType('goog.dom.DomHelper');
goog.requireType('goog.ui.Control');
goog.requireType('goog.ui.ControlContent');



/**
 * Toolbar-style renderer for {@link goog.ui.ColorMenuButton}s.
 * @constructor
 * @extends {goog.ui.ToolbarMenuButtonRenderer}
 * @final
 */
goog.ui.ToolbarColorMenuButtonRenderer = function() {
  'use strict';
  goog.ui.ToolbarMenuButtonRenderer.call(this);
};
goog.inherits(
    goog.ui.ToolbarColorMenuButtonRenderer, goog.ui.ToolbarMenuButtonRenderer);
goog.addSingletonGetter(goog.ui.ToolbarColorMenuButtonRenderer);


/**
 * Overrides the superclass implementation by wrapping the caption text or DOM
 * structure in a color indicator element.  Creates the following DOM structure:
 *
 *    <div class="goog-inline-block goog-toolbar-menu-button-caption">
 *      <div class="goog-color-menu-button-indicator">
 *        Contents...
 *      </div>
 *    </div>
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {!Element} Caption element.
 * @see goog.ui.ToolbarColorMenuButtonRenderer#createColorIndicator
 * @override
 */
goog.ui.ToolbarColorMenuButtonRenderer.prototype.createCaption = function(
    content, dom) {
  'use strict';
  return goog.ui.MenuButtonRenderer.wrapCaption(
      goog.ui.ColorMenuButtonRenderer.wrapCaption(content, dom),
      this.getCssClass(), dom);
};


/**
 * Takes a color menu button control's root element and a value object
 * (which is assumed to be a color), and updates the button's DOM to reflect
 * the new color.  Overrides {@link goog.ui.ButtonRenderer#setValue}.
 * @param {Element} element The button control's root element (if rendered).
 * @param {*} value New value; assumed to be a color spec string.
 * @override
 */
goog.ui.ToolbarColorMenuButtonRenderer.prototype.setValue = function(
    element, value) {
  'use strict';
  if (element) {
    goog.ui.ColorMenuButtonRenderer.setCaptionValue(
        this.getContentElement(element), value);
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
goog.ui.ToolbarColorMenuButtonRenderer.prototype.initializeDom = function(
    button) {
  'use strict';
  this.setValue(button.getElement(), button.getValue());
  goog.dom.classlist.add(
      goog.asserts.assert(button.getElement()),
      goog.getCssName('goog-toolbar-color-menu-button'));
  goog.ui.ToolbarColorMenuButtonRenderer.superClass_.initializeDom.call(
      this, button);
};

// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Renderer for {@link goog.ui.ColorButton}s.
 *
 */

goog.provide('goog.ui.ColorButtonRenderer');

goog.require('goog.dom.classes');
goog.require('goog.functions');
goog.require('goog.ui.ColorMenuButtonRenderer');



/**
 * Renderer for {@link goog.ui.ColorButton}s.
 * Uses {@link goog.ui.ColorMenuButton}s but disables the dropdown.
 *
 * @constructor
 * @extends {goog.ui.ColorMenuButtonRenderer}
 */
goog.ui.ColorButtonRenderer = function() {
  goog.base(this);

  /**
   * @inheritDoc
   */
  // TODO(user): enable disabling the dropdown in goog.ui.ColorMenuButton
  this.createDropdown = goog.functions.NULL;

};
goog.inherits(goog.ui.ColorButtonRenderer, goog.ui.ColorMenuButtonRenderer);
goog.addSingletonGetter(goog.ui.ColorButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer. Additionally, applies class to the button's caption.
 * @type {string}
 */
goog.ui.ColorButtonRenderer.CSS_CLASS = goog.getCssName('goog-color-button');


/** @inheritDoc */
goog.ui.ColorButtonRenderer.prototype.createCaption = function(content, dom) {
  var caption = goog.base(this, 'createCaption', content, dom);
  goog.dom.classes.add(caption, goog.ui.ColorButtonRenderer.CSS_CLASS);
  return caption;
};


/** @inheritDoc */
goog.ui.ColorButtonRenderer.prototype.initializeDom = function(button) {
  goog.base(this, 'initializeDom', button);
  goog.dom.classes.add(button.getElement(),
      goog.ui.ColorButtonRenderer.CSS_CLASS);
};



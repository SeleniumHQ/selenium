// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A toggle button control.  Extends {@link goog.ui.Button} by
 * providing checkbox-like semantics.
 *
 */

goog.provide('goog.ui.ToggleButton');

goog.require('goog.ui.Button');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.ControlContent');
goog.require('goog.ui.CustomButtonRenderer');
goog.require('goog.ui.registry');



/**
 * A toggle button, with checkbox-like semantics.  Rendered using
 * {@link goog.ui.CustomButtonRenderer} by default, though any
 * {@link goog.ui.ButtonRenderer} would work.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *     structure to display as the button's caption.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the button; defaults to {@link goog.ui.CustomButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM hepler, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Button}
 */
goog.ui.ToggleButton = function(content, opt_renderer, opt_domHelper) {
  goog.ui.Button.call(this, content, opt_renderer ||
      goog.ui.CustomButtonRenderer.getInstance(), opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.CHECKED, true);
};
goog.inherits(goog.ui.ToggleButton, goog.ui.Button);


// Register a decorator factory function for goog.ui.ToggleButtons.
goog.ui.registry.setDecoratorByClassName(
  goog.getCssName('goog-toggle-button'), function() {
  // ToggleButton defaults to using CustomButtonRenderer.
  return new goog.ui.ToggleButton(null);
});

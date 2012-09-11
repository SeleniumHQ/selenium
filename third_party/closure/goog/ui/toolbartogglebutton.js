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
 * @fileoverview A toolbar toggle button control.
 *
 * @author attila@google.com (Attila Bodis)
 * @author ssaviano@google.com (Steven Saviano)
 */

goog.provide('goog.ui.ToolbarToggleButton');

goog.require('goog.ui.ControlContent');
goog.require('goog.ui.ToggleButton');
goog.require('goog.ui.ToolbarButtonRenderer');
goog.require('goog.ui.registry');



/**
 * A toggle button control for a toolbar.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *     structure to display as the button's caption.
 * @param {goog.ui.ToolbarButtonRenderer=} opt_renderer Optional renderer used
 *     to render or decorate the button; defaults to
 *     {@link goog.ui.ToolbarButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM hepler, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.ToggleButton}
 */
goog.ui.ToolbarToggleButton = function(content, opt_renderer, opt_domHelper) {
  goog.ui.ToggleButton.call(this, content, opt_renderer ||
      goog.ui.ToolbarButtonRenderer.getInstance(), opt_domHelper);
};
goog.inherits(goog.ui.ToolbarToggleButton, goog.ui.ToggleButton);


// Registers a decorator factory function for toggle buttons in toolbars.
goog.ui.registry.setDecoratorByClassName(
    goog.getCssName('goog-toolbar-toggle-button'), function() {
      return new goog.ui.ToolbarToggleButton(null);
    });

// Copyright 2010 Google Inc. All Rights Reserved
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
 * @fileoverview A color button rendered via
 * {@link goog.ui.ColorButtonRenderer}.
 *
*
 */

goog.provide('goog.ui.ColorButton');

goog.require('goog.ui.Button');
goog.require('goog.ui.ColorButtonRenderer');
goog.require('goog.ui.registry');


/**
 * A color button control.  Identical to {@link goog.ui.Button}, except it
 * defaults its renderer to {@link goog.ui.ColorButtonRenderer}.
 * This button displays a particular color and is clickable.
 * It is primarily useful with {@link goog.ui.ColorSplitBehavior} to cache the
 * last selected color.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *    structure to display as the button's caption.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Optional renderer used to
 *    render or decorate the button; defaults to
 *    {@link goog.ui.ColorButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *    document interaction.
 * @constructor
 * @extends {goog.ui.Button}
 */
goog.ui.ColorButton = function(content, opt_renderer, opt_domHelper) {
  goog.ui.Button.call(this, content, opt_renderer ||
      goog.ui.ColorButtonRenderer.getInstance(), opt_domHelper);
};
goog.inherits(goog.ui.ColorButton, goog.ui.Button);

// Register a decorator factory function for goog.ui.ColorButtons.
goog.ui.registry.setDecoratorByClassName(goog.ui.ColorButtonRenderer.CSS_CLASS,
    function() {
      // ColorButton defaults to using ColorButtonRenderer.
      return new goog.ui.ColorButton(null);
    });


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
 * @fileoverview A button rendered via {@link goog.ui.CustomButtonRenderer}.
 *
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.ui.CustomButton');

goog.require('goog.ui.Button');
goog.require('goog.ui.CustomButtonRenderer');
goog.require('goog.ui.registry');



/**
 * A custom button control.  Identical to {@link goog.ui.Button}, except it
 * defaults its renderer to {@link goog.ui.CustomButtonRenderer}.  One could
 * just as easily pass {@code goog.ui.CustomButtonRenderer.getInstance()} to
 * the {@link goog.ui.Button} constructor and get the same result.  Provided
 * for convenience.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *    structure to display as the button's caption.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Optional renderer used to
 *    render or decorate the button; defaults to
 *    {@link goog.ui.CustomButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *    document interaction.
 * @constructor
 * @extends {goog.ui.Button}
 */
goog.ui.CustomButton = function(content, opt_renderer, opt_domHelper) {
  goog.ui.Button.call(
      this, content, opt_renderer || goog.ui.CustomButtonRenderer.getInstance(),
      opt_domHelper);
};
goog.inherits(goog.ui.CustomButton, goog.ui.Button);


// Register a decorator factory function for goog.ui.CustomButtons.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.CustomButtonRenderer.CSS_CLASS, function() {
      // CustomButton defaults to using CustomButtonRenderer.
      return new goog.ui.CustomButton(null);
    });

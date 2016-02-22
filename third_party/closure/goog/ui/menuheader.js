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
 * @fileoverview A class for representing menu headers.
 * @see goog.ui.Menu
 *
 */

goog.provide('goog.ui.MenuHeader');

goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.MenuHeaderRenderer');
goog.require('goog.ui.registry');



/**
 * Class representing a menu header.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to
 *     display as the content of the item (use to add icons or styling to
 *     menus).
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper used for
 *     document interactions.
 * @param {goog.ui.MenuHeaderRenderer=} opt_renderer Optional renderer.
 * @constructor
 * @extends {goog.ui.Control}
 */
goog.ui.MenuHeader = function(content, opt_domHelper, opt_renderer) {
  goog.ui.Control.call(this, content, opt_renderer ||
      goog.ui.MenuHeaderRenderer.getInstance(), opt_domHelper);

  this.setSupportedState(goog.ui.Component.State.DISABLED, false);
  this.setSupportedState(goog.ui.Component.State.HOVER, false);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, false);
  this.setSupportedState(goog.ui.Component.State.FOCUSED, false);

  // Headers are always considered disabled.
  this.setStateInternal(goog.ui.Component.State.DISABLED);
};
goog.inherits(goog.ui.MenuHeader, goog.ui.Control);


// Register a decorator factory function for goog.ui.MenuHeaders.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.MenuHeaderRenderer.CSS_CLASS,
    function() {
      // MenuHeader defaults to using MenuHeaderRenderer.
      return new goog.ui.MenuHeader(null);
    });

/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A class for representing menu headers.
 * @see goog.ui.Menu
 */

goog.provide('goog.ui.MenuHeader');

goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.MenuHeaderRenderer');
goog.require('goog.ui.registry');
goog.requireType('goog.dom.DomHelper');
goog.requireType('goog.ui.ControlContent');



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
  'use strict';
  goog.ui.Control.call(
      this, content, opt_renderer || goog.ui.MenuHeaderRenderer.getInstance(),
      opt_domHelper);

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
    goog.ui.MenuHeaderRenderer.CSS_CLASS, function() {
      'use strict';
      // MenuHeader defaults to using MenuHeaderRenderer.
      return new goog.ui.MenuHeader(null);
    });

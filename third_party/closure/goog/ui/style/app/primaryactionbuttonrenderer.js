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
 * @fileoverview Renderer for {@link goog.ui.Button}s in App style. This
 * type of button is typically used for an application's "primary action," eg
 * in Gmail, it's "Compose," in Calendar, it's "Create Event".
 *
 */

goog.provide('goog.ui.style.app.PrimaryActionButtonRenderer');

goog.require('goog.ui.Button');
goog.require('goog.ui.registry');
goog.require('goog.ui.style.app.ButtonRenderer');



/**
 * Custom renderer for {@link goog.ui.Button}s. This renderer supports the
 * "primary action" style for buttons.
 *
 * @constructor
 * @extends {goog.ui.style.app.ButtonRenderer}
 * @final
 */
goog.ui.style.app.PrimaryActionButtonRenderer = function() {
  goog.ui.style.app.ButtonRenderer.call(this);
};
goog.inherits(goog.ui.style.app.PrimaryActionButtonRenderer,
    goog.ui.style.app.ButtonRenderer);
goog.addSingletonGetter(goog.ui.style.app.PrimaryActionButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.style.app.PrimaryActionButtonRenderer.CSS_CLASS =
    'goog-primaryactionbutton';


/**
 * Array of arrays of CSS classes that we want composite classes added and
 * removed for in IE6 and lower as a workaround for lack of multi-class CSS
 * selector support.
 * @type {Array<Array<string>>}
 */
goog.ui.style.app.PrimaryActionButtonRenderer.IE6_CLASS_COMBINATIONS = [
  ['goog-button-base-disabled', 'goog-primaryactionbutton'],
  ['goog-button-base-focused', 'goog-primaryactionbutton'],
  ['goog-button-base-hover', 'goog-primaryactionbutton']
];


/** @override */
goog.ui.style.app.PrimaryActionButtonRenderer.prototype.getCssClass =
    function() {
  return goog.ui.style.app.PrimaryActionButtonRenderer.CSS_CLASS;
};


/** @override */
goog.ui.style.app.PrimaryActionButtonRenderer.prototype.
    getIe6ClassCombinations = function() {
  return goog.ui.style.app.PrimaryActionButtonRenderer.IE6_CLASS_COMBINATIONS;
};


// Register a decorator factory function for
// goog.ui.style.app.PrimaryActionButtonRenderer.
goog.ui.registry.setDecoratorByClassName(
    goog.ui.style.app.PrimaryActionButtonRenderer.CSS_CLASS,
    function() {
      return new goog.ui.Button(null,
          goog.ui.style.app.PrimaryActionButtonRenderer.getInstance());
    });

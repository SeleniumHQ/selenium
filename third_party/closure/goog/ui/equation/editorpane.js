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

goog.provide('goog.ui.equation.EditorPane');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.ui.Component');



/**
 * An abstract equation editor tab pane.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.equation.EditorPane = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
};
goog.inherits(goog.ui.equation.EditorPane, goog.ui.Component);


/**
 * A link to any available help documentation to be displayed in a "Learn more"
 * link.  If not set through the equationeditor plugin constructor, the link
 * will be omitted.
 * @type {string}
 * @private
 */
goog.ui.equation.EditorPane.prototype.helpUrl_ = '';


/**
 * Sets the visibility of this tab pane.
 * @param {boolean} visible Whether this tab should become visible.
 */
goog.ui.equation.EditorPane.prototype.setVisible =
    function(visible) {
  goog.style.showElement(this.getElement(), visible);
};


/**
 * Sets the equation to show in this tab pane.
 * @param {string} equation The equation.
 * @protected
 */
goog.ui.equation.EditorPane.prototype.setEquation = goog.abstractMethod;


/**
 * @return {string} The equation shown in this tab pane.
 * @protected
 */
goog.ui.equation.EditorPane.prototype.getEquation = goog.abstractMethod;


/**
 * Sets the help link URL to show in this tab pane.
 * @param {string} url The help link URL.
 * @protected
 */
goog.ui.equation.EditorPane.prototype.setHelpUrl = function(url) {
  this.helpUrl_ = url;
};


/**
 * @return {string} The help link URL.
 * @protected
 */
goog.ui.equation.EditorPane.prototype.getHelpUrl = function() {
  return this.helpUrl_;
};


/**
 * @return {boolean} Whether the equation was modified.
 * @protected
 */
goog.ui.equation.EditorPane.prototype.isModified = goog.abstractMethod;


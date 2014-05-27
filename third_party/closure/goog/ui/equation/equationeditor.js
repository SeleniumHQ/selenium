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

goog.provide('goog.ui.equation.EquationEditor');

goog.require('goog.events');
goog.require('goog.ui.Component');
goog.require('goog.ui.TabBar');
goog.require('goog.ui.equation.ImageRenderer');
goog.require('goog.ui.equation.TexPane');



/**
 * User interface for equation editor plugin.
 * @constructor
 * @param {Object} context The context that this equation editor runs in.
 * @param {goog.dom.DomHelper=} opt_domHelper DomHelper to use.
 * @param {string=} opt_helpUrl Help document URL to use in the "Learn more"
 *     link.
 * @extends {goog.ui.Component}
 * @final
 */
goog.ui.equation.EquationEditor = function(context, opt_domHelper,
    opt_helpUrl) {
  goog.ui.equation.EquationEditor.base(this, 'constructor', opt_domHelper);

  /**
   * The context this editor runs in.
   * @type {Object}
   * @private
   */
  this.context_ = context;

  /**
   * Help document URL to use in the "Learn more" link.
   * @type {string}
   * @private
   */
  this.helpUrl_ = opt_helpUrl || '';
};
goog.inherits(goog.ui.equation.EquationEditor, goog.ui.Component);


/**
 * Constants for event names.
 * @enum {string}
 */
goog.ui.equation.EquationEditor.EventType = {
  /**
   * Dispatched when equation changes.
   */
  CHANGE: 'change'
};


/**
 * The index of the last active tab. Zero means first tab.
 * @type {number}
 * @private
 */
goog.ui.equation.EquationEditor.prototype.activeTabIndex_ = 0;


/** @override */
goog.ui.equation.EquationEditor.prototype.createDom = function() {
  goog.ui.equation.EquationEditor.base(this, 'createDom');
  this.createDom_();
};


/**
 * Creates main editor contents.
 * @private
 */
goog.ui.equation.EquationEditor.prototype.createDom_ = function() {
  var contentElement = this.getElement();

  /** @desc Title of the visual equation editor tab. */
  var MSG_VISUAL_EDITOR = goog.getMsg('Editor');

  /** @desc Title of the TeX equation editor tab. */
  var MSG_TEX_EDITOR = goog.getMsg('TeX');

  // Create the main tabs
  var dom = this.dom_;
  var tabTop = dom.createDom('div',
      {'class': 'goog-tab-bar goog-tab-bar-top'},
      dom.createDom('div',
          {'class': 'goog-tab goog-tab-selected'}, MSG_VISUAL_EDITOR),
      dom.createDom('div', {'class': 'goog-tab'}, MSG_TEX_EDITOR));
  var tabClear = dom.createDom('div', {'class': 'goog-tab-bar-clear'});
  var tabContent = dom.createDom('div', {'class': 'ee-content'});
  dom.appendChild(contentElement, tabTop);
  dom.appendChild(contentElement, tabClear);
  dom.appendChild(contentElement, tabContent);

  var tabBar = new goog.ui.TabBar();
  tabBar.decorate(tabTop);

  /**
   * The tab bar.
   * @type {!goog.ui.TabBar}
   * @private
   */
  this.tabBar_ = tabBar;

  goog.events.listen(tabBar, goog.ui.Component.EventType.SELECT,
      goog.bind(this.handleTabSelect_, this));

  var texEditor = new goog.ui.equation.TexPane(this.context_,
      this.helpUrl_, this.dom_);
  this.addChild(texEditor);
  texEditor.render(tabContent);

  this.setVisibleTab_(0); // Make first tab visible
};


/**
 * Sets the visibility of the editor.
 * @param {boolean} visible Whether the editor should be visible.
 */
goog.ui.equation.EquationEditor.prototype.setVisible = function(visible) {
  // Show active tab if visible, or none if not
  this.setVisibleTab_(visible ? this.activeTabIndex_ : -1);
};


/**
 * Sets the tab at the selected index as visible and all the rest as not
 * visible.
 * @param {number} tabIndex The tab index that is visible. -1 means no
 *     tab is visible.
 * @private
 */
goog.ui.equation.EquationEditor.prototype.setVisibleTab_ = function(tabIndex) {
  for (var i = 0; i < this.getChildCount(); i++) {
    this.getChildAt(i).setVisible(i == tabIndex);
  }
};


/** @override */
goog.ui.equation.EquationEditor.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  this.createDom_();
};


/**
 * Returns the encoded equation.
 * @return {string} The encoded equation.
 */
goog.ui.equation.EquationEditor.prototype.getEquation = function() {
  var sel = this.tabBar_.getSelectedTabIndex();
  return this.getChildAt(sel).getEquation();
};


/**
 * @return {string} The html code to embed in the document.
 */
goog.ui.equation.EquationEditor.prototype.getHtml = function() {
  return goog.ui.equation.ImageRenderer.getHtml(this.getEquation());
};


/**
 * Checks whether the current equation is valid and can be used in a document.
 * @return {boolean} Whether the equation is valid.
 */
goog.ui.equation.EquationEditor.prototype.isValid = function() {
  return goog.ui.equation.ImageRenderer.isEquationTooLong(
      this.getEquation());
};


/**
 * Handles a tab selection by the user.
 * @param {goog.events.Event} e The event.
 * @private
 */
goog.ui.equation.EquationEditor.prototype.handleTabSelect_ = function(e) {
  var sel = this.tabBar_.getSelectedTabIndex();
  if (sel != this.activeTabIndex_) {
    this.activeTabIndex_ = sel;
    this.setVisibleTab_(sel);
  }

  // TODO(user) Pass equation from the tab to the other is modified
};


/**
 * Parse an equation and draw it.
 * Clears any previous displayed equation.
 * @param {string} equation The equation text to parse.
 */
goog.ui.equation.EquationEditor.prototype.setEquation = function(equation) {
  var sel = this.tabBar_.getSelectedTabIndex();
  this.getChildAt(sel).setEquation(equation);
};


/** @override */
goog.ui.equation.EquationEditor.prototype.disposeInternal = function() {
  this.context_ = null;
  goog.ui.equation.EquationEditor.base(this, 'disposeInternal');
};

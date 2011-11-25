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
 * @fileoverview Tabbed pane with style and functionality specific to
 * Editor dialogs.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.ui.editor.TabPane');

goog.require('goog.dom.TagName');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.Tab');
goog.require('goog.ui.TabBar');



/**
 * Creates a new Editor-style tab pane.
 * @param {goog.dom.DomHelper} dom The dom helper for the window to create this
 *     tab pane in.
 * @param {string=} opt_caption Optional caption of the tab pane.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.editor.TabPane = function(dom, opt_caption) {
  goog.base(this, dom);

  /**
   * The event handler used to register events.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  /**
   * The tab bar used to render the tabs.
   * @type {goog.ui.TabBar}
   * @private
   */
  this.tabBar_ = new goog.ui.TabBar(goog.ui.TabBar.Location.START,
      undefined, this.dom_);
  this.tabBar_.setFocusable(false);

  /**
   * The content element.
   * @private
   */
  this.tabContent_ = this.dom_.createDom(goog.dom.TagName.DIV,
      {className: goog.getCssName('goog-tab-content')});

  /**
   * The currently selected radio button.
   * @type {Element}
   * @private
   */
  this.selectedRadio_ = null;

  /**
   * The currently visible tab content.
   * @type {Element}
   * @private
   */
  this.visibleContent_ = null;


  // Add the caption as the first element in the tab bar.
  if (opt_caption) {
    var captionControl = new goog.ui.Control(opt_caption, undefined,
        this.dom_);
    captionControl.addClassName(goog.getCssName('tr-tabpane-caption'));
    captionControl.setEnabled(false);
    this.tabBar_.addChild(captionControl, true);
  }
};
goog.inherits(goog.ui.editor.TabPane, goog.ui.Component);


/**
 * @return {string} The ID of the content element for the current tab.
 */
goog.ui.editor.TabPane.prototype.getCurrentTabId = function() {
  return this.tabBar_.getSelectedTab().getId();
};


/**
 * Selects the tab with the given id.
 * @param {string} id Id of the tab to select.
 */
goog.ui.editor.TabPane.prototype.setSelectedTabId = function(id) {
  this.tabBar_.setSelectedTab(this.tabBar_.getChild(id));
};


/**
 * Adds a tab to the tab pane.
 * @param {string} id The id of the tab to add.
 * @param {string} caption The caption of the tab.
 * @param {string} tooltip The tooltip for the tab.
 * @param {Element} content The content element to show when this tab is
 *     selected.
 */
goog.ui.editor.TabPane.prototype.addTab = function(id, caption, tooltip,
    content) {
  var radio = this.dom_.createDom(goog.dom.TagName.INPUT, {type: 'radio'});

  var tab = new goog.ui.Tab([radio, this.dom_.createTextNode(caption)],
      undefined, this.dom_);
  tab.setId(id);
  tab.setTooltip(tooltip);
  this.tabBar_.addChild(tab, true);

  this.eventHandler_.listen(radio, goog.events.EventType.SELECT,
      goog.bind(this.tabBar_.setSelectedTab, this.tabBar_, tab));

  content.id = id + '-tab';
  this.tabContent_.appendChild(content);
  goog.style.showElement(content, false);
};


/** @override */
goog.ui.editor.TabPane.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Get the root element and add a class name to it.
  var root = this.getElement();
  goog.dom.classes.add(root, goog.getCssName('tr-tabpane'));

  // Add the tabs.
  this.addChild(this.tabBar_, true);
  this.eventHandler_.listen(this.tabBar_, goog.ui.Component.EventType.SELECT,
      this.handleTabSelect_);

  // Add the tab content.
  root.appendChild(this.tabContent_);

  // Add an element to clear the tab float.
  root.appendChild(
      this.dom_.createDom(goog.dom.TagName.DIV,
          {className: goog.getCssName('goog-tab-bar-clear')}));
};


/**
 * Handles a tab change.
 * @param {goog.events.Event} e The browser change event.
 * @private
 */
goog.ui.editor.TabPane.prototype.handleTabSelect_ = function(e) {
  var tab = /** @type {goog.ui.Tab} */ (e.target);

  // Show the tab content.
  if (this.visibleContent_) {
    goog.style.showElement(this.visibleContent_, false);
  }
  this.visibleContent_ = this.dom_.getElement(tab.getId() + '-tab');
  goog.style.showElement(this.visibleContent_, true);

  // Select the appropriate radio button (and deselect the current one).
  if (this.selectedRadio_) {
    this.selectedRadio_.checked = false;
  }
  this.selectedRadio_ = tab.getElement().getElementsByTagName(
      goog.dom.TagName.INPUT)[0];
  this.selectedRadio_.checked = true;
};

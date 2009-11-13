// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved.

/**
 * @fileoverview Definition of the goog.ui.tree.TreeControl class, which
 * provides a way to view a hierarchical set of data.
 *
 *
 * This is a based on the webfx tree control. It since been updated to add
 * typeahead support, as well as accessibility support using ARIA framework.
 *
 * @see ../demos/tree/demo.html
 */

goog.provide('goog.ui.tree.TreeControl');

goog.require('goog.debug.Logger');
goog.require('goog.dom.a11y');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.events.FocusHandler');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.ui.tree.BaseNode');
goog.require('goog.ui.tree.TreeNode');
goog.require('goog.ui.tree.TypeAhead');
goog.require('goog.userAgent');



/**
 * This creates a TreeControl object. A tree control provides a way to
 * view a hierachical set of data.
 * @param {string} html The html content of the node label.
 * @param {Object} opt_config The configuration for the tree. See
 *    goog.ui.tree.TreeControl.DefaultConfig. If not specified, a default config
 *    will be used.
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.tree.BaseNode}
 */
goog.ui.tree.TreeControl = function(html, opt_config, opt_domHelper) {
  goog.ui.tree.BaseNode.call(this, html, opt_config, opt_domHelper);

  this.selectedItem_ = this;

  this.typeAhead_ = new goog.ui.tree.TypeAhead();

  if (goog.userAgent.IE && goog.userAgent.isVersion('6')) {
    /** @preserveTry */
    try {
      // works since IE6SP1
      document.execCommand('BackgroundImageCache', false, true)
    } catch (e) {
      this.logger_.warning('Failed to enable background image cache');
    }
  }
};
goog.inherits(goog.ui.tree.TreeControl, goog.ui.tree.BaseNode);


/**
 * The object handling keyboard events.
 * @type {goog.events.KeyHandler}
 * @private
 */
goog.ui.tree.TreeControl.prototype.keyHandler_ = null;


/**
 * The object handling focus events.
 * @type {goog.events.FocusHandler}
 * @private
 */
goog.ui.tree.TreeControl.prototype.focusHandler_ = null;


/**
 * Logger
 * @type {goog.debug.Logger}
 * @private
 */
goog.ui.tree.TreeControl.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.ui.tree.TreeControl');


/**
 * Allows an alternative element to be set to receive key targets, otherwise it
 * will be the tree's element itself.
 * @type {Element}
 * @private
 */
goog.ui.tree.TreeControl.prototype.keyEventTarget_ = null;


/**
 * Whether the tree node is open. The root is opened by default.
 * @type {boolean}
 * @private
 */
goog.ui.tree.TreeControl.prototype.expanded_ = true;


/**
 * Whether the tree item is selected. The root is selected by default.
 * @type {boolean}
 * @private
 */
goog.ui.tree.TreeControl.prototype.selected_ = true;


/**
 * Whether the tree is focused.
 * @type {boolean}
 * @private
 */
goog.ui.tree.TreeControl.prototype.focused_ = false;


/**
 * Child node that currently has focus.
 * @type {goog.ui.tree.BaseNode}
 * @private
 */
goog.ui.tree.TreeControl.prototype.focusedNode_ = null;


/**
 * Whether redrawing is suspended.
 * @type {boolean}
 * @private
 */
goog.ui.tree.TreeControl.prototype.suspendRedraw_ = false;


/**
 * Whether to show lines.
 * @type {boolean}
 * @private
 */
goog.ui.tree.TreeControl.prototype.showLines_ = true;


/**
 * Whether to show expanded lines.
 * @type {boolean}
 * @private
 */
goog.ui.tree.TreeControl.prototype.showExpandIcons_ = true;


/**
 * Whether to show the root node.
 * @type {boolean}
 * @private
 */
goog.ui.tree.TreeControl.prototype.showRootNode_ = true;


/**
 * Whether to show the root lines.
 * @type {boolean}
 * @private
 */
goog.ui.tree.TreeControl.prototype.showRootLines_ = true;


/**
 * Used for typeahead support.
 * @type {goog.ui.tree.TypeAhead}
 * @private
 */
goog.ui.tree.TreeControl.prototype.typeAhead_ = null;


/**
 * Returns the tree.
 * @return {goog.ui.tree.TreeControl} The tree.
 */
goog.ui.tree.TreeControl.prototype.getTree = function() {
  return this;
};


/**
 * Returns the depth of the node in the tree.
 * @return {number} The depth of the node in the tree.
 */
goog.ui.tree.TreeControl.prototype.getDepth = function() {
  return 0;
};


/**
 * Expands the parent chain of this node so that it is visible.
 */
goog.ui.tree.TreeControl.prototype.reveal = function() {
  // always expanded by default
  // needs to be overriden so that we don't try to reveal our parent
  // which is a generic component
};


/**
 * Handles focus on the tree.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.tree.TreeControl.prototype.handleFocus_ = function(e) {
  this.focused_ = true;
  goog.dom.classes.add(this.getElement(), 'focused');

  if (this.selectedItem_) {
    this.selectedItem_.select();
  }
};


/**
 * Handles blur on the tree.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.tree.TreeControl.prototype.handleBlur_ = function(e) {
  this.focused_ = false;
  goog.dom.classes.remove(this.getElement(), 'focused');
};


/**
 * @return {boolean} Whether the tree has keyboard focus.
 */
goog.ui.tree.TreeControl.prototype.hasFocus = function() {
  return this.focused_;
};


/**
 * Returns whether the node is expanded.
 * @return {boolean} Whether the node is expanded, false if it's collapsed.
 */
goog.ui.tree.TreeControl.prototype.getExpanded = function() {
  return !this.showRootNode_ ||
         goog.ui.tree.TreeControl.superClass_.getExpanded.call(this);
};


/**
 * Sets the node to be expanded.
 * @param {boolean} b Whether to expand or close the node.
 */
goog.ui.tree.TreeControl.prototype.setExpanded = function(b) {
  if (!this.showRootNode_) {
    this.expanded_ = b;
  } else {
    goog.ui.tree.TreeControl.superClass_.setExpanded.call(this, b);
  }
};


/**
 * Returns the source for the icon.
 * @return {string} Src for the icon.
 */
goog.ui.tree.TreeControl.prototype.getExpandIconHtml = function() {
  // no expand icon for root element
  return '';
};


/**
 * @return {Element} The icon element.
 */
goog.ui.tree.TreeControl.prototype.getIconElement = function() {
  var el = this.getRowElement();
  return el ? /** @type {Element} */ (el.firstChild) : null;
};


/**
 * @return {Element} The expanded icon element.
 */
goog.ui.tree.TreeControl.prototype.getExpandIconElement = function() {
  // no expand icon for root element
  return null;
};


/**
 * Updates the expand icon of the node.
 */
goog.ui.tree.TreeControl.prototype.updateExpandIcon = function() {
  // no expand icon
};


/**
 * Returns the class name to use for the row.
 * @return {string} The class name for the row.
 */
goog.ui.tree.TreeControl.prototype.getRowClassName = function() {
  return goog.ui.tree.TreeControl.superClass_.getRowClassName.call(this) +
    (this.showRootNode_ ? '' : ' ' + this.getConfig().cssHideRoot);
};


/**
 * Returns the source for the icon.
 * @return {string} Src for the icon.
 */
goog.ui.tree.TreeControl.prototype.getCalculatedIconClass = function() {
  // if classic then the openIcon is used for expanded, otherwise openIcon is
  // used for selected
  var config = this.getConfig();
  var behavior = this.getTree() ? this.getTree().getBehavior() :
                 config.defaultBehavior;
  var expanded = behavior == 'classic' && this.getExpanded() ||
                 behavior != 'classic' && this.isSelected();
  if (expanded && this.expandedIconClass_) {
    return this.expandedIconClass_;
  }
  if (!expanded && this.iconClass_) {
    return this.iconClass_;
  }

  // fall back on default icons
  if (expanded && config.cssExpandedRootIcon) {
    return config.cssTreeIcon + ' ' + config.cssExpandedRootIcon;
  } else if (!expanded && config.cssCollapsedRootIcon) {
    return config.cssTreeIcon + ' ' + config.cssCollapsedRootIcon;
  }
  return '';
};


/**
 * Sets the selected item.
 * @param {goog.ui.tree.BaseNode} o The item to select.
 */
goog.ui.tree.TreeControl.prototype.setSelectedItem = function(o) {
  if (this.selectedItem_ == o) {
    return;
  }

  var hadFocus = false;
  if (this.selectedItem_) {
    hadFocus = this.selectedItem_ == this.focusedNode_;
    this.selectedItem_.setSelectedInternal_(false);
  }

  this.selectedItem_ = o;

  if (this.selectedItem_) {
    this.selectedItem_.setSelectedInternal_(true);
    if (hadFocus) {
      this.selectedItem_.select();
    }
  }

  this.dispatchEvent(goog.events.EventType.CHANGE);
};


/**
 * Returns the selected item.
 * @return {goog.ui.tree.BaseNode} o The currently selected item.
 */
goog.ui.tree.TreeControl.prototype.getSelectedItem = function() {
  return this.selectedItem_;
};


/**
 * Returns the behavior of the tree.
 * @return {string} Describes when to show the open icon.
 */
goog.ui.tree.TreeControl.prototype.getBehavior = function() {
  // TODO (arv) - should this be an enum? if so, what are the values? Classic
  // and something else?
  return this.getConfig().defaultBehavior;
};


/**
 * Sets whether to show lines.
 * @param {boolean} b Whether to show lines.
 */
goog.ui.tree.TreeControl.prototype.setShowLines = function(b) {
  if (this.showLines_ != b) {
    this.showLines_ = b;
    if (this.isInDocument()) {
      this.updateLinesAndExpandIcons_();
    }
  }
};


/**
 * @return {boolean} Whether to show lines.
 */
goog.ui.tree.TreeControl.prototype.getShowLines = function() {
  return this.showLines_;
};


/**
 * Updates the lines after the tree has been drawn.
 * @private
 */
goog.ui.tree.TreeControl.prototype.updateLinesAndExpandIcons_ = function() {
  var tree = this;
  var showLines = tree.getShowLines();
  var showRootLines = tree.getShowRootLines();
  // Recursively walk through all nodes and update the class names of the
  // expand icon and the children element.
  function updateShowLines(node) {
    var childrenEl = node.getChildrenElement();
    if (childrenEl) {
      var hideLines = !showLines || tree == node.getParent() && !showRootLines;
      var childClass = hideLines ? node.getConfig().cssChildrenNoLines :
          node.getConfig().cssChildren;
      childrenEl.className = childClass;

      var expandIconEl = node.getExpandIconElement();
      if (expandIconEl) {
        expandIconEl.className = node.getExpandIconClass();
      }
    }
    node.forEachChild(updateShowLines);
  }
  updateShowLines(this);
};


/**
 * Sets whether to show root lines.
 * @param {boolean} b Whether to show root lines.
 */
goog.ui.tree.TreeControl.prototype.setShowRootLines = function(b) {
  if (this.showRootLines_ != b) {
    this.showRootLines_ = b;
    if (this.isInDocument()) {
      this.updateLinesAndExpandIcons_();
    }
  }
};


/**
 * @return {boolean} Whether to show root lines.
 */
goog.ui.tree.TreeControl.prototype.getShowRootLines = function() {
  return this.showRootLines_;
};


/**
 * Sets whether to show expand icons.
 * @param {boolean} b Whether to show expand icons.
 */
goog.ui.tree.TreeControl.prototype.setShowExpandIcons = function(b) {
  if (this.showExpandIcons_ != b) {
    this.showExpandIcons_ = b;
    if (this.isInDocument()) {
      this.updateLinesAndExpandIcons_();
    }
  }
};


/**
 * @return {boolean} Whether to show expand icons.
 */
goog.ui.tree.TreeControl.prototype.getShowExpandIcons = function() {
  return this.showExpandIcons_;
};


/**
 * Sets whether to show the root node.
 * @param {boolean} b Whether to show the root node.
 */
goog.ui.tree.TreeControl.prototype.setShowRootNode = function(b) {
  if (this.showRootNode_ != b) {
    this.showRootNode_ = b;
    if (this.isInDocument()) {
      var el = this.getRowElement();
      if (el) {
        el.className = this.getRowClassName();
      }
    }
    // Ensure that we do not hide the selected item.
    if (!b && this.getSelectedItem() == this && this.getFirstChild()) {
      this.setSelectedItem(this.getFirstChild());
    }
  }
};


/**
 * @return {boolean} Whether to show the root node.
 */
goog.ui.tree.TreeControl.prototype.getShowRootNode = function() {
  return this.showRootNode_;
};


/**
 * Add roles and states.
 * @protected
 */
goog.ui.tree.TreeControl.prototype.initAccessibility = function() {
  goog.ui.tree.TreeControl.superClass_.initAccessibility.call(this);

  var elt = this.getElement();
  goog.dom.a11y.setRole(elt, 'tree');
  goog.dom.a11y.setState(elt, 'labelledby', this.getLabelElement().id);
};


/**
 * Creates the element.
 * @return {Element} The root element.
 */
goog.ui.tree.TreeControl.prototype.createDom = function() {
  var elt = goog.ui.tree.TreeControl.superClass_.createDom.call(this);
  this.keyEventTarget_ = this.keyEventTarget_ || elt;
  return elt;
};


/** @inheritDoc */
goog.ui.tree.TreeControl.prototype.enterDocument = function() {
  goog.ui.tree.TreeControl.superClass_.enterDocument.call(this);
  var el = this.getElement();
  el.className = this.getConfig().cssRoot;
  el.setAttribute('hideFocus', 'true');
  this.attachEvents_();
  this.initAccessibility();
};


/** @inheritDoc */
goog.ui.tree.TreeControl.prototype.exitDocument = function() {
  goog.ui.tree.TreeControl.superClass_.exitDocument.call(this);
  this.detachEvents_();
};


/**
 * Adds the event listeners to the tree.
 * @private
 */
goog.ui.tree.TreeControl.prototype.attachEvents_ = function() {
  var el = this.getElement();
  el.tabIndex = 0;

  var kh = this.keyHandler_ = new goog.events.KeyHandler(el);
  var fh = this.focusHandler_ = new goog.events.FocusHandler(el);

  this.getHandler().
      listen(fh, goog.events.FocusHandler.EventType.FOCUSOUT, this.handleBlur_).
      listen(fh, goog.events.FocusHandler.EventType.FOCUSIN, this.handleFocus_).
      listen(kh, goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent).
      listen(el, goog.events.EventType.MOUSEDOWN, this.handleMouseEvent_).
      listen(el, goog.events.EventType.CLICK, this.handleMouseEvent_).
      listen(el, goog.events.EventType.DBLCLICK, this.handleMouseEvent_);
};


/**
 * Removes the event listeners from the tree.
 * @private
 */
goog.ui.tree.TreeControl.prototype.detachEvents_ = function() {
  this.keyHandler_.dispose();
  this.keyHandler_ = null;
  this.focusHandler_.dispose();
  this.focusHandler_ = null;
};


/**
 * Handles mouse events.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.tree.TreeControl.prototype.handleMouseEvent_ = function(e) {
  this.logger_.fine('Received event ' + e.type);
  var node = this.getNodeFromEvent_(e);
  if (node) {
    switch (e.type) {
      case goog.events.EventType.MOUSEDOWN:
        node.onMouseDown(e);
        break;
      case goog.events.EventType.CLICK:
        node.onClick_(e);
        break;
      case goog.events.EventType.DBLCLICK:
        node.onDoubleClick_(e);
        break;
    }
  }
};


/**
 * Handles key down on the tree.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @return {boolean} The handled value.
 */
goog.ui.tree.TreeControl.prototype.handleKeyEvent = function(e) {
  var handled = false;

  // Handle typeahead and navigation keystrokes.
  handled = this.typeAhead_.handleNavigation(e) ||
            (this.selectedItem_ && this.selectedItem_.onKeyDown_(e)) ||
            this.typeAhead_.handleTypeAheadChar(e);

  if (handled) {
    e.preventDefault();
  }

  return handled;
};


/**
 * Finds the containing node given an event.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @return {goog.ui.tree.BaseNode} The containing node or null if no node is
 *     found.
 * @private
 */
goog.ui.tree.TreeControl.prototype.getNodeFromEvent_ = function(e) {
  // find the right node
  var node = null;
  var target = e.target;
  while (target != null) {
    var id = target.id;
    node = goog.ui.tree.BaseNode.allNodes_[id];
    if (node) {
      return node;
    }
    if (target == this.getElement()) {
      break;
    }
    target = target.parentNode;
  }
  return null;
};


/**
 * Sets whether to suspend redraw. This is a performance optimization to allow
 * insertion of many nodes without incremental redrawing.
 * @param {boolean} b Whether to suspend redraw.
 */
goog.ui.tree.TreeControl.prototype.setSuspendRedraw = function(b) {
  this.suspendRedraw = b;
};


/**
 * Gets whether to suspend redraw. This is a performance optimization to allow
 * insertion of many nodes without incremental redrawing.
 * @return {boolean} Whether redraw is suspended.
 */
goog.ui.tree.TreeControl.prototype.getSuspendRedraw = function() {
  return this.suspendRedraw;
};


/**
 * Creates a new tree node using the same config as the root.
 * @param {string} html The html content of the node label.
 * @return {goog.ui.tree.TreeNode} The new item.
 */
goog.ui.tree.TreeControl.prototype.createNode = function(html) {
  return new goog.ui.tree.TreeNode(html, this.getConfig(), this.getDomHelper());
};


/**
 * Allows the caller to notify that the given node has been added or just had
 * been updated in the tree.
 * @param {goog.ui.tree.BaseNode} node New node being added or existing node
 *    that just had been updated.
 */
goog.ui.tree.TreeControl.prototype.setNode = function(node) {
  if (this.typeAhead_) {
    this.typeAhead_.setNodeInMap(node);
  }
};


/**
 * Allows the caller to notify that the given node is being removed from the
 * tree.
 * @param {goog.ui.tree.BaseNode} node Node being removed.
 */
goog.ui.tree.TreeControl.prototype.removeNode = function(node) {
  if (this.typeAhead_) {
    this.typeAhead_.removeNodeFromMap(node);
  }
};


/**
 * Clear the typeahead buffer.
 */
goog.ui.tree.TreeControl.prototype.clearTypeAhead = function() {
  if (this.typeAhead_) {
    this.typeAhead_.clear();
  }
};


/**
 * A default configuration for the tree.
 */
goog.ui.tree.TreeControl.defaultConfig = {
  cleardotPath: 'images/cleardot.gif',
  defaultHtml: 'Tree Item',
  defaultBehavior: 'classic',
  indentWidth: 19,
  cssRoot: goog.getCssName('goog-tree-root') + ' ' +
      goog.getCssName('goog-tree-item'),
  cssHideRoot: goog.getCssName('goog-tree-hide-root'),
  cssItem: goog.getCssName('goog-tree-item'),
  cssChildren: goog.getCssName('goog-tree-children'),
  cssChildrenNoLines: goog.getCssName('goog-tree-children-nolines'),
  cssTreeRow: goog.getCssName('goog-tree-row'),
  cssItemLabel: goog.getCssName('goog-tree-item-label'),
  cssTreeIcon: goog.getCssName('goog-tree-icon'),
  cssExpandTreeIcon: goog.getCssName('goog-tree-expand-icon'),
  cssExpandTreeIconPlus: goog.getCssName('goog-tree-expand-icon-plus'),
  cssExpandTreeIconMinus: goog.getCssName('goog-tree-expand-icon-minus'),
  cssExpandTreeIconTPlus: goog.getCssName('goog-tree-expand-icon-tplus'),
  cssExpandTreeIconTMinus: goog.getCssName('goog-tree-expand-icon-tminus'),
  cssExpandTreeIconLPlus: goog.getCssName('goog-tree-expand-icon-lplus'),
  cssExpandTreeIconLMinus: goog.getCssName('goog-tree-expand-icon-lminus'),
  cssExpandTreeIconT: goog.getCssName('goog-tree-expand-icon-t'),
  cssExpandTreeIconL: goog.getCssName('goog-tree-expand-icon-l'),
  cssExpandTreeIconBlank: goog.getCssName('goog-tree-expand-icon-blank'),
  cssExpandedFolderIcon: goog.getCssName('goog-tree-expanded-folder-icon'),
  cssCollapsedFolderIcon: goog.getCssName('goog-tree-collapsed-folder-icon'),
  cssFileIcon: goog.getCssName('goog-tree-file-icon'),
  cssExpandedRootIcon: goog.getCssName('goog-tree-expanded-folder-icon'),
  cssCollapsedRootIcon: goog.getCssName('goog-tree-collapsed-folder-icon')
};

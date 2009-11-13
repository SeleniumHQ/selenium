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
 * @fileoverview Definition of the goog.ui.tree.BaseNode class.
 *
 *
 * This is a based on the webfx tree control. It since been updated to add
 * typeahead support, as well as accessibility support using ARIA framework.
 * See file comment in treecontrol.js.
 */

goog.provide('goog.ui.tree.BaseNode');
goog.provide('goog.ui.tree.BaseNode.EventType');

goog.require('goog.Timer');
goog.require('goog.dom.a11y');
goog.require('goog.events.KeyCodes');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');
goog.require('goog.ui.Component');
goog.require('goog.userAgent');


/**
 * An abstract base class for a node in the tree.
 *
 * @param {string} html The html content of the node label.
 * @param {Object} opt_config The configuration for the tree. See
 *    goog.ui.tree.TreeControl.DefaultConfig. If not specified, a default config
 *    will be used.
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.tree.BaseNode = function(html, opt_config, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * The configuration for the tree.
   * @type {Object}
   * @private
   */
  this.config_ = opt_config || goog.ui.tree.TreeControl.defaultConfig;

  /**
   * Html content of the node label.
   * @type {string}
   * @private
   */
  this.html_ = html || this.config_.defaultHtml;

  /**
   * Extra data associated with the node.
   * @type {Object?}
   * @private
   */
  this.clientData_ = null;

  goog.ui.tree.BaseNode.allNodes_[this.getId()] = this;
};
goog.inherits(goog.ui.tree.BaseNode, goog.ui.Component);


/**
 * The event types dispatched by this class.
 * @enum {string}
 */
goog.ui.tree.BaseNode.EventType = {
  BEFORE_EXPAND: 'beforeexpand',
  EXPAND: 'expand',
  BEFORE_COLLAPSE: 'beforecollapse',
  COLLAPSE: 'collapse'
};


/**
 * Prefix to use for the of id of nodes in the tree. Clients can change the
 * prefix to use something unique in their namespace
 * @type {string}
 */
goog.ui.tree.BaseNode.idPrefix = 'tn';


/**
 * Map of nodes in existence. Needed to route events to the appropriate nodes.
 * Nodes are aadded to the map at construction time and removed at dispose time.
 * @type {Object}
 * @private
 */
goog.ui.tree.BaseNode.allNodes_ = {};


/**
 * Whether the tree item is selected.
 * @type {boolean}
 * @private
 */
goog.ui.tree.BaseNode.prototype.selected_ = false;


/**
 * Whether the tree node is expanded.
 * @type {boolean}
 * @private
 */
goog.ui.tree.BaseNode.prototype.expanded_ = false;


/**
 * Tooltip for the tree item
 * @type {string?}
 * @private
 */
goog.ui.tree.BaseNode.prototype.toolTip_ = null;


/**
 * Html that can appear after the label (so not inside the anchor).
 * @type {string}
 * @private
 */
goog.ui.tree.BaseNode.prototype.afterLabelHtml_ = '';


/**
 * Whether to allow user to collapse this node.
 * @type {boolean}
 * @private
 */
goog.ui.tree.BaseNode.prototype.isUserCollapsible_ = true;


/**
 * Nesting depth of this node; cached result of computeDepth.
 * -1 if value has not been cached.
 * @type {number}
 * @private
 */
goog.ui.tree.BaseNode.prototype.depth_ = -1;


/**
 * Disposes of the node and its children.
 */
goog.ui.tree.BaseNode.prototype.disposeInternal = function() {
  goog.ui.tree.BaseNode.superClass_.disposeInternal.call(this);
  if (this.tree_) {
    this.tree_.removeNode(this);
    this.tree_ = null;
  }
  this.setElementInternal(null);
  delete goog.ui.tree.BaseNode.allNodes_[this.getId()];
};


/**
 * Add roles and states
 * @protected
 */
goog.ui.tree.BaseNode.prototype.initAccessibility = function() {
  var el = this.getElement();
  if (el) {
    // Set an id for the label
    var label = this.getLabelElement();
    if (label && !label.id) {
        label.id = this.getId() + '.label';
    }

    goog.dom.a11y.setRole(el, 'treeitem');
    goog.dom.a11y.setState(el, 'selected', false);
    goog.dom.a11y.setState(el, 'expanded', false);
    goog.dom.a11y.setState(el, 'level', this.getDepth());
    if (label) {
      goog.dom.a11y.setState(el, 'labelledby', label.id);
    }

    var img = this.getIconElement();
    if (img) {
      goog.dom.a11y.setRole(img, 'presentation');
    }
    var ei = this.getExpandIconElement();
    if (ei) {
      goog.dom.a11y.setRole(ei, 'presentation');
    }

    var ce = this.getChildrenElement();
    goog.dom.a11y.setRole(ce, 'group');

    // In case the children will be created lazily.
    if (ce.hasChildNodes()) {
      // do setsize for each child
      var count = this.getChildCount();
      for (var i = 1; i <= count; i++) {
        var child = this.getChildAt(i - 1).getElement();
        goog.dom.a11y.setState(child, 'setsize', count);
        goog.dom.a11y.setState(child, 'posinset', i);
      }
    }
  }
};


/**
 * Creates the element.
 * @return {Element} The element.
 */
goog.ui.tree.BaseNode.prototype.createDom = function() {
  // IE uses about:blank if not attached to document and this can cause Win2k3
  // to fail.
  var elt;
  if (goog.userAgent.IE) {
    var dummy = this.getDomHelper().createElement('div');
    dummy.style.display = 'none';
    document.body.appendChild(dummy);
    var sb = new goog.string.StringBuffer();
    this.toHtml(sb);
    dummy.innerHTML = sb;
    var res = dummy.removeChild(dummy.firstChild);
    document.body.removeChild(dummy);
    elt = /** @type {Element} */ (res);
  } else {
    var dummy = this.getDomHelper().createElement('div');
    var sb = new goog.string.StringBuffer();
    this.toHtml(sb);
    dummy.innerHTML = sb;
    elt = /** @type {Element} */ (dummy.removeChild(dummy.firstChild));
  }
  this.setElementInternal(elt);
  return elt;
};



/**
 * Called when the DOM for the component is for sure in the document.
 */
goog.ui.tree.BaseNode.prototype.enterDocument = function() {
  goog.ui.tree.BaseNode.superClass_.enterDocument.call(this);
  this.initAccessibility();
};


/**
 * Adds a node as a child to the current node.
 * @param {goog.ui.tree.BaseNode} child The child to add.
 * @param {goog.ui.tree.BaseNode} opt_before If specified, the new child is
 *    added as a child before this one. If not specified, it's appended to the
 *    end.
 * @return {goog.ui.tree.BaseNode} The added child.
 */
goog.ui.tree.BaseNode.prototype.add = function(child, opt_before) {
  var oldLast;
  var emptyBefore = this.getChildCount() == 0;
  var parent = child.getParent();
  var before = opt_before;

  if (!before) { // append
    if (parent != null) {
      parent.remove(child);
    }
    oldLast = this.getLastChild();
    this.addChild(child);
  } else { // insertBefore
    if (opt_before.getParent() != this) {
      throw Error('Can only add nodes before siblings');
    }
    if (parent != null) {
      parent.remove(child);
    }
    this.addChildAt(child, this.indexOfChild(before));
  }

  if (before) {
    if (before == this.firstChild_) {
      this.firstChild_ = child;
      child.previousSibling_ = null;
    }
    if (before.previousSibling_) {
      child.previousSibling_ = before.previousSibling_;
      before.previousSibling_.nextSibling_ = child;
    }
    before.previousSibling_ = child;
    child.nextSibling_ = before;
  } else {
    if (!this.firstChild_) {
      this.firstChild_ = child;
      child.previousSibling_ = null;
    }
    if (this.lastChild_) {
      this.lastChild_.nextSibling_ = child;
    }
    child.previousSibling_ = this.lastChild_;
    child.nextSibling_ = null;
    this.lastChild_ = child;
  }

  var t = this.getTree();
  if (t) {
    child.setTreeInternal(t);
  }
  child.setDepth_(this.getDepth() + 1);

  if (this.isInDocument() && !t.getSuspendRedraw()) {
    var el = this.getChildrenElement();

    var newEl = child.getElement() || child.createDom();
    var refEl = before ? before.getElement() : null;
    el.insertBefore(newEl, refEl);
    if (this.isInDocument()) {
      child.enterDocument();
    }

    if (oldLast) {
      oldLast.updateExpandIcon();
    }
    if (emptyBefore) {
      el.style.display = '';
      this.setExpanded(this.getExpanded());
      // if we are using classic expand will not update icon
      if (t && t.getBehavior() != 'classic')
        this.updateIcon();
    }
  }
  return child;
};


/**
 * Removes a child. The caller is responsible for disposing the node.
 * @param {goog.ui.tree.BaseNode} child The child to remove.
 * @return {goog.ui.tree.BaseNode} The child that was removed.
 */
goog.ui.tree.BaseNode.prototype.remove = function(child) {
  // if we remove selected or tree with the selected we should select this
  var tree = this.getTree();
  var selectedItem = tree ? tree.getSelectedItem() : null;
  if (selectedItem == child || child.contains(selectedItem)) {
    if (tree.hasFocus()) {
      this.select();
      goog.Timer.callOnce(this.onTimeoutSelect_, 10, this);
    } else {
      this.select();
    }
  }

  if (child.getParent() != this) {
    throw Error('Can only remove children');
  }
  this.removeChild(child.getId());

  if (this.lastChild_ == child) {
    this.lastChild_ = child.previousSibling_;
  }
  if (this.firstChild_ == child) {
    this.firstChild_ = child.nextSibling_;
  }
  if (child.previousSibling_) {
    child.previousSibling_.nextSibling_ = child.nextSibling_;
  }
  if (child.nextSibling_) {
    child.nextSibling_.previousSibling_ = child.previousSibling_;
  }

  var wasLast = child.isLastSibling();

  child.tree_ = null;
  child.depth_ = -1;

  if (tree) {
    // Tell the tree control that this node is now removed.
    tree.removeNode(this);

    if (this.isInDocument() && !tree.getSuspendRedraw()) {
      var el = this.getChildrenElement();

      if (child.isInDocument()) {
        var childEl = child.getElement();
        el.removeChild(childEl);

        child.exitDocument();
      }

      if (wasLast) {
        var newLast = this.getLastChild();
        if (newLast) {
          newLast.updateExpandIcon();
        }
      }
      if (!this.hasChildren()) {
        el.style.display = 'none';
        this.updateExpandIcon();
        this.updateIcon();
      }
    }
  }

  return child;
};


/**
 * Handler for setting focus asynchornously.
 * @private
 */
goog.ui.tree.BaseNode.prototype.onTimeoutSelect_ = function() {
  this.select();
};


/**
 * Returns the tree. Meant to be overridden.
 */
goog.ui.tree.BaseNode.prototype.getTree = goog.abstractMethod;


/**
 * Returns the depth of the node in the tree.
 * Should no longer be overridden; override computeDepth instead.
 * @return {number} The non-negative depth of this node (the root is zero).
 */
goog.ui.tree.BaseNode.prototype.getDepth = function() {
  var depth = this.depth_;
  if (depth < 0) {
    depth = this.computeDepth();
    this.setDepth_(depth);
  }
  return depth;
};


/**
 * Computes the depth of the node in the tree.
 * Called only by getDepth, when the depth hasn't already been cached.
 * Can be overridden.
 * @return {number} The non-negative depth of this node (the root is zero).
 * @protected
 */
goog.ui.tree.BaseNode.prototype.computeDepth = function() {
  var parent = this.getParent();
  if (parent) {
    return parent.getDepth() + 1;
  } else {
    return 0;
  }
};


/**
 * Changes the depth of a node (and all its descendents).
 * @param {number} depth The new nesting depth; must be non-negative.
 * @private
 */
goog.ui.tree.BaseNode.prototype.setDepth_ = function(depth) {
  if (depth != this.depth_) {
    this.depth_ = depth;
    var row = this.getRowElement();
    if (row) {
      var indent = this.getPixelIndent_() + 'px';
      if (this.isRightToLeft()) {
        row.style.paddingRight = indent;
      } else {
        row.style.paddingLeft = indent;
      }
    }
    this.forEachChild(function(child) {
      child.setDepth_(depth + 1);
    });
  }
};


/**
 * Returns true if the node is a descendant of this node
 * @param {goog.ui.tree.BaseNode} node The node to check.
 * @return {boolean} True if the node is a descendant of this node, false
 *    otherwise.
 */
goog.ui.tree.BaseNode.prototype.contains = function(node) {
  while (node) {
    if (node == this) {
      return true;
    }
    node = node.getParent();
  }
  return false;
};


/**
 * An array of empty children to return for nodes that have no children.
 * @type {Array}
 * @private
 */
goog.ui.tree.BaseNode.EMPTY_CHILDREN_ = [];


/**
 * Returns the children of this node. The caller must not modify the returned
 * collection.
 * @return {Array.<goog.ui.tree.BaseNode>} The children.
 */
goog.ui.tree.BaseNode.prototype.getChildren = function() {
  // TODO: This breaks encapsulation, as children_ is private in the superclass.
  return this.children_ ? this.children_ :
                          goog.ui.tree.BaseNode.EMPTY_CHILDREN_;
};


/**
 * @return {goog.ui.tree.BaseNode?} The first child of this node.
 */
goog.ui.tree.BaseNode.prototype.getFirstChild = function() {
  return /** @type {goog.ui.tree.BaseNode?} */ (this.getChildAt(0));
};


/**
 * @return {goog.ui.tree.BaseNode?} The last child of this node.
 */
goog.ui.tree.BaseNode.prototype.getLastChild = function() {
  return /** @type {goog.ui.tree.BaseNode?} */ (
      this.getChildAt(this.getChildCount() - 1));
};


/**
 * @return {goog.ui.tree.BaseNode?} The previous sibling of this node.
 */
goog.ui.tree.BaseNode.prototype.getPreviousSibling = function() {
  return this.previousSibling_;
};


/**
 * @return {goog.ui.tree.BaseNode?} The next sibling of this node.
 */
goog.ui.tree.BaseNode.prototype.getNextSibling = function() {
  return this.nextSibling_;
};


/**
 * @return {boolean} Whether the node is the last sibling.
 */
goog.ui.tree.BaseNode.prototype.isLastSibling = function() {
  return !this.nextSibling_;
};


/**
 * @return {boolean} Whether the node is selected.
 */
goog.ui.tree.BaseNode.prototype.isSelected = function() {
  return this.selected_;
};


/**
 * Selects the node.
 */
goog.ui.tree.BaseNode.prototype.select = function() {
  this.setSelected_(true);
};


/**
 * Deselects the node.
 */
goog.ui.tree.BaseNode.prototype.deselect = function() {
  this.setSelected_(false);
};


/**
 * Changes the node's selection state.
 * @param {boolean} b True to select the node, false to deselect it.
 * @private
 */
goog.ui.tree.BaseNode.prototype.setSelected_ = function(b) {
  var t = this.getTree();
  if (!t) {
    return;
  }
  t.setSelectedItem(this);
};


/**
 * Called from the tree to instruct the node change its selection state.
 * @param {boolean} selected The new selection state.
 * @private
 */
goog.ui.tree.BaseNode.prototype.setSelectedInternal_ = function(selected) {
  if (this.selected_ == selected) {
    return;
  }
  this.selected_ = selected;

  this.updateRow();
  var tree = this.getTree();
  if (tree.getBehavior() != 'classic') {
    this.updateIcon();
  }

  var el = this.getElement();
  if (el) {
    goog.dom.a11y.setState(el, 'selected', selected);
    if (selected) {
      goog.dom.a11y.setState(tree.getElement(), 'activedescendant',
          this.getId());
    }
  }
};


/**
 * @return {boolean} Whether the node is expanded.
 */
goog.ui.tree.BaseNode.prototype.getExpanded = function() {
  return this.expanded_;
};


/**
 * Sets the node to be expanded.
 * @param {boolean} b Whether to expand or close the node.
 */
goog.ui.tree.BaseNode.prototype.setExpanded = function(b) {
  var isStateChange = b != this.expanded_;
  if (isStateChange) {
    // Only fire events if the expanded state has actually changed.
  var prevented =
      !this.dispatchEvent(b ? goog.ui.tree.BaseNode.EventType.BEFORE_EXPAND :
                          goog.ui.tree.BaseNode.EventType.BEFORE_COLLAPSE);
    if (prevented) return;
  }

  var ce;
  this.expanded_ = b;
  var t = this.getTree();
  var el = this.getElement();

  if (this.hasChildren()) {
    var si = t ? t.getSelectedItem() : null;
    if (!b && this.contains(si)) {
      this.select();
    }

    if (el) {
      ce = this.getChildrenElement();
      if (ce) {
        ce.style.display = b ? 'block' : 'none';

        // Make sure we have the HTML for the children here.
        if (b && this.isInDocument() && !ce.hasChildNodes()) {
          var sb = new goog.string.StringBuffer();
          this.forEachChild(function(child) {
            child.toHtml(sb);
          });
          ce.innerHTML = sb.toString();
          this.forEachChild(function(child) {
            child.enterDocument();
          });
        }
      }
      this.updateExpandIcon();
    }
  } else {
    ce = this.getChildrenElement();
    if (ce) {
      ce.style.display = 'none';
    }
  }
  if (t && t.getBehavior() == 'classic') {
    this.updateIcon();
  }
  if (el) {
    goog.dom.a11y.setState(el, 'expanded', b);
  }

  if (isStateChange) {
    this.dispatchEvent(b ? goog.ui.tree.BaseNode.EventType.EXPAND :
                       goog.ui.tree.BaseNode.EventType.COLLAPSE);
  }
};


/**
 * Toggles the expanded state of the node.
 */
goog.ui.tree.BaseNode.prototype.toggle = function() {
  this.setExpanded(!this.getExpanded());
};

/**
 * Expands the node.
 */
goog.ui.tree.BaseNode.prototype.expand = function() {
  this.setExpanded(true);
};


/**
 * Collapses the node.
 */
goog.ui.tree.BaseNode.prototype.collapse = function() {
  this.setExpanded(false);
};



/**
 * Collapses the children of the node.
 */
goog.ui.tree.BaseNode.prototype.collapseChildren = function() {
  this.forEachChild(function(child) {
    child.collapseAll();
  });
};


/**
 * Collapses the children and the node.
 */
goog.ui.tree.BaseNode.prototype.collapseAll = function() {
  this.collapseChildren();
  this.collapse();
};


/**
 * Expands the children of the node.
 */
goog.ui.tree.BaseNode.prototype.expandChildren = function() {
  this.forEachChild(function(child) {
    child.expandAll();
  });
};


/**
 * Expands the children and the node.
 */
goog.ui.tree.BaseNode.prototype.expandAll = function() {
  this.expandChildren();
  this.expand();
};


/**
 * Expands the parent chain of this node so that it is visible.
 */
goog.ui.tree.BaseNode.prototype.reveal = function() {
  var p = this.getParent();
  if (p) {
    p.setExpanded(true);
    p.reveal();
  }
};


/**
 * Sets whether the node will allow the user to collapse it.
 * @param {boolean} isCollapsible Whether to allow node collapse.
 */
goog.ui.tree.BaseNode.prototype.setIsUserCollapsible = function(isCollapsible) {
  this.isUserCollapsible_ = isCollapsible;
  if (!this.isUserCollapsible_) {
    this.expand();
  }
  if (this.getElement()) {
    this.updateExpandIcon();
  }
};


/**
 * @return {boolean} Whether the node is collapsible by user actions.
 */
goog.ui.tree.BaseNode.prototype.isUserCollapsible = function() {
  return this.isUserCollapsible_;
};


/**
 * Returns the html for the node.
 * @param {goog.string.StringBuffer} sb A string buffer to append the HTML to.
 */
goog.ui.tree.BaseNode.prototype.toHtml = function(sb) {
  var t = this.getTree();
  var hideLines = !t.getShowLines() ||
                  t == this.getParent() && !t.getShowRootLines();

  var childClass = hideLines ? this.config_.cssChildrenNoLines :
                   this.config_.cssChildren;

  var nonEmptyAndExpanded = this.getExpanded() && this.hasChildren();

  sb.append('<div class="', this.config_.cssItem, '" id="', this.getId(), '">',
    this.getRowHtml(),
    '<div class="', childClass, '" style="',
    this.getLineStyle(),
    (nonEmptyAndExpanded ? '' : 'display:none;'),
    '">');

  if (nonEmptyAndExpanded) {
    // children
    this.forEachChild(function(child) {
      child.toHtml(sb);
    });
  }

  // and tags
  sb.append('</div></div>');
};


/**
 * @return {number} The pixel indent of the row.
 * @private
 */
goog.ui.tree.BaseNode.prototype.getPixelIndent_ = function() {
  return Math.max(0, (this.getDepth() - 1) * this.config_.indentWidth);
};


/**
 * @return {string} The html for the row.
 */
goog.ui.tree.BaseNode.prototype.getRowHtml = function() {
  var tree = this.getTree();
  var sb = new goog.string.StringBuffer();
  sb.append('<div class="', this.getRowClassName(), '" style="padding-',
      this.isRightToLeft() ? 'right:' : 'left:',
      this.getPixelIndent_(), 'px">',
      this.getExpandIconHtml(),
      this.getIconHtml(),
      this.getLabelHtml(),
      '</div>');
  return sb.toString();
};


/**
 * @return {string} The class name for the row.
 */
goog.ui.tree.BaseNode.prototype.getRowClassName = function() {
  var selectedClass;
  if (this.isSelected()) {
    selectedClass = ' selected';
  } else {
    selectedClass = '';
  }
  return this.config_.cssTreeRow + selectedClass;
};


/**
 * @return {string} The html for the label.
 */
goog.ui.tree.BaseNode.prototype.getLabelHtml = function() {
  var toolTip = this.getToolTip();
  var tree = this.getTree();
  var sb = new goog.string.StringBuffer();
  sb.append('<span class="', this.config_.cssItemLabel, '" ',
    (toolTip ? (' title="' + goog.string.htmlEscape(toolTip) + '" ') : ' '),
    '>', this.getHtml(), '</span>',
    '<span>', this.getAfterLabelHtml(), '</span>');
  return sb.toString();
};


/**
 * Returns the html that appears after the label. This is useful if you want to
 * put extra UI on the row of the label but not inside the anchor tag.
 * @return {string} The html.
 */
goog.ui.tree.BaseNode.prototype.getAfterLabelHtml = function() {
  return this.afterLabelHtml_;
};


/**
 * Sets the html that appears after the label. This is useful if you want to
 * put extra UI on the row of the label but not inside the anchor tag.
 * @param {string} html The html.
 */
goog.ui.tree.BaseNode.prototype.setAfterLabelHtml = function(html) {
  this.afterLabelHtml_ = html;
  var el = this.getAfterLabelElement();
  if (el) {
    el.innerHTML = html;
  }
};


/**
 * @return {string} The html for the icon.
 */
goog.ui.tree.BaseNode.prototype.getIconHtml = function() {
  // here we are not using textToHtml since the file names rarerly contains
  // HTML...
  var iconClass = this.getCalculatedIconClass();
  if (iconClass) {
    return goog.string.buildString('<img class="', iconClass,
           '" src="', this.config_.cleardotPath, '">');
  } else {
    return goog.string.buildString('<img style="display:none"',
           '" src="', this.config_.cleardotPath, '">');
  }
};


/**
 * Gets the calculated icon class.  Meant to be overridden.
 */
goog.ui.tree.BaseNode.prototype.getCalculatedIconClass = goog.abstractMethod;


/**
 * @return {string} The source for the icon.
 */
goog.ui.tree.BaseNode.prototype.getExpandIconHtml = function() {
  // here we are not using textToHtml since the file names rarerly contains
  // HTML...
  return goog.string.buildString('<img type="expand" class="',
      this.getExpandIconClass(), '" src="', this.config_.cleardotPath + '">');
};


/**
 * @return {string} The src for the icon used for expanding the node.
 */
goog.ui.tree.BaseNode.prototype.getExpandIconClass = function() {
  var t = this.getTree();
  var hideLines = !t.getShowLines() ||
                  t == this.getParent() && !t.getShowRootLines();

  var config = this.config_;
  var sb = new goog.string.StringBuffer();
  sb.append(this.config_.cssTreeIcon, ' ', config.cssExpandTreeIcon, ' ');
  if (this.hasChildren()) {
    var bits = 0;
    /*
      Bitmap used to determine which icon to use
      1  Plus
      2  Minus
      4  T Line
      8  L Line
    */

    if (t && t.getShowExpandIcons() && this.isUserCollapsible_) {
      if (this.getExpanded()) {
        bits = 2;
      } else {
        bits = 1;
      }
    }

    if (t && !hideLines) {
      if (this.isLastSibling()) {
        bits += 4;
      } else {
        bits += 8;
      }
    }

    switch (bits) {
      case 1:
        sb.append(config.cssExpandTreeIconPlus);
        break;
      case 2:
        sb.append(config.cssExpandTreeIconMinus);
        break;
      case 4:
        sb.append(config.cssExpandTreeIconL);
        break;
      case 5:
        sb.append(config.cssExpandTreeIconLPlus);
        break;
      case 6:
        sb.append(config.cssExpandTreeIconLMinus);
        break;
      case 8:
        sb.append(config.cssExpandTreeIconT);
        break;
      case 9:
        sb.append(config.cssExpandTreeIconTPlus);
        break;
      case 10:
        sb.append(config.cssExpandTreeIconTMinus);
        break;
      default:  // 0
        sb.append(config.cssExpandTreeIconBlank);
    }
  } else {
    if (t && hideLines) {
      sb.append(config.cssExpandTreeIconBlank);
    } else if (this.isLastSibling()) {
      sb.append(config.cssExpandTreeIconL);
    } else {
      sb.append(config.cssExpandTreeIconT);
    }
  }
  return sb.toString();
};


/**
 * @return {string} The line style.
 */
goog.ui.tree.BaseNode.prototype.getLineStyle = function() {
  return goog.string.buildString(
      'background-position:', this.getLineStyle2(), ';');
};


/**
 * @return {string} The line style.
 */
goog.ui.tree.BaseNode.prototype.getLineStyle2 = function() {
  return (this.isLastSibling() ? '-100' :
          (this.getDepth() - 1) * this.config_.indentWidth) + 'px 0';
};


/**
 * @return {Element} The element for the tree node.
 */
goog.ui.tree.BaseNode.prototype.getElement = function() {
  var el = goog.ui.tree.BaseNode.superClass_.getElement.call(this);
  if (!el) {
    el = this.getDomHelper().getElement(this.getId());
    this.setElementInternal(el);
  }
  return el;
};


/**
 * @return {Element} The row is the div that is used to draw the node without
 *     the children.
 */
goog.ui.tree.BaseNode.prototype.getRowElement = function() {
  var el = this.getElement();
  return el ? /** @type {Element} */ (el.firstChild) : null;
};


/**
 * @return {Element?} The expanded icon element.
 */
goog.ui.tree.BaseNode.prototype.getExpandIconElement = function() {
  var el = this.getRowElement();
  return el ? /** @type {Element} */ (el.firstChild) : null;
};


/**
 * @return {Element?} The icon element.
 */
goog.ui.tree.BaseNode.prototype.getIconElement = function() {
  var el = this.getRowElement();
  return el ? /** @type {Element} */ (el.childNodes[1]) : null;
};


/**
 * @return {Element?} The label element.
 */
goog.ui.tree.BaseNode.prototype.getLabelElement = function() {
  var el = this.getRowElement();
  // TODO: find/fix race condition that requires us to add
  // the lastChild check
  return el && el.lastChild ?
      /** @type {Element} */ (el.lastChild.previousSibling) : null;
};


/**
 * @return {Element?} The element after the label.
 */
goog.ui.tree.BaseNode.prototype.getAfterLabelElement = function() {
  var el = this.getRowElement();
  return el ? /** @type {Element} */ (el.lastChild) : null;
};


/**
 * @return {Element?} The div containing the children.
 */
goog.ui.tree.BaseNode.prototype.getChildrenElement = function() {
  var el = this.getElement();
  return el ? /** @type {Element} */ (el.lastChild) : null;
};


/**
 * Sets the icon class for the node.
 * @param {string} s The icon class.
 */
goog.ui.tree.BaseNode.prototype.setIconClass = function(s) {
  this.iconClass_ = s;
  if (this.isInDocument()) {
    this.updateIcon();
  }
};


/**
 * Gets the icon class for the node.
 * @return {string} s The icon source.
 */
goog.ui.tree.BaseNode.prototype.getIconClass = function() {
  return this.iconClass_;
};


/**
 * Sets the icon class for when the node is expanded.
 * @param {string} s The expanded icon class.
 */
goog.ui.tree.BaseNode.prototype.setExpandedIconClass = function(s) {
  this.expandedIconClass_ = s;
  if (this.isInDocument()) {
    this.updateIcon();
  }
};


/**
 * Gets the icon class for when the node is expanded.
 * @return {string} The class.
 */
goog.ui.tree.BaseNode.prototype.getExpandedIconClass = function() {
  return this.expandedIconClass_;
};


/**
 * Sets the text of the label.
 * @param {string} s The plain text of the label.
 */
goog.ui.tree.BaseNode.prototype.setText = function(s) {
  this.setHtml(goog.string.htmlEscape(s));
};


/**
 * Returns the text of the label. If the text was originally set as HTML, the
 * return value is unspecified.
 * @return {string} The plain text of the label.
 */
goog.ui.tree.BaseNode.prototype.getText = function() {
  return goog.string.unescapeEntities(this.getHtml());
};


/**
 * Sets the html of the label.
 * @param {string} s The html string for the label.
 */
goog.ui.tree.BaseNode.prototype.setHtml = function(s) {
  this.html_ = s;
  var el = this.getLabelElement();
  if (el) {
    el.innerHTML = s;
  }
  var t = this.getTree();
  if (t) {
    // Tell the tree control about the updated label text.
    t.setNode(this);
  }
};


/**
 * Returns the html of the label.
 * @return {string} The html string of the label.
 */
goog.ui.tree.BaseNode.prototype.getHtml = function() {
  return this.html_;
};


/**
 * Sets the text of the tooltip.
 * @param {string} s The tooltip text to set.
 */
goog.ui.tree.BaseNode.prototype.setToolTip = function(s) {
  this.toolTip_ = s;
  var el = this.getLabelElement();
  if (el) {
    el.title = s;
  }
};


/**
 * Returns the text of the tooltip.
 * @return {string?} The tooltip text.
 */
goog.ui.tree.BaseNode.prototype.getToolTip = function() {
  return this.toolTip_;
};


/**
 * Updates the tree node by replacing it with a new node.
 */
goog.ui.tree.BaseNode.prototype.update = function() {
  // TODO (jonp) - this function is more complicated than the webfx code because
  // 1) it would violate the closure component model to change do replaceNode
  // on our parent's element
  // 2) this node and all its children need to be notified to clear their event
  // handlers and then reinstall them on the new element
  //
  // The implementation of this should be incremental, at least on the tree
  // node itself, so it doesn't violate the Closure component model and then
  // either support incremental on the children also or notify the children
  // before and after the operation
  throw Error('Upate not yet supported');
};


/**
 * Updates the row styles.
 */
goog.ui.tree.BaseNode.prototype.updateRow = function() {
  var rowEl = this.getRowElement();
  if (rowEl) {
    rowEl.className = this.getRowClassName();
  }
};


/**
 * Updates the expand icon of the node.
 */
goog.ui.tree.BaseNode.prototype.updateExpandIcon = function() {
  var t = this.getTree();
  if (t.getSuspendRedraw()) return;
  var img = this.getExpandIconElement();
  if (img) {
    img.className = this.getExpandIconClass();
  }
  var cel = this.getChildrenElement();
  if (cel) {
    cel.style.backgroundPosition = this.getLineStyle2();
  }
};


/**
 * Updates the icon of the node.
 */
goog.ui.tree.BaseNode.prototype.updateIcon = function() {
  var t = this.getTree();
  if (t.getSuspendRedraw()) return;
  var img = this.getIconElement();
  if (img) {
    img.className = this.getCalculatedIconClass();
  }
};


/**
 * Handles mouse down event.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @protected
 */
goog.ui.tree.BaseNode.prototype.onMouseDown = function(e) {
  var el = e.target;
  // expand icon
  var type = el.getAttribute('type');
  if (type == 'expand' && this.hasChildren()) {
    if (this.isUserCollapsible_) {
      this.toggle();
    }
    return;
  }

  this.select();
  this.updateRow();
};


/**
 * Handles a click event.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.tree.BaseNode.prototype.onClick_ = function(e) {
  e.preventDefault();
};


/**
 * Handles a double click event.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.tree.BaseNode.prototype.onDoubleClick_ = function(e) {
  var el = e.target;
  // expand icon
  var type = el.getAttribute('type');
  if (type == 'expand' && this.hasChildren()) {
    return;
  }

  if (this.isUserCollapsible_) {
    this.toggle();
  }
};


/**
 * Handles a key down event.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @return {boolean} The handled value.
 * @private
 */
goog.ui.tree.BaseNode.prototype.onKeyDown_ = function(e) {
  var handled = true;
  var n;
  switch (e.keyCode) {
    case goog.events.KeyCodes.RIGHT:
      if (e.altKey) {
        break;
      }
      if (this.hasChildren()) {
        if (!this.getExpanded()) {
          this.setExpanded(true);
        } else {
          this.getFirstChild().select();
        }
      }
      break;

    case goog.events.KeyCodes.LEFT:
      if (e.altKey) {
        break;
      }
      if (this.hasChildren() && this.getExpanded() && this.isUserCollapsible_) {
        this.setExpanded(false);
      } else {
        var p = this.getParent();
        var t = this.getTree();
        // don't go to root if hidden
        if (p && (t.getShowRootNode() || p != t)) {
          p.select();
        }
      }
      break;

    case goog.events.KeyCodes.DOWN:
      n = this.getNextShownNode();
      if (n) {
        n.select();
      }
      break;

    case goog.events.KeyCodes.UP:
      n = this.getPreviousShownNode();
      if (n) {
        n.select();
      }
      break;

    default:
      handled = false;
  }

  if (handled) {
    e.preventDefault();
    var t = this.getTree();
    if (t) {
      // clear type ahead buffer as user navigates with arrow keys
      t.clearTypeAhead();
    }
  }

  return handled;
};


/**
 * Handles a key down event
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.tree.BaseNode.prototype.onKeyPress_ = function(e) {
  if (!e.altKey && e.keyCode >= goog.events.KeyCodes.LEFT &&
      e.keyCode <= goog.events.KeyCodes.DOWN) {
    e.preventDefault();
  }
};


/**
 * @return {goog.ui.tree.BaseNode} The last shown descendant.
 */
goog.ui.tree.BaseNode.prototype.getLastShownDescendant = function() {
  if (!this.getExpanded() || !this.hasChildren()) {
    return this;
  }
  // we know there is at least 1 child
  return this.getLastChild().getLastShownDescendant();
};


/**
 * @return {goog.ui.tree.BaseNode} The next node to show or null if there isn't
 *     a next node to show.
 */
goog.ui.tree.BaseNode.prototype.getNextShownNode = function() {
  if (this.hasChildren() && this.getExpanded()) {
    return this.getFirstChild();
  } else {
    var p = this;
    var next;
    while (p != null) {
      next = p.getNextSibling();
      if (next != null) {
        return next;
      }
      p = p.getParent();
    }
    return null;
  }
};


/**
 * @return {goog.ui.tree.BaseNode?} The previous node to show.
 */
goog.ui.tree.BaseNode.prototype.getPreviousShownNode = function() {
  var ps = this.getPreviousSibling();
  if (ps != null) {
    return ps.getLastShownDescendant();
  }
  var p = /** @type {goog.ui.tree.BaseNode?} */ (this.getParent());
  var t = this.getTree();
  if (!t.getShowRootNode() && p == t) {
    return null;
  }
  return p;
};


/**
 * @return {Object?} Data set by the client.
 */
goog.ui.tree.BaseNode.prototype.getClientData = function() {
  return this.clientData_;
};


/**
 * Sets client data to associate with the node.
 * @param {Object} data The client data to associate with the node.
 */
goog.ui.tree.BaseNode.prototype.setClientData = function(data) {
  this.clientData_ = data;
};


/**
 * @return {Object} The configuration for the tree.
 */
goog.ui.tree.BaseNode.prototype.getConfig = function() {
  return this.config_;
};


/**
 * Called when the node knows its root tree control.
 * @protected
 */
goog.ui.tree.BaseNode.prototype.onTreeAvailable = function() {
  var tree = this.getTree();
  // Add new node to the type ahead node map.
  tree.setNode(this);
};


/**
 * Internal method that is used to set the tree control on the node.
 * @param {goog.ui.tree.TreeControl} tree The tree control.
 */
goog.ui.tree.BaseNode.prototype.setTreeInternal = function(tree) {
  if (this.tree_ != tree) {
    this.tree_ = tree;
    this.onTreeAvailable();
    var count = this.getChildCount();
    for (var i = 0; i < count; i++) {
      var child = this.getChildAt(i);
      child.setTreeInternal(tree);
    }
  }
};

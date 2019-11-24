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
 * @fileoverview Definition of the goog.ui.tree.TreeNode class.
 *
 * @author arv@google.com (Erik Arvidsson)
 * @author eae@google.com (Emil A Eklund)
 *
 * This is a based on the webfx tree control. See file comment in
 * treecontrol.js.
 */

goog.provide('goog.ui.tree.TreeNode');

goog.require('goog.ui.tree.BaseNode');

goog.forwardDeclare('goog.ui.tree.TreeControl');  // circular



/**
 * A single node in the tree.
 * @param {string|!goog.html.SafeHtml} content The content of the node label.
 *     Strings are treated as plain-text and will be HTML escaped.
 * @param {Object=} opt_config The configuration for the tree. See
 *    goog.ui.tree.TreeControl.defaultConfig. If not specified, a default config
 *    will be used.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.tree.BaseNode}
 */
goog.ui.tree.TreeNode = function(content, opt_config, opt_domHelper) {
  goog.ui.tree.BaseNode.call(this, content, opt_config, opt_domHelper);
};
goog.inherits(goog.ui.tree.TreeNode, goog.ui.tree.BaseNode);


/**
 * Returns the tree.
 * @return {?goog.ui.tree.TreeControl} The tree.
 * @override
 */
goog.ui.tree.TreeNode.prototype.getTree = function() {
  if (this.tree) {
    return this.tree;
  }
  var parent = this.getParent();
  if (parent) {
    var tree = parent.getTree();
    if (tree) {
      this.setTreeInternal(tree);
      return tree;
    }
  }
  return null;
};


/**
 * Returns the source for the icon.
 * @return {string} Src for the icon.
 * @override
 */
goog.ui.tree.TreeNode.prototype.getCalculatedIconClass = function() {
  var expanded = this.getExpanded();
  var expandedIconClass = this.getExpandedIconClass();
  if (expanded && expandedIconClass) {
    return expandedIconClass;
  }
  var iconClass = this.getIconClass();
  if (!expanded && iconClass) {
    return iconClass;
  }

  // fall back on default icons
  var config = this.getConfig();
  if (this.hasChildren()) {
    if (expanded && config.cssExpandedFolderIcon) {
      return config.cssTreeIcon + ' ' + config.cssExpandedFolderIcon;
    } else if (!expanded && config.cssCollapsedFolderIcon) {
      return config.cssTreeIcon + ' ' + config.cssCollapsedFolderIcon;
    }
  } else {
    if (config.cssFileIcon) {
      return config.cssTreeIcon + ' ' + config.cssFileIcon;
    }
  }
  return '';
};

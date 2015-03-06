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
 * @fileoverview Generic tree node data structure with arbitrary number of child
 * nodes.
 *
 */

goog.provide('goog.structs.TreeNode');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.structs.Node');



/**
 * Generic tree node data structure with arbitrary number of child nodes.
 * It is possible to create a dynamic tree structure by overriding
 * {@link #getParent} and {@link #getChildren} in a subclass. All other getters
 * will automatically work.
 *
 * @param {KEY} key Key.
 * @param {VALUE} value Value.
 * @constructor
 * @extends {goog.structs.Node<KEY, VALUE>}
 * @template KEY, VALUE
 */
goog.structs.TreeNode = function(key, value) {
  goog.structs.Node.call(this, key, value);

  /**
   * Reference to the parent node or null if it has no parent.
   * @private {goog.structs.TreeNode<KEY, VALUE>}
   */
  this.parent_ = null;

  /**
   * Child nodes or null in case of leaf node.
   * @private {Array<!goog.structs.TreeNode<KEY, VALUE>>}
   */
  this.children_ = null;
};
goog.inherits(goog.structs.TreeNode, goog.structs.Node);


/**
 * Constant for empty array to avoid unnecessary allocations.
 * @private
 */
goog.structs.TreeNode.EMPTY_ARRAY_ = [];


/**
 * @return {!goog.structs.TreeNode} Clone of the tree node without its parent
 *     and child nodes. The key and the value are copied by reference.
 * @override
 */
goog.structs.TreeNode.prototype.clone = function() {
  return new goog.structs.TreeNode(this.getKey(), this.getValue());
};


/**
 * @return {!goog.structs.TreeNode} Clone of the subtree with this node as root.
 */
goog.structs.TreeNode.prototype.deepClone = function() {
  var clone = this.clone();
  this.forEachChild(function(child) {
    clone.addChild(child.deepClone());
  });
  return clone;
};


/**
 * @return {goog.structs.TreeNode<KEY, VALUE>} Parent node or null if it has no
 *     parent.
 */
goog.structs.TreeNode.prototype.getParent = function() {
  return this.parent_;
};


/**
 * @return {boolean} Whether the node is a leaf node.
 */
goog.structs.TreeNode.prototype.isLeaf = function() {
  return !this.getChildCount();
};


/**
 * Tells if the node is the last child of its parent. This method helps how to
 * connect the tree nodes with lines: L shapes should be used before the last
 * children and |- shapes before the rest. Schematic tree visualization:
 *
 * <pre>
 * Node1
 * |-Node2
 * | L-Node3
 * |   |-Node4
 * |   L-Node5
 * L-Node6
 * </pre>
 *
 * @return {boolean} Whether the node has parent and is the last child of it.
 */
goog.structs.TreeNode.prototype.isLastChild = function() {
  var parent = this.getParent();
  return Boolean(parent && this == goog.array.peek(parent.getChildren()));
};


/**
 * @return {!Array<!goog.structs.TreeNode<KEY, VALUE>>} Immutable child nodes.
 */
goog.structs.TreeNode.prototype.getChildren = function() {
  return this.children_ || goog.structs.TreeNode.EMPTY_ARRAY_;
};


/**
 * Gets the child node of this node at the given index.
 * @param {number} index Child index.
 * @return {goog.structs.TreeNode<KEY, VALUE>} The node at the given index or
 *     null if not found.
 */
goog.structs.TreeNode.prototype.getChildAt = function(index) {
  return this.getChildren()[index] || null;
};


/**
 * @return {number} The number of children.
 */
goog.structs.TreeNode.prototype.getChildCount = function() {
  return this.getChildren().length;
};


/**
 * @return {number} The number of ancestors of the node.
 */
goog.structs.TreeNode.prototype.getDepth = function() {
  var depth = 0;
  var node = this;
  while (node.getParent()) {
    depth++;
    node = node.getParent();
  }
  return depth;
};


/**
 * @return {!Array<!goog.structs.TreeNode<KEY, VALUE>>} All ancestor nodes in
 *     bottom-up order.
 */
goog.structs.TreeNode.prototype.getAncestors = function() {
  var ancestors = [];
  var node = this.getParent();
  while (node) {
    ancestors.push(node);
    node = node.getParent();
  }
  return ancestors;
};


/**
 * @return {!goog.structs.TreeNode<KEY, VALUE>} The root of the tree structure,
 *     i.e. the farthest ancestor of the node or the node itself if it has no
 *     parents.
 */
goog.structs.TreeNode.prototype.getRoot = function() {
  var root = this;
  while (root.getParent()) {
    root = root.getParent();
  }
  return root;
};


/**
 * Builds a nested array structure from the node keys in this node's subtree to
 * facilitate testing tree operations that change the hierarchy.
 * @return {!Array<KEY>} The structure of this node's descendants as nested
 *     array of node keys. The number of unclosed opening brackets up to a
 *     particular node is proportional to the indentation of that node in the
 *     graphical representation of the tree. Example:
 *     <pre>
 *       this
 *       |- child1
 *       |  L- grandchild
 *       L- child2
 *     </pre>
 *     is represented as ['child1', ['grandchild'], 'child2'].
 */
goog.structs.TreeNode.prototype.getSubtreeKeys = function() {
  var ret = [];
  this.forEachChild(function(child) {
    ret.push(child.getKey());
    if (!child.isLeaf()) {
      ret.push(child.getSubtreeKeys());
    }
  });
  return ret;
};


/**
 * Tells whether this node is the ancestor of the given node.
 * @param {!goog.structs.TreeNode<KEY, VALUE>} node A node.
 * @return {boolean} Whether this node is the ancestor of {@code node}.
 */
goog.structs.TreeNode.prototype.contains = function(node) {
  var current = node;
  do {
    current = current.getParent();
  } while (current && current != this);
  return Boolean(current);
};


/**
 * Finds the deepest common ancestor of the given nodes. The concept of
 * ancestor is not strict in this case, it includes the node itself.
 * @param {...!goog.structs.TreeNode<KEY, VALUE>} var_args The nodes.
 * @return {goog.structs.TreeNode<KEY, VALUE>} The common ancestor of the nodes
 *     or null if they are from different trees.
 * @template KEY, VALUE
 */
goog.structs.TreeNode.findCommonAncestor = function(var_args) {
  /** @type {goog.structs.TreeNode} */
  var ret = arguments[0];
  if (!ret) {
    return null;
  }

  var retDepth = ret.getDepth();
  for (var i = 1; i < arguments.length; i++) {
    /** @type {goog.structs.TreeNode} */
    var node = arguments[i];
    var depth = node.getDepth();
    while (node != ret) {
      if (depth <= retDepth) {
        ret = ret.getParent();
        retDepth--;
      }
      if (depth > retDepth) {
        node = node.getParent();
        depth--;
      }
    }
  }

  return ret;
};


/**
 * Returns a node whose key matches the given one in the hierarchy rooted at
 * this node. The hierarchy is searched using an in-order traversal.
 * @param {KEY} key The key to search for.
 * @return {goog.structs.TreeNode<KEY, VALUE>} The node with the given key, or
 *     null if no node with the given key exists in the hierarchy.
 */
goog.structs.TreeNode.prototype.getNodeByKey = function(key) {
  if (this.getKey() == key) {
    return this;
  }
  var children = this.getChildren();
  for (var i = 0; i < children.length; i++) {
    var descendant = children[i].getNodeByKey(key);
    if (descendant) {
      return descendant;
    }
  }
  return null;
};


/**
 * Traverses all child nodes.
 * @param {function(this:THIS, !goog.structs.TreeNode<KEY, VALUE>, number,
 *     !Array<!goog.structs.TreeNode<KEY, VALUE>>)} f Callback function. It
 *     takes the node, its index and the array of all child nodes as arguments.
 * @param {THIS=} opt_this The object to be used as the value of {@code this}
 *     within {@code f}.
 * @template THIS
 */
goog.structs.TreeNode.prototype.forEachChild = function(f, opt_this) {
  goog.array.forEach(this.getChildren(), f, opt_this);
};


/**
 * Traverses all child nodes recursively in preorder.
 * @param {function(!goog.structs.TreeNode<KEY, VALUE>)} f Callback function.
 *     It takes the node as argument.
 * @param {Object=} opt_this The object to be used as the value of {@code this}
 *     within {@code f}.
 */
goog.structs.TreeNode.prototype.forEachDescendant = function(f, opt_this) {
  goog.array.forEach(this.getChildren(), function(child) {
    f.call(opt_this, child);
    child.forEachDescendant(f, opt_this);
  });
};


/**
 * Traverses the subtree with the possibility to skip branches. Starts with
 * this node, and visits the descendant nodes depth-first, in preorder.
 * @param {function(this:THIS, !goog.structs.TreeNode<KEY, VALUE>):
 *     (boolean|undefined)} f Callback function. It takes the node as argument.
 *     The children of this node will be visited if the callback returns true or
 *     undefined, and will be skipped if the callback returns false.
 * @param {THIS=} opt_this The object to be used as the value of {@code this}
 *     within {@code f}.
 * @template THIS
 */
goog.structs.TreeNode.prototype.traverse = function(f, opt_this) {
  if (f.call(opt_this, this) !== false) {
    goog.array.forEach(this.getChildren(), function(child) {
      child.traverse(f, opt_this);
    });
  }
};


/**
 * Sets the parent node of this node. The callers must ensure that the parent
 * node and only that has this node among its children.
 * @param {goog.structs.TreeNode<KEY, VALUE>} parent The parent to set. If
 *     null, the node will be detached from the tree.
 * @protected
 */
goog.structs.TreeNode.prototype.setParent = function(parent) {
  this.parent_ = parent;
};


/**
 * Appends a child node to this node.
 * @param {!goog.structs.TreeNode<KEY, VALUE>} child Orphan child node.
 */
goog.structs.TreeNode.prototype.addChild = function(child) {
  this.addChildAt(child, this.children_ ? this.children_.length : 0);
};


/**
 * Inserts a child node at the given index.
 * @param {!goog.structs.TreeNode<KEY, VALUE>} child Orphan child node.
 * @param {number} index The position to insert at.
 */
goog.structs.TreeNode.prototype.addChildAt = function(child, index) {
  goog.asserts.assert(!child.getParent());
  child.setParent(this);
  this.children_ = this.children_ || [];
  goog.asserts.assert(index >= 0 && index <= this.children_.length);
  goog.array.insertAt(this.children_, child, index);
};


/**
 * Replaces a child node at the given index.
 * @param {!goog.structs.TreeNode<KEY, VALUE>} newChild Child node to set. It
 *     must not have parent node.
 * @param {number} index Valid index of the old child to replace.
 * @return {!goog.structs.TreeNode<KEY, VALUE>} The original child node,
 *     detached from its parent.
 */
goog.structs.TreeNode.prototype.replaceChildAt = function(newChild, index) {
  goog.asserts.assert(!newChild.getParent(),
      'newChild must not have parent node');
  var children = this.getChildren();
  var oldChild = children[index];
  goog.asserts.assert(oldChild, 'Invalid child or child index is given.');
  oldChild.setParent(null);
  children[index] = newChild;
  newChild.setParent(this);
  return oldChild;
};


/**
 * Replaces the given child node.
 * @param {!goog.structs.TreeNode<KEY, VALUE>} newChild New node to replace
 *     {@code oldChild}. It must not have parent node.
 * @param {!goog.structs.TreeNode<KEY, VALUE>} oldChild Existing child node to
 *     be replaced.
 * @return {!goog.structs.TreeNode<KEY, VALUE>} The replaced child node
 *     detached from its parent.
 */
goog.structs.TreeNode.prototype.replaceChild = function(newChild, oldChild) {
  return this.replaceChildAt(newChild,
      goog.array.indexOf(this.getChildren(), oldChild));
};


/**
 * Removes the child node at the given index.
 * @param {number} index The position to remove from.
 * @return {goog.structs.TreeNode<KEY, VALUE>} The removed node if any.
 */
goog.structs.TreeNode.prototype.removeChildAt = function(index) {
  var child = this.children_ && this.children_[index];
  if (child) {
    child.setParent(null);
    goog.array.removeAt(this.children_, index);
    if (this.children_.length == 0) {
      delete this.children_;
    }
    return child;
  }
  return null;
};


/**
 * Removes the given child node of this node.
 * @param {goog.structs.TreeNode<KEY, VALUE>} child The node to remove.
 * @return {goog.structs.TreeNode<KEY, VALUE>} The removed node if any.
 */
goog.structs.TreeNode.prototype.removeChild = function(child) {
  return this.removeChildAt(goog.array.indexOf(this.getChildren(), child));
};


/**
 * Removes all child nodes of this node.
 */
goog.structs.TreeNode.prototype.removeChildren = function() {
  if (this.children_) {
    goog.array.forEach(this.children_, function(child) {
      child.setParent(null);
    });
  }
  delete this.children_;
};

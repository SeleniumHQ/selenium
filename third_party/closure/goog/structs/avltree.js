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
 * @fileoverview Datastructure: AvlTree.
 *
 *
 * This file provides the implementation of an AVL-Tree datastructure. The tree
 * maintains a set of unique values in a sorted order. The values can be
 * accessed efficiently in their sorted order since the tree enforces an O(logn)
 * maximum height. See http://en.wikipedia.org/wiki/Avl_tree for more detail.
 *
 * The big-O notation for all operations are below:
 * <pre>
 *   Method                 big-O
 * ----------------------------------------------------------------------------
 * - add                    O(logn)
 * - remove                 O(logn)
 * - clear                  O(1)
 * - contains               O(logn)
 * - indexOf                O(logn)
 * - getCount               O(1)
 * - getMinimum             O(1), or O(logn) when optional root is specified
 * - getMaximum             O(1), or O(logn) when optional root is specified
 * - getHeight              O(1)
 * - getValues              O(n)
 * - inOrderTraverse        O(logn + k), where k is number of traversed nodes
 * - reverseOrderTraverse   O(logn + k), where k is number of traversed nodes
 * - copy                   O(n * p), where p is the time complexity to copy a
 *                          node
 * </pre>
 */


goog.module('goog.structs.AvlTree');
goog.module.declareLegacyNamespace();

var Collection = goog.require('goog.structs.Collection');
var asserts = goog.require('goog.asserts');



/**
 * Constructs an AVL-Tree, which uses the specified comparator to order its
 * values. The values can be accessed efficiently in their sorted order since
 * the tree enforces a O(logn) maximum height.
 *
 * @param {?Function=} opt_comparator Function used to order the tree's nodes.
 * @constructor
 * @implements {Collection<T>}
 * @final
 * @template T
 */
var AvlTree = function(opt_comparator) {
  /**
   * Comparison function used to compare values in the tree. This function
   * should take two values, a and b, and return x where:
   *
   * <pre>
   *  x < 0 if a < b,
   *  x > 0 if a > b,
   *  x = 0 otherwise
   * </pre>
   *
   * @private @const {!Function}
   */
  this.comparator_ = opt_comparator || DEFAULT_COMPARATOR;

  /**
   * Pointer to the root node of the tree.
   *
   * @private {?Node<T>}
   */
  this.root_ = null;

  /**
   * Pointer to the node with the smallest value in the tree.
   *
   * @private {?Node<T>}
   */
  this.minNode_ = null;

  /**
   * Pointer to the node with the largest value in the tree.
   *
   * @private {?Node<T>}
   */
  this.maxNode_ = null;
};


/**
 * String comparison function used to compare values in the tree. This function
 * is used by default if no comparator is specified in the tree's constructor.
 *
 * @param {T} a The first value.
 * @param {T} b The second value.
 * @return {number} -1 if a < b, 1 if a > b, 0 if a = b.
 * @template T
 * @const
 */
var DEFAULT_COMPARATOR = function(a, b) {
  if (String(a) < String(b)) {
    return -1;
  } else if (String(a) > String(b)) {
    return 1;
  }
  return 0;
};


/**
 * @param {?Node} node
 * @return {number}
 */
function height(node) {
  return node ? node.height : 0;
}


/**
 * @param {?Node} node
 * @return {number}
 */
function balanceFactor(node) {
  if (node) {
    var lh = node.left ? node.left.height : 0;
    var rh = node.right ? node.right.height : 0;
    return lh - rh;
  }
  return 0;
}


/**
 * @param {!Node<T>} node Node to balance.
 * @return {!Node<T>} Root of the modified subtree.
 * @private
 */
AvlTree.prototype.balance_ = function(node) {
  var bf = balanceFactor(node);
  if (bf > 1) {
    if (balanceFactor(node.left) < 0) {
      asserts.assert(node.left);
      this.leftRotate_(node.left);
    }
    return this.rightRotate_(node);
  } else if (bf < -1) {
    if (balanceFactor(node.right) > 0) {
      asserts.assert(node.right);
      this.rightRotate_(node.right);
    }
    return this.leftRotate_(node);
  }
  return node;
};


/**
 * Recursively find the correct place to add the given value to the tree.
 *
 * @param {T} value
 * @param {!Node<T>} currentNode
 * @return {boolean}
 * @private
 */
AvlTree.prototype.addInternal_ = function(value, currentNode) {
  var comparison = this.comparator_(value, currentNode.value);
  var added = false;

  if (comparison > 0) {
    if (currentNode.right) {
      added = this.addInternal_(value, currentNode.right);
    } else {
      currentNode.right = new Node(value, currentNode);
      added = true;

      if (currentNode == this.maxNode_) {
        this.maxNode_ = currentNode.right;
      }
    }
  } else if (comparison < 0) {
    if (currentNode.left) {
      added = this.addInternal_(value, currentNode.left);
    } else {
      currentNode.left = new Node(value, currentNode);
      added = true;

      if (currentNode == this.minNode_) {
        this.minNode_ = currentNode.left;
      }
    }
  }

  if (added) {
    currentNode.count++;
    currentNode.height =
        Math.max(height(currentNode.left), height(currentNode.right)) + 1;

    this.balance_(currentNode);
  }

  return added;
};


/**
 * Inserts a node into the tree with the specified value if the tree does
 * not already contain a node with the specified value. If the value is
 * inserted, the tree is balanced to enforce the AVL-Tree height property.
 *
 * @param {T} value Value to insert into the tree.
 * @return {boolean} Whether value was inserted into the tree.
 * @override
 */
AvlTree.prototype.add = function(value) {
  // If the tree is empty, create a root node with the specified value
  if (!this.root_) {
    this.root_ = new Node(value);
    this.minNode_ = this.root_;
    this.maxNode_ = this.root_;
    return true;
  }

  return this.addInternal_(value, this.root_);
};


/**
 * @param {?Node} node
 * @return {number}
 */
function count(node) {
  return node ? node.count : 0;
}


/**
 * @param {T} value Value to remove.
 * @param {?Node<T>} currentNode
 * @return {{value: (T|null), root: ?Node<T>}} The value that was removed or
 *     null if nothing was removed in addition to the root of the modified
 *     subtree.
 * @private
 */
AvlTree.prototype.removeInternal_ = function(value, currentNode) {
  if (!currentNode) {
    return {value: null, root: null};
  }

  var comparison = this.comparator_(currentNode.value, value);

  if (comparison > 0) {
    var removeResult = this.removeInternal_(value, currentNode.left);
    currentNode.left = removeResult.root;
    value = removeResult.value;
  } else if (comparison < 0) {
    var removeResult = this.removeInternal_(value, currentNode.right);
    currentNode.right = removeResult.root;
    value = removeResult.value;
  } else {
    value = currentNode.value;
    if (!currentNode.left || !currentNode.right) {
      // Zero or one children.
      var replacement = currentNode.left ? currentNode.left : currentNode.right;

      if (!replacement) {
        if (this.maxNode_ == currentNode) {
          this.maxNode_ = currentNode.parent;
        }
        if (this.minNode_ == currentNode) {
          this.minNode_ = currentNode.parent;
        }
        return {value: value, root: null};
      }

      if (this.maxNode_ == currentNode) {
        this.maxNode_ = replacement;
      }
      if (this.minNode_ == currentNode) {
        this.minNode_ = replacement;
      }

      replacement.parent = currentNode.parent;
      currentNode = replacement;
    } else {
      value = currentNode.value;
      var nextInOrder = currentNode.right;
      // Two children. Note this cannot be the max or min value. Find the next
      // in order replacement (the left most child of the current node's right
      // child).
      this.traverse_(function(node) {
        if (node.left) {
          nextInOrder = node.left;
          return nextInOrder;
        }
        return null;
      }, currentNode.right);
      asserts.assert(nextInOrder);
      currentNode.value = nextInOrder.value;
      var removeResult = this.removeInternal_(
          /** @type {?} */ (nextInOrder.value), currentNode.right);
      currentNode.right = removeResult.root;
    }
  }

  currentNode.count = count(currentNode.left) + count(currentNode.right) + 1;
  currentNode.height =
      Math.max(height(currentNode.left), height(currentNode.right)) + 1;
  return {root: this.balance_(currentNode), value: value};
};


/**
 * Removes a node from the tree with the specified value if the tree contains a
 * node with this value. If a node is removed the tree is balanced to enforce
 * the AVL-Tree height property. The value of the removed node is returned.
 *
 * @param {T} value Value to find and remove from the tree.
 * @return {T} The value of the removed node or null if the value was not in
 *     the tree.
 * @override
 */
AvlTree.prototype.remove = function(value) {
  var result = this.removeInternal_(value, this.root_);
  this.root_ = result.root;
  return result.value;
};


/**
 * Removes all nodes from the tree.
 */
AvlTree.prototype.clear = function() {
  this.root_ = null;
  this.minNode_ = null;
  this.maxNode_ = null;
};


/**
 * Returns true if the tree contains a node with the specified value, false
 * otherwise.
 *
 * @param {T} value Value to find in the tree.
 * @return {boolean} Whether the tree contains a node with the specified value.
 * @override
 */
AvlTree.prototype.contains = function(value) {
  // Assume the value is not in the tree and set this value if it is found
  var isContained = false;

  // Depth traverse the tree and set isContained if we find the node
  this.traverse_(function(node) {
    var retNode = null;
    var comparison = this.comparator_(node.value, value);
    if (comparison > 0) {
      retNode = node.left;
    } else if (comparison < 0) {
      retNode = node.right;
    } else {
      isContained = true;
    }
    return retNode;  // If null, we'll stop traversing the tree
  });

  // Return true if the value is contained in the tree, false otherwise
  return isContained;
};


/**
 * Returns the index (in an in-order traversal) of the node in the tree with
 * the specified value. For example, the minimum value in the tree will
 * return an index of 0 and the maximum will return an index of n - 1 (where
 * n is the number of nodes in the tree).  If the value is not found then -1
 * is returned.
 *
 * @param {T} value Value in the tree whose in-order index is returned.
 * @return {number} The in-order index of the given value in the
 *     tree or -1 if the value is not found.
 */
AvlTree.prototype.indexOf = function(value) {
  // Assume the value is not in the tree and set this value if it is found
  var retIndex = -1;
  var currIndex = 0;

  // Depth traverse the tree and set retIndex if we find the node
  this.traverse_(function(node) {
    var comparison = this.comparator_(node.value, value);
    if (comparison > 0) {
      // The value is less than this node, so recurse into the left subtree.
      return node.left;
    }

    if (node.left) {
      // The value is greater than all of the nodes in the left subtree.
      currIndex += node.left.count;
    }

    if (comparison < 0) {
      // The value is also greater than this node.
      currIndex++;
      // Recurse into the right subtree.
      return node.right;
    }
    // We found the node, so stop traversing the tree.
    retIndex = currIndex;
    return null;
  });

  // Return index if the value is contained in the tree, -1 otherwise
  return retIndex;
};


/**
 * Returns the number of values stored in the tree.
 *
 * @return {number} The number of values stored in the tree.
 * @override
 */
AvlTree.prototype.getCount = function() {
  return this.root_ ? this.root_.count : 0;
};


/**
 * Returns a k-th smallest value, based on the comparator, where 0 <= k <
 * this.getCount().
 * @param {number} k The number k.
 * @return {T} The k-th smallest value.
 */
AvlTree.prototype.getKthValue = function(k) {
  if (k < 0 || k >= this.getCount()) {
    return null;
  }
  return this.getKthNode_(k).value;
};


/**
 * Returns the value u, such that u is contained in the tree and u < v, for all
 * values v in the tree where v != u.
 *
 * @return {T} The minimum value contained in the tree.
 */
AvlTree.prototype.getMinimum = function() {
  return this.getMinNode_().value;
};


/**
 * Returns the value u, such that u is contained in the tree and u > v, for all
 * values v in the tree where v != u.
 *
 * @return {T} The maximum value contained in the tree.
 */
AvlTree.prototype.getMaximum = function() {
  return this.getMaxNode_().value;
};


/**
 * Returns the height of the tree (the maximum depth). This height should
 * always be <= 1.4405*(Math.log(n+2)/Math.log(2))-1.3277, where n is the
 * number of nodes in the tree.
 *
 * @return {number} The height of the tree.
 */
AvlTree.prototype.getHeight = function() {
  return this.root_ ? this.root_.height : 0;
};


/**
 * Inserts the values stored in the tree into a new Array and returns the Array.
 *
 * @return {!Array<T>} An array containing all of the trees values in sorted
 *     order.
 */
AvlTree.prototype.getValues = function() {
  var ret = [];
  this.inOrderTraverse(function(value) { ret.push(value); });
  return ret;
};


/**
 * Performs an in-order traversal of the tree and calls `func` with each
 * traversed node, optionally starting from the smallest node with a value >= to
 * the specified start value. The traversal ends after traversing the tree's
 * maximum node or when `func` returns a value that evaluates to true.
 *
 * @param {Function} func Function to call on each traversed node.
 * @param {T=} opt_startValue If specified, traversal will begin on the node
 *     with the smallest value >= opt_startValue.
 */
AvlTree.prototype.inOrderTraverse = function(func, opt_startValue) {
  // If our tree is empty, return immediately
  if (!this.root_) {
    return;
  }

  // Depth traverse the tree to find node to begin in-order traversal from
  /** @type {undefined|!Node} */
  var startNode;
  if (opt_startValue !== undefined) {
    this.traverse_(function(node) {
      var retNode = null;
      var comparison = this.comparator_(node.value, opt_startValue);
      if (comparison > 0) {
        retNode = node.left;
        startNode = node;
      } else if (comparison < 0) {
        retNode = node.right;
      } else {
        startNode = node;
      }
      return retNode;  // If null, we'll stop traversing the tree
    });
    if (!startNode) {
      return;
    }
  } else {
    startNode = /** @type {!Node} */ (this.getMinNode_());
  }

  // Traverse the tree and call func on each traversed node's value
  var node = /** @type {!Node} */ (startNode);
  var prev = node.left ? node.left : node;
  while (node != null) {
    if (node.left != null && node.left != prev && node.right != prev) {
      node = node.left;
    } else {
      if (node.right != prev) {
        if (func(node.value)) {
          return;
        }
      }
      var temp = node;
      node =
          node.right != null && node.right != prev ? node.right : node.parent;
      prev = temp;
    }
  }
};


/**
 * Performs a reverse-order traversal of the tree and calls `func` with
 * each traversed node, optionally starting from the largest node with a value
 * <= to the specified start value. The traversal ends after traversing the
 * tree's minimum node or when func returns a value that evaluates to true.
 *
 * @param {function(T):?} func Function to call on each traversed node.
 * @param {T=} opt_startValue If specified, traversal will begin on the node
 *     with the largest value <= opt_startValue.
 */
AvlTree.prototype.reverseOrderTraverse = function(func, opt_startValue) {
  // If our tree is empty, return immediately
  if (!this.root_) {
    return;
  }

  // Depth traverse the tree to find node to begin reverse-order traversal from
  var startNode;
  if (opt_startValue !== undefined) {
    this.traverse_(goog.bind(function(node) {
      var retNode = null;
      var comparison = this.comparator_(node.value, opt_startValue);
      if (comparison > 0) {
        retNode = node.left;
      } else if (comparison < 0) {
        retNode = node.right;
        startNode = node;
      } else {
        startNode = node;
      }
      return retNode;  // If null, we'll stop traversing the tree
    }, this));
    if (!startNode) {
      return;
    }
  } else {
    startNode = this.getMaxNode_();
  }

  // Traverse the tree and call func on each traversed node's value
  var node = startNode, prev = startNode.right ? startNode.right : startNode;
  while (node != null) {
    if (node.right != null && node.right != prev && node.left != prev) {
      node = node.right;
    } else {
      if (node.left != prev) {
        if (func(node.value)) {
          return;
        }
      }
      var temp = node;
      node = node.left != null && node.left != prev ? node.left : node.parent;
      prev = temp;
    }
  }
};


/**
 * Performs a traversal defined by the supplied `traversalFunc`. The first
 * call to `traversalFunc` is passed the root or the optionally specified
 * startNode. After that, calls `traversalFunc` with the node returned
 * by the previous call to `traversalFunc` until `traversalFunc`
 * returns null or the optionally specified endNode. The first call to
 * traversalFunc is passed the root or the optionally specified startNode.
 *
 * @param {function(
 *     this:AvlTree<T>,
 *     !Node<T>):?Node<T>} traversalFunc
 * Function used to traverse the tree.
 * @param {Node<T>=} opt_startNode The node at which the
 *     traversal begins.
 * @param {Node<T>=} opt_endNode The node at which the
 *     traversal ends.
 * @private
 */
AvlTree.prototype.traverse_ = function(
    traversalFunc, opt_startNode, opt_endNode) {
  var node = opt_startNode ? opt_startNode : this.root_;
  var endNode = opt_endNode ? opt_endNode : null;
  while (node && node != endNode) {
    node = traversalFunc.call(this, node);
  }
};


/**
 * Performs a left tree rotation on the specified node.
 *
 * @param {!Node<T>} node Pivot node to rotate from.
 * @return {!Node<T>} New root of the sub tree.
 * @private
 */
AvlTree.prototype.leftRotate_ = function(node) {
  // Re-assign parent-child references for the parent of the node being removed
  if (node.isLeftChild()) {
    node.parent.left = node.right;
    node.right.parent = node.parent;
  } else if (node.isRightChild()) {
    node.parent.right = node.right;
    node.right.parent = node.parent;
  } else {
    this.root_ = node.right;
    this.root_.parent = null;
  }

  // Re-assign parent-child references for the child of the node being removed
  var temp = node.right;
  node.right = node.right.left;
  if (node.right != null) node.right.parent = node;
  temp.left = node;
  node.parent = temp;

  // Update counts.
  temp.count = node.count;
  node.count -= (temp.right ? temp.right.count : 0) + 1;

  node.fixHeight();
  temp.fixHeight();

  return temp;
};


/**
 * Performs a right tree rotation on the specified node.
 *
 * @param {!Node<T>} node Pivot node to rotate from.
 * @return {!Node<T>} New root of the sub tree.
 * @private
 */
AvlTree.prototype.rightRotate_ = function(node) {
  // Re-assign parent-child references for the parent of the node being removed
  if (node.isLeftChild()) {
    node.parent.left = node.left;
    node.left.parent = node.parent;
  } else if (node.isRightChild()) {
    node.parent.right = node.left;
    node.left.parent = node.parent;
  } else {
    this.root_ = node.left;
    this.root_.parent = null;
  }

  // Re-assign parent-child references for the child of the node being removed
  var temp = node.left;
  node.left = node.left.right;
  if (node.left != null) node.left.parent = node;
  temp.right = node;
  node.parent = temp;

  // Update counts.
  temp.count = node.count;
  node.count -= (temp.left ? temp.left.count : 0) + 1;

  node.fixHeight();
  temp.fixHeight();

  return temp;
};


/**
 * Returns the node in the tree that has k nodes before it in an in-order
 * traversal, optionally rooted at `opt_rootNode`.
 *
 * @param {number} k The number of nodes before the node to be returned in an
 *     in-order traversal, where 0 <= k < root.count.
 * @param {Node<T>=} opt_rootNode Optional root node.
 * @return {Node<T>} The node at the specified index.
 * @private
 */
AvlTree.prototype.getKthNode_ = function(k, opt_rootNode) {
  var root = opt_rootNode || this.root_;
  var numNodesInLeftSubtree = root.left ? root.left.count : 0;

  if (k < numNodesInLeftSubtree) {
    return this.getKthNode_(k, root.left);
  } else if (k == numNodesInLeftSubtree) {
    return root;
  } else {
    return this.getKthNode_(k - numNodesInLeftSubtree - 1, root.right);
  }
};


/**
 * Returns the node with the smallest value in tree, optionally rooted at
 * `opt_rootNode`.
 *
 * @param {Node<T>=} opt_rootNode Optional root node.
 * @return {Node<T>} The node with the smallest value in
 *     the tree.
 * @private
 */
AvlTree.prototype.getMinNode_ = function(opt_rootNode) {
  if (!opt_rootNode) {
    return this.minNode_;
  }

  var minNode = opt_rootNode;
  this.traverse_(function(node) {
    var retNode = null;
    if (node.left) {
      minNode = node.left;
      retNode = node.left;
    }
    return retNode;  // If null, we'll stop traversing the tree
  }, opt_rootNode);

  return minNode;
};


/**
 * Returns the node with the largest value in tree, optionally rooted at
 * opt_rootNode.
 *
 * @param {Node<T>=} opt_rootNode Optional root node.
 * @return {Node<T>} The node with the largest value in
 *     the tree.
 * @private
 */
AvlTree.prototype.getMaxNode_ = function(opt_rootNode) {
  if (!opt_rootNode) {
    return this.maxNode_;
  }

  var maxNode = opt_rootNode;
  this.traverse_(function(node) {
    var retNode = null;
    if (node.right) {
      maxNode = node.right;
      retNode = node.right;
    }
    return retNode;  // If null, we'll stop traversing the tree
  }, opt_rootNode);

  return maxNode;
};


/**
 * Copies the AVL tree.
 * @param {(function(T): T)=} opt_copy - Function used to copy the elements
 *     contained in the tree. The identity function is used by default, which
 *     results in a shallow copy of the tree. Copied elements will be compared
 *     against their originals using the tree's comparator to ensure the
 *     integrity of the copied tree.
 * @return {!AvlTree<T>}
 */
AvlTree.prototype.copy = function(opt_copy) {
  var tree = new AvlTree(this.comparator_);

  // Empty tree
  if (!this.root_) {
    return tree;
  }

  // Copy instance properties
  var copyInfo =
      this.root_.copy(/* parent= */ null, this.comparator_, opt_copy);
  tree.root_ = copyInfo.root;
  tree.minNode_ = copyInfo.leftMost;
  tree.maxNode_ = copyInfo.rightMost;

  return tree;
};



/**
 * Constructs an AVL-Tree node with the specified value. If no parent is
 * specified, the node's parent is assumed to be null. The node's height
 * defaults to 1 and its children default to null.
 *
 * @param {T} value Value to store in the node.
 * @param {Node<T>=} opt_parent Optional parent node.
 * @constructor
 * @final
 * @template T
 */
var Node = function(value, opt_parent) {
  /**
   * The value stored by the node.
   *
   * @type {T}
   */
  this.value = value;

  /**
   * The node's parent. Null if the node is the root.
   *
   * @type {?Node<T>}
   */
  this.parent = opt_parent ? opt_parent : null;

  /**
   * The number of nodes in the subtree rooted at this node.
   *
   * @type {number}
   */
  this.count = 1;

  /**
   * The node's left child. Null if the node does not have a left child.
   *
   * @type {?Node<T>}
   */
  this.left = null;

  /**
   * The node's right child. Null if the node does not have a right child.
   *
   * @type {?Node<T>}
   */
  this.right = null;

  /**
   * Height of this node.
   *
   * @type {number}
   */
  this.height = 1;
};


/**
 * Returns true iff the specified node has a parent and is the right child of
 * its parent.
 *
 * @return {boolean} Whether the specified node has a parent and is the right
 *    child of its parent.
 */
Node.prototype.isRightChild = function() {
  return !!this.parent && this.parent.right == this;
};


/**
 * Returns true iff the specified node has a parent and is the left child of
 * its parent.
 *
 * @return {boolean} Whether the specified node has a parent and is the left
 *    child of its parent.
 */
Node.prototype.isLeftChild = function() {
  return !!this.parent && this.parent.left == this;
};


/**
 * Helper method to fix the height of this node (e.g. after children have
 * changed).
 */
Node.prototype.fixHeight = function() {
  this.height = Math.max(
                    this.left ? this.left.height : 0,
                    this.right ? this.right.height : 0) +
      1;
};


/**
 * Copies a node.
 * @param {?Node<T>} parent - The parent of this node.
 * @param {!Function} comparator Comparison function for values, used to assert
 *     that the nodes are equivalent after copying.
 * @param {(function(T): T)=} opt_copy - Function used to copy the elements
 *     contained in the tree. The identity function is used by default, which
 *     results in a shallow copy of the tree. Copied elements will be compared
 *     against their originals using the tree's comparator to ensure the
 *     integrity of the copied tree.
 * @return {{
 *   root: !Node<T>,
 *   leftMost: ?Node<T>,
 *   rightMost: ?Node<T>,
 * }} subtree - Information about the copied subtree
 */
Node.prototype.copy = function(parent, comparator, opt_copy) {
  var val;

  if (opt_copy) {
    val = opt_copy(this.value);
    asserts.assert(comparator(this.value, val) === 0);
  } else {
    val = this.value;
  }

  var node = new Node(val, parent);

  // Copy all properties
  node.count = this.count;
  node.height = this.height;

  var minNode = node;
  var maxNode = node;

  if (this.left) {
    var leftInfo = this.left.copy(node, comparator, opt_copy);
    node.left = leftInfo.root;
    minNode = leftInfo.leftMost;
  }

  if (this.right) {
    var rightInfo = this.right.copy(node, comparator, opt_copy);
    node.right = rightInfo.root;
    maxNode = rightInfo.rightMost;
  }

  return {root: node, leftMost: minNode, rightMost: maxNode};
};

exports = AvlTree;

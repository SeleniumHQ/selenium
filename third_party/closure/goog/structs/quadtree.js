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
 * @fileoverview Datastructure: A point Quad Tree for representing 2D data. Each
 * region has the same ratio as the bounds for the tree.
 *
 * The implementation currently requires pre-determined bounds for data as it
 * can not rebalance itself to that degree.
 *
 * @see ../demos/quadtree.html
 */


goog.provide('goog.structs.QuadTree');
goog.provide('goog.structs.QuadTree.Node');
goog.provide('goog.structs.QuadTree.Point');

goog.require('goog.math.Coordinate');



/**
 * Constructs a new quad tree.
 * @param {number} minX Minimum x-value that can be held in tree.
 * @param {number} minY Minimum y-value that can be held in tree.
 * @param {number} maxX Maximum x-value that can be held in tree.
 * @param {number} maxY Maximum y-value that can be held in tree.
 * @constructor
 */
goog.structs.QuadTree = function(minX, minY, maxX, maxY) {

  /**
   * The root node for the quad tree.
   * @type {goog.structs.QuadTree.Node}
   * @private
   */
  this.root_ = new goog.structs.QuadTree.Node(
      minX, minY, maxX - minX, maxY - minY);
};


/**
 * Count of the number of items in the tree.
 * @type {number}
 * @private
 */
goog.structs.QuadTree.prototype.count_ = 0;


/**
 * Returns a reference to the tree's root node.  Callers shouldn't modify nodes,
 * directly.  This is a convenience for visualization and debugging purposes.
 * @return {goog.structs.QuadTree.Node} The root node.
 */
goog.structs.QuadTree.prototype.getRootNode = function() {
  return this.root_;
};


/**
 * Sets the value of an (x, y) point within the quad-tree.
 * @param {number} x The x-coordinate.
 * @param {number} y The y-coordinate.
 * @param {*} value The value associated with the point.
 */
goog.structs.QuadTree.prototype.set = function(x, y, value) {
  var root = this.root_;
  if (x < root.x || y < root.y || x > root.x + root.w || y > root.y + root.h) {
    throw Error('Out of bounds : (' + x + ', ' + y + ')');
  }
  if (this.insert_(root, new goog.structs.QuadTree.Point(x, y, value))) {
    this.count_++;
  }
};


/**
 * Gets the value of the point at (x, y) or null if the point is empty.
 * @param {number} x The x-coordinate.
 * @param {number} y The y-coordinate.
 * @param {*=} opt_default The default value to return if the node doesn't
 *     exist.
 * @return {*} The value of the node, the default value if the node
 *     doesn't exist, or undefined if the node doesn't exist and no default
 *     has been provided.
 */
goog.structs.QuadTree.prototype.get = function(x, y, opt_default) {
  var node = this.find_(this.root_, x, y);
  return node ? node.point.value : opt_default;
};


/**
 * Removes a point from (x, y) if it exists.
 * @param {number} x The x-coordinate.
 * @param {number} y The y-coordinate.
 * @return {*} The value of the node that was removed, or null if the
 *     node doesn't exist.
 */
goog.structs.QuadTree.prototype.remove = function(x, y) {
  var node = this.find_(this.root_, x, y);
  if (node) {
    var value = node.point.value;
    node.point = null;
    node.nodeType = goog.structs.QuadTree.NodeType.EMPTY;
    this.balance_(node);
    this.count_--;
    return value;
  } else {
    return null;
  }
};


/**
 * Returns true if the point at (x, y) exists in the tree.
 * @param {number} x The x-coordinate.
 * @param {number} y The y-coordinate.
 * @return {boolean} Whether the tree contains a point at (x, y).
 */
goog.structs.QuadTree.prototype.contains = function(x, y) {
  return this.get(x, y) != null;
};


/**
 * @return {boolean} Whether the tree is empty.
 */
goog.structs.QuadTree.prototype.isEmpty = function() {
  return this.root_.nodeType == goog.structs.QuadTree.NodeType.EMPTY;
};


/**
 * @return {number} The number of items in the tree.
 */
goog.structs.QuadTree.prototype.getCount = function() {
  return this.count_;
};


/**
 * Removes all items from the tree.
 */
goog.structs.QuadTree.prototype.clear = function() {
  this.root_.nw = this.root_.ne = this.root_.sw = this.root_.se = null;
  this.root_.nodeType = goog.structs.QuadTree.NodeType.EMPTY;
  this.root_.point = null;
  this.count_ = 0;
};


/**
 * Returns an array containing the coordinates of each point stored in the tree.
 * @return {Array.<goog.math.Coordinate?>} Array of coordinates.
 */
goog.structs.QuadTree.prototype.getKeys = function() {
  var arr = [];
  this.traverse_(this.root_, function(node) {
    arr.push(new goog.math.Coordinate(node.point.x, node.point.y));
  });
  return arr;
};


/**
 * Returns an array containing all values stored within the tree.
 * @return {Array.<Object>} The values stored within the tree.
 */
goog.structs.QuadTree.prototype.getValues = function() {
  var arr = [];
  this.traverse_(this.root_, function(node) {
    // Must have a point because it's a leaf.
    arr.push(node.point.value);
  });
  return arr;
};


/**
 * Clones the quad-tree and returns the new instance.
 * @return {goog.structs.QuadTree} A clone of the tree.
 */
goog.structs.QuadTree.prototype.clone = function() {
  var x1 = this.root_.x;
  var y1 = this.root_.y;
  var x2 = x1 + this.root_.w;
  var y2 = y1 + this.root_.h;
  var clone = new goog.structs.QuadTree(x1, y1, x2, y2);
  // This is inefficient as the clone needs to recalculate the structure of the
  // tree, even though we know it already.  But this is easier and can be
  // optimized when/if needed.
  this.traverse_(this.root_, function(node) {
    clone.set(node.point.x, node.point.y, node.point.value);
  });
  return clone;
};


/**
 * Traverses the tree and calls a function on each node.
 * @param {function(?, goog.math.Coordinate, goog.structs.QuadTree)} fn
 *     The function to call for every value. This function takes 3 arguments
 *     (the value, the coordinate, and the tree itself) and the return value is
 *     irrelevant.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@ code fn}.
 */
goog.structs.QuadTree.prototype.forEach = function(fn, opt_obj) {
  this.traverse_(this.root_, function(node) {
    var coord = new goog.math.Coordinate(node.point.x, node.point.y);
    fn.call(opt_obj, node.point.value, coord, this);
  });
};


/**
 * Traverses the tree depth-first, with quadrants being traversed in clockwise
 * order (NE, SE, SW, NW).  The provided function will be called for each
 * leaf node that is encountered.
 * @param {goog.structs.QuadTree.Node} node The current node.
 * @param {function(goog.structs.QuadTree.Node)} fn The function to call
 *     for each leaf node. This function takes the node as an argument, and its
 *     return value is irrelevant.
 * @private
 */
goog.structs.QuadTree.prototype.traverse_ = function(node, fn) {
  switch (node.nodeType) {
    case goog.structs.QuadTree.NodeType.LEAF:
      fn.call(this, node);
      break;

    case goog.structs.QuadTree.NodeType.POINTER:
      this.traverse_(node.ne, fn);
      this.traverse_(node.se, fn);
      this.traverse_(node.sw, fn);
      this.traverse_(node.nw, fn);
      break;
  }
};


/**
 * Finds a leaf node with the same (x, y) coordinates as the target point, or
 * null if no point exists.
 * @param {goog.structs.QuadTree.Node} node The node to search in.
 * @param {number} x The x-coordinate of the point to search for.
 * @param {number} y The y-coordinate of the point to search for.
 * @return {goog.structs.QuadTree.Node} The leaf node that matches the target,
 *     or null if it doesn't exist.
 * @private
 */
goog.structs.QuadTree.prototype.find_ = function(node, x, y) {
  switch (node.nodeType) {
    case goog.structs.QuadTree.NodeType.EMPTY:
      return null;

    case goog.structs.QuadTree.NodeType.LEAF:
      return node.point.x == x && node.point.y == y ? node : null;

    case goog.structs.QuadTree.NodeType.POINTER:
      return this.find_(this.getQuadrantForPoint_(node, x, y), x, y);

    default:
      throw Error('Invalid nodeType');
  }
};


/**
 * Inserts a point into the tree, updating the tree's structure if necessary.
 * @param {goog.structs.QuadTree.Node} parent The parent to insert the point
 *     into.
 * @param {goog.structs.QuadTree.Point} point The point to insert.
 * @return {boolean} True if a new node was added to the tree; False if a node
 *     already existed with the correpsonding coordinates and had its value
 *     reset.
 * @private
 */
goog.structs.QuadTree.prototype.insert_ = function(parent, point) {
  switch (parent.nodeType) {
    case goog.structs.QuadTree.NodeType.EMPTY:
      this.setPointForNode_(parent, point);
      return true;

    case goog.structs.QuadTree.NodeType.LEAF:
      if (parent.point.x == point.x && parent.point.y == point.y) {
        this.setPointForNode_(parent, point);
        return false;
      } else {
        this.split_(parent);
        return this.insert_(parent, point);
      }

    case goog.structs.QuadTree.NodeType.POINTER:
      return this.insert_(
          this.getQuadrantForPoint_(parent, point.x, point.y), point);

    default:
      throw Error('Invalid nodeType in parent');
  }
};


/**
 * Converts a leaf node to a pointer node and reinserts the node's point into
 * the correct child.
 * @param {goog.structs.QuadTree.Node} node The node to split.
 * @private
 */
goog.structs.QuadTree.prototype.split_ = function(node) {
  var oldPoint = node.point;
  node.point = null;

  node.nodeType = goog.structs.QuadTree.NodeType.POINTER;

  var x = node.x;
  var y = node.y;
  var hw = node.w / 2;
  var hh = node.h / 2;

  node.nw = new goog.structs.QuadTree.Node(x, y, hw, hh, node);
  node.ne = new goog.structs.QuadTree.Node(x + hw, y, hw, hh, node);
  node.sw = new goog.structs.QuadTree.Node(x, y + hh, hw, hh, node);
  node.se = new goog.structs.QuadTree.Node(x + hw, y + hh, hw, hh, node);

  this.insert_(node, oldPoint);
};


/**
 * Attempts to balance a node. A node will need balancing if all its children
 * are empty or it contains just one leaf.
 * @param {goog.structs.QuadTree.Node} node The node to balance.
 * @private
 */
goog.structs.QuadTree.prototype.balance_ = function(node) {
  switch (node.nodeType) {
    case goog.structs.QuadTree.NodeType.EMPTY:
    case goog.structs.QuadTree.NodeType.LEAF:
      if (node.parent) {
        this.balance_(node.parent);
      }
      break;

    case goog.structs.QuadTree.NodeType.POINTER:
      var nw = node.nw, ne = node.ne, sw = node.sw, se = node.se;
      var firstLeaf = null;

      // Look for the first non-empty child, if there is more than one then we
      // break as this node can't be balanced.
      if (nw.nodeType != goog.structs.QuadTree.NodeType.EMPTY) {
        firstLeaf = nw;
      }
      if (ne.nodeType != goog.structs.QuadTree.NodeType.EMPTY) {
        if (firstLeaf) {
          break;
        }
        firstLeaf = ne;
      }
      if (sw.nodeType != goog.structs.QuadTree.NodeType.EMPTY) {
        if (firstLeaf) {
          break;
        }
        firstLeaf = sw;
      }
      if (se.nodeType != goog.structs.QuadTree.NodeType.EMPTY) {
        if (firstLeaf) {
          break;
        }
        firstLeaf = se;
      }

      if (!firstLeaf) {
        // All child nodes are empty: so make this node empty.
        node.nodeType = goog.structs.QuadTree.NodeType.EMPTY;
        node.nw = node.ne = node.sw = node.se = null;

      } else if (firstLeaf.nodeType == goog.structs.QuadTree.NodeType.POINTER) {
        // Only child was a pointer, therefore we can't rebalance.
        break;

      } else {
        // Only child was a leaf: so update node's point and make it a leaf.
        node.nodeType = goog.structs.QuadTree.NodeType.LEAF;
        node.nw = node.ne = node.sw = node.se = null;
        node.point = firstLeaf.point;
      }

      // Try and balance the parent as well.
      if (node.parent) {
        this.balance_(node.parent);
      }

      break;
  }
};


/**
 * Returns the child quadrant within a node that contains the given (x, y)
 * coordinate.
 * @param {goog.structs.QuadTree.Node} parent The node.
 * @param {number} x The x-coordinate to look for.
 * @param {number} y The y-coordinate to look for.
 * @return {goog.structs.QuadTree.Node} The child quadrant that contains the
 *     point.
 * @private
 */
goog.structs.QuadTree.prototype.getQuadrantForPoint_ = function(parent, x, y) {
  var mx = parent.x + parent.w / 2;
  var my = parent.y + parent.h / 2;
  if (x < mx) {
    return y < my ? parent.nw : parent.sw;
  } else {
    return y < my ? parent.ne : parent.se;
  }
};


/**
 * Sets the point for a node, as long as the node is a leaf or empty.
 * @param {goog.structs.QuadTree.Node} node The node to set the point for.
 * @param {goog.structs.QuadTree.Point} point The point to set.
 * @private
 */
goog.structs.QuadTree.prototype.setPointForNode_ = function(node, point) {
  if (node.nodeType == goog.structs.QuadTree.NodeType.POINTER) {
    throw Error('Can not set point for node of type POINTER');
  }
  node.nodeType = goog.structs.QuadTree.NodeType.LEAF;
  node.point = point;
};


/**
 * Enumeration of node types.
 * @enum {number}
 */
goog.structs.QuadTree.NodeType = {
  EMPTY: 0,
  LEAF: 1,
  POINTER: 2
};



/**
 * Constructs a new quad tree node.
 * @param {number} x X-coordiate of node.
 * @param {number} y Y-coordinate of node.
 * @param {number} w Width of node.
 * @param {number} h Height of node.
 * @param {goog.structs.QuadTree.Node=} opt_parent Optional parent node.
 * @constructor
 */
goog.structs.QuadTree.Node = function(x, y, w, h, opt_parent) {
  /**
   * The x-coordinate of the node.
   * @type {number}
   */
  this.x = x;

  /**
   * The y-coordinate of the node.
   * @type {number}
   */
  this.y = y;

  /**
   * The width of the node.
   * @type {number}
   */
  this.w = w;

  /**
   * The height of the node.
   * @type {number}
   */
  this.h = h;

  /**
   * The parent node.
   * @type {goog.structs.QuadTree.Node?}
   */
  this.parent = opt_parent || null;
};


/**
 * The node's type.
 * @type {goog.structs.QuadTree.NodeType}
 */
goog.structs.QuadTree.Node.prototype.nodeType =
    goog.structs.QuadTree.NodeType.EMPTY;


/**
 * The child node in the North-West quadrant.
 * @type {goog.structs.QuadTree.Node?}
 */
goog.structs.QuadTree.Node.prototype.nw = null;


/**
 * The child node in the North-East quadrant.
 * @type {goog.structs.QuadTree.Node?}
 */
goog.structs.QuadTree.Node.prototype.ne = null;


/**
 * The child node in the South-West quadrant.
 * @type {goog.structs.QuadTree.Node?}
 */
goog.structs.QuadTree.Node.prototype.sw = null;


/**
 * The child node in the South-East quadrant.
 * @type {goog.structs.QuadTree.Node?}
 */
goog.structs.QuadTree.Node.prototype.se = null;


/**
 * The point for the node, if it is a leaf node.
 * @type {goog.structs.QuadTree.Point?}
 */
goog.structs.QuadTree.Node.prototype.point = null;



/**
 * Creates a new point object.
 * @param {number} x The x-coordinate of the point.
 * @param {number} y The y-coordinate of the point.
 * @param {*=} opt_value Optional value associated with the point.
 * @constructor
 */
goog.structs.QuadTree.Point = function(x, y, opt_value) {
  /**
   * The x-coordinate for the point.
   * @type {number}
   */
  this.x = x;

  /**
   * The y-coordinate for the point.
   * @type {number}
   */
  this.y = y;

  /**
   * Optional value associated with the point.
   * @type {*}
   */
  this.value = goog.isDef(opt_value) ? opt_value : null;
};

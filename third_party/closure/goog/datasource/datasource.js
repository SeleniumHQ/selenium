// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Generic rich data access API.
 *
 * Abstraction for data sources that allows listening for changes at different
 * levels of the data tree and updating the data via XHR requests
 *
 */


goog.provide('goog.ds.BaseDataNode');
goog.provide('goog.ds.BasicNodeList');
goog.provide('goog.ds.DataNode');
goog.provide('goog.ds.DataNodeList');
goog.provide('goog.ds.EmptyNodeList');
goog.provide('goog.ds.LoadState');
goog.provide('goog.ds.SortedNodeList');
goog.provide('goog.ds.Util');
goog.provide('goog.ds.logger');

goog.require('goog.array');
goog.require('goog.debug.Logger');



/**
 * Interface for node in rich data tree.
 *
 * Names that are reserved for system use and shouldn't be used for data node
 * names: eval, toSource, toString, unwatch, valueOf, watch. Behavior is
 * undefined if these names are used.
 *
 * @constructor
 */
goog.ds.DataNode = function() {};


/**
 * Get the value of the node
 * @return {Object} The value of the node, or null if no value.
 */
goog.ds.DataNode.prototype.get = goog.nullFunction;


/**
 * Set the value of the node
 * @param {Object} value The new value of the node.
 */
goog.ds.DataNode.prototype.set = goog.nullFunction;


/**
 * Gets all of the child nodes of the current node.
 * Should return an empty DataNode list if no child nodes.
 * @param {string=} opt_selector String selector to choose child nodes.
 * @return {goog.ds.DataNodeList} The child nodes.
 */
goog.ds.DataNode.prototype.getChildNodes = goog.nullFunction;


/**
 * Gets a named child node of the current node
 * @param {string} name The node name.
 * @param {boolean=} opt_canCreate Whether to create a child node if it does not
 *     exist.
 * @return {goog.ds.DataNode} The child node, or null
 * if no node of this name exists.
 */
goog.ds.DataNode.prototype.getChildNode = goog.nullFunction;


/**
 * Gets the value of a child node
 * @param {string} name The node name.
 * @return {Object} The value of the node, or null if no value or the child node
 *     doesn't exist.
 */
goog.ds.DataNode.prototype.getChildNodeValue = goog.nullFunction;


/**
 * Sets a named child node of the current node.
 *
 * @param {string} name The node name.
 * @param {Object} value The value to set, can be DataNode, object, property,
 *     or null. If value is null, removes the child node.
 * @return {Object} The child node, if the node was set.
 */
goog.ds.DataNode.prototype.setChildNode = goog.nullFunction;


/**
 * Get the name of the node relative to the parent node
 * @return {string} The name of the node.
 */
goog.ds.DataNode.prototype.getDataName = goog.nullFunction;


/**
 * Set the name of the node relative to the parent node
 * @param {string} name The name of the node.
 */
goog.ds.DataNode.prototype.setDataName = goog.nullFunction;


/**
 * Gets the a qualified data path to this node
 * @return {string} The data path.
 */
goog.ds.DataNode.prototype.getDataPath = goog.nullFunction;


/**
 * Load or reload the backing data for this node
 */
goog.ds.DataNode.prototype.load = goog.nullFunction;


/**
 * Gets the state of the backing data for this node
 * @return {goog.ds.LoadState} The state.
 */
goog.ds.DataNode.prototype.getLoadState = null;


/**
 * Whether the value of this node is a homogeneous list of data
 * @return {boolean} True if a list.
 */
goog.ds.DataNode.prototype.isList = goog.nullFunction;


/**
 * Enum for load state of a DataNode.
 * @enum {string}
 */
goog.ds.LoadState = {
  LOADED: 'LOADED',
  LOADING: 'LOADING',
  FAILED: 'FAILED',
  NOT_LOADED: 'NOT_LOADED'
};



/**
 * Base class for data node functionality, has default implementations for
 * many of the functions.
 *
 * implements goog.ds.DataNode
 * @constructor
 */
goog.ds.BaseDataNode = function() {};


/**
 * Set the value of the node
 * @param {Object} value The new value of the node.
 */
goog.ds.BaseDataNode.prototype.set = goog.nullFunction;


/**
 * Gets all of the child nodes of the current node.
 * Should return an empty DataNode list if no child nodes.
 * @param {string=} opt_selector String selector to choose child nodes.
 * @return {goog.ds.DataNodeList} The child nodes.
 */
goog.ds.BaseDataNode.prototype.getChildNodes = function(opt_selector) {
  return new goog.ds.EmptyNodeList();
};


/**
 * Gets a named child node of the current node
 * @param {string} name The node name.
 * @param {boolean=} opt_canCreate Whether you can create the child node if
 *     it doesn't exist already.
 * @return {goog.ds.DataNode} The child node, or null if no node of
 *     this name exists and opt_create is false.
 */
goog.ds.BaseDataNode.prototype.getChildNode = function(name, opt_canCreate) {
  return null;
};


/**
 * Gets the value of a child node
 * @param {string} name The node name.
 * @return {Object} The value of the node, or null if no value or the
 *     child node doesn't exist.
 */
goog.ds.BaseDataNode.prototype.getChildNodeValue = function(name) {
  return null;
};


/**
 * Get the name of the node relative to the parent node
 * @return {string} The name of the node.
 */
goog.ds.BaseDataNode.prototype.getDataName = goog.nullFunction;


/**
 * Gets the a qualified data path to this node
 * @return {string} The data path.
 */
goog.ds.BaseDataNode.prototype.getDataPath = function() {
  var parentPath = '';
  var myName = this.getDataName();
  if (this.getParent_ && this.getParent_()) {
    parentPath = this.getParent_().getDataPath() +
        (myName.indexOf(goog.ds.STR_ARRAY_START) != -1 ? '' :
        goog.ds.STR_PATH_SEPARATOR);
  }

  return parentPath + myName;
};


/**
 * Load or reload the backing data for this node
 */
goog.ds.BaseDataNode.prototype.load = goog.nullFunction;


/**
 * Gets the state of the backing data for this node
 * @return {goog.ds.LoadState} The state.
 */
goog.ds.BaseDataNode.prototype.getLoadState = function() {
  return goog.ds.LoadState.LOADED;
};


/**
 * Gets the parent node. Subclasses implement this function
 * @type {Function}
 * @protected
 * @suppress {underscore}
 */
goog.ds.BaseDataNode.prototype.getParent_ = null;


/**
 * Interface for node list in rich data tree.
 *
 * Has both map and list-style accessors
 *
 * @constructor
 * @extends {goog.ds.DataNode}
 */
// TODO(user): Use interfaces when available.
goog.ds.DataNodeList = function() {};


/**
 * Add a node to the node list.
 * If the node has a dataName, uses this for the key in the map.
 *
 * @param {goog.ds.DataNode} node The node to add.
 */
goog.ds.DataNodeList.prototype.add = goog.nullFunction;


/**
 * Get a node by string key.
 * Returns null if node doesn't exist.
 *
 * @param {string} key String lookup key.
 * @return {goog.ds.DataNode} The node, or null if doesn't exist.
 */
goog.ds.DataNodeList.prototype.get = goog.nullFunction;


/**
 * Get a node by index
 * Returns null if the index is out of range
 *
 * @param {number} index The index of the node.
 * @return {goog.ds.DataNode} The node, or null if doesn't exist.
 */
goog.ds.DataNodeList.prototype.getByIndex = goog.nullFunction;


/**
 * Gets the size of the node list
 *
 * @return {number} The size of the list.
 */
goog.ds.DataNodeList.prototype.getCount = goog.nullFunction;


/**
 * Sets a node in the list of a given name
 * @param {string} name Name of the node.
 * @param {goog.ds.DataNode} node The node.
 */
goog.ds.DataNodeList.prototype.setNode = goog.nullFunction;


/**
 * Removes a node in the list of a given name
 * @param {string} name Name of the node.
 * @return {boolean} True if node existed and was deleted.
 */
goog.ds.DataNodeList.prototype.removeNode = goog.nullFunction;


/**
 * Simple node list implementation with underlying array and map
 * implements goog.ds.DataNodeList.
 *
 * Names that are reserved for system use and shouldn't be used for data node
 * names: eval, toSource, toString, unwatch, valueOf, watch. Behavior is
 * undefined if these names are used.
 *
 * @param {Array.<goog.ds.DataNode>=} opt_nodes optional nodes to add to list.
 * @constructor
 * @extends {goog.ds.DataNodeList}
 */
// TODO(user): Use interfaces when available.
goog.ds.BasicNodeList = function(opt_nodes) {
  this.map_ = {};
  this.list_ = [];
  this.indexMap_ = {};
  if (opt_nodes) {
    for (var i = 0, node; node = opt_nodes[i]; i++) {
      this.add(node);
    }
  }
};


/**
 * Add a node to the node list.
 * If the node has a dataName, uses this for the key in the map.
 * TODO(user) Remove function as well
 *
 * @param {goog.ds.DataNode} node The node to add.
 */
goog.ds.BasicNodeList.prototype.add = function(node) {
  this.list_.push(node);
  var dataName = node.getDataName();
  if (dataName) {
    this.map_[dataName] = node;
    this.indexMap_[dataName] = this.list_.length - 1;
  }
};


/**
 * Get a node by string key.
 * Returns null if node doesn't exist.
 *
 * @param {string} key String lookup key.
 * @return {goog.ds.DataNode} The node, or null if doesn't exist.
 */
goog.ds.BasicNodeList.prototype.get = function(key) {
  return this.map_[key] || null;
};


/**
 * Get a node by index
 * Returns null if the index is out of range
 *
 * @param {number} index The index of the node.
 * @return {goog.ds.DataNode} The node, or null if doesn't exist.
 */
goog.ds.BasicNodeList.prototype.getByIndex = function(index) {
  return this.list_[index] || null;
};


/**
 * Gets the size of the node list
 *
 * @return {number} The size of the list.
 */
goog.ds.BasicNodeList.prototype.getCount = function() {
  return this.list_.length;
};


/**
 * Sets a node in the list of a given name
 * @param {string} name Name of the node.
 * @param {goog.ds.DataNode} node The node.
 */
goog.ds.BasicNodeList.prototype.setNode = function(name, node) {
  if (node == null) {
    this.removeNode(name);
  } else {
    var existingNode = this.indexMap_[name];
    if (existingNode != null) {
      this.map_[name] = node;
      this.list_[existingNode] = node;
    } else {
      this.add(node);
    }
  }
};


/**
 * Removes a node in the list of a given name
 * @param {string} name Name of the node.
 * @return {boolean} True if node existed and was deleted.
 */
goog.ds.BasicNodeList.prototype.removeNode = function(name) {
  var existingNode = this.indexMap_[name];
  if (existingNode != null) {
    this.list_.splice(existingNode, 1);
    delete this.map_[name];
    delete this.indexMap_[name];
    for (var index in this.indexMap_) {
      if (this.indexMap_[index] > existingNode) {
        this.indexMap_[index]--;
      }
    }
  }
  return existingNode != null;
};


/**
 * Get the index of a named node
 * @param {string} name The name of the node to get the index of.
 * @return {number|undefined} The index.
 */
goog.ds.BasicNodeList.prototype.indexOf = function(name) {
  return this.indexMap_[name];
};


/**
 * Immulatable empty node list
 * @extends {goog.ds.BasicNodeList}
 * @constructor
 */

goog.ds.EmptyNodeList = function() {
  goog.ds.BasicNodeList.call(this);
};
goog.inherits(goog.ds.EmptyNodeList, goog.ds.BasicNodeList);


/**
 * Add a node to the node list.
 * If the node has a dataName, uses this for the key in the map.
 *
 * @param {goog.ds.DataNode} node The node to add.
 */
goog.ds.EmptyNodeList.prototype.add = function(node) {
  throw Error('Can\'t add to EmptyNodeList');
};



/**
 * Node list implementation which maintains sort order during insertion and
 * modification operations based on a comparison function.
 *
 * The SortedNodeList does not guarantee sort order will be maintained if
 * the underlying data nodes are modified externally.
 *
 * Names that are reserved for system use and shouldn't be used for data node
 * names: eval, toSource, toString, unwatch, valueOf, watch. Behavior is
 * undefined if these names are used.
 *
 * @param {Function} compareFn Comparison function by which the
 *     node list is sorted. Should take 2 arguments to compare, and return a
 *     negative integer, zero, or a positive integer depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @param {Array.<goog.ds.DataNode>=} opt_nodes optional nodes to add to list;
 *    these are assumed to be in sorted order.
 * @extends {goog.ds.BasicNodeList}
 * @constructor
 */
goog.ds.SortedNodeList = function(compareFn, opt_nodes) {
  this.compareFn_ = compareFn;
  goog.ds.BasicNodeList.call(this, opt_nodes);
};
goog.inherits(goog.ds.SortedNodeList, goog.ds.BasicNodeList);


/**
 * Add a node to the node list, maintaining sort order.
 * If the node has a dataName, uses this for the key in the map.
 *
 * @param {goog.ds.DataNode} node The node to add.
 */
goog.ds.SortedNodeList.prototype.add = function(node) {
  if (!this.compareFn_) {
    this.append(node);
    return;
  }

  var searchLoc = goog.array.binarySearch(this.list_, node, this.compareFn_);

  // if there is another node that is "equal" according to the comparison
  // function, insert before that one; otherwise insert at the location
  // goog.array.binarySearch indicated
  if (searchLoc < 0) {
    searchLoc = -(searchLoc + 1);
  }

  // update any indexes that are after the insertion point
  for (var index in this.indexMap_) {
    if (this.indexMap_[index] >= searchLoc) {
      this.indexMap_[index]++;
    }
  }

  goog.array.insertAt(this.list_, node, searchLoc);
  var dataName = node.getDataName();
  if (dataName) {
    this.map_[dataName] = node;
    this.indexMap_[dataName] = searchLoc;
  }
};


/**
 * Adds the given node to the end of the SortedNodeList. This should
 * only be used when the caller can guarantee that the sort order will
 * be maintained according to this SortedNodeList's compareFn (e.g.
 * when initializing a new SortedNodeList from a list of nodes that has
 * already been sorted).
 * @param {goog.ds.DataNode} node The node to append.
 */
goog.ds.SortedNodeList.prototype.append = function(node) {
  goog.ds.SortedNodeList.superClass_.add.call(this, node);
};


/**
 * Sets a node in the list of a given name, maintaining sort order.
 * @param {string} name Name of the node.
 * @param {goog.ds.DataNode} node The node.
 */
goog.ds.SortedNodeList.prototype.setNode = function(name, node) {
  if (node == null) {
    this.removeNode(name);
  } else {
    var existingNode = this.indexMap_[name];
    if (existingNode != null) {
      if (this.compareFn_) {
        var compareResult = this.compareFn_(this.list_[existingNode], node);
        if (compareResult == 0) {
          // the new node can just replace the old one
          this.map_[name] = node;
          this.list_[existingNode] = node;
        } else {
          // remove the old node, then add the new one
          this.removeNode(name);
          this.add(node);
        }
      }
    } else {
      this.add(node);
    }
  }
};


/**
 * The character denoting an attribute.
 * @type {string}
 * @private
 */
goog.ds.STR_ATTRIBUTE_START_ = '@';


/**
 * The character denoting all children.
 * @type {string}
 */
goog.ds.STR_ALL_CHILDREN_SELECTOR = '*';


/**
 * The wildcard character.
 * @type {string}
 */
goog.ds.STR_WILDCARD = '*';


/**
 * The character denoting path separation.
 * @type {string}
 */
goog.ds.STR_PATH_SEPARATOR = '/';


/**
 * The character denoting the start of an array.
 * @type {string}
 */
goog.ds.STR_ARRAY_START = '[';


/**
 * Shared logger instance for data package
 * @type {goog.debug.Logger}
 */
goog.ds.logger = goog.debug.Logger.getLogger('goog.ds');


/**
 * Create a data node that references another data node,
 * useful for pointer-like functionality.
 * All functions will return same values as the original node except for
 * getDataName()
 * @param {!goog.ds.DataNode} node The original node.
 * @param {string} name The new name.
 * @return {!goog.ds.DataNode} The new data node.
 */
goog.ds.Util.makeReferenceNode = function(node, name) {
  /**
   * @constructor
   * @extends {goog.ds.DataNode}
   */
  var nodeCreator = function() {};
  nodeCreator.prototype = node;
  var newNode = new nodeCreator();
  newNode.getDataName = function() {
    return name;
  };
  return newNode;
};

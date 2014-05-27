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
 * @fileoverview
 * Efficient implementation of DataNode API.
 *
 * The implementation consists of three concrete classes for modelling
 * DataNodes with different characteristics: FastDataNode,
 * FastPrimitiveDataNode and FastListNode.
 *
 * FastDataNode is for bean-like or map-like objects that consists of
 * key/value mappings and where the primary access pattern is by key.
 *
 * FastPrimitiveDataNode wraps primitives like strings, boolean, and numbers.
 *
 * FastListNode is for array-like data nodes. It also supports key-based
 * lookups if the data nodes have an "id" property or if child nodes are
 * explicitly added by name. It is most efficient if these features are not
 * used.
 *
 * FastDataNodes can be constructed from JSON-like objects via the function
 * goog.ds.FastDataNode.fromJs.

 */

goog.provide('goog.ds.AbstractFastDataNode');
goog.provide('goog.ds.FastDataNode');
goog.provide('goog.ds.FastListNode');
goog.provide('goog.ds.PrimitiveFastDataNode');

goog.require('goog.ds.DataManager');
goog.require('goog.ds.EmptyNodeList');
goog.require('goog.string');

/*
 * Implementation note: In order to reduce the number of objects,
 * FastDataNode stores its key/value mappings directly in the FastDataNode
 * object iself (instead of a separate map). To make this work we have to
 * sure that there are no name clashes with other attribute names used by
 * FastDataNode (like dataName and parent). This is especially difficult in
 * the light of automatic renaming by the JavaScript compiler. For this reason,
 * all internal attributes start with "__" so that they are not renamed
 * by the compiler.
 */

/**
 * Creates a new abstract data node.
 * @param {string} dataName Name of the datanode.
 * @param {goog.ds.DataNode=} opt_parent Parent of this data node.
 * @constructor
 * @extends {goog.ds.DataNodeList}
 */
// TODO(arv): Use interfaces when available.
goog.ds.AbstractFastDataNode = function(dataName, opt_parent) {
  if (!dataName) {
    throw Error('Cannot create a fast data node without a data name');
  }
  this['__dataName'] = dataName;
  this['__parent'] = opt_parent;
};


/**
 * Return the name of this data node.
 * @return {string} Name of this data noden.
 * @override
 */
goog.ds.AbstractFastDataNode.prototype.getDataName = function() {
  return this['__dataName'];
};


/**
 * Set the name of this data node.
 * @param {string} value Name.
 * @override
 */
goog.ds.AbstractFastDataNode.prototype.setDataName = function(value) {
  this['__dataName'] = value;
};


/**
 * Get the path leading to this data node.
 * @return {string} Data path.
 * @override
 */
goog.ds.AbstractFastDataNode.prototype.getDataPath = function() {
  var parentPath;
  if (this['__parent']) {
    parentPath = this['__parent'].getDataPath() + goog.ds.STR_PATH_SEPARATOR;
  } else {
    parentPath = '';
  }
  return parentPath + this.getDataName();
};



/**
 * Creates a new fast data node, using the properties of root.
 * @param {Object} root JSON-like object to initialize data node from.
 * @param {string} dataName Name of this data node.
 * @param {goog.ds.DataNode=} opt_parent Parent of this data node.
 * @extends {goog.ds.AbstractFastDataNode}
 * @constructor
 */
goog.ds.FastDataNode = function(root, dataName, opt_parent) {
  goog.ds.AbstractFastDataNode.call(this, dataName, opt_parent);
  this.extendWith(root);
};
goog.inherits(goog.ds.FastDataNode, goog.ds.AbstractFastDataNode);


/**
 * Add all attributes of object to this data node.
 * @param {Object} object Object to add attributes from.
 * @protected
 */
goog.ds.FastDataNode.prototype.extendWith = function(object) {
  for (var key in object) {
    this[key] = object[key];
  }
};


/**
 * Creates a new FastDataNode structure initialized from object. This will
 * return an instance of the most suitable sub-class of FastDataNode.
 *
 * You should not modify object after creating a fast data node from it
 * or assume that changing object changes the data node. Doing so results
 * in undefined behaviour.
 *
 * @param {Object|number|boolean|string} object Object to initialize data
 *     node from.
 * @param {string} dataName Name of data node.
 * @param {goog.ds.DataNode=} opt_parent Parent of data node.
 * @return {!goog.ds.AbstractFastDataNode} Data node representing object.
 */
goog.ds.FastDataNode.fromJs = function(object, dataName, opt_parent) {
  if (goog.isArray(object)) {
    return new goog.ds.FastListNode(object, dataName, opt_parent);
  } else if (goog.isObject(object)) {
    return new goog.ds.FastDataNode(object, dataName, opt_parent);
  } else {
    return new goog.ds.PrimitiveFastDataNode(object || !!object,
                                             dataName,
                                             opt_parent);
  }
};


/**
 * Static instance of an empty list.
 * @type {!goog.ds.EmptyNodeList}
 * @private
 */
goog.ds.FastDataNode.emptyList_ = new goog.ds.EmptyNodeList();


/**
 * Not supported for normal FastDataNodes.
 * @param {*} value Value to set data node to.
 * @override
 */
goog.ds.FastDataNode.prototype.set = function(value) {
  throw 'Not implemented yet';
};


/** @override */
goog.ds.FastDataNode.prototype.getChildNodes = function(opt_selector) {
  if (!opt_selector || opt_selector == goog.ds.STR_ALL_CHILDREN_SELECTOR) {
    return this;
  } else if (opt_selector.indexOf(goog.ds.STR_WILDCARD) == -1) {
    var child = this.getChildNode(opt_selector);
    return child ? new goog.ds.FastListNode([child], '') :
        new goog.ds.EmptyNodeList();
  } else {
    throw Error('Unsupported selector: ' + opt_selector);
  }
};


/**
 * Makes sure that a named child is wrapped in a data node structure.
 * @param {string} name Name of child to wrap.
 * @private
 */
goog.ds.FastDataNode.prototype.wrapChild_ = function(name) {
  var child = this[name];
  if (child != null && !child.getDataName) {
    this[name] = goog.ds.FastDataNode.fromJs(this[name], name, this);
  }
};


/**
 * Get a child node by name.
 * @param {string} name Name of child node.
 * @param {boolean=} opt_create Whether to create the child if it does not
 * exist.
 * @return {goog.ds.DataNode} Child node.
 * @override
 */
goog.ds.FastDataNode.prototype.getChildNode = function(name, opt_create) {
  this.wrapChild_(name);
  // this[name] always is a data node object, so using "||" is fine.
  var child = this[name] || null;
  if (child == null && opt_create) {
    child = new goog.ds.FastDataNode({}, name, this);
    this[name] = child;
  }
  return child;
};


/**
 * Sets a child node. Creates the child if it does not exist.
 *
 * Calling  this function makes any child nodes previously obtained for name
 * invalid. You should not use these child nodes but instead obtain a new
 * instance by calling getChildNode.
 *
 * @override
 */
goog.ds.FastDataNode.prototype.setChildNode = function(name, value) {
  if (value != null) {
    this[name] = value;
  } else {
    delete this[name];
  }
  goog.ds.DataManager.getInstance().fireDataChange(this.getDataPath() +
      goog.ds.STR_PATH_SEPARATOR + name);
  return null;
};


/**
 * Returns the value of a child node. By using this method you can avoid
 * the need to create PrimitiveFastData nodes.
 * @param {string} name Name of child node.
 * @return {Object} Value of child node.
 * @override
 */
goog.ds.FastDataNode.prototype.getChildNodeValue = function(name) {
  var child = this[name];
  if (child != null) {
    return (child.getDataName ? child.get() : child);
  } else {
    return null;
  }
};


/**
 * Returns whether this data node is a list. Always returns false for
 * instances of FastDataNode but may return true for subclasses.
 * @return {boolean} Whether this data node is array-like.
 * @override
 */
goog.ds.FastDataNode.prototype.isList = function() {
  return false;
};


/**
 * Returns a javascript object representation of this data node. You should
 * not modify the object returned by this function.
 * @return {!Object} Javascript object representation of this data node.
 */
goog.ds.FastDataNode.prototype.getJsObject = function() {
  var result = {};
  for (var key in this) {
    if (!goog.string.startsWith(key, '__') && !goog.isFunction(this[key])) {
      result[key] = (this[key]['__dataName'] ? this[key].getJsObject() :
          this[key]);
    }
  }
  return result;
};


/**
 * Creates a deep copy of this data node.
 * @return {goog.ds.FastDataNode} Clone of this data node.
 */
goog.ds.FastDataNode.prototype.clone = function() {
  return /** @type {goog.ds.FastDataNode} */(goog.ds.FastDataNode.fromJs(
      this.getJsObject(), this.getDataName()));
};


/*
 * Implementation of goog.ds.DataNodeList for FastDataNode.
 */


/**
 * Adds a child to this data node.
 * @param {goog.ds.DataNode} value Child node to add.
 * @override
 */
goog.ds.FastDataNode.prototype.add = function(value) {
  this.setChildNode(value.getDataName(), value);
};


/**
 * Gets the value of this data node (if called without opt_key) or
 * gets a child node (if called with opt_key).
 * @param {string=} opt_key Name of child node.
 * @return {*} This data node or a child node.
 * @override
 */
goog.ds.FastDataNode.prototype.get = function(opt_key) {
  if (!goog.isDef(opt_key)) {
    // if there is no key, DataNode#get was called
    return this;
  } else {
    return this.getChildNode(opt_key);
  }
};


/**
 * Gets a child node by index. This method has a complexity of O(n) where
 * n is the number of children. If you need a faster implementation of this
 * method, you should use goog.ds.FastListNode.
 * @param {number} index Index of child node (starting from 0).
 * @return {goog.ds.DataNode} Child node at specified index.
 * @override
 */
goog.ds.FastDataNode.prototype.getByIndex = function(index) {
  var i = 0;
  for (var key in this) {
    if (!goog.string.startsWith(key, '__') && !goog.isFunction(this[key])) {
      if (i == index) {
        this.wrapChild_(key);
        return this[key];
      }
      ++i;
    }
  }
  return null;
};


/**
 * Gets the number of child nodes. This method has a complexity of O(n) where
 * n is the number of children. If you need a faster implementation of this
 * method, you should use goog.ds.FastListNode.
 * @return {number} Number of child nodes.
 * @override
 */
goog.ds.FastDataNode.prototype.getCount = function() {
  var count = 0;
  for (var key in this) {
    if (!goog.string.startsWith(key, '__') && !goog.isFunction(this[key])) {
      ++count;
    }
  }
  // maybe cache this?
  return count;
};


/**
 * Sets a child node.
 * @param {string} name Name of child node.
 * @param {Object} value Value of child node.
 * @override
 */
goog.ds.FastDataNode.prototype.setNode = function(name, value) {
  this.setChildNode(name, value);
};


/**
 * Removes a child node.
 * @override
 */
goog.ds.FastDataNode.prototype.removeNode = function(name) {
  delete this[name];
  return false;
};



/**
 * Creates a new data node wrapping a primitive value.
 * @param {number|boolean|string} value Value the value to wrap.
 * @param {string} dataName name Name of this data node.
 * @param {goog.ds.DataNode=} opt_parent Parent of this data node.
 * @extends {goog.ds.AbstractFastDataNode}
 * @constructor
 * @final
 */
goog.ds.PrimitiveFastDataNode = function(value, dataName, opt_parent) {
  this.value_ = value;
  goog.ds.AbstractFastDataNode.call(this, dataName, opt_parent);
};
goog.inherits(goog.ds.PrimitiveFastDataNode, goog.ds.AbstractFastDataNode);


/**
 * Returns the value of this data node.
 * @return {(boolean|number|string)} Value of this data node.
 * @override
 */
goog.ds.PrimitiveFastDataNode.prototype.get = function() {
  return this.value_;
};


/**
 * Sets this data node to a new value.
 * @param {*} value Value to set data node to.
 * @override
 */
goog.ds.PrimitiveFastDataNode.prototype.set = function(value) {
  if (goog.isArray(value) || goog.isObject(value)) {
    throw Error('can only set PrimitiveFastDataNode to primitive values');
  }
  this.value_ = value;
  goog.ds.DataManager.getInstance().fireDataChange(this.getDataPath());
};


/**
 * Returns child nodes of this data node. Always returns an unmodifiable,
 * empty list.
 * @return {!goog.ds.DataNodeList} (Empty) list of child nodes.
 * @override
 */
goog.ds.PrimitiveFastDataNode.prototype.getChildNodes = function() {
  return goog.ds.FastDataNode.emptyList_;
};


/**
 * Get a child node by name. Always returns null.
 * @param {string} name Name of child node.
 * @return {goog.ds.DataNode} Child node.
 * @override
 */
goog.ds.PrimitiveFastDataNode.prototype.getChildNode = function(name) {
  return null;
};


/**
 * Returns the value of a child node. Always returns null.
 * @param {string} name Name of child node.
 * @return {Object} Value of child node.
 * @override
 */
goog.ds.PrimitiveFastDataNode.prototype.getChildNodeValue = function(name) {
  return null;
};


/**
 * Not supported by primitive data nodes.
 * @param {string} name Name of child node.
 * @param {Object} value Value of child node.
 * @override
 */
goog.ds.PrimitiveFastDataNode.prototype.setChildNode =
    function(name, value) {
  throw Error('Cannot set a child node for a PrimitiveFastDataNode');
};


/**
 * Returns whether this data node is a list. Always returns false for
 * instances of PrimitiveFastDataNode.
 * @return {boolean} Whether this data node is array-like.
 * @override
 */
goog.ds.PrimitiveFastDataNode.prototype.isList = function() {
  return false;
};


/**
 * Returns a javascript object representation of this data node. You should
 * not modify the object returned by this function.
 * @return {*} Javascript object representation of this data node.
 */
goog.ds.PrimitiveFastDataNode.prototype.getJsObject = function() {
  return this.value_;
};


/**
 * Creates a new list node from an array.
 * @param {Array} values values hold by this list node.
 * @param {string} dataName name of this node.
 * @param {goog.ds.DataNode=} opt_parent parent of this node.
 * @extends {goog.ds.AbstractFastDataNode}
 * @constructor
 * @final
 */
// TODO(arv): Use interfaces when available.  This implements DataNodeList
// as well.
goog.ds.FastListNode = function(values, dataName, opt_parent) {
  this.values_ = [];
  for (var i = 0; i < values.length; ++i) {
    var name = values[i].id || ('[' + i + ']');
    this.values_.push(goog.ds.FastDataNode.fromJs(values[i], name, this));
    if (values[i].id) {
      if (!this.map_) {
        this.map_ = {};
      }
      this.map_[values[i].id] = i;
    }
  }
  goog.ds.AbstractFastDataNode.call(this, dataName, opt_parent);
};
goog.inherits(goog.ds.FastListNode, goog.ds.AbstractFastDataNode);


/**
 * Not supported for FastListNodes.
 * @param {*} value Value to set data node to.
 * @override
 */
goog.ds.FastListNode.prototype.set = function(value) {
  throw Error('Cannot set a FastListNode to a new value');
};


/**
 * Returns child nodes of this data node. Currently, only supports
 * returning all children.
 * @return {!goog.ds.DataNodeList} List of child nodes.
 * @override
 */
goog.ds.FastListNode.prototype.getChildNodes = function() {
  return this;
};


/**
 * Get a child node by name.
 * @param {string} key Name of child node.
 * @param {boolean=} opt_create Whether to create the child if it does not
 * exist.
 * @return {goog.ds.DataNode} Child node.
 * @override
 */
goog.ds.FastListNode.prototype.getChildNode = function(key, opt_create) {
  var index = this.getKeyAsNumber_(key);
  if (index == null && this.map_) {
    index = this.map_[key];
  }
  if (index != null && this.values_[index]) {
    return this.values_[index];
  } else if (opt_create) {
    this.setChildNode(key, {});
    return this.getChildNode(key);
  } else {
    return null;
  }
};


/**
 * Returns the value of a child node.
 * @param {string} key Name of child node.
 * @return {*} Value of child node.
 * @override
 */
goog.ds.FastListNode.prototype.getChildNodeValue = function(key) {
  var child = this.getChildNode(key);
  return (child ? child.get() : null);
};


/**
 * Tries to interpret key as a numeric index enclosed by square brakcets.
 * @param {string} key Key that should be interpreted as a number.
 * @return {?number} Numeric index or null if key is not of the form
 *  described above.
 * @private
 */
goog.ds.FastListNode.prototype.getKeyAsNumber_ = function(key) {
  if (key.charAt(0) == '[' && key.charAt(key.length - 1) == ']') {
    return Number(key.substring(1, key.length - 1));
  } else {
    return null;
  }
};


/**
 * Sets a child node. Creates the child if it does not exist. To set
 * children at a certain index, use a key of the form '[index]'. Note, that
 * you can only set values at existing numeric indices. To add a new node
 * to this list, you have to use the add method.
 *
 * Calling  this function makes any child nodes previously obtained for name
 * invalid. You should not use these child nodes but instead obtain a new
 * instance by calling getChildNode.
 *
 * @override
 */
goog.ds.FastListNode.prototype.setChildNode = function(key, value) {
  var count = this.values_.length;
  if (value != null) {
    if (!value.getDataName) {
      value = goog.ds.FastDataNode.fromJs(value, key, this);
    }
    var index = this.getKeyAsNumber_(key);
    if (index != null) {
      if (index < 0 || index >= this.values_.length) {
        throw Error('List index out of bounds: ' + index);
      }
      this.values_[key] = value;
    } else {
      if (!this.map_) {
        this.map_ = {};
      }
      this.values_.push(value);
      this.map_[key] = this.values_.length - 1;
    }
  } else {
    this.removeNode(key);
  }
  var dm = goog.ds.DataManager.getInstance();
  dm.fireDataChange(this.getDataPath() + goog.ds.STR_PATH_SEPARATOR + key);
  if (this.values_.length != count) {
    this.listSizeChanged_();
  }
  return null;
};


/**
 * Fire data changes that are appropriate when the size of this list changes.
 * Should be called whenever the list size has changed.
 * @private
 */
goog.ds.FastListNode.prototype.listSizeChanged_ = function() {
  var dm = goog.ds.DataManager.getInstance();
  dm.fireDataChange(this.getDataPath());
  dm.fireDataChange(this.getDataPath() + goog.ds.STR_PATH_SEPARATOR +
      'count()');
};


/**
 * Returns whether this data node is a list. Always returns true.
 * @return {boolean} Whether this data node is array-like.
 * @override
 */
goog.ds.FastListNode.prototype.isList = function() {
  return true;
};


/**
 * Returns a javascript object representation of this data node. You should
 * not modify the object returned by this function.
 * @return {!Object} Javascript object representation of this data node.
 */
goog.ds.FastListNode.prototype.getJsObject = function() {
  var result = [];
  for (var i = 0; i < this.values_.length; ++i) {
    result.push(this.values_[i].getJsObject());
  }
  return result;
};


/*
 * Implementation of goog.ds.DataNodeList for FastListNode.
 */


/**
 * Adds a child to this data node
 * @param {goog.ds.DataNode} value Child node to add.
 * @override
 */
goog.ds.FastListNode.prototype.add = function(value) {
  if (!value.getDataName) {
    value = goog.ds.FastDataNode.fromJs(value,
        String('[' + (this.values_.length) + ']'), this);
  }
  this.values_.push(value);
  var dm = goog.ds.DataManager.getInstance();
  dm.fireDataChange(this.getDataPath() + goog.ds.STR_PATH_SEPARATOR +
      '[' + (this.values_.length - 1) + ']');
  this.listSizeChanged_();
};


/**
 * Gets the value of this data node (if called without opt_key) or
 * gets a child node (if called with opt_key).
 * @param {string=} opt_key Name of child node.
 * @return {Array|goog.ds.DataNode} Array of child nodes (if called without
 *     opt_key), or a named child node otherwise.
 * @override
 */
goog.ds.FastListNode.prototype.get = function(opt_key) {
  // if there are no arguments, DataNode.get was called
  if (!goog.isDef(opt_key)) {
    return this.values_;
  } else {
    return this.getChildNode(opt_key);
  }
};


/**
 * Gets a child node by (numeric) index.
 * @param {number} index Index of child node (starting from 0).
 * @return {goog.ds.DataNode} Child node at specified index.
 * @override
 */
goog.ds.FastListNode.prototype.getByIndex = function(index) {
  var child = this.values_[index];
  return (child != null ? child : null); // never return undefined
};


/**
 * Gets the number of child nodes.
 * @return {number} Number of child nodes.
 * @override
 */
goog.ds.FastListNode.prototype.getCount = function() {
  return this.values_.length;
};


/**
 * Sets a child node.
 * @param {string} name Name of child node.
 * @param {Object} value Value of child node.
 * @override
 */
goog.ds.FastListNode.prototype.setNode = function(name, value) {
  throw Error('Setting child nodes of a FastListNode is not implemented, yet');
};


/**
 * Removes a child node.
 * @override
 */
goog.ds.FastListNode.prototype.removeNode = function(name) {
  var index = this.getKeyAsNumber_(name);
  if (index == null && this.map_) {
    index = this.map_[name];
  }
  if (index != null) {
    this.values_.splice(index, 1);
    if (this.map_) {
      var keyToDelete = null;
      for (var key in this.map_) {
        if (this.map_[key] == index) {
          keyToDelete = key;
        } else if (this.map_[key] > index) {
          --this.map_[key];
        }
      }
      if (keyToDelete) {
        delete this.map_[keyToDelete];
      }
    }
    var dm = goog.ds.DataManager.getInstance();
    dm.fireDataChange(this.getDataPath() + goog.ds.STR_PATH_SEPARATOR +
        '[' + index + ']');
    this.listSizeChanged_();
  }
  return false;
};


/**
 * Returns the index of a named child nodes. This method only works if
 * this list uses mixed name/indexed lookup, i.e. if its child node have
 * an 'id' attribute.
 * @param {string} name Name of child node to determine index of.
 * @return {number} Index of child node named name.
 */
goog.ds.FastListNode.prototype.indexOf = function(name) {
  var index = this.getKeyAsNumber_(name);
  if (index == null && this.map_) {
    index = this.map_[name];
  }
  if (index == null) {
    throw Error('Cannot determine index for: ' + name);
  }
  return /** @type {number} */(index);
};

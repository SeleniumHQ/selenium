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
 * @fileoverview An implementation of DataNode for wrapping JS data.
 *
 */


goog.provide('goog.ds.JsDataSource');
goog.provide('goog.ds.JsPropertyDataSource');

goog.require('goog.ds.BaseDataNode');
goog.require('goog.ds.BasicNodeList');
goog.require('goog.ds.DataManager');
goog.require('goog.ds.DataNode');
goog.require('goog.ds.EmptyNodeList');
goog.require('goog.ds.LoadState');


/**
 * Data source whose backing is JavaScript data
 *
 * Names that are reserved for system use and shouldn't be used for data node
 * names: eval, toSource, toString, unwatch, valueOf, watch. Behavior is
 * undefined if these names are used.
 *
 * @param {Object} root The root JS node.
 * @param {string} dataName The name of this node relative to the parent node.
 * @param {Object=} opt_parent Optional parent of this JsDataSource.
 *
 * implements goog.ds.DataNode.
 * @constructor
 * @extends {goog.ds.DataNode}
 */
// TODO(arv): Use interfaces when available.
goog.ds.JsDataSource = function(root, dataName, opt_parent) {
  this.parent_ = opt_parent;
  this.dataName_ = dataName;
  this.setRoot(root);
};


/**
 * The root JS object. Can be null.
 * @type {*}
 * @protected
 * @suppress {underscore|visibility}
 */
goog.ds.JsDataSource.prototype.root_;


/**
 * Sets the root JS object
 * @param {Object} root The root JS object. Can be null.
 *
 * @protected
 */
goog.ds.JsDataSource.prototype.setRoot = function(root) {
  this.root_ = root;
  this.childNodeList_ = null;
};


/**
 * Set this data source to use list semantics. List data sources:
 * - Are assumed to have child nodes of all of the same type of data
 * - Fire data changes on the root node of the list whenever children
 *     are added or removed
 * @param {?boolean} isList True to use list semantics.
 * @private
 */
goog.ds.JsDataSource.prototype.setIsList_ = function(isList) {
  this.isList_ = isList;
};


/** @override */
goog.ds.JsDataSource.prototype.get = function() {
  return !goog.isObject(this.root_) ? this.root_ : this.getChildNodes();
};


/**
 * Set the value of the node
 * @param {*} value The new value of the node.
 * @override
 */
goog.ds.JsDataSource.prototype.set = function(value) {
  if (value && goog.isObject(this.root_)) {
    throw Error('Can\'t set group nodes to new values yet');
  }

  if (this.parent_) {
    this.parent_.root_[this.dataName_] = value;
  }
  this.root_ = value;
  this.childNodeList_ = null;

  goog.ds.DataManager.getInstance().fireDataChange(this.getDataPath());
};


/**
 * TODO(user) revisit lazy creation.
 * @override
 */
goog.ds.JsDataSource.prototype.getChildNodes = function(opt_selector) {
  if (!this.root_) {
    return new goog.ds.EmptyNodeList();
  }

  if (!opt_selector || opt_selector == goog.ds.STR_ALL_CHILDREN_SELECTOR) {
    this.createChildNodes_(false);
    return this.childNodeList_;
  } else if (opt_selector.indexOf(goog.ds.STR_WILDCARD) == -1) {
    if (this.root_[opt_selector] != null) {
      return new goog.ds.BasicNodeList([this.getChildNode(opt_selector)]);
    } else {
      return new goog.ds.EmptyNodeList();
    }
  } else {
    throw Error('Selector not supported yet (' + opt_selector + ')');
  }

};


/**
 * Creates the DataNodeList with the child nodes for this element.
 * Allows for only building list as needed.
 *
 * @param {boolean=} opt_force Whether to force recreating child nodes,
 *     defaults to false.
 * @private
 */
goog.ds.JsDataSource.prototype.createChildNodes_ = function(opt_force) {
  if (this.childNodeList_ && !opt_force) {
    return;
  }

  if (!goog.isObject(this.root_)) {
    this.childNodeList_ = new goog.ds.EmptyNodeList();
    return;
  }

  var childNodeList = new goog.ds.BasicNodeList();
  var newNode;
  if (goog.isArray(this.root_)) {
    var len = this.root_.length;
    for (var i = 0; i < len; i++) {
      // "id" is reserved node name that will map to a named child node
      // TODO(user) Configurable logic for choosing id node
      var node = this.root_[i];
      var id = node.id;
      var name = id != null ? String(id) : '[' + i + ']';
      newNode = new goog.ds.JsDataSource(node, name, this);
      childNodeList.add(newNode);
    }
  } else {
    for (var name in this.root_) {
      var obj = this.root_[name];
      // If the node is already a datasource, then add it.
      if (obj.getDataName) {
        childNodeList.add(obj);
      } else if (!goog.isFunction(obj)) {
        newNode = new goog.ds.JsDataSource(obj, name, this);
        childNodeList.add(newNode);
      }
    }
  }
  this.childNodeList_ = childNodeList;
};


/**
 * Gets a named child node of the current node
 * @param {string} name The node name.
 * @param {boolean=} opt_canCreate If true, can create child node.
 * @return {goog.ds.DataNode} The child node, or null if no node of
 *     this name exists.
 * @override
 */
goog.ds.JsDataSource.prototype.getChildNode = function(name, opt_canCreate) {
  if (!this.root_) {
    return null;
  }
  var node = /** @type {goog.ds.DataNode} */ (this.getChildNodes().get(name));
  if (!node && opt_canCreate) {
    var newObj = {};
    if (goog.isArray(this.root_)) {
      newObj['id'] = name;
      this.root_.push(newObj);
    } else {
      this.root_[name] = newObj;
    }
    node = new goog.ds.JsDataSource(newObj, name, this);
    if (this.childNodeList_) {
      this.childNodeList_.add(node);
    }
  }
  return node;
};


/**
 * Gets the value of a child node
 * @param {string} name The node name.
 * @return {Object} The value of the node, or null if no value or the child
 *    node doesn't exist.
 * @override
 */
goog.ds.JsDataSource.prototype.getChildNodeValue = function(name) {
  if (this.childNodeList_) {
    var node = this.getChildNodes().get(name);
    return node ? node.get() : null;
  } else if (this.root_) {
    return this.root_[name];
  } else {
    return null;
  }
};


/**
 * Sets a named child node of the current node.
 * If value is null, removes the child node.
 * @param {string} name The node name.
 * @param {Object} value The value to set, can be DataNode, object,
 *     property, or null.
 * @return {Object} The child node, if set.
 * @override
 */
goog.ds.JsDataSource.prototype.setChildNode = function(name, value) {
  var removedPath = null;
  var node = null;
  var addedNode = false;

  // Set node to the DataNode to add - if the value isn't already a DataNode,
  // creates a JsDataSource or JsPropertyDataSource wrapper
  if (value != null) {
    if (value.getDataName) {
      // The value is a DataNode. We must update its parent.
      node = value;
      node.parent_ = this;
    } else {
      if (goog.isArray(value) || goog.isObject(value)) {
        node = new goog.ds.JsDataSource(value, name, this);
      } else {
        node = new goog.ds.JsPropertyDataSource(
            /** @type {goog.ds.DataNode} */ (this.root_), name, this);
      }
    }
  }

  // This logic will get cleaner once we can remove the backing array / object
  // and just rely on the childNodeList_. This is needed until dependent code
  // is cleaned up.
  // TODO(user) Remove backing array / object and just use childNodeList_

  if (goog.isArray(this.root_)) {
    // To remove by name, need to create a map of the child nodes by ID
    this.createChildNodes_();
    var index = this.childNodeList_.indexOf(name);
    if (value == null) {
      // Remove the node
      var nodeToRemove = this.childNodeList_.get(name);
      if (nodeToRemove) {
        removedPath = nodeToRemove.getDataPath();
      }
      this.root_.splice(index, 1);
    } else {
      // Add the node
      if (index) {
        this.root_[index] = value;
      } else {
        this.root_.push(value);
      }
    }
    if (index == null) {
      addedNode = true;
    }
    this.childNodeList_.setNode(name, /** @type {goog.ds.DataNode} */ (node));
  } else if (goog.isObject(this.root_)) {
    if (value == null) {
      // Remove the node
      this.createChildNodes_();
      var nodeToRemove = this.childNodeList_.get(name);
      if (nodeToRemove) {
        removedPath = nodeToRemove.getDataPath();
      }
      delete this.root_[name];
    } else {
      // Add the node
      if (!this.root_[name]) {
        addedNode = true;
      }
      this.root_[name] = value;
    }
    // Only need to update childNodeList_ if has been created already
    if (this.childNodeList_) {
      this.childNodeList_.setNode(name, /** @type {goog.ds.DataNode} */ (node));
    }
  }

  // Fire the event that the node changed
  var dm = goog.ds.DataManager.getInstance();
  if (node) {
    dm.fireDataChange(node.getDataPath());
    if (addedNode && this.isList()) {
      dm.fireDataChange(this.getDataPath());
      dm.fireDataChange(this.getDataPath() + '/count()');
    }
  } else if (removedPath) {
    dm.fireDataChange(removedPath);
    if (this.isList()) {
      dm.fireDataChange(this.getDataPath());
      dm.fireDataChange(this.getDataPath() + '/count()');
    }
  }
  return node;
};


/**
 * Get the name of the node relative to the parent node
 * @return {string} The name of the node.
 * @override
 */
goog.ds.JsDataSource.prototype.getDataName = function() {
  return this.dataName_;
};


/**
 * Setthe name of the node relative to the parent node
 * @param {string} dataName The name of the node.
 * @override
 */
goog.ds.JsDataSource.prototype.setDataName = function(dataName) {
  this.dataName_ = dataName;
};


/**
 * Gets the a qualified data path to this node
 * @return {string} The data path.
 * @override
 */
goog.ds.JsDataSource.prototype.getDataPath = function() {
  var parentPath = '';
  if (this.parent_) {
    parentPath = this.parent_.getDataPath() + goog.ds.STR_PATH_SEPARATOR;
  }

  return parentPath + this.dataName_;
};


/**
 * Load or reload the backing data for this node
 * @override
 */
goog.ds.JsDataSource.prototype.load = function() {
  // Nothing to do
};


/**
 * Gets the state of the backing data for this node
 * TODO(user) Discuss null value handling
 * @return {goog.ds.LoadState} The state.
 * @override
 */
goog.ds.JsDataSource.prototype.getLoadState = function() {
  return (this.root_ == null) ? goog.ds.LoadState.NOT_LOADED :
      goog.ds.LoadState.LOADED;
};


/**
 * Whether the value of this node is a homogeneous list of data
 * @return {boolean} True if a list.
 * @override
 */
goog.ds.JsDataSource.prototype.isList = function() {
  return this.isList_ != null ? this.isList_ : goog.isArray(this.root_);
};



/**
 * Data source for JavaScript properties that arent objects. Contains reference
 * to parent object so that you can set the vaule
 *
 * @param {goog.ds.DataNode} parent Parent object.
 * @param {string} dataName Name of this property.
 * @param {goog.ds.DataNode=} opt_parentDataNode The parent data node. If
 *     omitted, assumes that the parent object is the parent data node.
 *
 * @constructor
 * @extends {goog.ds.BaseDataNode}
 * @final
 */
goog.ds.JsPropertyDataSource = function(parent, dataName, opt_parentDataNode) {
  goog.ds.BaseDataNode.call(this);
  this.dataName_ = dataName;
  this.parent_ = parent;
  this.parentDataNode_ = opt_parentDataNode || this.parent_;
};
goog.inherits(goog.ds.JsPropertyDataSource, goog.ds.BaseDataNode);


/**
 * Get the value of the node
 * @return {Object} The value of the node, or null if no value.
 */
goog.ds.JsPropertyDataSource.prototype.get = function() {
  return this.parent_[this.dataName_];
};


/**
 * Set the value of the node
 * @param {Object} value The new value of the node.
 * @override
 */
goog.ds.JsPropertyDataSource.prototype.set = function(value) {
  var oldValue = this.parent_[this.dataName_];
  this.parent_[this.dataName_] = value;

  if (oldValue != value) {
    goog.ds.DataManager.getInstance().fireDataChange(this.getDataPath());
  }
};


/**
 * Get the name of the node relative to the parent node
 * @return {string} The name of the node.
 * @override
 */
goog.ds.JsPropertyDataSource.prototype.getDataName = function() {
  return this.dataName_;
};


/** @override */
goog.ds.JsPropertyDataSource.prototype.getParent = function() {
  return this.parentDataNode_;
};

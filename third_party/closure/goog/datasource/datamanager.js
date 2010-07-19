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
 * @fileoverview
 * Central class for registering and accessing data sources
 * Also handles processing of data events.
 *
 * There is a shared global instance that most client code should access via
 * goog.ds.DataManager.getInstance(). However you can also create your own
 * DataManager using new
 *
 * Implements DataNode to provide the top element in a data registry
 * Prepends '$' to top level data names in path to denote they are root object
 *
*
 */
goog.provide('goog.ds.DataManager');

goog.require('goog.ds.BasicNodeList');
goog.require('goog.ds.DataNode');
goog.require('goog.ds.Expr');
goog.require('goog.string');
goog.require('goog.structs');
goog.require('goog.structs.Map');


/**
 * Create a DataManger
 * @extends {goog.ds.DataNode}
 * @constructor
 */
goog.ds.DataManager = function() {
  this.dataSources_ = new goog.ds.BasicNodeList();
  this.autoloads_ = new goog.structs.Map();
  this.listenerMap_ = {};
  this.listenersByFunction_ = {};
  this.aliases_ = {};
  this.eventCount_ = 0;
  this.indexedListenersByFunction_ = {};
};


/**
 * Global instance
 * @private
 */
goog.ds.DataManager.instance_ = null;
goog.inherits(goog.ds.DataManager, goog.ds.DataNode);


/**
 * Get the global instance
 * @return {goog.ds.DataManager} The data manager singleton.
 */
goog.ds.DataManager.getInstance = function() {
  if (!goog.ds.DataManager.instance_) {
    goog.ds.DataManager.instance_ = new goog.ds.DataManager();
  }
  return goog.ds.DataManager.instance_;
};


/**
 * Clears the global instance (for unit tests to reset state).
 */
goog.ds.DataManager.clearInstance = function() {
  goog.ds.DataManager.instance_ = null;
};


/**
 * Add a data source
 * @param {goog.ds.DataNode} ds The data source.
 * @param {boolean=} opt_autoload Whether to automatically load the data,
 *   defaults to false.
 * @param {string=} opt_name Optional name, can also get name
 *   from the datasource.
 */
goog.ds.DataManager.prototype.addDataSource = function(ds, opt_autoload,
    opt_name) {
  var autoload = !!opt_autoload;
  var name = opt_name || ds.getDataName();
  if (!goog.string.startsWith(name, '$')) {
    name = '$' + name;
  }
  ds.setDataName(name);
  this.dataSources_.add(ds);
  this.autoloads_.set(name, autoload);
};


/**
 * Create an alias for a data path, very similar to assigning a variable.
 * For example, you can set $CurrentContact -> $Request/Contacts[5], and all
 * references to $CurrentContact will be procesed on $Request/Contacts[5].
 *
 * Aliases will hide datasources of the same name.
 *
 * @param {string} name Alias name, must be a top level path ($Foo).
 * @param {string} dataPath Data path being aliased.
 */
goog.ds.DataManager.prototype.aliasDataSource = function(name, dataPath) {
  if (!this.aliasListener_) {
    this.aliasListener_ = goog.bind(this.listenForAlias_, this);
  }
  if (this.aliases_[name]) {
    var oldPath = this.aliases_[name].getSource()
    this.removeListeners(this.aliasListener_, oldPath + '/...', name);
  }
  this.aliases_[name] = goog.ds.Expr.create(dataPath);
  this.addListener(this.aliasListener_, dataPath + '/...', name);
  this.fireDataChange(name);
};


/**
 * Listener function for matches of paths that have been aliased.
 * Fires a data change on the alias as well.
 *
 * @param {string} dataPath Path of data event fired.
 * @param {string} name Name of the alias.
 * @private
 */
goog.ds.DataManager.prototype.listenForAlias_ = function(dataPath, name) {
  var aliasedExpr = this.aliases_[name];

  if (aliasedExpr) {
    // If it's a subpath, appends the subpath to the alias name
    // otherwise just fires on the top level alias
    var aliasedPath = aliasedExpr.getSource();
    if (dataPath.indexOf(aliasedPath) == 0) {
      this.fireDataChange(name + dataPath.substring(aliasedPath.length));
    } else {
      this.fireDataChange(name);
    }
  }
};


/**
 * Gets a named child node of the current node.
 *
 * @param {string} name The node name.
 * @return {goog.ds.DataNode} The child node,
 *   or null if no node of this name exists.
 */
goog.ds.DataManager.prototype.getDataSource = function(name) {
  if (this.aliases_[name]) {
    return this.aliases_[name].getNode();
  } else {
    return this.dataSources_.get(name);
  }
};


/**
 * Get the value of the node
 * @return {Object} The value of the node, or null if no value.
 */
goog.ds.DataManager.prototype.get = function() {
  return this.dataSources_;
};


/**
 * Set the value of the node
 * @param {Object} value The new value of the node.
 */
goog.ds.DataManager.prototype.set = function(value) {
  throw Error('Can\'t set on DataManager');
};


/**
 * Gets all of the child nodes of the current node.
 * @param {string=} opt_selector String selector to choose child nodes
 * Should return an empty DataNode list if no child nodes.
 *
 * @return {goog.ds.DataNodeList} The child nodes.
 */
goog.ds.DataManager.prototype.getChildNodes = function(opt_selector) {
  if (opt_selector) {
    return new goog.ds.BasicNodeList(
        [this.getChildNode(/** @type {string} */(opt_selector))]);
  } else {
    return this.dataSources_;
  }
};


/**
 * Gets a named child node of the current node
 * @param {string} name The node name.
 * @return {goog.ds.DataNode} The child node,
 *   or null if no node of this name exists.
 */
goog.ds.DataManager.prototype.getChildNode = function(name) {
  return this.getDataSource(name);
};


/**
 * Gets the value of a child node
 * @param {string} name The node name.
 * @return {Object} The value of the node, or null if no value or the child node
 *    doesn't exist.
 */
goog.ds.DataManager.prototype.getChildNodeValue = function(name) {
  var ds = this.getDataSource(name);
  return ds ? ds.get() : null;
};


/**
 * Get the name of the node relative to the parent node
 * @return {string} The name of the node.
 */
goog.ds.DataManager.prototype.getDataName = function() {
  return '';
};


/**
 * Gets the a qualified data path to this node
 * @return {string} The data path.
 */
goog.ds.DataManager.prototype.getDataPath = function() {
  return '';
};


/**
 * Load or reload the backing data for this node
 * only loads datasources flagged with autoload
 */
goog.ds.DataManager.prototype.load = function() {
  var len = this.dataSources_.getCount();
  for (var i = 0; i < len; i++) {
    var ds = this.dataSources_.getByIndex(i);
    var autoload = this.autoloads_.get(ds.getDataName());
    if (autoload) {
      ds.load();
    }
  }
};


/**
 * Gets the state of the backing data for this node
 * @return {goog.ds.LoadState} The state.
 */
goog.ds.DataManager.prototype.getLoadState = goog.abstractMethod;


/**
 * Whether the value of this node is a homogeneous list of data
 * @return {boolean} True if a list.
 */
goog.ds.DataManager.prototype.isList = function() {
  return false;
};


/**
 * Get the total count of events fired (mostly for debugging)
 * @return {number} Count of events.
 */
goog.ds.DataManager.prototype.getEventCount = function() {
  return this.eventCount_;
};


/**
 * Adds a listener
 * Listeners should fire when any data with path that has dataPath as substring
 * is changed.
 * TODO(user) Look into better listener handling
 *
 * @param {Function} fn Callback function, signature function(dataPath, id).
 * @param {string} dataPath Fully qualified data path.
 * @param {string=} opt_id A value passed back to the listener when the dataPath
 *   is matched.
 */
goog.ds.DataManager.prototype.addListener = function(fn, dataPath, opt_id) {
  // maxAncestor sets how distant an ancestor you can be of the fired event
  // and still fire (you always fire if you are a descendant).
  // 0 means you don't fire if you are an ancestor
  // 1 means you only fire if you are parent
  // 1000 means you will fire if you are ancestor (effectively infinite)
  var maxAncestors = 0;
  if (goog.string.endsWith(dataPath, '/...')) {
    maxAncestors = 1000;
    dataPath = dataPath.substring(0, dataPath.length - 4);
  } else if (goog.string.endsWith(dataPath, '/*')) {
    maxAncestors = 1;
    dataPath = dataPath.substring(0, dataPath.length - 2);
  }

  opt_id = opt_id || '';
  var key = dataPath + ':' + opt_id + ':' + goog.getUid(fn);
  var listener = {dataPath: dataPath, id: opt_id, fn: fn};
  var expr = goog.ds.Expr.create(dataPath);

  var fnUid = goog.getUid(fn);
  if (!this.listenersByFunction_[fnUid]) {
    this.listenersByFunction_[fnUid] = {};
  }
  this.listenersByFunction_[fnUid][key] = {listener: listener, items: []};

  while (expr) {
    var listenerSpec = {listener: listener, maxAncestors: maxAncestors};
    var matchingListeners = this.listenerMap_[expr.getSource()];
    if (matchingListeners == null) {
      matchingListeners = {};
      this.listenerMap_[expr.getSource()] = matchingListeners;
    }
    matchingListeners[key] = listenerSpec;
    maxAncestors = 0;
    expr = expr.getParent();
    this.listenersByFunction_[fnUid][key].items.push({key: key,
        obj: matchingListeners});
  }
};


/**
 * Adds an indexed listener.
 *
 * Indexed listeners allow for '*' in data paths. If a * exists, will match
 * all values and return the matched values in an array to the callback.
 *
 * Currently uses a promiscuous match algorithm: Matches everything before the
 * first '*', and then does a regex match for all of the returned events.
 * Although this isn't optimized, it is still an improvement as you can collapse
 * 100's of listeners into a single regex match
 *
 * @param {Function} fn Callback function, signature (dataPath, id, indexes).
 * @param {string} dataPath Fully qualified data path.
 * @param {string=} opt_id A value passed back to the listener when the dataPath
 *   is matched.
 */
goog.ds.DataManager.prototype.addIndexedListener = function(fn, dataPath,
    opt_id) {
  var firstStarPos = dataPath.indexOf('*');
  // Just need a regular listener
  if (firstStarPos == -1) {
    this.addListener(fn, dataPath, opt_id);
    return;
  }

  var listenPath = dataPath.substring(0, firstStarPos) + '...';

  // Create regex that matches * to any non '\' character
  var ext = '$';
  if (goog.string.endsWith(dataPath, '/...')) {
    dataPath = dataPath.substring(0, dataPath.length - 4);
    ext = '';
  }
  var regExpPath = goog.string.regExpEscape(dataPath);
  var matchRegExp = regExpPath.replace(/\\\*/g, '([^\\\/]+)') + ext;

  // Matcher function applies the regex and calls back the original function
  // if the regex matches, passing in an array of the matched values
  var matchRegExpRe = new RegExp(matchRegExp);
  var matcher = function(path, id) {
    var match = matchRegExpRe.exec(path);
    if (match) {
      match.shift();
      fn(path, opt_id, match);
    }
  }
  this.addListener(matcher, listenPath, opt_id);

  // Add the indexed listener to the map so that we can remove it later.
  var fnUid = goog.getUid(fn);
  if (!this.indexedListenersByFunction_[fnUid]) {
    this.indexedListenersByFunction_[fnUid] = {};
  }
  var key = dataPath + ':' + opt_id;
  this.indexedListenersByFunction_[fnUid][key] = {listener:
      {dataPath: listenPath, fn: matcher, id: opt_id}};
};


/**
 * Removes indexed listeners with a given callback function, and optional
 * matching datapath and matching id.
 *
 * @param {Function} fn Callback function, signature function(dataPath, id).
 * @param {string=} opt_dataPath Fully qualified data path.
 * @param {string=} opt_id A value passed back to the listener when the dataPath
 *   is matched.
 */
goog.ds.DataManager.prototype.removeIndexedListeners = function(
    fn, opt_dataPath, opt_id) {
  this.removeListenersByFunction_(
      this.indexedListenersByFunction_, true, fn, opt_dataPath, opt_id);
};


/**
 * Removes listeners with a given callback function, and optional
 * matching dataPath and matching id
 *
 * @param {Function} fn Callback function, signature function(dataPath, id).
 * @param {string=} opt_dataPath Fully qualified data path.
 * @param {string=} opt_id A value passed back to the listener when the dataPath
 *   is matched.
 */
goog.ds.DataManager.prototype.removeListeners = function(fn, opt_dataPath,
    opt_id) {

  // Normalize data path root
  if (opt_dataPath && goog.string.endsWith(opt_dataPath, '/...')) {
    opt_dataPath = opt_dataPath.substring(0, opt_dataPath.length - 4);
  } else if (opt_dataPath && goog.string.endsWith(opt_dataPath, '/*')) {
    opt_dataPath = opt_dataPath.substring(0, opt_dataPath.length - 2);
  }

  this.removeListenersByFunction_(
      this.listenersByFunction_, false, fn, opt_dataPath, opt_id);
};


/**
 * Removes listeners with a given callback function, and optional
 * matching dataPath and matching id from the given listenersByFunction
 * data structure.
 *
 * @param {Object} listenersByFunction The listeners by function.
 * @param {boolean} indexed Indicates whether the listenersByFunction are
 *     indexed or not.
 * @param {Function} fn Callback function, signature function(dataPath, id).
 * @param {string=} opt_dataPath Fully qualified data path.
 * @param {string=} opt_id A value passed back to the listener when the dataPath
 *   is matched.
 * @private
 */
goog.ds.DataManager.prototype.removeListenersByFunction_ = function(
    listenersByFunction, indexed, fn, opt_dataPath, opt_id) {
  var fnUid = goog.getUid(fn);
  var functionMatches = listenersByFunction[fnUid];
  if (functionMatches != null) {
    for (var key in functionMatches) {
      var functionMatch = functionMatches[key];
      var listener = functionMatch.listener;
      if ((!opt_dataPath || opt_dataPath == listener.dataPath) &&
          (!opt_id || opt_id == listener.id)) {
        if (indexed) {
          this.removeListeners(
              listener.fn, listener.dataPath, listener.id);
        }
        if (functionMatch.items) {
          for (var i = 0; i < functionMatch.items.length; i++) {
            var item = functionMatch.items[i];
            delete item.obj[item.key];
          }
        }
        delete functionMatches[key];
      }
    }
  }
};


/**
 * Get the total number of listeners (per expression listened to, so may be
 * more than number of times addListener() has been called
 * @return {number} Number of listeners.
 */
goog.ds.DataManager.prototype.getListenerCount = function() {
  var count = 0;
  goog.structs.forEach(this.listenerMap_, function(matchingListeners) {
    count += goog.structs.getCount(matchingListeners);
  });
  return count;
};

/**
 * Disables the sending of all data events during the execution of the given
 * callback. This provides a way to avoid useless notifications of small changes
 * when you will eventually send a data event manually that encompasses them
 * all.
 *
 * Note that this function can not be called reentrantly.
 *
 * @param {Function} callback Zero-arg function to execute.
 */
goog.ds.DataManager.prototype.runWithoutFiringDataChanges = function(callback) {
  if (this.disableFiring_) {
    throw Error('Can not nest calls to runWithoutFiringDataChanges');
  }

  this.disableFiring_ = true;
  try {
    callback();
  } finally {
    this.disableFiring_ = false;
  }
};


/**
 * Fire a data change event to all listeners
 *
 * If the path matches the path of a listener, the listener will fire
 *
 * If your path is the parent of a listener, the listener will fire. I.e.
 * if $Contacts/bob@bob.com changes, then we will fire listener for
 * $Contacts/bob@bob.com/Name as well, as the assumption is that when
 * a parent changes, all children are invalidated.
 *
 * If your path is the child of a listener, the listener may fire, depending
 * on the ancestor depth.
 *
 * A listener for $Contacts might only be interested if the contact name changes
 * (i.e. $Contacts doesn't fire on $Contacts/bob@bob.com/Name),
 * while a listener for a specific contact might
 * (i.e. $Contacts/bob@bob.com would fire on $Contacts/bob@bob.com/Name).
 * Adding "/..." to a lisetener path listens to all children, and adding "/*" to
 * a listener path listens only to direct children
 *
 * @param {string} dataPath Fully qualified data path.
 */
goog.ds.DataManager.prototype.fireDataChange = function(dataPath) {
  if (this.disableFiring_) {
    return;
  }

  var expr = goog.ds.Expr.create(dataPath);
  var ancestorDepth = 0;

  // Look for listeners for expression and all its parents.
  // Parents of listener expressions are all added to the listenerMap as well,
  // so this will evaluate inner loop every time the dataPath is a child or
  // an ancestor of the original listener path
  while (expr) {
    var matchingListeners = this.listenerMap_[expr.getSource()];
    if (matchingListeners) {
      for (var id in matchingListeners) {
        var match = matchingListeners[id];
        var listener = match.listener;
        if (ancestorDepth <= match.maxAncestors) {
          listener.fn(dataPath, listener.id);
        }
      }
    }
    ancestorDepth++;
    expr = expr.getParent();
  }
  this.eventCount_++;
};

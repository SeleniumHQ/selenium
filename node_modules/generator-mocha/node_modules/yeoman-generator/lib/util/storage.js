'use strict';
var assert = require('assert');
var _ = require('lodash');

/**
 * Storage instances handle a json file where Generator authors can store data.
 *
 * `Base` instantiate the storage as `config` by default.
 *
 * @constructor
 * @param {String} name       The name of the new storage (this is a namespace)
 * @param {mem-fs-editor} fs  A mem-fs editor instance
 * @param {String} configPath The filepath used as a storage.
 *
 * @example
 * var MyGenerator = yeoman.base.extend({
 *   config: function() {
 *     this.config.set('coffeescript', false);
 *   }
 * });
 */

var Storage = module.exports = function (name, fs, configPath) {
  assert(name, 'A name parameter is required to create a storage');
  assert(configPath, 'A config filepath is required to create a storage');

  this.path = configPath;
  this.name = name;
  this.fs = fs;
  this.existed = Object.keys(this._store()).length > 0;
};

/**
 * Return the current store as JSON object
 * @private
 * @return {Object} the store content
 */
Storage.prototype._store = function () {
  return this.fs.readJSON(this.path, {})[this.name] || {};
};

/**
 * Persist a configuration to disk
 * @param {Object} val - current configuration values
 */
Storage.prototype._persist = function (val) {
  var fullStore = this.fs.readJSON(this.path, {});
  fullStore[this.name] = val;
  this.fs.write(this.path, JSON.stringify(fullStore, null, '  '));
};

/**
 * Save a new object of values
 * @return {null}
 */

Storage.prototype.save = function () {
  this._persist(this._store());
};

/**
 * Get a stored value
 * @param  {String} key  The key under which the value is stored.
 * @return {*}           The stored value. Any JSON valid type could be returned
 */

Storage.prototype.get = function (key) {
  return this._store()[key];
};

/**
 * Get all the stored values
 * @return {Object}  key-value object
 */

Storage.prototype.getAll = function () {
  return _.cloneDeep(this._store());
};

/**
 * Assign a key to a value and schedule a save.
 * @param {String} key  The key under which the value is stored
 * @param {*} val  Any valid JSON type value (String, Number, Array, Object).
 * @return {*} val  Whatever was passed in as val.
 */

Storage.prototype.set = function (key, val) {
  assert(!_.isFunction(val), 'Storage value can\'t be a function');

  var store = this._store();

  if (_.isObject(key)) {
    val = _.extend(store, key);
  } else {
    store[key] = val;
  }

  this._persist(store);
  return val;
};

/**
 * Delete a key from the store and schedule a save.
 * @param  {String} key  The key under which the value is stored.
 * @return {null}
 */

Storage.prototype.delete = function (key) {
  var store = this._store();
  delete store[key];
  this._persist(store);
};

/**
 * Setup the store with defaults value and schedule a save.
 * If keys already exist, the initial value is kept.
 * @param  {Object} defaults  Key-value object to store.
 * @return {*} val  Returns the merged options.
 */

Storage.prototype.defaults = function (defaults) {
  assert(_.isObject(defaults), 'Storage `defaults` method only accept objects');
  var val = _.defaults(this.getAll(), defaults);
  this.set(val);
  return val;
};

'use strict';
var _ = require('lodash');

/**
 * The Generator store
 * This is used to store generator (npm packages) reference and instantiate them when
 * requested.
 * @constructor
 * @private
 */

var Store = module.exports = function Store() {
  this._generators = {};
  this._meta = {};
};

/**
 * Store a module under the namespace key
 * @param {String}          namespace - The key under which the generator can be retrieved
 * @param {String|Function} generator - A generator module or a module path
 */

Store.prototype.add = function add(namespace, generator) {
  if (_.isString(generator)) {
    this._storeAsPath(namespace, generator);
    return;
  }

  this._storeAsModule(namespace, generator);
};

Store.prototype._storeAsPath = function _storeAsPath(namespace, path) {
  this._meta[namespace] = {
    resolved: path,
    namespace: namespace
  };

  Object.defineProperty(this._generators, namespace, {
    get: function () {
      var Generator = require(path);
      return Generator;
    },
    enumerable: true,
    configurable: true
  });
};

Store.prototype._storeAsModule = function _storeAsModule(namespace, Generator) {
  this._meta[namespace] = {
    resolved: 'unknown',
    namespace: namespace
  };

  this._generators[namespace] = Generator;
};

/**
 * Get the module registered under the given namespace
 * @param  {String} namespace
 * @return {Module}
 */

Store.prototype.get = function get(namespace) {
  var Generator = this._generators[namespace];

  if (!Generator) {
    return;
  }

  return _.extend(Generator, this._meta[namespace]);
};

/**
 * Returns the list of registered namespace.
 * @return {Array} Namespaces array
 */

Store.prototype.namespaces = function namespaces() {
  return Object.keys(this._generators);
};

/**
 * Get the stored generators meta data
 * @return {Object} Generators metadata
 */

Store.prototype.getGeneratorsMeta = function getGeneratorsMeta() {
  return this._meta;
};

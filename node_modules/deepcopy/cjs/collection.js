"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.isCollection = isCollection;
exports.set = set;

var _detector = require("./detector");

/**
 * collection types
 */
const collectionTypeSet = new Set(['Arguments', 'Array', 'Map', 'Object', 'Set']);
/**
 * get value from collection
 *
 * @param {Array|Object|Map|Set} collection
 * @param {string|number|symbol} key
 * @param {string} [type=null]
 * @return {*}
 */

function get(collection, key, type = null) {
  const valueType = type || (0, _detector.detectType)(collection);

  switch (valueType) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      return collection[key];

    case 'Map':
      return collection.get(key);

    case 'Set':
      // NOTE: Set.prototype.keys is alias of Set.prototype.values
      // it means key is equals value
      return key;

    default:
  }
}
/**
 * check to type string is collection
 *
 * @param {string} type
 */


function isCollection(type) {
  return collectionTypeSet.has(type);
}
/**
 * set value to collection
 *
 * @param {Array|Object|Map|Set} collection
 * @param {string|number|symbol} key
 * @param {*} value
 * @param {string} [type=null]
 * @return {Array|Object|Map|Set}
 */


function set(collection, key, value, type = null) {
  const valueType = type || (0, _detector.detectType)(collection);

  switch (valueType) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      collection[key] = value;
      break;

    case 'Map':
      collection.set(key, value);
      break;

    case 'Set':
      collection.add(value);
      break;

    default:
  }

  return collection;
}
//# sourceMappingURL=collection.js.map
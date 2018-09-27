"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = deepcopy;

var _detector = require("./detector");

var _collection = require("./collection");

var _copier = require("./copier");

/**
 * deepcopy function
 *
 * @param {*} value
 * @param {Object|Function} [options]
 * @return {*}
 */
function deepcopy(value, options = {}) {
  if (typeof options === 'function') {
    options = {
      customizer: options
    };
  }

  const {
    // TODO: before/after customizer
    customizer // TODO: max depth
    // depth = Infinity,

  } = options;
  const valueType = (0, _detector.detectType)(value);

  if (!(0, _collection.isCollection)(valueType)) {
    return recursiveCopy(value, null, null, null, customizer);
  }

  const copiedValue = (0, _copier.copy)(value, valueType, customizer);
  const references = new WeakMap([[value, copiedValue]]);
  const visited = new WeakSet([value]);
  return recursiveCopy(value, copiedValue, references, visited, customizer);
}
/**
 * recursively copy
 *
 * @param {*} value target value
 * @param {*} clone clone of value
 * @param {WeakMap} references visited references of clone
 * @param {WeakSet} visited visited references of value
 * @param {Function} customizer user customize function
 * @return {*}
 */


function recursiveCopy(value, clone, references, visited, customizer) {
  const type = (0, _detector.detectType)(value);
  const copiedValue = (0, _copier.copy)(value, type); // return if not a collection value

  if (!(0, _collection.isCollection)(type)) {
    return copiedValue;
  }

  let keys;

  switch (type) {
    case 'Arguments':
    case 'Array':
      keys = Object.keys(value);
      break;

    case 'Object':
      keys = Object.keys(value);
      keys.push(...Object.getOwnPropertySymbols(value));
      break;

    case 'Map':
    case 'Set':
      keys = value.keys();
      break;

    default:
  } // walk within collection with iterator


  for (let collectionKey of keys) {
    const collectionValue = (0, _collection.get)(value, collectionKey, type);

    if (visited.has(collectionValue)) {
      // for [Circular]
      (0, _collection.set)(clone, collectionKey, references.get(collectionValue), type);
    } else {
      const collectionValueType = (0, _detector.detectType)(collectionValue);
      const copiedCollectionValue = (0, _copier.copy)(collectionValue, collectionValueType); // save reference if value is collection

      if ((0, _collection.isCollection)(collectionValueType)) {
        references.set(collectionValue, copiedCollectionValue);
        visited.add(collectionValue);
      }

      (0, _collection.set)(clone, collectionKey, recursiveCopy(collectionValue, copiedCollectionValue, references, visited, customizer), type);
    }
  } // TODO: isSealed/isFrozen/isExtensible


  return clone;
}
//# sourceMappingURL=index.js.map
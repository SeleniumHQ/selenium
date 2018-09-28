import { detectType } from './detector';
import { get, isCollection, set } from './collection';
import { copy } from './copier';

/**
 * deepcopy function
 *
 * @param {*} value
 * @param {Object|Function} [options]
 * @return {*}
 */
export default function deepcopy(value, options = {}) {
  if (typeof options === 'function') {
    options = {
      customizer: options
    };
  }

  const {
    // TODO: before/after customizer
    customizer
    // TODO: max depth
    // depth = Infinity,
  } = options;

  const valueType = detectType(value);

  if (!isCollection(valueType)) {
    return recursiveCopy(value, null, null, null, customizer);
  }

  const copiedValue = copy(value, valueType, customizer);

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
  const type = detectType(value);
  const copiedValue = copy(value, type);

  // return if not a collection value
  if (!isCollection(type)) {
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
  }

  // walk within collection with iterator
  for (let collectionKey of keys) {
    const collectionValue = get(value, collectionKey, type);

    if (visited.has(collectionValue)) {
      // for [Circular]
      set(clone, collectionKey, references.get(collectionValue), type);
    } else {
      const collectionValueType = detectType(collectionValue);
      const copiedCollectionValue = copy(collectionValue, collectionValueType);

      // save reference if value is collection
      if (isCollection(collectionValueType)) {
        references.set(collectionValue, copiedCollectionValue);
        visited.add(collectionValue);
      }

      set(
        clone,
        collectionKey,
        recursiveCopy(
          collectionValue,
          copiedCollectionValue,
          references,
          visited,
          customizer
        ),
        type
      );
    }
  }

  // TODO: isSealed/isFrozen/isExtensible

  return clone;
}

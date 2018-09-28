import copyMap from './copy_map';
import { detectType } from './detector';

/**
 * no operation
 */
function noop() {}

/**
 * copy value
 *
 * @param {*} value
 * @param {string} [type=null]
 * @param {Function} [customizer=noop]
 * @return {*}
 */
export function copy(value, type = null, customizer = noop) {
  if (arguments.length === 2 && typeof type === 'function') {
    customizer = type;
    type = null;
  }

  const valueType = type || detectType(value);
  const copyFunction = copyMap.get(valueType);

  if (valueType === 'Object') {
    const result = customizer(value, valueType);

    if (result !== undefined) {
      return result;
    }
  }

  // NOTE: TypedArray needs pass type to argument
  return copyFunction ? copyFunction(value, valueType) : value;
}

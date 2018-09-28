"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.copy = copy;

var _copy_map = _interopRequireDefault(require("./copy_map"));

var _detector = require("./detector");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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


function copy(value, type = null, customizer = noop) {
  if (arguments.length === 2 && typeof type === 'function') {
    customizer = type;
    type = null;
  }

  const valueType = type || (0, _detector.detectType)(value);

  const copyFunction = _copy_map.default.get(valueType);

  if (valueType === 'Object') {
    const result = customizer(value, valueType);

    if (result !== undefined) {
      return result;
    }
  } // NOTE: TypedArray needs pass type to argument


  return copyFunction ? copyFunction(value, valueType) : value;
}
//# sourceMappingURL=copier.js.map
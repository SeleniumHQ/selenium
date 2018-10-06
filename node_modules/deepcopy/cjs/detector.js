"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detectType = detectType;

var _typeDetect = _interopRequireDefault(require("type-detect"));

var _buffer = require("./buffer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * detect type of value
 *
 * @param {*} value
 * @return {string}
 */
function detectType(value) {
  // NOTE: isBuffer must execute before type-detect,
  // because type-detect returns 'Uint8Array'.
  if ((0, _buffer.isBuffer)(value)) {
    return 'Buffer';
  }

  return (0, _typeDetect.default)(value);
}
//# sourceMappingURL=detector.js.map
/*istanbul ignore start*/'use strict';

exports.__esModule = true;
exports.cssDiff = undefined;
exports. /*istanbul ignore end*/diffCss = diffCss;

var /*istanbul ignore start*/_base = require('./base') /*istanbul ignore end*/;

/*istanbul ignore start*/
var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*istanbul ignore end*/var cssDiff = /*istanbul ignore start*/exports. /*istanbul ignore end*/cssDiff = new /*istanbul ignore start*/_base2.default() /*istanbul ignore end*/;
cssDiff.tokenize = function (value) {
  return value.split(/([{}:;,]|\s+)/);
};

function diffCss(oldStr, newStr, callback) {
  return cssDiff.diff(oldStr, newStr, callback);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaWZmL2Nzcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O2dDQU9nQjs7QUFQaEI7Ozs7Ozs7dUJBRU8sSUFBTSw2RUFBVSxxRUFBVjtBQUNiLFFBQVEsUUFBUixHQUFtQixVQUFTLEtBQVQsRUFBZ0I7QUFDakMsU0FBTyxNQUFNLEtBQU4sQ0FBWSxlQUFaLENBQVAsQ0FEaUM7Q0FBaEI7O0FBSVosU0FBUyxPQUFULENBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLEVBQWlDLFFBQWpDLEVBQTJDO0FBQUUsU0FBTyxRQUFRLElBQVIsQ0FBYSxNQUFiLEVBQXFCLE1BQXJCLEVBQTZCLFFBQTdCLENBQVAsQ0FBRjtDQUEzQyIsImZpbGUiOiJjc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGlmZiBmcm9tICcuL2Jhc2UnO1xuXG5leHBvcnQgY29uc3QgY3NzRGlmZiA9IG5ldyBEaWZmKCk7XG5jc3NEaWZmLnRva2VuaXplID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlLnNwbGl0KC8oW3t9OjssXXxcXHMrKS8pO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZDc3Mob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7IHJldHVybiBjc3NEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKTsgfVxuIl19

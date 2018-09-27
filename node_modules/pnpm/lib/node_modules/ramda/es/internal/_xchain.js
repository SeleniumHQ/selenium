import _curry2 from './_curry2';
import _flatCat from './_flatCat';
import map from '../map';

var _xchain = /*#__PURE__*/_curry2(function _xchain(f, xf) {
  return map(f, _flatCat(xf));
});
export default _xchain;
import _indexOf from './_indexOf';

export default function _contains(a, list) {
  return _indexOf(list, a, 0) >= 0;
}
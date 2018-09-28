export default function _isTransformer(obj) {
  return typeof obj['@@transducer/step'] === 'function';
}
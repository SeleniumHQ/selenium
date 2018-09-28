const isBufferExists = typeof Buffer !== 'undefined';
const isBufferFromExists = isBufferExists && typeof Buffer.from !== 'undefined';

export const isBuffer = isBufferExists
  ? /**
     * is value is Buffer?
     *
     * @param {*} value
     * @return {boolean}
     */
    function isBuffer(value) {
      return Buffer.isBuffer(value);
    }
  : /**
     * return false
     *
     * NOTE: for Buffer unsupported
     *
     * @return {boolean}
     */
    function isBuffer() {
      return false;
    };

export const copy = isBufferFromExists
  ? /**
     * copy Buffer
     *
     * @param {Buffer} value
     * @return {Buffer}
     */
    function copy(value) {
      return Buffer.from(value);
    }
  : isBufferExists
    ? /**
       * copy Buffer
       *
       * NOTE: for old node.js
       *
       * @param {Buffer} value
       * @return {Buffer}
       */
      function copy(value) {
        return new Buffer(value);
      }
    : /**
       * shallow copy
       *
       * NOTE: for Buffer unsupported
       *
       * @param {*}
       * @return {*}
       */
      function copy(value) {
        return value;
      };

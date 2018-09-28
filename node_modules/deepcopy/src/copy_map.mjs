import { copy as cloneBuffer } from './buffer';

const globalObject = Function('return this')();

/**
 * copy ArrayBuffer
 *
 * @param {ArrayBuffer} value
 * @return {ArrayBuffer}
 */
function copyArrayBuffer(value) {
  return value.slice(0);
}

/**
 * copy Boolean
 *
 * @param {Boolean} value
 * @return {Boolean}
 */
function copyBoolean(value) {
  return new Boolean(value.valueOf());
}

/**
 * copy DataView
 *
 * @param {DataView} value
 * @return {DataView}
 */
function copyDataView(value) {
  // TODO: copy ArrayBuffer?
  return new DataView(value.buffer);
}

/**
 * copy Buffer
 *
 * @param {Buffer} value
 * @return {Buffer}
 */
function copyBuffer(value) {
  return cloneBuffer(value);
}

/**
 * copy Date
 *
 * @param {Date} value
 * @return {Date}
 */
function copyDate(value) {
  return new Date(value.getTime());
}

/**
 * copy Number
 *
 * @param {Number} value
 * @return {Number}
 */
function copyNumber(value) {
  return new Number(value);
}

/**
 * copy RegExp
 *
 * @param {RegExp} value
 * @return {RegExp}
 */
function copyRegExp(value) {
  return new RegExp(value.source || '(?:)', value.flags);
}

/**
 * copy String
 *
 * @param {String} value
 * @return {String}
 */
function copyString(value) {
  return new String(value);
}

/**
 * copy TypedArray
 *
 * @param {*} value
 * @return {*}
 */
function copyTypedArray(value, type) {
  return globalObject[type].from(value);
}

/**
 * shallow copy
 *
 * @param {*} value
 * @return {*}
 */
function shallowCopy(value) {
  return value;
}

/**
 * get empty Array
 *
 * @return {Array}
 */
function getEmptyArray() {
  return [];
}

/**
 * get empty Map
 *
 * @return {Map}
 */
function getEmptyMap() {
  return new Map();
}

/**
 * get empty Object
 *
 * @return {Object}
 */
function getEmptyObject() {
  return {};
}

/**
 * get empty Set
 *
 * @return {Set}
 */
function getEmptySet() {
  return new Set();
}

export default new Map([
  // deep copy
  ['ArrayBuffer', copyArrayBuffer],
  ['Boolean', copyBoolean],
  ['Buffer', copyBuffer],
  ['DataView', copyDataView],
  ['Date', copyDate],
  ['Number', copyNumber],
  ['RegExp', copyRegExp],
  ['String', copyString],

  // typed arrays
  // TODO: pass bound function
  ['Float32Array', copyTypedArray],
  ['Float64Array', copyTypedArray],
  ['Int16Array', copyTypedArray],
  ['Int32Array', copyTypedArray],
  ['Int8Array', copyTypedArray],
  ['Uint16Array', copyTypedArray],
  ['Uint32Array', copyTypedArray],
  ['Uint8Array', copyTypedArray],
  ['Uint8ClampedArray', copyTypedArray],

  // shallow copy
  ['Array Iterator', shallowCopy],
  ['Map Iterator', shallowCopy],
  ['Promise', shallowCopy],
  ['Set Iterator', shallowCopy],
  ['String Iterator', shallowCopy],
  ['function', shallowCopy],
  ['global', shallowCopy],
  // NOTE: WeakMap and WeakSet cannot get entries
  ['WeakMap', shallowCopy],
  ['WeakSet', shallowCopy],

  // primitives
  ['boolean', shallowCopy],
  ['null', shallowCopy],
  ['number', shallowCopy],
  ['string', shallowCopy],
  ['symbol', shallowCopy],
  ['undefined', shallowCopy],

  // collections
  // NOTE: return empty value, because recursively copy later.
  ['Arguments', getEmptyArray],
  ['Array', getEmptyArray],
  ['Map', getEmptyMap],
  ['Object', getEmptyObject],
  ['Set', getEmptySet]

  // NOTE: type-detect returns following types
  // 'Location'
  // 'Document'
  // 'MimeTypeArray'
  // 'PluginArray'
  // 'HTMLQuoteElement'
  // 'HTMLTableDataCellElement'
  // 'HTMLTableHeaderCellElement'

  // TODO: is type-detect never return 'object'?
  // 'object'
]);

'use strict'

var hexadecimal = require('is-hexadecimal')

module.exports = sha

var MAX_SHA_LENGTH = 40
var MINUSCULE_SHA_LENGTH = 4
var MIN_SHA_LENGTH = 7

/* Get the end of a SHA which starts at character
 * `fromIndex` in `value`. */
function sha(value, fromIndex, allowShort) {
  var index = fromIndex
  var length = value.length
  var size

  /* No reason walking too far. */

  if (length > index + MAX_SHA_LENGTH) {
    length = index + MAX_SHA_LENGTH
  }

  while (index < length) {
    if (!hexadecimal(value.charCodeAt(index))) {
      break
    }

    index++
  }

  size = index - fromIndex

  if (
    size < (allowShort ? MINUSCULE_SHA_LENGTH : MIN_SHA_LENGTH) ||
    (size === MAX_SHA_LENGTH && hexadecimal(value.charCodeAt(index)))
  ) {
    return -1
  }

  return index
}

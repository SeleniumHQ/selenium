'use strict'

var decimal = require('is-decimal')

module.exports = issue

/* Get the end of an issue which starts at character
 * `fromIndex` in `value`. */
function issue(value, fromIndex) {
  var index = fromIndex
  var length = value.length

  while (index < length) {
    if (!decimal(value.charCodeAt(index))) {
      break
    }

    index++
  }

  if (index - fromIndex === 0) {
    return -1
  }

  return index
}

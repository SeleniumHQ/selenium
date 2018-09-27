'use strict'

var usernameCharacter = require('./username-character')

module.exports = username

var MAX_USER_LENGTH = 39

var CC_DASH = '-'.charCodeAt(0)

/* Get the end of a username which starts at character
 * `fromIndex` in `value`. */
function username(value, fromIndex) {
  var index = fromIndex
  var length = value.length
  var size

  /* First character of username cannot be a dash. */
  if (value.charCodeAt(index) === CC_DASH) {
    return -1
  }

  while (index < length) {
    if (!usernameCharacter(value.charCodeAt(index))) {
      break
    }

    index++
  }

  size = index - fromIndex

  /* Last character of username can no longer be a dash, but could be (GH-13). */
  if (!size || size > MAX_USER_LENGTH) {
    return -1
  }

  return index
}

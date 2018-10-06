'use strict'

var usernameCharacter = require('./username-character')

module.exports = factory

var C_AT = '@'
var C_HASH = '#'

var CC_HASH = C_HASH.charCodeAt(0)
var CC_AT = C_AT.charCodeAt(0)

/* Create a bound regex locator. */
function factory(regex) {
  return locator

  /* Find the place where a regex begins. */
  function locator(value, fromIndex) {
    var result
    var prev

    regex.lastIndex = fromIndex

    result = regex.exec(value)

    if (result) {
      result = regex.lastIndex - result[0].length
      prev = value.charCodeAt(result - 1)

      if (usernameCharacter(prev) || prev === CC_HASH || prev === CC_AT) {
        /* Find the next possible value. */
        return locator(value, regex.lastIndex)
      }

      return result
    }

    return -1
  }
}

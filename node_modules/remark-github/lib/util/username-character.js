'use strict'

var decimal = require('is-decimal')
var alphabetical = require('is-alphabetical')

module.exports = usernameCharacter

var CC_DASH = '-'.charCodeAt(0)

/* Check whether `code` is a valid username character. */
function usernameCharacter(code) {
  return code === CC_DASH || decimal(code) || alphabetical(code)
}

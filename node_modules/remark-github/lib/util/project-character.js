'use strict'

var decimal = require('is-decimal')
var alphabetical = require('is-alphabetical')

module.exports = projectCharacter

var CC_DOT = '.'.charCodeAt(0)
var CC_DASH = '-'.charCodeAt(0)

/* Check whether `code` is a valid project name character. */
function projectCharacter(code) {
  return (
    code === CC_DOT || code === CC_DASH || decimal(code) || alphabetical(code)
  )
}

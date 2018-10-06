'use strict'

var decimal = require('is-decimal')
var alphabetical = require('is-alphabetical')

module.exports = repoCharacter

var CC_DASH = '-'.charCodeAt(0)
var CC_SLASH = '/'.charCodeAt(0)
var CC_DOT = '.'.charCodeAt(0)

/* Check whether `code` is a repo character. */
function repoCharacter(code) {
  return (
    code === CC_SLASH ||
    code === CC_DOT ||
    code === CC_DASH ||
    decimal(code) ||
    alphabetical(code)
  )
}

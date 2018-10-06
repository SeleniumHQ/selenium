'use strict'

var projectCharacter = require('./project-character')

module.exports = project

var GIT_SUFFIX = '.git'
var MAX_PROJECT_LENGTH = 100

/* Get the end of a project which starts at character
 * `fromIndex` in `value`. */
function project(value, fromIndex) {
  var index = fromIndex
  var length = value.length
  var size

  while (index < length) {
    if (!projectCharacter(value.charCodeAt(index))) {
      break
    }

    index++
  }

  size = fromIndex - index

  if (
    !size ||
    size > MAX_PROJECT_LENGTH ||
    value.slice(index - GIT_SUFFIX.length, index) === GIT_SUFFIX
  ) {
    return -1
  }

  return index
}

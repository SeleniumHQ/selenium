'use strict'

module.exports = mention

var repo = require('../util/repo-character')

/* Find a possible mention. */
function mention(value, fromIndex) {
  var index = value.indexOf('@', fromIndex)

  if (index !== -1 && repo(value.charCodeAt(index - 1))) {
    return mention(value, index + 1)
  }

  return index
}

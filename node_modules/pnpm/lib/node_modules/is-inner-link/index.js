'use strict'
const path = require('path')
const isSubdir = require('is-subdir')
const resolveLinkTarget = require('resolve-link-target')

module.exports = function (parent, relativePathToLink) {
  const linkPath = path.resolve(parent, relativePathToLink)
  return resolveLinkTarget(linkPath)
    .then(target => ({
      isInner: isSubdir(parent, target),
      target
    }))
}

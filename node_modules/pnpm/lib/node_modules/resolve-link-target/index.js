'use strict'
const fs = require('graceful-fs')
const path = require('path')

module.exports = getLinkTarget
module.exports.sync = getLinkTargetSync

function getLinkTarget (linkPath) {
  linkPath = path.resolve(linkPath)
  return new Promise((resolve, reject) => {
    fs.readlink(linkPath, (err, target) => {
      if (err) {
        reject(err)
        return
      }
      resolve(_resolveLink(linkPath, target))
    })
  })
}

function getLinkTargetSync (linkPath) {
  linkPath = path.resolve(linkPath)
  const target = fs.readlinkSync(linkPath)
  return _resolveLink(linkPath, target)
}

function _resolveLink (dest, target) {
  if (path.isAbsolute(target)) {
    return path.resolve(target)
  }

  return path.join(path.dirname(dest), target)
}

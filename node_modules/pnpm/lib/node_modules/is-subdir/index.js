'use strict'
const path = require('path')
const isWindows = require('is-windows')

module.exports = isWindows()
? isSubdirOnWin
: isSubdirOnNonWin

function isSubdirOnWin (parent, dir) {
  const parentParts = winResolve(parent).split(':')
  const dirParts = winResolve(dir).split(':')
  return parentParts[0].toLowerCase() === dirParts[0].toLowerCase() &&
    dirParts[1].startsWith(parentParts[1])
}

// On Windows path.resolve('C:') returns C:\Users\
// This function resolves C: to C:
function winResolve (p) {
  if (p.endsWith(':')) {
    return p
  }
  return path.resolve(p)
}

function isSubdirOnNonWin (parent, dir) {
  const rParent = path.resolve(parent)
  const rDir = path.resolve(dir)
  return rDir.startsWith(rParent)
}

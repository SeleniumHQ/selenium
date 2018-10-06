'use strict'
const canLink = require('can-link')
const path = require('path')
const pathTemp = require('path-temp')
const nextPath = require('next-path')

module.exports = (filePath) => {
  filePath = path.resolve(filePath)
  const end = path.dirname(filePath)
  let dir = path.parse(end).root

  return new Promise((resolve, reject) => {
    (function can () {
      canLink(filePath, pathTemp(dir))
        .then((result) => {
          if (result) {
            resolve(dir)
          } else if (dir === end) {
            reject(new Error(`${filePath} cannot be linked to anywhere`))
          } else {
            dir = nextPath(dir, end)
            can()
          }
        })
        .catch(reject)
    }())
  })
}

module.exports.sync = (filePath) => {
  filePath = path.resolve(filePath)
  const end = path.dirname(filePath)
  let dir = path.parse(end).root

  while (true) {
    const result = canLink.sync(filePath, pathTemp(dir))
    if (result) {
      return dir
    } else if (dir === end) {
      throw new Error(`${filePath} cannot be linked to anywhere`)
    } else {
      dir = nextPath(dir, end)
    }
  }
}

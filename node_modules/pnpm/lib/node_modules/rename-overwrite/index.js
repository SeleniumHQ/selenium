'use strict'
const fs = require('graceful-fs')
const promisify = require('util.promisify')
const rimraf = promisify(require('rimraf'))
const rimrafSync = require('rimraf').sync

const rename = promisify(fs.rename)

module.exports = function renameOverwrite (oldPath, newPath) {
  return rename(oldPath, newPath)
    .catch(err => {
      switch (err.code) {
        case 'ENOTEMPTY':
        case 'EEXIST':
          return rimraf(newPath)
            .then(() => rename(oldPath, newPath))
        // weird Windows stuff
        case 'EPERM':
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              rimraf(newPath)
                .then(() => rename(oldPath, newPath))
                .then(resolve)
                .catch(reject)
            }, 200)
          })
        default:
          throw err
      }
    })
}

module.exports.sync = function renameOverwriteSync (oldPath, newPath) {
  try {
    fs.renameSync(oldPath, newPath)
  } catch (err) {
    switch (err.code) {
      case 'ENOTEMPTY':
      case 'EEXIST':
      case 'EPERM': // weird Windows stuff
        rimrafSync(newPath)
        fs.renameSync(oldPath, newPath)
        return
      default:
        throw err
    }
  }
}

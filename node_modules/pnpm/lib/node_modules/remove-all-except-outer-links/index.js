'use strict'
const fs = require('mz/fs')
const path = require('path')
const pFilter = require('p-filter')
const rimraf = require('rimraf-then')
const resolveLinkTarget = require('resolve-link-target')
const isSubdir = require('is-subdir')

module.exports = function (modulesDir) {
  return fs.readdir(modulesDir)
    .then(dirs => {
      return Promise.all(
        dirs.map(dir => dir[0] === '@'
          ? fs.readdir(path.join(modulesDir, dir)).then(subdirs => subdirs.map(subdir => path.join(dir, subdir)))
          : Promise.resolve([dir]))
      )
      .then(dirs => Array.prototype.concat.apply([], dirs))
      .then(dirs => {
        return pFilter(
          dirs.map(relativePath => path.join(modulesDir, relativePath)),
          absolutePath => {
            return fs.lstat(absolutePath)
              .then(stats => {
                if (!stats.isSymbolicLink()) return true

                return resolveLinkTarget(absolutePath)
                  .then(targetPath => isSubdir(modulesDir, targetPath))
              })
          }
        )
      })
    })
    .then(innerResources => {
      return Promise.all(innerResources.map(rimraf))
    })
}

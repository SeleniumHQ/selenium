
var _rimraf = require('rimraf')
var Promise = require('any-promise')

module.exports = function (dir) {
  return new Promise(function (resolve, reject) {
    _rimraf(dir, function (err) {
      if (err) reject(err)
      else resolve()
    })
  })
}

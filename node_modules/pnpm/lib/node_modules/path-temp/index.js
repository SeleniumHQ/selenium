'use strict'
const path = require('path')
const uniqueString = require('unique-string')

module.exports = function (folder) {
  return path.join(folder, `_tmp_${process.pid}_${uniqueString()}`)
}

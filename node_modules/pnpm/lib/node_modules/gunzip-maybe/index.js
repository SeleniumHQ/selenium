var zlib = require('zlib')
var peek = require('peek-stream')
var through = require('through2')
var pumpify = require('pumpify')
var isGzip = require('is-gzip')
var isDeflate = require('is-deflate')

var isCompressed = function (data) {
  if (isGzip(data)) return 1
  if (isDeflate(data)) return 2
  return 0
}

var gunzip = function (maxRecursion) {
  if (!(maxRecursion >= 0)) maxRecursion = 3

  return peek({newline: false, maxBuffer: 10}, function (data, swap) {
    if (maxRecursion < 0) return swap(new Error('Maximum recursion reached'))
    switch (isCompressed(data)) {
      case 1:
        swap(null, pumpify(zlib.createGunzip(), gunzip(maxRecursion - 1)))
        break
      case 2:
        swap(null, pumpify(zlib.createInflate(), gunzip(maxRecursion - 1)))
        break
      default:
        swap(null, through())
    }
  })
}

module.exports = gunzip

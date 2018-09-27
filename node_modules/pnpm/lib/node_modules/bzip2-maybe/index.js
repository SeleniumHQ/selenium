var bz2 = require('unbzip2-stream')
var isBzip2 = require('is-bzip2')
var peek = require('peek-stream')
var pumpify = require('pumpify')
var through = require('through2')

var bzip2 = function () {
  return peek({newline: false, maxBuffer: 10}, function (data, swap) {
    if (isBzip2(data)) {
      return swap(null, pumpify(bz2(), bzip2()))
    }

    swap(null, through())
  })
}

module.exports = bzip2

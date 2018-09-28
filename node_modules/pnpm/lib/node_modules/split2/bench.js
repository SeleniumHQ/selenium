'use strict'

var split = require('./')
var bench = require('fastbench')
var fs = require('fs')

function benchSplit (cb) {
  fs.createReadStream('package.json')
    .pipe(split())
    .on('end', cb)
    .resume()
}

var run = bench([
  benchSplit
], 10000)

run(run)

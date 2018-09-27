var tape = require('tape')
var zlib = require('zlib')
var concat = require('concat-stream')
var fs = require('fs')
var gunzip = require('./')

tape('deflated input', function (t) {
  fs.createReadStream(__filename)
    .pipe(zlib.createDeflate())
    .pipe(gunzip())
    .pipe(concat(function (data) {
      t.same(data, fs.readFileSync(__filename))
      t.end()
    }))
})

tape('deflated multiple times', function (t) {
  fs.createReadStream(__filename)
    .pipe(zlib.createDeflate())
    .pipe(zlib.createDeflate())
    .pipe(gunzip())
    .pipe(concat(function (data) {
      t.same(data, fs.readFileSync(__filename))
      t.end()
    }))
})

tape('gunzipped input', function (t) {
  fs.createReadStream(__filename)
    .pipe(zlib.createGzip())
    .pipe(gunzip())
    .pipe(concat(function (data) {
      t.same(data, fs.readFileSync(__filename))
      t.end()
    }))
})

tape('gunzipped multiple times', function (t) {
  fs.createReadStream(__filename)
    .pipe(zlib.createGzip())
    .pipe(zlib.createGzip())
    .pipe(gunzip())
    .pipe(concat(function (data) {
      t.same(data, fs.readFileSync(__filename))
      t.end()
    }))
})

tape('regular input', function (t) {
  fs.createReadStream(__filename)
    .pipe(gunzip())
    .pipe(concat(function (data) {
      t.same(data, fs.readFileSync(__filename))
      t.end()
    }))
})

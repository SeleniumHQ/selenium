var peek = require('peek-stream')
var ldjson = require('ldjson-stream')
var csv = require('csv-parser')

var isCSV = function(data) {
  return data.toString().indexOf(',') > -1
}

var isJSON = function(data) {
  try {
    JSON.parse(data)
    return true
  } catch (err) {
    return false
  }
}

var parser = function() {
  return peek(function(data, swap) {
    // maybe it is JSON?
    if (isJSON(data)) return swap(null, ldjson())

    // maybe it is CSV?
    if (isCSV(data)) return swap(null, csv())

    // we do not know - bail
    swap(new Error('No parser available'))
  })
}

var parse = parser()

parse.write('{"hello":"world"}\n{"hello":"another"}\n')
parse.on('data', function(data) {
  console.log('from ldj:', data)
})

var parse = parser()

parse.write('test,header\nvalue-1,value-2\n')
parse.on('data', function(data) {
  console.log('from csv:', data)
})

var fs = require('fs')
var csv = require('./')

var now = Date.now()
var rows = 0

fs.createReadStream(process.argv[2] || '/tmp/tmp.csv')
  .pipe(csv())
  .on('data', function (line) {
    rows++
  })
  .on('end', function () {
    console.log('parsed ' + rows + ' rows in ' + (Date.now() - now) + ' ms')
  })

#!/usr/bin/env node

var fs = require('fs')
var filename = process.argv[2]
var bzip2 = require('./')

if (filename === '--help') {
  console.log('Usage: bzip2-maybe filename?')
  console.log('')
  console.log('  cat somefile | bzip2-maybe')
  console.log('  bzip2-maybe somefile')
  console.log('')
  process.exit(0)
}

var input = (!filename || filename === '-') ? process.stdin : fs.createReadStream(filename)

input.pipe(bzip2()).pipe(process.stdout)

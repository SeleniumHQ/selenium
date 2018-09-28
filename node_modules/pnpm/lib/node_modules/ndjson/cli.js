#!/usr/bin/env node

var fs = require('fs')
var ndjson = require('./index.js')
var minimist = require('minimist')

var args = minimist(process.argv.slice(2))

var inputStream

var first = args._[0]
if (!first) {
  console.error('Usage: ndjson [input] <options>')
  process.exit(1)
}

if (first === '-') inputStream = process.stdin
else inputStream = fs.createReadStream(first)

var parse = ndjson.parse(args)
var serializer = ndjson.serialize(args)
  
inputStream.pipe(parse).pipe(serializer).pipe(process.stdout)

#!/usr/bin/env node

var minimist = require('minimist')
var ndjson = require('ndjson')
var fs = require('fs')
var csv = require('./')

var argv = minimist(process.argv, {
  alias: {
    h: 'headers',
    v: 'version',
    o: 'output',
    s: 'separator',
    q: 'quote',
    e: 'escape'
  },
  default: {
    s: ',',
    q: '"',
    e: '"'
  },
  boolean: ['version', 'help']
})

var headers = argv.headers && argv.headers.toString().split(argv.separator)
var filename = argv._[2]

if (argv.version) {
  console.log(require('./package').version)
  process.exit(0)
}

if (argv.help || (process.stdin.isTTY && !filename)) {
  console.error(
    'Usage: csv-parser [filename?] [options]\n\n' +
    '  --headers,-h        Explicitly specify csv headers as a comma separated list\n' +
    '  --output,-o         Set output file. Defaults to stdout\n' +
    '  --separator,-s      Set the separator character ("," by default)\n' +
    '  --quote,-q          Set the quote character (\'"\' by default)\n' +
    '  --escape,-e         Set the escape character (defaults to quote value)\n' +
    '  --strict            Require column length match headers length\n' +
    '  --version,-v        Print out the installed version\n' +
    '  --remove            Remove headers from output\n' +
    '  --help              Show this help\n'
  )
  process.exit(1)
}

var input
var output = (argv.output && argv.output !== '-') ? fs.createWriteStream(argv.output) : process.stdout
var removedHeaders = argv.remove && argv.remove.split(',')

function mapHeaders (name, i) {
  return removedHeaders.indexOf(name) === -1 ? name : null
}

if (filename === '-' || !filename) {
  input = process.stdin
} else if (fs.existsSync(filename)) {
  input = fs.createReadStream(filename)
} else {
  console.error('File: %s does not exist', filename)
  process.exit(2)
}

input
  .pipe(csv({
    headers: headers,
    separator: argv.separator,
    strict: argv.strict,
    mapHeaders: argv.remove ? mapHeaders : null
  }))
  .pipe(ndjson.serialize())
  .pipe(output)

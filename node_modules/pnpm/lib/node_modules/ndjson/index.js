var through = require('through2')
var split = require('split2')
var EOL = require('os').EOL
var stringify = require('json-stringify-safe')

module.exports = parse
module.exports.serialize = module.exports.stringify = serialize
module.exports.parse = parse

function parse (opts) {
  opts = opts || {}
  opts.strict = opts.strict !== false

  function parseRow (row) {
    try {
      if (row) return JSON.parse(row)
    } catch (e) {
      if (opts.strict) {
        this.emit('error', new Error('Could not parse row ' + row.slice(0, 50) + '...'))
      }
    }
  }

  return split(parseRow, opts)
}

function serialize (opts) {
  return through.obj(opts, function(obj, enc, cb) {
    cb(null, stringify(obj) + EOL)
  })
}

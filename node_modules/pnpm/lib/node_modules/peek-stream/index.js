var duplexify = require('duplexify')
var through = require('through2')
var bufferFrom = require('buffer-from')

var noop = function() {}

var isObject = function(data) {
  return !Buffer.isBuffer(data) && typeof data !== 'string'
}

var peek = function(opts, onpeek) {
  if (typeof opts === 'number') opts = {maxBuffer:opts}
  if (typeof opts === 'function') return peek(null, opts)
  if (!opts) opts = {}

  var maxBuffer = typeof opts.maxBuffer === 'number' ? opts.maxBuffer : 65535
  var strict = opts.strict
  var newline = opts.newline !== false

  var buffer = []
  var bufferSize = 0
  var dup = duplexify.obj()

  var peeker = through.obj({highWaterMark:1}, function(data, enc, cb) {
    if (isObject(data)) return ready(data, null, cb)
    if (!Buffer.isBuffer(data)) data = bufferFrom(data)

    if (newline) {
      var nl = Array.prototype.indexOf.call(data, 10)
      if (nl > 0 && data[nl-1] === 13) nl--

      if (nl > -1) {
        buffer.push(data.slice(0, nl))
        return ready(Buffer.concat(buffer), data.slice(nl), cb)
      }
    }

    buffer.push(data)
    bufferSize += data.length

    if (bufferSize < maxBuffer) return cb()
    if (strict) return cb(new Error('No newline found'))
    ready(Buffer.concat(buffer), null, cb)
  })

  var onpreend = function() {
    if (strict) return dup.destroy(new Error('No newline found'))
    dup.cork()
    ready(Buffer.concat(buffer), null, function(err) {
      if (err) return dup.destroy(err)
      dup.uncork()
    })
  }

  var ready = function(data, overflow, cb) {
    dup.removeListener('preend', onpreend)
    onpeek(data, function(err, parser) {
      if (err) return cb(err)

      dup.setWritable(parser)
      dup.setReadable(parser)

      if (data) parser.write(data)
      if (overflow) parser.write(overflow)

      overflow = buffer = peeker = null // free the data
      cb()
    })
  }

  dup.on('preend', onpreend)
  dup.setWritable(peeker)

  return dup
}

module.exports = peek

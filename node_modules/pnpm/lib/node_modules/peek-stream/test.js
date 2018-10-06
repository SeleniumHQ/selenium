var peek = require('./')
var tape = require('tape')
var concat = require('concat-stream')
var through = require('through2')

var uppercase = function(data, enc, cb) {
  cb(null, data.toString().toUpperCase())
}

tape('swap to uppercase', function(t) {
  var p = peek(function(data, swap) {
    swap(null, through(uppercase))
  })

  p.pipe(concat(function(data) {
    t.same(data.toString(), 'HELLO\nWORLD\n')
    t.end()
  }))

  p.write('hello\n')
  p.write('world\n')
  p.end()
})

tape('swap to uppercase no newline', function(t) {
  var p = peek(function(data, swap) {
    swap(null, through(uppercase))
  })

  p.pipe(concat(function(data) {
    t.same(data.toString(), 'HELLOWORLD')
    t.end()
  }))

  p.write('hello')
  p.write('world')
  p.end()
})

tape('swap to uppercase async', function(t) {
  var p = peek(function(data, swap) {
    setTimeout(function() {
      swap(null, through(uppercase))
    }, 100)
  })

  p.pipe(concat(function(data) {
    t.same(data.toString(), 'HELLO\nWORLD\n')
    t.end()
  }))

  p.write('hello\n')
  p.write('world\n')
  p.end()
})

tape('swap to error', function(t) {
  var p = peek(function(data, swap) {
    swap(new Error('nogo'))
  })

  p.on('error', function(err) {
    t.ok(err)
    t.same(err.message, 'nogo')
    t.end()
  })

  p.write('hello\n')
  p.write('world\n')
  p.end()
})

tape('swap to error async', function(t) {
  var p = peek(function(data, swap) {
    setTimeout(function() {
      swap(new Error('nogo'))
    }, 100)
  })

  p.on('error', function(err) {
    t.ok(err)
    t.same(err.message, 'nogo')
    t.end()
  })

  p.write('hello\n')
  p.write('world\n')
  p.end()
})
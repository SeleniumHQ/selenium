
var test      = require('tap').test
  , split     = require('./')
  , callback  = require('callback-stream')
  , strcb     = callback.bind(null, { decodeStrings: false })
  , objcb     = callback.bind(null, { objectMode: true })

test('split two lines on end', function(t) {
  t.plan(1)

  var input = split()

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello\nworld')
})

test('split two lines on two writes', function(t) {
  t.plan(1)

  var input = split()

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.write('hello')
  input.write('\nworld')
  input.end()
})

test('accumulate multiple writes', function(t) {
  t.plan(1)

  var input = split()

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, ['helloworld'])
  }))

  input.write('hello')
  input.write('world')
  input.end()
})

test('split using a custom string matcher', function(t) {
  t.plan(1)

  var input = split('~')

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello~world')
})

test('split using a custom regexp matcher', function(t) {
  t.plan(1)

  var input = split(/~/)

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello~world')
})

test('support an option argument', function(t) {
  t.plan(2)

  var input = split({ highWaterMark: 2 })

  input.pipe(strcb(function(err, list) {
    t.notOk(err, 'no errors')
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello\nworld')
})

test('support a mapper function', function(t) {
  t.plan(2)

  var a = { a: '42' }
    , b = { b: '24' }
  var input = split(JSON.parse)

  input.pipe(objcb(function(err, list) {
    t.notOk(err, 'no errors')
    t.deepEqual(list, [a, b])
  }))

  input.write(JSON.stringify(a))
  input.write('\n')
  input.end(JSON.stringify(b))
})

test('split lines windows-style', function(t) {
  t.plan(1)

  var input = split()

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello\r\nworld')
})

test('splits a buffer', function(t) {
  t.plan(1)

  var input = split()

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end(new Buffer('hello\nworld'))
})

test('do not end on undefined', function(t) {
  t.plan(1)

  var input = split(function(line) {})

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, [])
  }))

  input.end(new Buffer('hello\nworld'))
})

test('has destroy method', function(t) {
  t.plan(1)

  var input = split(function(line) {})

  input.on('close', function() {
    t.ok(true, 'close emitted')
    t.end()
  })

  input.destroy()
})

test('support custom matcher and mapper', function(t) {
  t.plan(4)

  var a = { a: '42' }
    , b = { b: '24' }
  var input = split('~', JSON.parse)

  t.equal(input.matcher, '~')
  t.equal(typeof input.mapper, 'function')

  input.pipe(objcb(function(err, list) {
    t.notOk(err, 'no errors')
    t.deepEqual(list, [a, b])
  }))

  input.write(JSON.stringify(a))
  input.write('~')
  input.end(JSON.stringify(b))
})

test('support custom matcher and options', function(t) {
  t.plan(6)

  var input = split('~', { highWaterMark: 1024 })

  t.equal(input.matcher, '~')
  t.equal(typeof input.mapper, 'function')
  t.equal(input._readableState.highWaterMark, 1024)
  t.equal(input._writableState.highWaterMark, 1024)

  input.pipe(strcb(function(err, list) {
    t.notOk(err, 'no errors')
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello~world')
})

test('support mapper and options', function(t) {
  t.plan(6)

  var a = { a: '42' }
    , b = { b: '24' }
  var input = split(JSON.parse, { highWaterMark: 1024 })

  t.ok(input.matcher instanceof RegExp, 'matcher is RegExp')
  t.equal(typeof input.mapper, 'function')
  t.equal(input._readableState.highWaterMark, 1024)
  t.equal(input._writableState.highWaterMark, 1024)

  input.pipe(objcb(function(err, list) {
    t.notOk(err, 'no errors')
    t.deepEqual(list, [a, b])
  }))

  input.write(JSON.stringify(a))
  input.write('\n')
  input.end(JSON.stringify(b))
})

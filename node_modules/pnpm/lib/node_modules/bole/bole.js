var _stringify = require('fast-safe-stringify')
  , individual = require('individual')('$$bole', { fastTime: false }) // singleton
  , format     = require('./format')
  , levels     = 'debug info warn error'.split(' ')
  , hostname   = require('os').hostname()
  , hostnameSt = _stringify(hostname)
  , pid        = process.pid
  , hasObjMode = false
  , scache     = []

levels.forEach(function (level) {
  // prepare a common part of the stringified output
  scache[level] = ',"hostname":' + hostnameSt + ',"pid":' + pid + ',"level":"' + level
  Number(scache[level]) // convert internal representation to plain string

  if (!Array.isArray(individual[level]))
    individual[level] = []
})


function stackToString (e) {
  var s = e.stack
    , ce

  if (typeof e.cause === 'function' && (ce = e.cause()))
    s += '\nCaused by: ' + stackToString(ce)

  return s
}


function errorToOut (err, out) {
  out.err = {
      name    : err.name
    , message : err.message
    , code    : err.code // perhaps
    , stack   : stackToString(err)
  }
}


function requestToOut (req, out) {
  out.req = {
      method        : req.method
    , url           : req.url
    , headers       : req.headers
    , remoteAddress : req.connection.remoteAddress
    , remotePort    : req.connection.remotePort
  }
}


function objectToOut (obj, out) {
  var k

  for (k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k))
      out[k] = obj[k]
  }
}


function objectMode (stream) {
  return stream._writableState && stream._writableState.objectMode === true
}


function stringify (level, name, message, obj) {
  var k
    , s = '{"time":'
        + (individual.fastTime ? Date.now() : ('"' + new Date().toISOString() + '"'))
        + scache[level]
        + '","name":'
        + name
        + (message !== undefined ? (',"message":' + _stringify(message)) : '')

  for (k in obj)
    s += ',' + _stringify(k) + ':' + _stringify(obj[k])

  s += '}'

  Number(s) // convert internal representation to plain string

  return s
}


function extend (level, name, message, obj) {
  var k
    , newObj = {
          time     : individual.fastTime ? Date.now() : new Date().toISOString()
        , hostname : hostname
        , pid      : pid
        , level    : level
        , name     : name
      }

  if (message !== undefined)
    obj.message = message

  for (k in obj)
    newObj[k] = obj[k]

  return newObj
}


function levelLogger (level, name) {
  var outputs = individual[level]
    , nameSt  = _stringify(name)

  return function namedLevelLogger (inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
    if (outputs.length === 0)
      return

    var out = {}
      , objectOut
      , i = 0
      , l = outputs.length
      , stringified
      , message

    if (typeof inp === 'string' || inp == null) {
      if (!(message = format(inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16)))
        message = undefined
    } else {
      if (!(message = format(a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16)))
        message = undefined
      if (typeof inp === 'boolean')
        message = String(inp)
      else if (inp instanceof Error) {
        errorToOut(inp, out)
      } else if (typeof inp === 'object') {
        if (inp.method && inp.url && inp.headers && inp.socket)
          requestToOut(inp, out)
        else
          objectToOut(inp, out)
      }
    }

    if (l === 1 && !hasObjMode) { // fast, standard case
      outputs[0].write(new Buffer(stringify(level, nameSt, message, out) + '\n'))
      return
    }

    for (; i < l; i++) {
      if (objectMode(outputs[i])) {
        if (objectOut === undefined) // lazy object completion
          objectOut = extend(level, name, message, out)
        outputs[i].write(objectOut)
      } else {
        if (stringified === undefined) // lazy stringify
          stringified = new Buffer(stringify(level, nameSt, message, out) + '\n')
        outputs[i].write(stringified)
      }
    }
  }
}


function bole (name) {
  function boleLogger (subname) {
    return bole(name + ':' + subname)
  }

  function makeLogger (p, level) {
    p[level] = levelLogger(level, name)
    return p
  }

  return levels.reduce(makeLogger, boleLogger)
}


bole.output = function output (opt) {
  var i = 0, b

  if (Array.isArray(opt)) {
    opt.forEach(bole.output)
    return bole
  }

  if (typeof opt.level !== 'string')
    throw new TypeError('Must provide a "level" option')

  for (; i < levels.length; i++) {
    if (!b && levels[i] === opt.level)
      b = true

    if (b) {
      if (opt.stream && objectMode(opt.stream))
        hasObjMode = true
      individual[levels[i]].push(opt.stream)
    }
  }

  return bole
}


bole.reset = function reset () {
  levels.forEach(function (level) {
    individual[level].splice(0, individual[level].length)
  })
  individual.fastTime = false
  return bole
}


bole.setFastTime = function setFastTime (b) {
  if (!arguments.length)
    individual.fastTime = true
  else
    individual.fastTime = b
  return bole
}


module.exports = bole

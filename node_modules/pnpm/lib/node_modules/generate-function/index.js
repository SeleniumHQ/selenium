var util = require('util')

var last = function(str) {
  str = str.trim()
  return str[str.length-1]
}

var first = function(str) {
  return str.trim()[0]
}

var notEmpty = function(line) {
  return line.trim()
}

var notEmptyElse = function() {
  var notNext = false
  return function(line, i, lines) {
    if (notNext) {
      notNext = false
      return ''
    }
    if (lines[i].trim() === '} else {' && (lines[i+1] || '').trim() === '}') {
      notNext = true
      return lines[i].replace('} else {', '}')
    }
    return line
  }
}

module.exports = function() {
  var lines = []
  var indent = 0

  var push = function(str) {
    var spaces = ''
    while (spaces.length < indent*2) spaces += '  '
    lines.push(spaces+str)
  }

  var line = function(fmt) {
    if (!fmt) return line

    if (fmt.trim()[0] === '}' && fmt[fmt.length-1] === '{') {
      indent--
      push(util.format.apply(util, arguments))
      indent++
      return line
    }
    if (fmt[fmt.length-1] === '{') {
      push(util.format.apply(util, arguments))
      indent++
      return line
    }
    if (fmt.trim()[0] === '}') {
      indent--
      push(util.format.apply(util, arguments))
      return line
    }

    push(util.format.apply(util, arguments))
    return line
  }

  line.trim = function() {
    lines = lines
      .filter(notEmpty)
      .map(notEmptyElse())
      .filter(notEmpty)
    return line
  }

  line.toString = function() {
    return lines.join('\n')
  }

  line.toFunction = function(scope) {
    var src = 'return ('+line.toString()+')'

    var keys = Object.keys(scope || {}).map(function(key) {
      return key
    })

    var vals = keys.map(function(key) {
      return scope[key]
    })

    return Function.apply(null, keys.concat(src)).apply(null, vals)
  }

  if (arguments.length) line.apply(null, arguments)

  return line
}

var isAnsi = require('ansi-regex')()

module.exports = splitAnsi

function splitAnsi (str) {
  var parts = str.match(isAnsi)
  if (!parts) return [str]

  var result = []
  var offset = 0
  var ptr = 0

  for (var i = 0; i < parts.length; i++) {
    offset = str.indexOf(parts[i], offset)
    if (offset === -1) throw new Error('Could not split string')
    if (ptr !== offset) result.push(str.slice(ptr, offset))
    if (ptr === offset && result.length) {
      result[result.length - 1] += parts[i]
    } else {
      if (offset === 0) result.push('')
      result.push(parts[i])
    }
    ptr = offset + parts[i].length
  }

  result.push(str.slice(ptr))
  return result
}

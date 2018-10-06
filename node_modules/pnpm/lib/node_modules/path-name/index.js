'use strict'

var PATH
// windows calls it's path 'Path' usually, but this is not guaranteed.
if (process.platform === 'win32') {
  PATH = 'Path'
  Object.keys(process.env).forEach(e => {
    if (e.match(/^PATH$/i)) {
      PATH = e
    }
  })
} else {
  PATH = 'PATH'
}

module.exports = PATH

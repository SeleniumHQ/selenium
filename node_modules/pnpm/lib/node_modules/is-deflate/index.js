'use strict'

module.exports = function (buf) {
  if (!buf || buf.length < 2) return false
  return buf[0] === 0x78 && (buf[1] === 1 || buf[1] === 0x9c || buf[1] === 0xda)
}

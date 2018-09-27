// consider this a warning about getting obsessive about optimization

var utilformat = require('util').format


function format (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
  if (a16 !== undefined)
    return utilformat(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16)
  if (a15 !== undefined)
    return utilformat(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15)
  if (a14 !== undefined)
    return utilformat(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14)
  if (a13 !== undefined)
    return utilformat(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13)
  if (a12 !== undefined)
    return utilformat(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12)
  if (a11 !== undefined)
    return utilformat(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11)
  if (a10 !== undefined)
    return utilformat(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10)
  if (a9 !== undefined)
    return utilformat(a1, a2, a3, a4, a5, a6, a7, a8, a9)
  if (a8 !== undefined)
    return utilformat(a1, a2, a3, a4, a5, a6, a7, a8)
  if (a7 !== undefined)
    return utilformat(a1, a2, a3, a4, a5, a6, a7)
  if (a6 !== undefined)
    return utilformat(a1, a2, a3, a4, a5, a6)
  if (a5 !== undefined)
    return utilformat(a1, a2, a3, a4, a5)
  if (a4 !== undefined)
    return utilformat(a1, a2, a3, a4)
  if (a3 !== undefined)
    return utilformat(a1, a2, a3)
  if (a2 !== undefined)
    return utilformat(a1, a2)
  return a1
}

module.exports = format

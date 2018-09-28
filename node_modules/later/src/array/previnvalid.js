/**
* Previous Invalid
* (c) 2013 Bill, BunKat LLC.
*
* Returns the previous invalid value in a range of values, wrapping as needed. Assumes
* the array has already been sorted.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

later.array.prevInvalid = function (val, values, extent) {

  var min = extent[0], max = extent[1], len = values.length,
      zeroVal = values[len-1] === 0 && min !== 0 ? max : 0,
      next = val,
      i = values.indexOf(val),
      start = next;

  while(next === (values[i] || zeroVal)) {
    next--;

    if(next < min) {
      next = max;
    }

    i--;
    if(i === -1) {
      i = len-1;
    }

    if(next === start) {
      return undefined;
    }
  }

  return next;
};
/**
* Next Invalid
* (c) 2013 Bill, BunKat LLC.
*
* Returns the next invalid value in a range of values, wrapping as needed. Assumes
* the array has already been sorted.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

later.array.nextInvalid = function (val, values, extent) {

  var min = extent[0], max = extent[1], len = values.length,
      zeroVal = values[len-1] === 0 && min !== 0 ? max : 0,
      next = val,
      i = values.indexOf(val),
      start = next;

  while(next === (values[i] || zeroVal)) {

    next++;
    if(next > max) {
      next = min;
    }

    i++;
    if(i === len) {
      i = 0;
    }

    if(next === start) {
      return undefined;
    }
  }

  return next;
};
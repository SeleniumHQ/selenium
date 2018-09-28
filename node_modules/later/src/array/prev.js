/**
* Previous
* (c) 2013 Bill, BunKat LLC.
*
* Returns the previous valid value in a range of values, wrapping as needed. Assumes
* the array has already been sorted.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

later.array.prev = function (val, values, extent) {

  var cur, len = values.length,
      zeroIsLargest = extent[0] !== 0,
      prevIdx = len-1;

  for(var i = 0; i < len; i++) {
    cur = values[i];

    if(cur === val) {
      return cur;
    }

    if(cur < val || (cur === 0 && zeroIsLargest && extent[1] < val)) {
      prevIdx = i;
      continue;
    }

    break;
  }

  return values[prevIdx];
};
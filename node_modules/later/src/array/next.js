/**
* Next
* (c) 2013 Bill, BunKat LLC.
*
* Returns the next valid value in a range of values, wrapping as needed. Assumes
* the array has already been sorted.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

later.array.next = function (val, values, extent) {

  var cur,
      zeroIsLargest = extent[0] !== 0,
      nextIdx = 0;

  for(var i = values.length-1; i > -1; --i) {
    cur = values[i];

    if(cur === val) {
      return cur;
    }

    if(cur > val || (cur === 0 && zeroIsLargest && extent[1] > val)) {
      nextIdx = i;
      continue;
    }

    break;
  }

  return values[nextIdx];
};
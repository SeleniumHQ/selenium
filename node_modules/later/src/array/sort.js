/**
* Sort
* (c) 2013 Bill, BunKat LLC.
*
* Sorts an array in natural ascending order, placing zero at the end
* if zeroIsLast is true.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

later.array.sort = function (arr, zeroIsLast) {
  arr.sort(function(a,b) {
    return +a - +b;
  });

  if(zeroIsLast && arr[0] === 0) {
    arr.push(arr.shift());
  }
};
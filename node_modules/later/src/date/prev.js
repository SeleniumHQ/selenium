/**
* Prev
* (c) 2013 Bill, BunKat LLC.
*
* Creates a new Date object defaulted to the last second after the specified
* values.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

/**
* Builds and returns a new Date using the specified values.  Date
* returned is either using Local time or UTC based on isLocal.
*
* @param {Int} Y: Four digit year
* @param {Int} M: Month between 0 and 11, defaults to 11
* @param {Int} D: Date between 1 and 31, defaults to last day of month
* @param {Int} h: Hour between 0 and 23, defaults to 23
* @param {Int} m: Minute between 0 and 59, defaults to 59
* @param {Int} s: Second between 0 and 59, defaults to 59
*/
later.date.prev = function(Y, M, D, h, m, s) {

  var len = arguments.length;
  M = len < 2 ? 11 : M-1;
  D = len < 3 ? later.D.extent(later.date.next(Y, M+1))[1] : D;
  h = len < 4 ? 23 : h;
  m = len < 5 ? 59 : m;
  s = len < 6 ? 59 : s;

  return later.date.build(Y, M, D, h, m, s);
};
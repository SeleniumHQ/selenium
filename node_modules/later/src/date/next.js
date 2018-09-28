/**
* Next
* (c) 2013 Bill, BunKat LLC.
*
* Creates a new Date object defaulted to the first second after the specified
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
* @param {Int} M: Month between 1 and 12, defaults to 1
* @param {Int} D: Date between 1 and 31, defaults to 1
* @param {Int} h: Hour between 0 and 23, defaults to 0
* @param {Int} m: Minute between 0 and 59, defaults to 0
* @param {Int} s: Second between 0 and 59, defaults to 0
*/
later.date.next = function(Y, M, D, h, m, s) {

  return later.date.build(
    Y,
    M !== undefined ? M-1 : 0,
    D !== undefined ? D : 1,
    h || 0,
    m || 0,
    s || 0);
};
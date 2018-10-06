/**
* Next Rollover
* (c) 2013 Bill, BunKat LLC.
*
* Determines if a value will cause a particualr constraint to rollover to the
* next largest time period. Used primarily when a constraint has a
* variable extent.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

later.date.nextRollover = function(d, val, constraint, period) {
  var cur = constraint.val(d),
      max = constraint.extent(d)[1];

  return (((val || max) <= cur) || val > max) ?
            new Date(period.end(d).getTime() + later.SEC) :
            period.start(d);
};
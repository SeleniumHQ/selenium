/**
* Prev Rollover
* (c) 2013 Bill, BunKat LLC.
*
* Determines if a value will cause a particualr constraint to rollover to the
* previous largest time period. Used primarily when a constraint has a
* variable extent.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

later.date.prevRollover = function(d, val, constraint, period) {
  var cur = constraint.val(d);

  return (val >= cur || !val) ?
            period.start(period.prev(d, period.val(d)-1)) :
            period.start(d);
};
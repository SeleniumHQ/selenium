/**
* Modifier
* (c) 2013 Bill, BunKat LLC.
*
* Example of creating a custom modifier. See
* http://bunkat.github.io/later/modifiers.html#custom for more details.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

var later = require('../index');

// create the new modifier
later.modifier.month = later.modifier.m = function(period, values) {
  if(period.name !== 'month') {
    throw new Error('Month modifier only works with months!');
  }

  return {
    name:     'reIndexed ' + period.name,
    range:    period.range,
    val:      function(d) { return period.val(d) - 1; },
    isValid:  function(d, val) { return period.isValid(d, val+1); },
    extent:   function(d) { return [0, 11]; },
    start:    period.start,
    end:      period.end,
    next:     function(d, val) { return period.next(d, val+1); },
    prev:     function(d, val) { return period.prev(d, val+1); }
  };
};

// use our new modifier in a schedule
var sched = later.parse.recur().customModifier('m', 2).month(),
    next = later.schedule(sched).next(1, new Date(2013, 3, 21));

console.log(next.toUTCString());
// Sat, 01 Mar 2014 00:00:00 GMT
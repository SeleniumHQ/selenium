/**
* Timeperiod
* (c) 2013 Bill, BunKat LLC.
*
* Example of creating a custom time period. See
* http://bunkat.github.io/later/time-periods.html#custom for more details.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

var later = require('../index');

// PartOfDay time period
// 0 = before noon (morning)
// 1 = after noon, before 6pm (afternoon)
// 2 = after 6pm (evening)
later.partOfDay = later.pd = {

  // the name of this time period
  name: 'part of day',

  // the minimum amount of seconds that moving from one value to the next
  // value will cover. in this case, the minimum is roughly 6 hours
  range: later.h.range * 6,

  // return the appropriate val based on the current hour
  val: function(d) {
    return later.h.val(d) < 12 ? 0 :
           later.h.val(d) < 18 ? 1 :
           2;
  },

  // use val(d) to determine if a particular value is valid
  isValid: function(d, val) {
    return later.pd.val(d) === val;
  },

  // ours is constant since every day will have the same number of ranges
  extent: function(d) { return [0, 2]; },

  // start is the first date that has the same val(d) as the d. in our case
  // this is either hour 0, 12, or 18 depending on what part of the day we
  // are in
  start: function(d) {
    var hour = later.pd.val(d) === 0 ? 0 :
                  later.pd.val(d) === 1 ? 12 :
                  18;

    // next is a helper that automatically creates a day in the right timezone
    return later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d),
      hour
    );
  },

  // end is the last date that has the same val(d) as the d. in our case this
  // is the last second of the part of the day we are in
  end: function(d) {
    var hour = later.pd.val(d) === 0 ? 11 :
                  later.pd.val(d) === 1 ? 5 :
                  23;

    // prev is a helper that automatically creates a day in the right timezone
    // with unspecified date parts set to the maximum (this case will set
    // minutes and seconds to 59 for us)
    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d),
      hour
    );
  },

  // move to the next instance of the specified time of day, noting that it
  // may occur on the following day
  next: function(d, val) {
    var hour = val === 0 ? 0 : val === 1 ? 12 : 18;

    return later.date.next(
      later.Y.val(d),
      later.M.val(d),
      // increment the day if we already passed the desired time period
      later.D.val(d) + (hour < later.h.val(d) ? 1 : 0),
      hour
    );
  },

  // move to the prev instance of the specified time of day, noting that it
  // may occur on the previous day
  prev: function(d, val) {
    var hour = val === 0 ? 11 : val === 1 ? 5 : 23;

    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      // decrement the day if we already passed the desired time period
      later.D.val(d) + (hour > later.h.val(d) ? -1 : 0),
      hour
    );
  }
};

// use our new time period in a schedule
later.date.localTime();
var sched = later.parse.recur().every(15).minute().on(2).customPeriod('pd'),
    next = later.schedule(sched).next(5, new Date(2013, 3, 21));

console.log(next);
//[ Sun Apr 21 2013 18:00:00,
//  Sun Apr 21 2013 18:15:00,
//  Sun Apr 21 2013 18:30:00,
//  Sun Apr 21 2013 18:45:00,
//  Sun Apr 21 2013 19:00:00 ]
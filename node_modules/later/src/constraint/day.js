/**
* Day Constraint (D)
* (c) 2013 Bill, BunKat LLC.
*
* Definition for a day of month (date) constraint type.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/
later.day = later.D = {

  /**
  * The name of this constraint.
  */
  name: 'day',

  /**
  * The rough amount of seconds between start and end for this constraint.
  * (doesn't need to be exact)
  */
  range: 86400,

  /**
  * The day value of the specified date.
  *
  * @param {Date} d: The date to calculate the value of
  */
  val: function(d) {
    return d.D || (d.D = later.date.getDate.call(d));
  },

  /**
  * Returns true if the val is valid for the date specified.
  *
  * @param {Date} d: The date to check the value on
  * @param {Integer} val: The value to validate
  */
  isValid: function(d, val) {
    return later.D.val(d) === (val || later.D.extent(d)[1]);
  },

  /**
  * The minimum and maximum valid day values of the month specified.
  * Zero to specify the last day of the month.
  *
  * @param {Date} d: The date indicating the month to find the extent of
  */
  extent: function(d) {
    if(d.DExtent) return d.DExtent;

    var month = later.M.val(d),
        max = later.DAYS_IN_MONTH[month-1];

    if(month === 2 && later.dy.extent(d)[1] === 366) {
      max = max+1;
    }

    return (d.DExtent = [1, max]);
  },

  /**
  * The start of the day of the specified date.
  *
  * @param {Date} d: The specified date
  */
  start: function(d) {
    return d.DStart || (d.DStart = later.date.next(
      later.Y.val(d), later.M.val(d), later.D.val(d)));
  },

  /**
  * The end of the day of the specified date.
  *
  * @param {Date} d: The specified date
  */
  end: function(d) {
    return d.DEnd || (d.DEnd = later.date.prev(
      later.Y.val(d), later.M.val(d), later.D.val(d)));
  },

  /**
  * Returns the start of the next instance of the day value indicated. Returns
  * the first day of the next month if val is greater than the number of
  * days in the following month.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  next: function(d, val) {
    val = val > later.D.extent(d)[1] ? 1 : val;
    var month = later.date.nextRollover(d, val, later.D, later.M),
        DMax = later.D.extent(month)[1];

    val = val > DMax ? 1 : val || DMax;

    return later.date.next(
      later.Y.val(month),
      later.M.val(month),
      val
    );
  },

  /**
  * Returns the end of the previous instance of the day value indicated. Returns
  * the last day in the previous month if val is greater than the number of days
  * in the previous month.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  prev: function(d, val) {
    var month = later.date.prevRollover(d, val, later.D, later.M),
        DMax = later.D.extent(month)[1];

    return later.date.prev(
      later.Y.val(month),
      later.M.val(month),
      val > DMax ? DMax : val || DMax
    );
  }

};
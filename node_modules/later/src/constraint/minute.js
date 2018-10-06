/**
* Minute Constraint (m)
* (c) 2013 Bill, BunKat LLC.
*
* Definition for a minute constraint type.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/
later.minute = later.m = {

  /**
  * The name of this constraint.
  */
  name: 'minute',

  /**
  * The rough amount of seconds between start and end for this constraint.
  * (doesn't need to be exact)
  */
  range: 60,

  /**
  * The minute value of the specified date.
  *
  * @param {Date} d: The date to calculate the value of
  */
  val: function(d) {
    return d.m || (d.m = later.date.getMin.call(d));
  },

  /**
  * Returns true if the val is valid for the date specified.
  *
  * @param {Date} d: The date to check the value on
  * @param {Integer} val: The value to validate
  */
  isValid: function(d, val) {
    return later.m.val(d) === val;
  },

  /**
  * The minimum and maximum valid minute values.
  */
  extent: function(d) {
    return [0, 59];
  },

  /**
  * The start of the minute of the specified date.
  *
  * @param {Date} d: The specified date
  */
  start: function(d) {
    return d.mStart || (d.mStart = later.date.next(
      later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d), later.m.val(d)));
  },

  /**
  * The end of the minute of the specified date.
  *
  * @param {Date} d: The specified date
  */
  end: function(d) {
    return d.mEnd || (d.mEnd = later.date.prev(
      later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d), later.m.val(d)));
  },

  /**
  * Returns the start of the next instance of the minute value indicated.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  next: function(d, val) {
    var m = later.m.val(d),
        s = later.s.val(d),
        inc = val > 59 ? 60-m : (val <= m ? (60-m) + val : val-m),
        next = new Date(d.getTime() + (inc * later.MIN) - (s * later.SEC));

    // correct for passing over a daylight savings boundry
    if(!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + ((inc + 120) * later.MIN) - (s * later.SEC));
    }

    return next;
  },

  /**
  * Returns the end of the previous instance of the minute value indicated.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  prev: function(d, val) {
    val = val > 59 ? 59 : val;

    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d),
      later.h.val(d) + (val >= later.m.val(d) ? -1 : 0),
      val);
  }

};
/**
* Time Constraint (dy)
* (c) 2013 Bill, BunKat LLC.
*
* Definition for a time of day constraint type. Stored as number of seconds
* since midnight to simplify calculations.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/
later.time = later.t = {

  /**
  * The name of this constraint.
  */
  name: 'time',

  /**
  * The rough amount of seconds between start and end for this constraint.
  * (doesn't need to be exact)
  */
  range: 1,

  /**
  * The time value of the specified date.
  *
  * @param {Date} d: The date to calculate the value of
  */
  val: function(d) {
    return d.t || (d.t =
      (later.h.val(d) * 3600) + (later.m.val(d) * 60) + (later.s.val(d)));
  },

  /**
  * Returns true if the val is valid for the date specified.
  *
  * @param {Date} d: The date to check the value on
  * @param {Integer} val: The value to validate
  */
  isValid: function(d, val) {
    return later.t.val(d) === val;
  },

  /**
  * The minimum and maximum valid time values.
  */
  extent: function() {
    return [0, 86399];
  },

  /**
  * Returns the specified date.
  *
  * @param {Date} d: The specified date
  */
  start: function(d) {
    return d;
  },

  /**
  * Returns the specified date.
  *
  * @param {Date} d: The specified date
  */
  end: function(d) {
    return d;
  },

  /**
  * Returns the start of the next instance of the time value indicated.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  next: function(d, val) {
    val = val > 86399 ? 0 : val;

    var next = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (val <= later.t.val(d) ? 1 : 0),
      0,
      0,
      val);

    // correct for passing over a daylight savings boundry
    if(!later.date.isUTC && next.getTime() < d.getTime()) {
      next = later.date.next(
        later.Y.val(next),
        later.M.val(next),
        later.D.val(next),
        later.h.val(next),
        later.m.val(next),
        val + 7200);
    }

    return next;
  },

  /**
  * Returns the end of the previous instance of the time value indicated.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  prev: function(d, val) {
    val = val > 86399 ? 86399 : val;

    return later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (val >= later.t.val(d) ? -1 : 0),
      0,
      0,
      val);
  }

};
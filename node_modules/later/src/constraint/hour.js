/**
* Hour Constraint (H)
* (c) 2013 Bill, BunKat LLC.
*
* Definition for a hour constraint type.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/
later.hour = later.h = {

  /**
  * The name of this constraint.
  */
  name: 'hour',

  /**
  * The rough amount of seconds between start and end for this constraint.
  * (doesn't need to be exact)
  */
  range: 3600,

  /**
  * The hour value of the specified date.
  *
  * @param {Date} d: The date to calculate the value of
  */
  val: function(d) {
    return d.h || (d.h = later.date.getHour.call(d));
  },

  /**
  * Returns true if the val is valid for the date specified.
  *
  * @param {Date} d: The date to check the value on
  * @param {Integer} val: The value to validate
  */
  isValid: function(d, val) {
    return later.h.val(d) === val;
  },

  /**
  * The minimum and maximum valid hour values.
  */
  extent: function() {
    return [0, 23];
  },

  /**
  * The start of the hour of the specified date.
  *
  * @param {Date} d: The specified date
  */
  start: function(d) {
    return d.hStart || (d.hStart = later.date.next(
      later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d)));
  },

  /**
  * The end of the hour of the specified date.
  *
  * @param {Date} d: The specified date
  */
  end: function(d) {
    return d.hEnd || (d.hEnd = later.date.prev(
      later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d)));
  },

  /**
  * Returns the start of the next instance of the hour value indicated.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  next: function(d, val) {
    val = val > 23 ? 0 : val;

    var next = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (val <= later.h.val(d) ? 1 : 0),
      val);

    // correct for passing over a daylight savings boundry
    if(!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = later.date.next(
        later.Y.val(next),
        later.M.val(next),
        later.D.val(next),
        val + 1);
    }

    return next;
  },

  /**
  * Returns the end of the previous instance of the hour value indicated.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  prev: function(d, val) {
    val = val > 23 ? 23 : val;

    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (val >= later.h.val(d) ? -1 : 0),
      val);
  }

};
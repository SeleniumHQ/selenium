/**
* Month Constraint (M)
* (c) 2013 Bill, BunKat LLC.
*
* Definition for a month constraint type.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/
later.month = later.M = {

  /**
  * The name of this constraint.
  */
  name: 'month',

  /**
  * The rough amount of seconds between start and end for this constraint.
  * (doesn't need to be exact)
  */
  range: 2629740,

  /**
  * The month value of the specified date.
  *
  * @param {Date} d: The date to calculate the value of
  */
  val: function(d) {
    return d.M || (d.M = later.date.getMonth.call(d)+1);
  },

  /**
  * Returns true if the val is valid for the date specified.
  *
  * @param {Date} d: The date to check the value on
  * @param {Integer} val: The value to validate
  */
  isValid: function(d, val) {
    return later.M.val(d) === (val || 12);
  },

  /**
  * The minimum and maximum valid month values. Unlike the native date object,
  * month values in later are 1 based.
  */
  extent: function() {
    return [1, 12];
  },

  /**
  * The start of the month of the specified date.
  *
  * @param {Date} d: The specified date
  */
  start: function(d) {
    return d.MStart || (d.MStart = later.date.next(later.Y.val(d), later.M.val(d)));
  },

  /**
  * The end of the month of the specified date.
  *
  * @param {Date} d: The specified date
  */
  end: function(d) {
    return d.MEnd || (d.MEnd = later.date.prev(later.Y.val(d), later.M.val(d)));
  },

  /**
  * Returns the start of the next instance of the month value indicated.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  next: function(d, val) {
    val = val > 12 ? 1 : val || 12;

    return later.date.next(
      later.Y.val(d) + (val > later.M.val(d) ? 0 : 1),
      val);
  },

  /**
  * Returns the end of the previous instance of the month value indicated.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  prev: function(d, val) {
    val = val > 12 ? 12 : val || 12;

    return later.date.prev(
      later.Y.val(d) - (val >= later.M.val(d) ? 1 : 0),
      val);
  }

};
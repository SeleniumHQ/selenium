/**
* Full date (fd)
* (c) 2013 Bill, BunKat LLC.
*
* Definition for specifying a full date and time.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/
later.fullDate = later.fd = {

  /**
  * The name of this constraint.
  */
  name: 'full date',

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
    return d.fd || (d.fd = d.getTime());
  },

  /**
  * Returns true if the val is valid for the date specified.
  *
  * @param {Date} d: The date to check the value on
  * @param {Integer} val: The value to validate
  */
  isValid: function(d, val) {
    return later.fd.val(d) === val;
  },

  /**
  * The minimum and maximum valid time values.
  */
  extent: function() {
    return [0, 32503680000000];
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
    return later.fd.val(d) < val ? new Date(val) : later.NEVER;
  },

  /**
  * Returns the end of the previous instance of the time value indicated.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  prev: function(d, val) {
    return later.fd.val(d) > val ? new Date(val) : later.NEVER;
  }

};
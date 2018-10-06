/**
* Week of Month Constraint (wy)
* (c) 2013 Bill, BunKat LLC.
*
* Definition for an week of month constraint type. Week of month treats the
* first of the month as the start of week 1, with each following week starting
* on Sunday.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/
later.weekOfMonth = later.wm = {

  /**
  * The name of this constraint.
  */
  name: 'week of month',

  /**
  * The rough amount of seconds between start and end for this constraint.
  * (doesn't need to be exact)
  */
  range: 604800,

  /**
  * The week of month value of the specified date.
  *
  * @param {Date} d: The date to calculate the value of
  */
  val: function(d) {
    return d.wm || (d.wm =
      (later.D.val(d) +
      (later.dw.val(later.M.start(d)) - 1) + (7 - later.dw.val(d))) / 7);
  },

  /**
  * Returns true if the val is valid for the date specified.
  *
  * @param {Date} d: The date to check the value on
  * @param {Integer} val: The value to validate
  */
  isValid: function(d, val) {
    return later.wm.val(d) === (val || later.wm.extent(d)[1]);
  },

  /**
  * The minimum and maximum valid week of month values for the month indicated.
  * Zero indicates the last week in the month.
  *
  * @param {Date} d: The date indicating the month to find values for
  */
  extent: function(d) {
    return d.wmExtent || (d.wmExtent = [1,
      (later.D.extent(d)[1] + (later.dw.val(later.M.start(d)) - 1) +
      (7 - later.dw.val(later.M.end(d)))) / 7]);
  },

  /**
  * The start of the week of the specified date.
  *
  * @param {Date} d: The specified date
  */
  start: function(d) {
    return d.wmStart || (d.wmStart = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      Math.max(later.D.val(d) - later.dw.val(d) + 1, 1)));
  },

  /**
  * The end of the week of the specified date.
  *
  * @param {Date} d: The specified date
  */
  end: function(d) {
    return d.wmEnd || (d.wmEnd = later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      Math.min(later.D.val(d) + (7 - later.dw.val(d)), later.D.extent(d)[1])));
  },

  /**
  * Returns the start of the next instance of the week value indicated. Returns
  * the first day of the next month if val is greater than the number of
  * days in the following month.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  next: function(d, val) {
    val = val > later.wm.extent(d)[1] ? 1 : val;

    var month = later.date.nextRollover(d, val, later.wm, later.M),
        wmMax = later.wm.extent(month)[1];

    val = val > wmMax ? 1 : val || wmMax;

    // jump to the Sunday of the desired week, set to 1st of month for week 1
    return later.date.next(
        later.Y.val(month),
        later.M.val(month),
        Math.max(1, (val-1) * 7 - (later.dw.val(month)-2)));
  },

  /**
  * Returns the end of the previous instance of the week value indicated. Returns
  * the last day of the previous month if val is greater than the number of
  * days in the previous month.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  prev: function(d, val) {
    var month = later.date.prevRollover(d, val, later.wm, later.M),
        wmMax = later.wm.extent(month)[1];

    val = val > wmMax ? wmMax : val || wmMax;

    // jump to the end of Saturday of the desired week
    return later.wm.end(later.date.next(
        later.Y.val(month),
        later.M.val(month),
        Math.max(1, (val-1) * 7 - (later.dw.val(month)-2))));
  }

};
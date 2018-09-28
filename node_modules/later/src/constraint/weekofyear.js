/**
* Week of Year Constraint (wy)
* (c) 2013 Bill, BunKat LLC.
*
* Definition for an ISO 8601 week constraint type. For more information about
* ISO 8601 see http://en.wikipedia.org/wiki/ISO_week_date.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/
later.weekOfYear = later.wy = {

  /**
  * The name of this constraint.
  */
  name: 'week of year (ISO)',

  /**
  * The rough amount of seconds between start and end for this constraint.
  * (doesn't need to be exact)
  */
  range: 604800,

  /**
  * The ISO week year value of the specified date.
  *
  * @param {Date} d: The date to calculate the value of
  */
  val: function(d) {
    if (d.wy) return d.wy;

    // move to the Thursday in the target week and find Thurs of target year
    var wThur = later.dw.next(later.wy.start(d), 5),
        YThur = later.dw.next(later.Y.prev(wThur, later.Y.val(wThur)-1), 5);

    // caculate the difference between the two dates in weeks
    return (d.wy = 1 + Math.ceil((wThur.getTime() - YThur.getTime()) / later.WEEK));
  },

  /**
  * Returns true if the val is valid for the date specified.
  *
  * @param {Date} d: The date to check the value on
  * @param {Integer} val: The value to validate
  */
  isValid: function(d, val) {
    return later.wy.val(d) === (val || later.wy.extent(d)[1]);
  },

  /**
  * The minimum and maximum valid ISO week values for the year indicated.
  *
  * @param {Date} d: The date indicating the year to find ISO values for
  */
  extent: function(d) {
    if (d.wyExtent) return d.wyExtent;

    // go to start of ISO week to get to the right year
    var year = later.dw.next(later.wy.start(d), 5),
        dwFirst = later.dw.val(later.Y.start(year)),
        dwLast = later.dw.val(later.Y.end(year));

    return (d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52]);
  },

  /**
  * The start of the ISO week of the specified date.
  *
  * @param {Date} d: The specified date
  */
  start: function(d) {
    return d.wyStart || (d.wyStart = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      // jump to the Monday of the current week
      later.D.val(d) - (later.dw.val(d) > 1 ? later.dw.val(d) - 2 : 6)
    ));
  },

  /**
  * The end of the ISO week of the specified date.
  *
  * @param {Date} d: The specified date
  */
  end: function(d) {
    return d.wyEnd || (d.wyEnd = later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      // jump to the Saturday of the current week
      later.D.val(d) + (later.dw.val(d) > 1 ? 8 - later.dw.val(d) : 0)
    ));
  },

  /**
  * Returns the start of the next instance of the ISO week value indicated.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  next: function(d, val) {
    val = val > later.wy.extent(d)[1] ? 1 : val;

    var wyThur = later.dw.next(later.wy.start(d), 5),
        year = later.date.nextRollover(wyThur, val, later.wy, later.Y);

    // handle case where 1st of year is last week of previous month
    if(later.wy.val(year) !== 1) {
      year = later.dw.next(year, 2);
    }

    var wyMax = later.wy.extent(year)[1],
        wyStart = later.wy.start(year);

    val = val > wyMax ? 1 : val || wyMax;

    return later.date.next(
        later.Y.val(wyStart),
        later.M.val(wyStart),
        later.D.val(wyStart) + 7 * (val-1)
      );
  },

  /**
  * Returns the end of the previous instance of the ISO week value indicated.
  *
  * @param {Date} d: The starting date
  * @param {int} val: The desired value, must be within extent
  */
  prev: function(d, val) {
    var wyThur = later.dw.next(later.wy.start(d), 5),
        year = later.date.prevRollover(wyThur, val, later.wy, later.Y);

    // handle case where 1st of year is last week of previous month
    if(later.wy.val(year) !== 1) {
      year = later.dw.next(year, 2);
    }

    var wyMax = later.wy.extent(year)[1],
        wyEnd = later.wy.end(year);

    val = val > wyMax ? wyMax : val || wyMax;

    return later.wy.end(later.date.next(
        later.Y.val(wyEnd),
        later.M.val(wyEnd),
        later.D.val(wyEnd) + 7 * (val-1)
      ));
  }
};
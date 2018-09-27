/**
* Simple API for generating valid schedules for Later.js.  All commands
* are chainable.
*
* Example:
*
* Every 5 minutes between minutes 15 and 45 of each hour and also
* at 9:00 am every day, except in the months of January and February
*
* recur().every(5).minute().between(15, 45).and().at('09:00:00')
*    .except().on(0, 1).month();
*/
later.parse.recur = function () {

  var schedules = [],
      exceptions = [],
      cur,
      curArr = schedules,
      curName,
      values, every, modifier, applyMin, applyMax, i, last;

  /**
  * Adds values to the specified constraint in the current schedule.
  *
  * @param {String} name: Name of constraint to add
  * @param {Int} min: Minimum value for this constraint
  * @param {Int} max: Maximum value for this constraint
  */
  function add(name, min, max) {
    name = modifier ? name + '_' + modifier : name;

    if (!cur) {
      curArr.push({});
      cur = curArr[0];
    }

    if (!cur[name]) {
      cur[name] = [];
    }

    curName = cur[name];

    if (every) {
      values = [];
      for (i = min; i <= max; i += every) {
        values.push(i);
      }

      // save off values in case of startingOn or between
      last = {n: name, x: every, c: curName.length, m: max};
    }

    values = applyMin ? [min] : applyMax ? [max] : values;
    var length = values.length;
    for (i = 0; i < length; i += 1) {
      var val = values[i];
      if (curName.indexOf(val) < 0) {
        curName.push(val);
      }
    }

    // reset the built up state
    values = every = modifier = applyMin = applyMax = 0;
  }

  return {

    /**
    * Set of constraints that must be met for an occurrence to be valid.
    *
    * @api public
    */
    schedules: schedules,

    /**
    * Set of exceptions that must not be met for an occurrence to be
    * valid.
    *
    * @api public
    */
    exceptions: exceptions,

    /**
    * Specifies the specific instances of a time period that are valid.
    * Must be followed by the desired time period (minute(), hour(),
    * etc). For example, to specify a schedule for the 5th and 25th
    * minute of every hour:
    *
    * recur().on(5, 25).minute();
    *
    * @param {Int} args: One or more valid instances
    * @api public
    */
    on: function () {
      values = arguments[0] instanceof Array ? arguments[0] : arguments;
      return this;
    },

    /**
    * Specifies the recurring interval of a time period that are valid.
    * Must be followed by the desired time period (minute(), hour(),
    * etc). For example, to specify a schedule for every 4 hours in the
    * day:
    *
    * recur().every(4).hour();
    *
    * @param {Int} x: Recurring interval
    * @api public
    */
    every: function (x) {
      every = x || 1;
      return this;
    },

    /**
    * Specifies the minimum valid value.  For example, to specify a schedule
    * that is valid for all hours after four:
    *
    * recur().after(4).hour();
    *
    * @param {Int} x: Recurring interval
    * @api public
    */
    after: function (x) {
      modifier = 'a';
      values = [x];
      return this;
    },

    /**
    * Specifies the maximum valid value.  For example, to specify a schedule
    * that is valid for all hours before four:
    *
    * recur().before(4).hour();
    *
    * @param {Int} x: Recurring interval
    * @api public
    */
    before: function (x) {
      modifier = 'b';
      values = [x];
      return this;
    },

    /**
    * Specifies that the first instance of a time period is valid. Must
    * be followed by the desired time period (minute(), hour(), etc).
    * For example, to specify a schedule for the first day of every
    * month:
    *
    * recur().first().dayOfMonth();
    *
    * @api public
    */
    first: function () {
      applyMin = 1;
      return this;
    },

    /**
    * Specifies that the last instance of a time period is valid. Must
    * be followed by the desired time period (minute(), hour(), etc).
    * For example, to specify a schedule for the last day of every year:
    *
    * recur().last().dayOfYear();
    *
    * @api public
    */
    last: function () {
      applyMax = 1;
      return this;
    },

    /**
    * Specifies a specific time that is valid. Time must be specified in
    * hh:mm:ss format using 24 hour time. For example, to specify
    * a schedule for 8:30 pm every day:
    *
    * recur().time('20:30:00');
    *
    * @param {String} time: Time in hh:mm:ss 24-hour format
    * @api public
    */
    time: function () {
      //values = arguments;
      for (var i = 0, len = values.length; i < len; i++) {
        var split = values[i].split(':');
        if(split.length < 3) split.push(0);
        values[i] = (+split[0]) * 3600 + (+split[1]) * 60 + (+split[2]);
      }

      add('t');
      return this;
    },

    /**
    * Seconds time period, denotes seconds within each minute.
    * Minimum value is 0, maximum value is 59. Specify 59 for last.
    *
    * recur().on(5, 15, 25).second();
    *
    * @api public
    */
    second: function () {
      add('s', 0, 59);
      return this;
    },

    /**
    * Minutes time period, denotes minutes within each hour.
    * Minimum value is 0, maximum value is 59. Specify 59 for last.
    *
    * recur().on(5, 15, 25).minute();
    *
    * @api public
    */
    minute: function () {
      add('m', 0, 59);
      return this;
    },

    /**
    * Hours time period, denotes hours within each day.
    * Minimum value is 0, maximum value is 23. Specify 23 for last.
    *
    * recur().on(5, 15, 25).hour();
    *
    * @api public
    */
    hour: function () {
      add('h', 0, 23);
      return this;
    },

    /**
    * Days of month time period, denotes number of days within a month.
    * Minimum value is 1, maximum value is 31.  Specify 0 for last.
    *
    * recur().every(2).dayOfMonth();
    *
    * @api public
    */
    dayOfMonth: function () {
      add('D', 1, applyMax ? 0 : 31);
      return this;
    },

    /**
    * Days of week time period, denotes the days within a week.
    * Minimum value is 1, maximum value is 7.  Specify 0 for last.
    * 1 - Sunday
    * 2 - Monday
    * 3 - Tuesday
    * 4 - Wednesday
    * 5 - Thursday
    * 6 - Friday
    * 7 - Saturday
    *
    * recur().on(1).dayOfWeek();
    *
    * @api public
    */
    dayOfWeek: function () {
      add('d', 1, 7);
      return this;
    },

    /**
    * Short hand for on(1,7).dayOfWeek()
    *
    * @api public
    */
    onWeekend: function() {
      values = [1,7];
      return this.dayOfWeek();
    },

    /**
    * Short hand for on(2,3,4,5,6).dayOfWeek()
    *
    * @api public
    */
    onWeekday: function() {
      values = [2,3,4,5,6];
      return this.dayOfWeek();
    },

    /**
    * Days of week count time period, denotes the number of times a
    * particular day has occurred within a month.  Used to specify
    * things like second Tuesday, or third Friday in a month.
    * Minimum value is 1, maximum value is 5.  Specify 0 for last.
    * 1 - First occurrence
    * 2 - Second occurrence
    * 3 - Third occurrence
    * 4 - Fourth occurrence
    * 5 - Fifth occurrence
    * 0 - Last occurrence
    *
    * recur().on(1).dayOfWeek().on(1).dayOfWeekCount();
    *
    * @api public
    */
    dayOfWeekCount: function () {
      add('dc', 1, applyMax ? 0 : 5);
      return this;
    },

    /**
    * Days of year time period, denotes number of days within a year.
    * Minimum value is 1, maximum value is 366.  Specify 0 for last.
    *
    * recur().every(2).dayOfYear();
    *
    * @api public
    */
    dayOfYear: function () {
      add('dy', 1, applyMax ? 0 : 366);
      return this;
    },

    /**
    * Weeks of month time period, denotes number of weeks within a
    * month. The first week is the week that includes the 1st of the
    * month. Subsequent weeks start on Sunday.
    * Minimum value is 1, maximum value is 5.  Specify 0 for last.
    * February 2nd,  2012 - Week 1
    * February 5th,  2012 - Week 2
    * February 12th, 2012 - Week 3
    * February 19th, 2012 - Week 4
    * February 26th, 2012 - Week 5 (or 0)
    *
    * recur().on(2).weekOfMonth();
    *
    * @api public
    */
    weekOfMonth: function () {
      add('wm', 1, applyMax ? 0 : 5);
      return this;
    },

    /**
    * Weeks of year time period, denotes the ISO 8601 week date. For
    * more information see: http://en.wikipedia.org/wiki/ISO_week_date.
    * Minimum value is 1, maximum value is 53.  Specify 0 for last.
    *
    * recur().every(2).weekOfYear();
    *
    * @api public
    */
    weekOfYear: function () {
      add('wy', 1, applyMax ? 0 : 53);
      return this;
    },

    /**
    * Month time period, denotes the months within a year.
    * Minimum value is 1, maximum value is 12.  Specify 0 for last.
    * 1 - January
    * 2 - February
    * 3 - March
    * 4 - April
    * 5 - May
    * 6 - June
    * 7 - July
    * 8 - August
    * 9 - September
    * 10 - October
    * 11 - November
    * 12 - December
    *
    * recur().on(1).dayOfWeek();
    *
    * @api public
    */
    month: function () {
      add('M', 1, 12);
      return this;
    },

    /**
    * Year time period, denotes the four digit year.
    * Minimum value is 1970, maximum value is Jan 1, 2100 (arbitrary)
    *
    * recur().on(2011, 2012, 2013).year();
    *
    * @api public
    */
    year: function () {
      add('Y', 1970, 2450);
      return this;
    },

    /**
    * Full date period, denotes a full date and time.
    * Minimum value is Jan 1, 1970, maximum value is Jan 1, 2100 (arbitrary)
    *
    * recur().on(new Date(2013, 3, 2, 10, 30, 0)).fullDate();
    *
    * @api public
    */
    fullDate: function () {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i] = values[i].getTime();
      }

      add('fd');
      return this;
    },

    /**
    * Custom modifier.
    *
    * recur().on(2011, 2012, 2013).custom('partOfDay');
    *
    * @api public
    */
    customModifier: function (id, vals) {
      var custom = later.modifier[id];
      if(!custom) throw new Error('Custom modifier ' + id + ' not recognized!');

      modifier = id;
      values = arguments[1] instanceof Array ? arguments[1] : [arguments[1]];
      return this;
    },

    /**
    * Custom time period.
    *
    * recur().on(2011, 2012, 2013).customPeriod('partOfDay');
    *
    * @api public
    */
    customPeriod: function (id) {
      var custom = later[id];
      if(!custom) throw new Error('Custom time period ' + id + ' not recognized!');

      add(id, custom.extent(new Date())[0], custom.extent(new Date())[1]);
      return this;
    },

    /**
    * Modifies a recurring interval (specified using every) to start
    * at a given offset.  To create a schedule for every 5 minutes
    * starting on the 6th minute - making minutes 6, 11, 16, etc valid:
    *
    * recur().every(5).minute().startingOn(6);
    *
    * @param {Int} start: The desired starting offset
    * @api public
    */
    startingOn: function (start) {
      return this.between(start, last.m);
    },

    /**
    * Modifies a recurring interval (specified using every) to start
    * and stop at specified times.  To create a schedule for every
    * 5 minutes starting on the 6th minute and ending on the 11th
    * minute - making minutes 6 and 11 valid:
    *
    * recur().every(5).minute().between(6, 11);
    *
    * @param {Int} start: The desired starting offset
    * @param {Int} end: The last valid value
    * @api public
    */
    between: function (start, end) {
      // remove the values added as part of specifying the last
      // time period and replace them with the new restricted values
      cur[last.n] = cur[last.n].splice(0, last.c);
      every = last.x;
      add(last.n, start, end);
      return this;
    },

    /**
    * Creates a composite schedule.  With a composite schedule, a valid
    * occurrence of any of the component schedules is considered a valid
    * value for the composite schedule (e.g. they are OR'ed together).
    * To create a schedule for every 5 minutes on Mondays and every 10
    * minutes on Tuesdays:
    *
    * recur().every(5).minutes().on(1).dayOfWeek().and().every(10)
    *    .minutes().on(2).dayOfWeek();
    *
    * @api public
    */
    and: function () {
      cur = curArr[curArr.push({}) - 1];
      return this;
    },

    /**
    * Creates exceptions to a schedule. Any valid occurrence of the
    * exception schedule (which may also be composite schedules) is
    * considered a invalid schedule occurrence. Everything that follows
    * except will be treated as an exception schedule.  To create a
    * schedule for 8:00 am every Tuesday except for patch Tuesday
    * (second Tuesday each month):
    *
    * recur().at('08:00:00').on(2).dayOfWeek().except()
    *    .dayOfWeekCount(1);
    *
    * @api public
    */
    except: function () {
      curArr = exceptions;
      cur = null;
      return this;
    }
  };
};
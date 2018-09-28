var later = require('../../index'),
    runner = require('./runner')(later, later.year),
    should = require('should');

describe('Later.year', function() {

  var tests = [
    {
      // first second of year
      date: new Date(2008, 0, 1),
      val: 2008,
      extent: [1970, 2099],
      start: new Date(2008, 0, 1),
      end: new Date(2008, 11, 31, 23, 59, 59)
    },
    {
      // last second of year
      date: new Date(2009, 11, 31, 23, 59, 59),
      val: 2009,
      extent: [1970, 2099],
      start: new Date(2009, 0, 1),
      end: new Date(2009, 11, 31, 23, 59, 59)
    },
    {
      // first second of month starting on Sunday
      date: new Date(2010, 7, 1),
      val: 2010,
      extent: [1970, 2099],
      start: new Date(2010, 0, 1),
      end: new Date(2010, 11, 31, 23, 59, 59)
    },
    {
      // last second of month ending on Saturday
      date: new Date(2011, 3, 30, 23, 59, 59),
      val: 2011,
      extent: [1970, 2099],
      start: new Date(2011, 0, 1),
      end: new Date(2011, 11, 31, 23, 59, 59)
    },
    {
      // first second of day
      date: new Date(2012, 1, 28),
      val: 2012,
      extent: [1970, 2099],
      start: new Date(2012, 0, 1),
      end: new Date(2012, 11, 31, 23, 59, 59)
    },
    {
      // last second of day on leap day
      date: new Date(2012, 1, 29, 23, 59, 59),
      val: 2012,
      extent: [1970, 2099],
      start: new Date(2012, 0, 1),
      end: new Date(2012, 11, 31, 23, 59, 59)
    },
    {
      // first second of hour
      date: new Date(2012, 10, 8, 14),
      val: 2012,
      extent: [1970, 2099],
      start: new Date(2012, 0, 1),
      end: new Date(2012, 11, 31, 23, 59, 59)
    },
    {
      // last second of hour (start DST)
      date: new Date(2013, 2, 10, 1, 59, 59),
      val: 2013,
      extent: [1970, 2099],
      start: new Date(2013, 0, 1),
      end: new Date(2013, 11, 31, 23, 59, 59)
    },
    {
      // first second of hour (end DST)
      date: new Date(2013, 10, 3, 2),
      val: 2013,
      extent: [1970, 2099],
      start: new Date(2013, 0, 1),
      end: new Date(2013, 11, 31, 23, 59, 59)
    },
    {
      // last second of hour
      date: new Date(2014, 1, 22, 6, 59, 59),
      val: 2014,
      extent: [1970, 2099],
      start: new Date(2014, 0, 1),
      end: new Date(2014, 11, 31, 23, 59, 59)
    },
    {
      // first second of minute
      date: new Date(2015, 5, 19, 18, 22),
      val: 2015,
      extent: [1970, 2099],
      start: new Date(2015, 0, 1),
      end: new Date(2015, 11, 31, 23, 59, 59)
    },
    {
      // last second of minute
      date: new Date(2016, 7, 29, 2, 56, 59),
      val: 2016,
      extent: [1970, 2099],
      start: new Date(2016, 0, 1),
      end: new Date(2016, 11, 31, 23, 59, 59)
    },
    {
      // second
      date: new Date(2017, 8, 4, 10, 31, 22),
      val: 2017,
      extent: [1970, 2099],
      start: new Date(2017, 0, 1),
      end: new Date(2017, 11, 31, 23, 59, 59)
    }
  ];

  runner.run(tests, true);

});
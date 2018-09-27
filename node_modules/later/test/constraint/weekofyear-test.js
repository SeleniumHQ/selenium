var later = require('../../index'),
    runner = require('./runner')(later, later.weekOfYear),
    should = require('should');

describe('Later.weekOfYear', function() {

  var tests = [
    {
      // first second of year
      date: new Date(2008, 0, 1),
      val: 1,
      extent: [1,52],
      start: new Date(2007, 11, 31),
      end: new Date(2008, 0, 6, 23, 59, 59)
    },
    {
      // last second of year
      date: new Date(2009, 11, 31, 23, 59, 59),
      val: 53,
      extent: [1,53],
      start: new Date(2009, 11, 28),
      end: new Date(2010, 0, 3, 23, 59, 59)
    },
    {
      // first second of month starting on Sunday
      date: new Date(2010, 7, 1),
      val: 30,
      extent: [1,52],
      start: new Date(2010, 6, 26),
      end: new Date(2010, 7, 1, 23, 59, 59)
    },
    {
      // last second of month ending on Saturday
      date: new Date(2011, 3, 30, 23, 59, 59),
      val: 17,
      extent: [1,52],
      start: new Date(2011, 3, 25),
      end: new Date(2011, 4, 1, 23, 59, 59)
    },
    {
      // first second of day
      date: new Date(2012, 1, 28),
      val: 9,
      extent: [1,52],
      start: new Date(2012, 1, 27),
      end: new Date(2012, 2, 4, 23, 59, 59)
    },
    {
      // last second of day on leap day
      date: new Date(2012, 1, 29, 23, 59, 59),
      val: 9,
      extent: [1,52],
      start: new Date(2012, 1, 27),
      end: new Date(2012, 2, 4, 23, 59, 59)
    },
    {
      // first second of hour
      date: new Date(2012, 10, 8, 14),
      val: 45,
      extent: [1,52],
      start: new Date(2012, 10, 5),
      end: new Date(2012, 10, 11, 23, 59, 59)
    },
    {
      // last second of hour (start DST)
      date: new Date(2013, 2, 10, 1, 59, 59),
      val: 10,
      extent: [1,52],
      start: new Date(2013, 2, 4),
      end: new Date(2013, 2, 10, 23, 59, 59)
    },
    {
      // first second of hour (end DST)
      date: new Date(2013, 10, 3, 2),
      val: 44,
      extent: [1,52],
      start: new Date(2013, 9, 28),
      end: new Date(2013, 10, 3, 23, 59, 59)
    },
    {
      // last second of hour
      date: new Date(2014, 1, 22, 6, 59, 59),
      val: 8,
      extent: [1,52],
      start: new Date(2014, 1, 17),
      end: new Date(2014, 1, 23, 23, 59, 59)
    },
    {
      // first second of minute
      date: new Date(2015, 5, 19, 18, 22),
      val: 25,
      extent: [1,53],
      start: new Date(2015, 5, 15),
      end: new Date(2015, 5, 21, 23, 59, 59)
    },
    {
      // last second of minute
      date: new Date(2016, 7, 29, 2, 56, 59),
      val: 35,
      extent: [1,52],
      start: new Date(2016, 7, 29),
      end: new Date(2016, 8, 4, 23, 59, 59)
    },
    {
      // second
      date: new Date(2017, 8, 4, 10, 31, 22),
      val: 36,
      extent: [1, 52],
      start: new Date(2017, 8, 4),
      end: new Date(2017, 8, 10, 23, 59, 59)
    }
  ];

  runner.run(tests);

});
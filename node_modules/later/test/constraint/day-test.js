var later = require('../../index'),
    runner = require('./runner')(later, later.day),
    should = require('should');

describe('Later.day', function() {

  var tests = [
    {
      // first second of year
      date: new Date(2008, 0, 1),
      val: 1,
      extent: [1,31],
      start: new Date(2008, 0, 1),
      end: new Date(2008, 0, 1, 23, 59, 59)
    },
    {
      // last second of year
      date: new Date(2009, 11, 31, 23, 59, 59),
      val: 31,
      extent: [1,31],
      start: new Date(2009, 11, 31),
      end: new Date(2009, 11, 31, 23, 59, 59)
    },
    {
      // first second of month starting on Sunday
      date: new Date(2010, 7, 1),
      val: 1,
      extent: [1,31],
      start: new Date(2010, 7, 1),
      end: new Date(2010, 7, 1, 23, 59, 59)
    },
    {
      // last second of month ending on Saturday
      date: new Date(2011, 3, 30, 23, 59, 59),
      val: 30,
      extent: [1,30],
      start: new Date(2011, 3, 30),
      end: new Date(2011, 3, 30, 23, 59, 59)
    },
    {
      // first second of day
      date: new Date(2012, 1, 28),
      val: 28,
      extent: [1,29],
      start: new Date(2012, 1, 28),
      end: new Date(2012, 1, 28, 23, 59, 59)
    },
    {
      // last second of day on leap day
      date: new Date(2012, 1, 29, 23, 59, 59),
      val: 29,
      extent: [1,29],
      start: new Date(2012, 1, 29),
      end: new Date(2012, 1, 29, 23, 59, 59)
    },
    {
      // first second of hour
      date: new Date(2012, 10, 8, 14),
      val: 8,
      extent: [1,30],
      start: new Date(2012, 10, 8),
      end: new Date(2012, 10, 8, 23, 59, 59)
    },
    {
      // last second of hour (start DST)
      date: new Date(2013, 2, 10, 1, 59, 59),
      val: 10,
      extent: [1,31],
      start: new Date(2013, 2, 10),
      end: new Date(2013, 2, 10, 23, 59, 59)
    },
    {
      // first second of hour (end DST)
      date: new Date(2013, 10, 3, 2),
      val: 3,
      extent: [1,30],
      start: new Date(2013, 10, 3),
      end: new Date(2013, 10, 3, 23, 59, 59)
    },
    {
      // last second of hour
      date: new Date(2014, 1, 22, 6, 59, 59),
      val: 22,
      extent: [1,28],
      start: new Date(2014, 1, 22),
      end: new Date(2014, 1, 22, 23, 59, 59)
    },
    {
      // first second of minute
      date: new Date(2015, 5, 19, 18, 22),
      val: 19,
      extent: [1,30],
      start: new Date(2015, 5, 19),
      end: new Date(2015, 5, 19, 23, 59, 59)
    },
    {
      // last second of minute
      date: new Date(2016, 7, 29, 2, 56, 59),
      val: 29,
      extent: [1,31],
      start: new Date(2016, 7, 29),
      end: new Date(2016, 7, 29, 23, 59, 59)
    },
    {
      // second
      date: new Date(2017, 8, 4, 10, 31, 22),
      val: 4,
      extent: [1,30],
      start: new Date(2017, 8, 4),
      end: new Date(2017, 8, 4, 23, 59, 59)
    }
  ];

  runner.run(tests);

});
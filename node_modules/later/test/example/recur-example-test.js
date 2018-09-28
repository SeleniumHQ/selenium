var later = require('../../index'),
    should = require('should');

describe('Recur Examples', function() {

  describe('instances', function() {

    it('At 11:30am on March 21, 2013', function() {
      later.date.UTC();

      var sched = later.parse.recur().on(new Date('2013-03-21T11:30:00')).fullDate();

      var start = new Date('2013-03-11T03:05:23Z'),
          end = new Date('2013-04-21T03:40:10Z'),
          expected = new Date('2013-03-21T11:30:00Z');

      var next = later.schedule(sched).next(1, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(1, end, start);
      prev.should.eql(expected);
    });

    it('At 11:30am on March 21, 2013 starting past the date should not occur', function() {
      later.date.UTC();

      var sched = later.parse.recur().on(new Date('2013-03-21T11:30:00')).fullDate();

      var start = new Date('2013-03-31T03:05:23Z'),
          end = new Date('2013-02-21T03:40:10Z'),
          expected = later.NEVER;

      var next = later.schedule(sched).next(1, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(1, end, start);
      prev.should.eql(expected);
    });

    it('Every 5 minutes', function() {
      later.date.UTC();

      var sched = later.parse.recur().every(5).minute();

      var start = new Date('2013-03-21T03:05:23Z'),
          end = new Date('2013-03-21T03:40:10Z'),
          expected = [
            new Date('2013-03-21T03:05:23'),
            new Date('2013-03-21T03:10:00'),
            new Date('2013-03-21T03:15:00'),
            new Date('2013-03-21T03:20:00'),
            new Date('2013-03-21T03:25:00'),
            new Date('2013-03-21T03:30:00'),
            new Date('2013-03-21T03:35:00'),
            new Date('2013-03-21T03:40:00')
          ];

      var next = later.schedule(sched).next(8, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(8, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it('Every second Tuesday at 4AM and 10PM', function() {
      later.date.UTC();

      var sched = later.parse.recur().on(2).dayOfWeekCount().on(3).dayOfWeek().on('4:00', '22:00').time();

      var start = new Date('2013-02-01T00:00:00Z'),
          end = new Date('2013-05-01T00:00:00Z'),
          expected = [
            new Date('2013-02-12T04:00:00Z'),
            new Date('2013-02-12T22:00:00Z'),
            new Date('2013-03-12T04:00:00Z'),
            new Date('2013-03-12T22:00:00Z'),
            new Date('2013-04-09T04:00:00Z'),
            new Date('2013-04-09T22:00:00Z')
          ];

      var next = later.schedule(sched).next(6, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(6, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it('Once a month on the closest weekday to the 15th', function() {
      later.date.UTC();

      var sched = later.parse.recur()
                    .on(15).dayOfMonth().onWeekday()
                  .and()
                    .on(14).dayOfMonth().on(6).dayOfWeek()
                  .and()
                    .on(16).dayOfMonth().on(2).dayOfWeek();

      var start = new Date('2013-03-01T00:00:00Z'),
          end = new Date('2013-10-01T00:00:00Z'),
          expected = [
            new Date('2013-03-15T00:00:00Z'),
            new Date('2013-04-15T00:00:00Z'),
            new Date('2013-05-15T00:00:00Z'),
            new Date('2013-06-14T00:00:00Z'),
            new Date('2013-07-15T00:00:00Z'),
            new Date('2013-08-15T00:00:00Z'),
            new Date('2013-09-16T00:00:00Z')
          ];

      var next = later.schedule(sched).next(7, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(7, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it('Next time Jan 1st is ISO Week #53', function() {
      later.date.UTC();

      var sched = later.parse.recur()
                    .first().month()
                    .first().dayOfMonth()
                    .last().weekOfYear();

      var start = new Date('2013-03-01T00:00:00Z'),
          end = new Date('2016-10-01T00:00:00Z'),
          expected = new Date('2016-01-01T00:00:00Z');

      var next = later.schedule(sched).next(1, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(1, end, start);
      prev.should.eql(expected);

      later.schedule(sched).isValid(expected).should.eql(true);
    });

    it('Every minute except multiples of 2 and 3', function() {
      later.date.UTC();

      var sched = later.parse.recur()
                    .every().minute()
                  .except()
                    .every(2).minute().between(2,59)
                  .and()
                    .every(3).minute().between(3,59);

      var start = new Date('2013-03-01T00:00:00Z'),
          end = new Date('2013-03-01T00:18:00Z'),
          expected = [
            new Date('2013-03-01T00:00:00Z'),
            new Date('2013-03-01T00:01:00Z'),
            new Date('2013-03-01T00:05:00Z'),
            new Date('2013-03-01T00:07:00Z'),
            new Date('2013-03-01T00:11:00Z'),
            new Date('2013-03-01T00:13:00Z'),
            new Date('2013-03-01T00:17:00Z')
          ];

      //var next = later.schedule(sched).next(7, start, end);
      //next.should.eql(expected);

      var prev = later.schedule(sched).prev(7, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it('Last day of every month', function() {
      later.date.UTC();

      var sched = later.parse.recur().last().dayOfMonth();

      var start = new Date('2012-01-01T00:00:00Z'),
          end = new Date('2013-01-01T00:00:00Z'),
          expected = [
            new Date('2012-01-31T00:00:00Z'),
            new Date('2012-02-29T00:00:00Z'),
            new Date('2012-03-31T00:00:00Z'),
            new Date('2012-04-30T00:00:00Z'),
            new Date('2012-05-31T00:00:00Z'),
            new Date('2012-06-30T00:00:00Z'),
            new Date('2012-07-31T00:00:00Z'),
            new Date('2012-08-31T00:00:00Z'),
            new Date('2012-09-30T00:00:00Z'),
            new Date('2012-10-31T00:00:00Z'),
            new Date('2012-11-30T00:00:00Z'),
            new Date('2012-12-31T00:00:00Z')
          ];

      var next = later.schedule(sched).next(12, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(12, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it('Last Wednesday of every month', function() {
      later.date.UTC();

      var sched = later.parse.recur().on(0).dayOfWeekCount().on(4).dayOfWeek();

      var start = new Date('2012-01-01T00:00:00Z'),
          end = new Date('2013-01-01T00:00:00Z'),
          expected = [
            new Date('2012-01-25T00:00:00Z'),
            new Date('2012-02-29T00:00:00Z'),
            new Date('2012-03-28T00:00:00Z'),
            new Date('2012-04-25T00:00:00Z'),
            new Date('2012-05-30T00:00:00Z'),
            new Date('2012-06-27T00:00:00Z'),
            new Date('2012-07-25T00:00:00Z'),
            new Date('2012-08-29T00:00:00Z'),
            new Date('2012-09-26T00:00:00Z'),
            new Date('2012-10-31T00:00:00Z'),
            new Date('2012-11-28T00:00:00Z'),
            new Date('2012-12-26T00:00:00Z')
          ];

      var next = later.schedule(sched).next(12, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(12, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it('All 31st numbered days of the year', function() {
      later.date.UTC();

      var sched = later.parse.recur().on(31).dayOfMonth();

      var start = new Date('2013-01-01T00:00:00Z'),
          end = new Date('2014-01-01T00:00:00Z'),
          expected = [
            new Date('2013-01-31T00:00:00Z'),
            new Date('2013-03-31T00:00:00Z'),
            new Date('2013-05-31T00:00:00Z'),
            new Date('2013-07-31T00:00:00Z'),
            new Date('2013-08-31T00:00:00Z'),
            new Date('2013-10-31T00:00:00Z'),
            new Date('2013-12-31T00:00:00Z')
          ];

      var next = later.schedule(sched).next(7, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(7, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it('Every Friday the 13th', function() {
      later.date.UTC();

      var sched = later.parse.recur()
                    .on(13).dayOfMonth()
                    .on(6).dayOfWeek();

      var start = new Date('2010-01-01T00:00:00Z'),
          end = new Date('2014-01-01T00:00:00Z'),
          expected = [
            new Date('2010-08-13T00:00:00Z'),
            new Date('2011-05-13T00:00:00Z'),
            new Date('2012-01-13T00:00:00Z'),
            new Date('2012-04-13T00:00:00Z'),
            new Date('2012-07-13T00:00:00Z'),
            new Date('2013-09-13T00:00:00Z'),
            new Date('2013-12-13T00:00:00Z')
          ];

      var next = later.schedule(sched).next(7, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(7, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it.skip('Every hour passing over DST', function() {
      // this test will only pass when DST starts on March 10, 2013 at 2ams
      later.date.localTime();

      var sched = later.parse.recur().every(1).hour();

      var start = new Date(2013, 2, 10),
          end = new Date(2013, 2, 10, 5),
          expected = [
            new Date(2013, 2, 10, 0),
            new Date(2013, 2, 10, 1),
            new Date(2013, 2, 10, 3),
            new Date(2013, 2, 10, 4),
            new Date(2013, 2, 10, 5)
          ];

      var next = later.schedule(sched).next(5, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(5, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it('should recur everyday except on weekends', function() {
      later.date.UTC();

      var sched = later.parse.recur()
                    .on('08:00:00').time()
                  .except()
                    .on(1,7).dayOfWeek();

      var start = new Date('2012-01-05T00:00:00Z'),
          end = new Date('2012-01-11T10:00:00Z'),
          expected = [
            new Date('2012-01-05T08:00:00Z'),
            new Date('2012-01-06T08:00:00Z'),
            new Date('2012-01-09T08:00:00Z'),
            new Date('2012-01-10T08:00:00Z'),
            new Date('2012-01-11T08:00:00Z')
          ];

      var next = later.schedule(sched).next(5, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(5, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it('should recur Wednesday every 4 weeks at 8am starting on the 5th week', function() {
      later.date.UTC();

      var sched = later.parse.recur()
                    .every(4).weekOfYear().startingOn(5)
                    .on(4).dayOfWeek()
                    .on('08:00:00').time();

      var start = new Date('2012-01-01T23:59:15Z'),
          end = new Date('2012-06-21T08:00:00Z'),
          expected = [
            new Date('2012-02-01T08:00:00Z'),
            new Date('2012-02-29T08:00:00Z'),
            new Date('2012-03-28T08:00:00Z'),
            new Date('2012-04-25T08:00:00Z'),
            new Date('2012-05-23T08:00:00Z'),
            new Date('2012-06-20T08:00:00Z')
          ];

      var next = later.schedule(sched).next(6, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(6, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it('should find the first second of every month', function() {
      later.date.UTC();

      var sched = later.parse.recur()
                    .first().dayOfMonth()
                    .first().hour()
                    .first().minute()
                    .first().second();

      var start = new Date('2012-01-01T00:00:00Z'),
          end = new Date('2012-12-02T00:00:00Z'),
          expected = [
            new Date('2012-01-01T00:00:00Z'),
            new Date('2012-02-01T00:00:00Z'),
            new Date('2012-03-01T00:00:00Z'),
            new Date('2012-04-01T00:00:00Z'),
            new Date('2012-05-01T00:00:00Z'),
            new Date('2012-06-01T00:00:00Z'),
            new Date('2012-07-01T00:00:00Z'),
            new Date('2012-08-01T00:00:00Z'),
            new Date('2012-09-01T00:00:00Z'),
            new Date('2012-10-01T00:00:00Z'),
            new Date('2012-11-01T00:00:00Z'),
            new Date('2012-12-01T00:00:00Z')
          ];

      var next = later.schedule(sched).next(12, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(12, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

    it('should find the last second of every month', function() {
      later.date.UTC();

      var sched = later.parse.recur()
                    .last().dayOfMonth()
                    .last().hour()
                    .last().minute()
                    .last().second();

      var start = new Date('2012-01-01T00:00:00Z'),
          end = new Date('2013-01-05T23:59:59Z'),
          expected = [
            new Date('2012-01-31T23:59:59Z'),
            new Date('2012-02-29T23:59:59Z'),
            new Date('2012-03-31T23:59:59Z'),
            new Date('2012-04-30T23:59:59Z'),
            new Date('2012-05-31T23:59:59Z'),
            new Date('2012-06-30T23:59:59Z'),
            new Date('2012-07-31T23:59:59Z'),
            new Date('2012-08-31T23:59:59Z'),
            new Date('2012-09-30T23:59:59Z'),
            new Date('2012-10-31T23:59:59Z'),
            new Date('2012-11-30T23:59:59Z'),
            new Date('2012-12-31T23:59:59Z')
          ];

      var next = later.schedule(sched).next(12, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prev(12, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e).should.eql(true);
      });
    });

  });

  describe('ranges', function() {

    it('(1) After 15 minutes and before 30 minutes except multiples of 5 and 8', function() {
      later.date.UTC();

      var sched = later.parse.recur()
                    .after(15).minute().before(45).minute()
                    .and().on(7).minute()
                    .and().on(49).minute()
                  .except()
                    .every(5).minute()
                    .and().every(8).minute();

      var start = new Date('2013-03-21T03:06:23Z'),
          end = new Date('2013-03-21T04:10:45Z'),
          expected = [
            [new Date('2013-03-21T03:07:00Z'), new Date('2013-03-21T03:08:00Z')],
            [new Date('2013-03-21T03:17:00Z'), new Date('2013-03-21T03:20:00Z')],
            [new Date('2013-03-21T03:21:00Z'), new Date('2013-03-21T03:24:00Z')],
            [new Date('2013-03-21T03:26:00Z'), new Date('2013-03-21T03:30:00Z')],
            [new Date('2013-03-21T03:31:00Z'), new Date('2013-03-21T03:32:00Z')],
            [new Date('2013-03-21T03:33:00Z'), new Date('2013-03-21T03:35:00Z')],
            [new Date('2013-03-21T03:36:00Z'), new Date('2013-03-21T03:40:00Z')],
            [new Date('2013-03-21T03:41:00Z'), new Date('2013-03-21T03:45:00Z')],
            [new Date('2013-03-21T03:49:00Z'), new Date('2013-03-21T03:50:00Z')],
            [new Date('2013-03-21T04:07:00Z'), new Date('2013-03-21T04:08:00Z')]
          ];

      var next = later.schedule(sched).nextRange(10, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prevRange(10, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e[0]).should.eql(true);
        later.schedule(sched).isValid(e[1]).should.eql(false);
      });
    });

    it('(2) After 15 minutes and before 30 minutes except multiples of 5 and 8', function() {
      later.date.UTC();

      var sched = later.parse.recur()
                    .after(15).minute().before(45).minute()
                    .and().on(7).minute()
                    .and().on(49).minute()
                  .except()
                    .every(5).minute()
                    .and().every(8).minute();

      var start = new Date('2013-03-21T03:22:00Z'),
          end = new Date('2013-03-21T04:07:30Z'),
          expected = [
            [new Date('2013-03-21T03:22:00Z'), new Date('2013-03-21T03:24:00Z')],
            [new Date('2013-03-21T03:26:00Z'), new Date('2013-03-21T03:30:00Z')],
            [new Date('2013-03-21T03:31:00Z'), new Date('2013-03-21T03:32:00Z')],
            [new Date('2013-03-21T03:33:00Z'), new Date('2013-03-21T03:35:00Z')],
            [new Date('2013-03-21T03:36:00Z'), new Date('2013-03-21T03:40:00Z')],
            [new Date('2013-03-21T03:41:00Z'), new Date('2013-03-21T03:45:00Z')],
            [new Date('2013-03-21T03:49:00Z'), new Date('2013-03-21T03:50:00Z')],
            [new Date('2013-03-21T04:07:00Z'), new Date('2013-03-21T04:07:30Z')]
          ];

      var next = later.schedule(sched).nextRange(8, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prevRange(8, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e[0]).should.eql(true);
        //later.schedule(sched).isValid(e[1]).should.eql(false);
      });
    });

    it('After 30 minutes except seconds multiples of 5', function() {
      later.date.UTC();

      // this is a bad schedule since after 30 minutes means on the 0th second
      // and then the exception says that the 0th second is invalid
      var sched = later.parse.recur().after(30).minute().except().every(5).second();

      var start = new Date('2013-03-21T03:05:23Z'),
          end = new Date('2013-03-21T10:40:10Z');

      later.schedule(sched).nextRange(1, start, end).should.eql(later.NEVER);
    });

    it('Every second after 30 minutes except seconds multiples of 5', function() {
      later.date.UTC();

      var sched = later.parse.recur().every(1).second().after(30).minute().except().every(5).second();

      var start = new Date('2013-03-21T03:05:23Z'),
          end = new Date('2013-03-21T03:30:15Z'),
          expected = [
            [new Date('2013-03-21T03:30:01Z'), new Date('2013-03-21T03:30:05Z')],
            [new Date('2013-03-21T03:30:06Z'), new Date('2013-03-21T03:30:10Z')],
            [new Date('2013-03-21T03:30:11Z'), new Date('2013-03-21T03:30:15Z')]
          ];

      var next = later.schedule(sched).nextRange(3, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prevRange(3, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e[0]).should.eql(true);
        later.schedule(sched).isValid(e[1]).should.eql(false);
      });
    });

    it('First 5 minutes of every hour', function() {
      later.date.UTC();

      var sched = later.parse.recur().on(0,1,2,3,4).minute();

      var start = new Date('2013-03-21T03:05:23Z'),
          end = new Date('2013-03-21T10:40:10Z'),
          expected = [
            [new Date('2013-03-21T04:00:00Z'), new Date('2013-03-21T04:05:00Z')],
            [new Date('2013-03-21T05:00:00Z'), new Date('2013-03-21T05:05:00Z')],
            [new Date('2013-03-21T06:00:00Z'), new Date('2013-03-21T06:05:00Z')],
            [new Date('2013-03-21T07:00:00Z'), new Date('2013-03-21T07:05:00Z')],
            [new Date('2013-03-21T08:00:00Z'), new Date('2013-03-21T08:05:00Z')],
            [new Date('2013-03-21T09:00:00Z'), new Date('2013-03-21T09:05:00Z')],
            [new Date('2013-03-21T10:00:00Z'), new Date('2013-03-21T10:05:00Z')]
          ];

      var next = later.schedule(sched).nextRange(7, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prevRange(7, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e[0]).should.eql(true);
        later.schedule(sched).isValid(e[1]).should.eql(false);
      });
    });


    it('Every weekday between 8:30AM and 5:30PM', function() {
      later.date.UTC();

      var sched = later.parse.recur().after('8:30').time().before('17:30').time().onWeekday();

      var start = new Date('2013-01-01T00:00:00Z'),
          end = new Date('2013-01-10T00:00:00Z'),
          expected = [
            [new Date('2013-01-01T08:30:00Z'), new Date('2013-01-01T17:30:00Z')],
            [new Date('2013-01-02T08:30:00Z'), new Date('2013-01-02T17:30:00Z')],
            [new Date('2013-01-03T08:30:00Z'), new Date('2013-01-03T17:30:00Z')],
            [new Date('2013-01-04T08:30:00Z'), new Date('2013-01-04T17:30:00Z')],
            [new Date('2013-01-07T08:30:00Z'), new Date('2013-01-07T17:30:00Z')],
            [new Date('2013-01-08T08:30:00Z'), new Date('2013-01-08T17:30:00Z')],
            [new Date('2013-01-09T08:30:00Z'), new Date('2013-01-09T17:30:00Z')]
          ];

      var next = later.schedule(sched).nextRange(7, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prevRange(7, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e[0]).should.eql(true);
        later.schedule(sched).isValid(e[1]).should.eql(false);
      });
    });

    it('Every weekend between 8AM and 5PM', function() {
      later.date.UTC();

      var sched = later.parse.recur().after(8).hour().before(17).hour().onWeekend();

      var start = new Date('2013-02-01T00:00:00Z'),
          end = new Date('2013-02-24T00:00:00Z'),
          expected = [
            [new Date('2013-02-02T08:00:00Z'), new Date('2013-02-02T17:00:00Z')],
            [new Date('2013-02-03T08:00:00Z'), new Date('2013-02-03T17:00:00Z')],
            [new Date('2013-02-09T08:00:00Z'), new Date('2013-02-09T17:00:00Z')],
            [new Date('2013-02-10T08:00:00Z'), new Date('2013-02-10T17:00:00Z')],
            [new Date('2013-02-16T08:00:00Z'), new Date('2013-02-16T17:00:00Z')],
            [new Date('2013-02-17T08:00:00Z'), new Date('2013-02-17T17:00:00Z')],
            [new Date('2013-02-23T08:00:00Z'), new Date('2013-02-23T17:00:00Z')]
          ];

      var next = later.schedule(sched).nextRange(7, start, end);
      next.should.eql(expected);

      var prev = later.schedule(sched).prevRange(7, end, start);
      prev.should.eql(expected.reverse());

      expected.forEach(function(e) {
        later.schedule(sched).isValid(e[0]).should.eql(true);
        later.schedule(sched).isValid(e[1]).should.eql(false);
      });
    });
  });
});
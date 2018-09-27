var later = require('../../index'),
    should = require('should');

describe('Text Examples', function() {

  it('Fire at 12pm (noon) every day', function() {
    later.date.UTC();

    var sched = later.parse.text('at 12:00 pm');

    var start = new Date('2013-03-21T03:05:23Z'),
        end = new Date('2013-03-26T03:40:10Z'),
        expected = [
          new Date('2013-03-21T12:00:00'),
          new Date('2013-03-22T12:00:00'),
          new Date('2013-03-23T12:00:00'),
          new Date('2013-03-24T12:00:00'),
          new Date('2013-03-25T12:00:00')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire at 10:15am every day', function() {
    later.date.UTC();

    var sched = later.parse.text('at 10:15 am');

    var start = new Date('2013-03-21T03:05:23Z'),
        end = new Date('2013-03-26T03:40:10Z'),
        expected = [
          new Date('2013-03-21T10:15:00'),
          new Date('2013-03-22T10:15:00'),
          new Date('2013-03-23T10:15:00'),
          new Date('2013-03-24T10:15:00'),
          new Date('2013-03-25T10:15:00')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire at 10:15am every day (2)', function() {
    later.date.UTC();

    var sched = later.parse.text('at 10:15');

    var start = new Date('2013-03-21T03:05:23Z'),
        end = new Date('2013-03-26T03:40:10Z'),
        expected = [
          new Date('2013-03-21T10:15:00Z'),
          new Date('2013-03-22T10:15:00Z'),
          new Date('2013-03-23T10:15:00Z'),
          new Date('2013-03-24T10:15:00Z'),
          new Date('2013-03-25T10:15:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire at 10:15am every day during 2013', function() {
    later.date.UTC();

    var sched = later.parse.text('at 10:15 am in 2013 ');

    var start = new Date('2012-03-21T03:05:23Z'),
        end = new Date('2013-01-05T23:40:10Z'),
        expected = [
          new Date('2013-01-01T10:15:00Z'),
          new Date('2013-01-02T10:15:00Z'),
          new Date('2013-01-03T10:15:00Z'),
          new Date('2013-01-04T10:15:00Z'),
          new Date('2013-01-05T10:15:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire every minute starting at 2pm and ending at 2:59pm, every day', function() {
    later.date.UTC();

    var sched = later.parse.text('every 1 min after 2:00pm and before 3:00pm');

    var start = new Date('2013-03-21T13:05:23Z'),
        end = new Date('2013-03-21T14:04:10Z'),
        expected = [
          new Date('2013-03-21T14:00:00Z'),
          new Date('2013-03-21T14:01:00Z'),
          new Date('2013-03-21T14:02:00Z'),
          new Date('2013-03-21T14:03:00Z'),
          new Date('2013-03-21T14:04:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire every hour starting at 2pm and ending at 6:59pm, every day', function() {
    later.date.UTC();

    var sched = later.parse.text('every 1 hour after 2:00pm and before 7:00pm');

    var start = new Date('2013-03-21T13:05:23Z'),
        end = new Date('2013-03-21T18:04:10Z'),
        expected = [
          new Date('2013-03-21T14:00:00Z'),
          new Date('2013-03-21T15:00:00Z'),
          new Date('2013-03-21T16:00:00Z'),
          new Date('2013-03-21T17:00:00Z'),
          new Date('2013-03-21T18:00:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire every 5 minutes starting at 2pm and ending at 2:55pm, every day', function() {
    later.date.UTC();

    var sched = later.parse.text('every 5 mins after 2:00pm and before 2:55pm');

    var start = new Date('2013-03-21T14:06:23Z'),
        end = new Date('2013-03-21T14:32:10Z'),
        expected = [
          new Date('2013-03-21T14:10:00Z'),
          new Date('2013-03-21T14:15:00Z'),
          new Date('2013-03-21T14:20:00Z'),
          new Date('2013-03-21T14:25:00Z'),
          new Date('2013-03-21T14:30:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire every 5 minutes starting at 2pm and ending at 2:55pm, AND fire every 5 minutes starting at 6pm and ending at 6:55pm, every day', function() {
    later.date.UTC();

    var sched = later.parse.text('every 5 mins after 2:00pm before 3:00pm also every 5 min after 6:00pm before 7:00pm');

    var start = new Date('2013-03-21T14:45:23Z'),
        end = new Date('2013-03-21T18:12:10Z'),
        expected = [
          new Date('2013-03-21T14:45:23Z'),
          new Date('2013-03-21T14:50:00Z'),
          new Date('2013-03-21T14:55:00Z'),
          new Date('2013-03-21T18:00:00Z'),
          new Date('2013-03-21T18:05:00Z'),
          new Date('2013-03-21T18:10:00Z')
        ];

    var next = later.schedule(sched).next(6, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(6, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire every minute starting at 2pm and ending at 2:05pm, every day', function() {
    later.date.UTC();

    var sched = later.parse.text('every 1 min after 2:00pm and before 2:06pm');

    var start = new Date('2013-03-21T14:03:23Z'),
        end = new Date('2013-03-22T14:02:10Z'),
        expected = [
          new Date('2013-03-21T14:03:23Z'),
          new Date('2013-03-21T14:04:00Z'),
          new Date('2013-03-21T14:05:00Z'),
          new Date('2013-03-22T14:00:00Z'),
          new Date('2013-03-22T14:01:00Z'),
          new Date('2013-03-22T14:02:00Z')
        ];

    var next = later.schedule(sched).next(6, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(6, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire at 2:10pm and at 2:44pm every Wednesday in the month of March.', function() {
    later.date.UTC();

    var sched = later.parse.text('at 2:10pm and 2:44pm on Wed of March');

    var start = new Date('2013-03-19T14:03:23Z'),
        end = new Date('2014-03-05T14:16:10Z'),
        expected = [
          new Date('2013-03-20T14:10:00Z'),
          new Date('2013-03-20T14:44:00Z'),
          new Date('2013-03-27T14:10:00Z'),
          new Date('2013-03-27T14:44:00Z'),
          new Date('2014-03-05T14:10:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire at 10:15am every Monday, Tuesday, Wednesday, Thursday and Friday.', function() {
    later.date.UTC();

    var sched = later.parse.text('at 10:15am every weekday');

    var start = new Date('2013-03-21T14:03:23Z'),
        end = new Date('2013-03-29T06:16:10Z'),
        expected = [
          new Date('2013-03-22T10:15:00Z'),
          new Date('2013-03-25T10:15:00Z'),
          new Date('2013-03-26T10:15:00Z'),
          new Date('2013-03-27T10:15:00Z'),
          new Date('2013-03-28T10:15:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire at 10:15am on the 15th day of every month', function() {
    later.date.UTC();

    var sched = later.parse.text('at 10:15am on the 15th day');

    var start = new Date('2013-03-21T14:03:23Z'),
        end = new Date('2013-09-02T06:16:10Z'),
        expected = [
          new Date('2013-04-15T10:15:00Z'),
          new Date('2013-05-15T10:15:00Z'),
          new Date('2013-06-15T10:15:00Z'),
          new Date('2013-07-15T10:15:00Z'),
          new Date('2013-08-15T10:15:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire at 10:15am on the last day of every month', function() {
    later.date.UTC();

    var sched = later.parse.text('at 10:15am on the last day of the month');

    var start = new Date('2013-04-21T14:03:23Z'),
        end = new Date('2013-09-02T06:16:10Z'),
        expected = [
          new Date('2013-04-30T10:15:00Z'),
          new Date('2013-05-31T10:15:00Z'),
          new Date('2013-06-30T10:15:00Z'),
          new Date('2013-07-31T10:15:00Z'),
          new Date('2013-08-31T10:15:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire at 10:15am on the last Friday of every month', function() {
    later.date.UTC();

    var sched = later.parse.text('at 10:15am on Friday on the last day instance');

    var start = new Date('2013-04-21T14:03:23Z'),
        end = new Date('2013-09-02T06:16:10Z'),
        expected = [
          new Date('2013-04-26T10:15:00Z'),
          new Date('2013-05-31T10:15:00Z'),
          new Date('2013-06-28T10:15:00Z'),
          new Date('2013-07-26T10:15:00Z'),
          new Date('2013-08-30T10:15:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire at 10:15am on the third Friday of every month', function() {
    later.date.UTC();

    var sched = later.parse.text('at 10:15am on Friday on the 3rd day instance');

    var start = new Date('2013-04-21T14:03:23Z'),
        end = new Date('2013-09-22T06:16:10Z'),
        expected = [
          new Date('2013-05-17T10:15:00Z'),
          new Date('2013-06-21T10:15:00Z'),
          new Date('2013-07-19T10:15:00Z'),
          new Date('2013-08-16T10:15:00Z'),
          new Date('2013-09-20T10:15:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire at 12pm (noon) every 5 days every month, starting on the first day of the month.', function() {
    later.date.UTC();

    var sched = later.parse.text('at 12:00pm every 5th day');

    var start = new Date('2013-04-21T14:03:23Z'),
        end = new Date('2013-05-17T06:16:10Z'),
        expected = [
          new Date('2013-04-26T12:00:00Z'),
          new Date('2013-05-01T12:00:00Z'),
          new Date('2013-05-06T12:00:00Z'),
          new Date('2013-05-11T12:00:00Z'),
          new Date('2013-05-16T12:00:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

  it('Fire every November 11th at 11:11am.', function() {
    later.date.UTC();

    var sched = later.parse.text('at 11:11am on the 11th day of November');

    var start = new Date('2013-04-21T14:03:23Z'),
        end = new Date('2017-12-02T06:16:10Z'),
        expected = [
          new Date('2013-11-11T11:11:00Z'),
          new Date('2014-11-11T11:11:00Z'),
          new Date('2015-11-11T11:11:00Z'),
          new Date('2016-11-11T11:11:00Z'),
          new Date('2017-11-11T11:11:00Z')
        ];

    var next = later.schedule(sched).next(5, start, end);
    next.should.eql(expected);

    var prev = later.schedule(sched).prev(5, end, start);
    prev.should.eql(expected.reverse());

    expected.forEach(function(e) {
      later.schedule(sched).isValid(e).should.eql(true);
    });
  });

});
var later = require('../../index'),
    should = require('should');

describe('Modifier After', function() {

  describe('name', function() {

    it('should append "after" before a minute constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [15]);
      after.name.should.equal('after ' + later.m.name);
    });

    it('should append "after" before a time constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [15]);
      after.name.should.equal('after ' + later.t.name);
    });

  });

  describe('range', function() {

    it('should be the number of seconds covered by the minutes range', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [15]);
      after.range.should.equal(44 * 60);
    });

    it('should be the number of seconds covered by the time range', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [60000]);
      after.range.should.equal(26399);
    });

  });

  describe('val', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return the correct minutes value when less than constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [5]);
      after.val(d).should.equal(10);
    });

    it('should return the correct minutes value when greater than constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [15]);
      after.val(d).should.equal(10);
    });

    it('should be the number of seconds covered by the time range when less than constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [10000]);
      after.val(d).should.equal(11400);
    });

    it('should be the number of seconds covered by the time range when greater than constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [20000]);
      after.val(d).should.equal(11400);
    });

  });

  describe('isValid', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return true if the current minute val is greater than constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [5]);
      after.isValid(d, 10).should.equal(true);
    });

    it('should return true if the current minute val is equal to the constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [10]);
      after.isValid(d, 5).should.equal(true);
    });

    it('should return false if the current minute val is less than constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [15]);
      after.isValid(d, 2).should.equal(false);
    });

    it('should return true if the current time val is greater than constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [10000]);
      after.isValid(d, 30000).should.equal(true);
    });

    it('should return true if the current time val is equal to the constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [11400]);
      after.isValid(d, 20000).should.equal(true);
    });

    it('should return false if the current time val is less than constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [20000]);
      after.isValid(d, 15000).should.equal(false);
    });

  });

  describe('extent', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return the minute extent', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [15]);
      after.extent(d).should.eql(later.m.extent(d));
    });

    it('should return the time extent', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [60000]);
      after.extent(d).should.eql(later.t.extent(d));
    });

  });

  describe('start', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return the minute start', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [15]);
      after.start(d).should.eql(later.m.start(d));
    });

    it('should return the time start', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [60000]);
      after.start(d).should.eql(later.t.start(d));
    });

  });

  describe('end', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return the minute end', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [15]);
      after.end(d).should.eql(later.m.end(d));
    });

    it('should return the time end', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [60000]);
      after.end(d).should.eql(later.t.end(d));
    });

  });

  describe('next', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return start of range if val equals minute constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [15]);
      after.next(d, 15).should.eql(new Date('2013-03-21T03:15:00Z'));
    });

    it('should return start of extent if val does not equal minute constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [10]);
      after.next(d, 5).should.eql(new Date('2013-03-21T04:00:00Z'));
    });

    it('should return start of range if val equals time constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [11520]);
      after.next(d, 11520).should.eql(new Date('2013-03-21T03:12:00Z'));
    });

    it('should return start of extent if val does not equal time constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [11520]);
      after.next(d, 11521).should.eql(new Date('2013-03-22T00:00:00Z'));
    });

  });

  describe('prev', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return end of range if val equals minute constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [15]);
      after.prev(d, 15).should.eql(new Date('2013-03-21T02:59:59Z'));
    });

    it('should return start of range - 1 if val does not equal minute constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.m, [10]);
      after.prev(d, 5).should.eql(new Date('2013-03-21T03:09:59Z'));
    });

    it('should return end of range if val equals time constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [11520]);
      after.prev(d, 11520).should.eql(new Date('2013-03-20T23:59:59Z'));
    });

    it('should return start of range - 1 if val does not equal time constraint', function() {
      later.date.UTC();
      var after = later.modifier.after(later.t, [11400]);
      after.prev(d, 11521).should.eql(new Date('2013-03-21T03:09:59Z'));
    });

  });


  describe('compiled minute schedule', function() {

    var c = later.compile({m_a: [30]});

    it('should tick to next consecutive minutes', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:31:00Z'),
          expected = new Date('2013-03-21T03:32:00Z'),
          actual = c.tick('next', d);

      actual.should.eql(expected);
    });

    it('should tick to prev consecutive minutes', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:26:00Z'),
          expected = new Date('2013-03-21T03:25:59Z'),
          actual = c.tick('prev', d);

      actual.should.eql(expected);
    });

    it('should go the next valid value when invalid', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:25:00Z'),
          expected = new Date('2013-03-21T03:30:00Z'),
          actual = c.start('next', d);

      actual.should.eql(expected);
    });

    it('should go the prev valid value when invalid', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:25:00Z'),
          expected = new Date('2013-03-21T02:59:59Z'),
          actual = c.start('prev', d);

      actual.should.eql(expected);
    });

    it('should go the end of constraint value when valid for prev', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:45:10Z'),
          expected = new Date('2013-03-21T03:45:59Z'),
          actual = c.start('prev', d);

      actual.should.eql(expected);
    });

    it('should go the start of constraint value when valid for next', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:45:10Z'),
          expected = new Date('2013-03-21T03:45:00Z'),
          actual = c.start('next', d);

      actual.should.eql(expected);
    });

    it('should go the end of the constraint', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:45:10Z'),
          expected = new Date('2013-03-21T04:00:00Z'),
          actual = c.end('next', d);

      actual.should.eql(expected);
    });

  });

  describe('compiled time schedule', function() {

    var c = later.compile({t_a: [11400]});

    it('should tick to next consecutive minutes', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:31:00Z'),
          expected = new Date('2013-03-21T03:31:01Z'),
          actual = c.tick('next', d);

      actual.should.eql(expected);
    });

    it('should tick to prev consecutive minutes', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:26:00Z'),
          expected = new Date('2013-03-21T03:25:59Z'),
          actual = c.tick('prev', d);

      actual.should.eql(expected);
    });

    it('should go the next valid value when invalid', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:05:00Z'),
          expected = new Date('2013-03-21T03:10:00Z'),
          actual = c.start('next', d);

      actual.getTime().should.eql(expected.getTime());
    });

    it('should go the prev valid value when invalid', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:05:00Z'),
          expected = new Date('2013-03-20T23:59:59Z'),
          actual = c.start('prev', d);

      actual.getTime().should.eql(expected.getTime());
    });

    it('should go the start of constraint value when valid for prev', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:10:10Z'),
          expected = new Date('2013-03-21T03:10:10Z'),
          actual = c.start('prev', d);

      actual.getTime().should.eql(expected.getTime());
    });

    it('should go the start of constraint value when valid for next', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:10:10Z'),
          expected = new Date('2013-03-21T03:10:10Z'),
          actual = c.start('next', d);

      actual.getTime().should.eql(expected.getTime());
    });

    it('should go the end of the constraint', function() {
      later.date.UTC();
      var d = new Date('2013-03-21T03:45:10Z'),
          expected = new Date('2013-03-22T00:00:00Z'),
          actual = c.end('next', d);

      actual.getTime().should.eql(expected.getTime());
    });

  });
});
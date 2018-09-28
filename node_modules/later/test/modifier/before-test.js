var later = require('../../index'),
    should = require('should');

describe('Modifier Before', function() {

  describe('name', function() {

    it('should append "before" before a minute constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [15]);
      before.name.should.equal('before ' + later.m.name);
    });

    it('should append "before" before a time constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [15]);
      before.name.should.equal('before ' + later.t.name);
    });

  });

  describe('range', function() {

    it('should be the number of seconds covered by the minutes range', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [15]);
      before.range.should.equal(14 * 60);
    });

    it('should be the number of seconds covered by the time range', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [60000]);
      before.range.should.equal(59999);
    });

  });

  describe('val', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return the correct minutes value when less than constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [5]);
      before.val(d).should.equal(10);
    });

    it('should return the correct minutes value when greater than constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [15]);
      before.val(d).should.equal(10);
    });

    it('should be the number of seconds covered by the time range when less than constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [10000]);
      before.val(d).should.equal(11400);
    });

    it('should be the number of seconds covered by the time range when greater than constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [20000]);
      before.val(d).should.equal(11400);
    });

  });

  describe('isValid', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return false if the current minute val is greater than constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [5]);
      before.isValid(d, 10).should.equal(false);
    });

    it('should return false if the current minute val is equal to the constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [10]);
      before.isValid(d, 5).should.equal(false);
    });

    it('should return true if the current minute val is less than constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [15]);
      before.isValid(d, 2).should.equal(true);
    });

    it('should return false if the current time val is greater than constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [10000]);
      before.isValid(d, 30000).should.equal(false);
    });

    it('should return false if the current time val is equal to the constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [11400]);
      before.isValid(d, 20000).should.equal(false);
    });

    it('should return true if the current time val is less than constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [20000]);
      before.isValid(d, 15000).should.equal(true);
    });

  });

  describe('extent', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return the minute extent', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [15]);
      before.extent(d).should.eql(later.m.extent(d));
    });

    it('should return the time extent', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [60000]);
      before.extent(d).should.eql(later.t.extent(d));
    });

  });

  describe('start', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return the minute start', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [15]);
      before.start(d).should.eql(later.m.start(d));
    });

    it('should return the time start', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [60000]);
      before.start(d).should.eql(later.t.start(d));
    });

  });

  describe('end', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return the minute end', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [15]);
      before.end(d).should.eql(later.m.end(d));
    });

    it('should return the time end', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [60000]);
      before.end(d).should.eql(later.t.end(d));
    });

  });

  describe('next', function() {

    var d = new Date('2013-03-21T03:10:00Z');

    it('should return start of range if val equals minute constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [5]);
      before.next(d, 5).should.eql(new Date('2013-03-21T04:00:00Z'));
    });

    it('should return end of valid if val does not equal minute constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [20]);
      before.next(d, 5).should.eql(new Date('2013-03-21T03:20:00Z'));
    });

    it('should return start of range if val equals time constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [5520]);
      before.next(d, 5520).should.eql(new Date('2013-03-22T00:00:00Z'));
    });

    it('should return end of valid if val does not equal time constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [11520]);
      before.next(d, 11521).should.eql(new Date('2013-03-21T03:12:00Z'));
    });

  });

  describe('prev', function() {

    var d = new Date('2013-03-21T03:30:00Z');

    it('should return end of range if val equals minute constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [15]);
      before.prev(d, 15).should.eql(new Date('2013-03-21T03:14:59Z'));
    });

    it('should return start of range - 1 if val does not equal minute constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.m, [45]);
      before.prev(d, 5).should.eql(new Date('2013-03-21T02:59:59Z'));
    });

    it('should return end of range if val equals time constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [11520]);
      before.prev(d, 11520).should.eql(new Date('2013-03-21T03:11:59Z'));
    });

    it('should return start of range - 1 if val does not equal time constraint', function() {
      later.date.UTC();
      var before = later.modifier.before(later.t, [11400]);
      before.prev(d, 11521).should.eql(new Date('2013-03-20T23:59:59Z'));
    });

  });

});
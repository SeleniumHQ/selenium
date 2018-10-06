var later = require('../../index'),
    should = require('should');

describe('Compile', function() {

  describe('start', function() {
    var d = new Date('2013-03-21T00:00:05Z');

    describe('next', function() {

      it('should return start date if start is valid', function() {
        later.date.UTC();
        later.compile({Y:[2013], M:[3], D:[21], s:[5]}).start('next', d).should.eql(d);
      });

      it('should return start date if after modifier is used', function() {
        later.date.UTC();
        later.compile({M: [3], Y_a:[2012]}).start('next', d).should.eql(new Date('2013-03-01T00:00:00Z'));
      });

      it('should return next valid occurrence if invalid', function() {
        later.date.UTC();
        later.compile({Y:[2013], M:[4,5]}).start('next', d).should.eql(new Date('2013-04-01T00:00:00Z'));
      });

      it('should validate all constraints on a rollover', function() {
        later.date.UTC();
        later.compile({Y:[2013,2015], M:[1]}).start('next', d).should.eql(new Date('2015-01-01T00:00:00Z'));
      });
    });

    describe('prev', function() {

      it('should return start date if start is valid', function() {
        later.date.UTC();
        later.compile({Y:[2013], s:[5]}).start('prev', d).should.eql(d);
      });

      it('should return previous valid occurrence if invalid', function() {
        later.date.UTC();
        later.compile({Y:[2012]}).start('prev', d).should.eql(new Date('2012-12-31T23:59:59Z'));
      });

    });

  });

  describe('end', function() {
    var d = new Date('2013-03-21T00:00:05Z');

    it('should return next invalid occurrence if valid', function() {
      later.date.UTC();
      later.compile({Y:[2013,2014]}).end('next', d).should.eql(new Date('2015-01-01T00:00:00Z'));
    });

    it('should return prev invalid occurrence if valid', function() {
      later.date.UTC();
      later.compile({Y:[2013,2014]}).end('prev', d).should.eql(new Date('2012-12-31T23:59:59Z'));
    });

  });

  describe('tick', function() {
    var d = new Date('2013-03-21T00:00:05Z');

    describe('next', function() {

      it('should tick the smallest constraint with only one', function() {
        later.date.UTC();
        later.compile({M:[3,5]}).tick('next', d).should.eql(new Date('2013-04-01T00:00:00Z'));
      });

      it('should tick the smallest constraint with multiple', function() {
        later.date.UTC();
        later.compile({Y:[2013,2014], s: [10, 20]}).tick('next', d).should.eql(new Date('2013-03-21T00:00:06Z'));
      });

    });

    describe('prev', function() {

      it('should tick the smallest constraint with only one', function() {
        later.date.UTC();
        later.compile({M:[3,5]}).tick('prev', d).should.eql(new Date('2013-02-28T23:59:59Z'));
      });

      it('should tick the smallest constraint with multiple', function() {
        later.date.UTC();
        later.compile({Y:[2013,2014], s: [10, 20]}).tick('prev', d).should.eql(new Date('2013-03-21T00:00:04Z'));
      });

    });

  });


});

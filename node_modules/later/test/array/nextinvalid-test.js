var later = require('../../index'),
    should = require('should');

describe('Later.array.nextInvalid', function() {

  it('should exist', function() {
    should.exist(later.array.nextInvalid);
  });

  it('should return the next invalid value', function() {
    var arr = [1,2,5],
        extent = [1,5],
        cur = 2,
        expected = 3,
        actual = later.array.nextInvalid(cur, arr, extent);

    actual.should.eql(expected);
  });

  it('should return the next invalid value when greater than arr', function() {
    var arr = [1,2,5],
        extent = [1,10],
        cur = 5,
        expected = 6,
        actual = later.array.nextInvalid(cur, arr, extent);

    actual.should.eql(expected);
  });

  it('should return the next invalid value when zero value is largest', function() {
    var arr = [1,2,5, 0],
        extent = [1,31],
        cur = 31,
        expected = 3,
        actual = later.array.nextInvalid(cur, arr, extent);

    actual.should.eql(expected);
  });

  it('should return the next invalid value when zero value is smallest', function() {
    var arr = [0,1,2,5,10],
        extent = [0,10],
        cur = 10,
        expected = 3,
        actual = later.array.nextInvalid(cur, arr, extent);

    actual.should.eql(expected);
  });

  it('should return the current value if it is invalid', function() {
    var arr = [0,1,2,5,10],
        extent = [0,10],
        cur = 4,
        expected = 4,
        actual = later.array.nextInvalid(cur, arr, extent);

    actual.should.eql(expected);
  });
});
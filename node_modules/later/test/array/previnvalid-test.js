var later = require('../../index'),
    should = require('should');

describe('Later.array.prevInvalid', function() {

  it('should exist', function() {
    should.exist(later.array.prevInvalid);
  });

  it('should return the previous invalid value', function() {
    var arr = [1,2,5],
        extent = [1,5],
        cur = 5,
        expected = 4,
        actual = later.array.prevInvalid(cur, arr, extent);

    actual.should.eql(expected);
  });

  it('should return the previous invalid value when less than arr', function() {
    var arr = [2,3,5],
        extent = [1,10],
        cur = 3,
        expected = 1,
        actual = later.array.prevInvalid(cur, arr, extent);

    actual.should.eql(expected);
  });

  it('should return the previous invalid value when zero value is largest', function() {
    var arr = [1,2,5,0],
        extent = [1,31],
        cur = 31,
        expected = 30,
        actual = later.array.prevInvalid(cur, arr, extent);

    actual.should.eql(expected);
  });

  it('should return the previous invalid value when zero value is smallest', function() {
    var arr = [0,1,2,5,10],
        extent = [0,10],
        cur = 2,
        expected = 9,
        actual = later.array.prevInvalid(cur, arr, extent);

    actual.should.eql(expected);
  });

  it('should return the current value if it is invalid', function() {
    var arr = [0,1,2,5,10],
        extent = [0,10],
        cur = 4,
        expected = 4,
        actual = later.array.prevInvalid(cur, arr, extent);

    actual.should.eql(expected);
  });

  it('should return undefined if there is no invalid value', function() {
    var arr = [0,1,2,3,4,5],
        extent = [0,5],
        cur = 4;

    should.not.exist(later.array.prevInvalid(cur, arr, extent));
  });
});
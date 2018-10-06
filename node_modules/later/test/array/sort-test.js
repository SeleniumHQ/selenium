var later = require('../../index'),
    should = require('should');

describe('Later.array.sort', function() {

  it('should exist', function() {
    should.exist(later.array.sort);
  });

  it('should not modify arrays that are already sorted', function() {
    var arr = [1,2,3,4,5],
        expected = [1,2,3,4,5];

    later.array.sort(arr);
    arr.should.eql(expected);
  });

  it('should sort in natural order', function() {
    var arr = [6,9,2,4,3],
        expected = [2,3,4,6,9];

    later.array.sort(arr);
    arr.should.eql(expected);
  });

  it('should put zero at the front by default', function() {
    var arr = [6,9,2,0,4,3],
        expected = [0,2,3,4,6,9];

    later.array.sort(arr);
    arr.should.eql(expected);
  });

  it('should put zero at the end if zeroIsLast is true', function() {
    var arr = [6,9,2,0,4,3],
        expected = [2,3,4,6,9,0];

    later.array.sort(arr, true);
    arr.should.eql(expected);
  });

});
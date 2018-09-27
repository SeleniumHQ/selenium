var later = require('../../index'),
    should = require('should');

describe('Set interval', function() {

  it('should execute a callback after the specified amount of time', function(done) {
    this.timeout(0);

    var s = later.parse.recur().every(1).second(),
        t = later.setInterval(test, s),
        count = 0;

    function test() {
      later.schedule(s).isValid(new Date()).should.eql(true);
      count++;
      if(count > 2) {
        t.clear();
        done();
      }
    }

  });

  it('should allow clearing of the timeout', function(done) {
    this.timeout(0);

    var s = later.parse.recur().every(2).second();

    function test() {
      should.not.exist(true);
    }

    var t = later.setInterval(test, s);
    t.clear();

    setTimeout(done, 3000);
  });

});
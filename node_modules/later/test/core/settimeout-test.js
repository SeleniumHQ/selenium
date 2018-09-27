var later = require('../../index'),
    should = require('should');

describe('Set timeout', function() {

  it('should execute a callback after the specified amount of time', function(done) {
    this.timeout(3000);

    var s = later.parse.recur().every(2).second();

    function test() {
      later.schedule(s).isValid(new Date()).should.eql(true);
      done();
    }

    later.setTimeout(test, s);
  });

  it('should allow clearing of the timeout', function(done) {
    this.timeout(3000);

    var s = later.parse.recur().every(1).second();

    function test() {
      should.not.exist(true);
    }

    var t = later.setTimeout(test, s);
    t.clear();

    setTimeout(done, 2000);
  });


  it('should not execute a far out schedule immediately', function(done) {
    this.timeout(3000);

    var s = later.parse.recur().on(2017).year();

    function test() {
      should.not.exist(true);
    }

    var t = later.setTimeout(test, s);

    setTimeout(function() { t.clear(); done(); }, 2000);
  });

  it('should execute a callback for a one-time occurrence after the specified amount of time', function(done) {
    this.timeout(3000);
 
    var offsetInMilliseconds = 2000;
    var now = new Date()
    var nowOffset = now.getTime() + offsetInMilliseconds
    var s = later.parse.recur().on(new Date(nowOffset)).fullDate();

    function test() {
      done();
    }

    later.setTimeout(test, s);
  });

});
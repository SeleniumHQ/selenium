var Benchmark = require('benchmark'),
    later = require('../../index'),
    suite = new Benchmark.Suite('next');

var schedSimple = later.parse.cron('* */5 * * * *'),
    compiledSimple = later.schedule(schedSimple);

var schedComplex = later.parse.cron('0 5 15W * ?'),
    compiledComplex = later.schedule(schedComplex);

suite
.add('simple next', function() {
  compiledSimple.next();
})
.add('complex next', function() {
  compiledComplex.next();
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.run({async: false});
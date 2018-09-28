var Benchmark = require('benchmark'),
    later = require('../../index'),
    suite = new Benchmark.Suite('val');

suite
/*.add('year', function() {
  later.year.val(new Date(2012, 4, 15, 20, 15, 13));
})
.add('month', function() {
  later.month.val(new Date(2012, 4, 15, 20, 15, 13));
})
.add('day', function() {
  later.day.val(new Date(2012, 4, 15, 20, 15, 13));
})
.add('hour', function() {
  later.hour.val(new Date(2012, 4, 15, 20, 15, 13));
})
.add('minute', function() {
  later.minute.val(new Date(2012, 4, 15, 20, 15, 13));
})
.add('second', function() {
  later.second.val(new Date(2012, 4, 15, 20, 15, 13));
})
.add('dayofweek', function() {
  later.dayOfWeek.val(new Date(2012, 4, 15, 20, 15, 13));
})
.add('dayofweekcount', function() {
  later.dayOfWeekCount.val(new Date(2012, 4, 15, 20, 15, 13));
})*/
.add('dayofyear', function() {
  later.dayOfYear.val(new Date(2012, 4, 15, 20, 15, 13));
})
/*.add('time', function() {
  later.time.val(new Date(2012, 4, 15, 20, 15, 13));
})
.add('weekofmonth', function() {
  later.weekOfMonth.val(new Date(2012, 4, 15, 20, 15, 13));
})
.add('weekofyear', function() {
  later.weekOfYear.val(new Date(2012, 4, 15, 20, 15, 13));
})*/
.on('cycle', function(event) {
  console.log(String(event.target));
})
.run({async: true});
var Benchmark = require('benchmark'),
    later = require('../../index'),
    suite = new Benchmark.Suite('next');

suite
.add('year', function() {
  later.year.next(new Date(2012, 4, 15, 20, 15, 13), 2014);
})
.add('month', function() {
  later.month.next(new Date(2012, 4, 15, 20, 15, 13), 1);
})
.add('day', function() {
  later.day.next(new Date(2012, 4, 15, 20, 15, 13), 1);
})
.add('hour', function() {
  later.hour.next(new Date(2012, 4, 15, 20, 15, 13), 1);
})
.add('minute', function() {
  later.minute.next(new Date(2012, 4, 15, 20, 15, 13), 1);
})
.add('second', function() {
  later.second.next(new Date(2012, 4, 15, 20, 15, 13), 1);
})
.add('dayofweek', function() {
  later.dayOfWeek.next(new Date(2012, 4, 15, 20, 15, 13), 1);
})
.add('dayofweekcount', function() {
  later.dayOfWeekCount.next(new Date(2012, 4, 15, 20, 15, 13), 1);
})
.add('dayofyear', function() {
  later.dayOfYear.next(new Date(2012, 4, 15, 20, 15, 13), 1);
})
.add('time', function() {
  later.time.next(new Date(2012, 4, 15, 20, 15, 13), 1);
})
.add('weekofmonth', function() {
  later.weekOfMonth.next(new Date(2012, 4, 15, 20, 15, 13), 1);
})
.add('weekofyear', function() {
  later.weekOfYear.next(new Date(2012, 4, 15, 20, 15, 13), 1);
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.run({async: false});
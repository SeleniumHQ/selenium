require('colors')
var jsdiff = require('../');

var one = 'beep boop';
var other = 'beep boob blah';

var diff = jsdiff.diffChars(one, other);

diff.forEach(function(part){
  // green for additions, red for deletions
  // grey for common parts
  var color = part.added ? 'green' :
    part.removed ? 'red' : 'grey';
  process.stderr.write(part.value[color]);
});

console.log();
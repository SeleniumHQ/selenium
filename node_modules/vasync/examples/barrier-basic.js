var mod_vasync = require('../lib/vasync');

var barrier = mod_vasync.barrier();

barrier.on('drain', function () {
	console.log('barrier drained!');
});

console.log('barrier', barrier);

barrier.start('op1');
console.log('op1 started', barrier);

barrier.start('op2');
console.log('op2 started', barrier);

barrier.done('op2');
console.log('op2 done', barrier);

barrier.done('op1');
console.log('op1 done', barrier);

barrier.start('op3');
console.log('op3 started');

setTimeout(function () {
	barrier.done('op3');
	console.log('op3 done');
}, 10);

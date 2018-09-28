var mod_vasync = require('../lib/vasync');

var queue = mod_vasync.queue(function (task, callback) { task(callback); }, 1);

queue.push(function (callback) {
	console.log('first task begins');
	setTimeout(function () {
		console.log('first task ends');
		callback();
	}, 500);
});

queue.push(function (callback) {
	console.log('second task begins');
	process.nextTick(function () {
		console.log('second task ends');
		callback();
	});
});

var mod_fs = require('fs');
var mod_vasync = require('../lib/vasync');

var queue;

function doneOne()
{
	console.log('task completed; queue state:\n%s\n',
	    JSON.stringify(queue, null, 4));
}

queue = mod_vasync.queue(mod_fs.stat, 2);

console.log('initial queue state:\n%s\n', JSON.stringify(queue, null, 4));

queue.push('/tmp/file1', doneOne);
queue.push('/tmp/file2', doneOne);
queue.push('/tmp/file3', doneOne);
queue.push('/tmp/file4', doneOne);

console.log('all tasks pushed:\n%s\n', JSON.stringify(queue, null, 4));

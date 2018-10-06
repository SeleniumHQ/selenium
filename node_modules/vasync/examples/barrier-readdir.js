var mod_fs = require('fs');
var mod_path = require('path');
var mod_vasync = require('../lib/vasync');

var barrier = mod_vasync.barrier();

barrier.on('drain', function () {
	console.log('all files checked');
});

barrier.start('readdir');

mod_fs.readdir(__dirname, function (err, files) {
	barrier.done('readdir');

	if (err)
		throw (err);

	files.forEach(function (file) {
		barrier.start('stat ' + file);

		var path = mod_path.join(__dirname, file);

		mod_fs.stat(path, function (err2, stat) {
			barrier.done('stat ' + file);
			console.log('%s: %d bytes', file, stat['size']);
		});
	});
});

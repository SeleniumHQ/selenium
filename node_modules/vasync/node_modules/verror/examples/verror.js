var fs = require('fs');
var VError = require('../lib/verror');

var filename = '/nonexistent';
fs.stat(filename, function (err1) {
	var err2 = new VError(err1, 'stat "%s" failed', filename);
	console.error(err2.message);
	console.error(err2.cause().message);
});

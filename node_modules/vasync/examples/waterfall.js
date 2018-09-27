/*
 * examples/waterfall.js: simple waterfall example
 */
var mod_vasync = require('..');
mod_vasync.waterfall([
    function func1(callback) {
 	setImmediate(function () {
		callback(null, 37);
	});
    },
    function func2(extra, callback) {
	console.log('func2 got "%s" from func1', extra);
	callback();
    }
], function () {
	console.log('done');
});

var mod_dns = require('dns');
var mod_util = require('util');
var mod_vasync = require('../lib/vasync');

console.log(mod_vasync.parallel({
    'funcs': [
	function f1 (callback) { mod_dns.resolve('joyent.com', callback); },
	function f2 (callback) { mod_dns.resolve('github.com', callback); },
	function f3 (callback) { mod_dns.resolve('asdfaqsdfj.com', callback); }
    ]
}, function (err, results) {
	console.log('error: %s', err.message);
	console.log('results: %s', mod_util.inspect(results, null, 3));
}));

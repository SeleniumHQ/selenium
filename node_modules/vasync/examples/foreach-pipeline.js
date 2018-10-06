var mod_dns = require('dns');
var mod_util = require('util');
var mod_vasync = require('../lib/vasync');

console.log(mod_vasync.forEachPipeline({
    'func': mod_dns.resolve,
    'inputs': [ 'joyent.com', 'github.com', 'asdfaqsdfj.com' ]
}, function (err, results) {
	console.log('error: %s', err.message);
	console.log('results: %s', mod_util.inspect(results, null, 3));
}));

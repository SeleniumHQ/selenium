/*
 * Tests that if the user modifies the list of functions passed to
 * vasync.pipeline, vasync ignores the changes and does not crash.
 */
var assert = require('assert');
var vasync = require('../lib/vasync');
var count = 0;
var funcs;

function doStuff(_, callback)
{
	count++;
	setImmediate(callback);
}

funcs = [ doStuff, doStuff, doStuff ];

vasync.pipeline({
    'funcs': funcs
}, function (err) {
	assert.ok(!err);
	assert.ok(count === 3);
});

funcs.push(doStuff);

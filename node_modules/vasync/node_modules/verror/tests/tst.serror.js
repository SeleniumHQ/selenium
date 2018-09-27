/*
 * tst.serror.js: tests basic functionality of the SError class.
 */

var mod_assert = require('assert');
var mod_verror = require('../lib/verror');

var VError = mod_verror.VError;
var SError = mod_verror.SError;

var err, suberr, stack, nodestack;

/*
 * See tst.verror.js
 */
function cleanStack(stacktxt)
{
	var re = new RegExp(__filename + ':\\d+:\\d+', 'gm');
	stacktxt = stacktxt.replace(re, 'tst.serror.js');
	return (stacktxt);
}

nodestack = new Error().stack.split('\n').slice(2).join('\n');

/* basic no-args case */
err = new SError();
mod_assert.equal(err.name, 'VError');
mod_assert.ok(err instanceof Error);
mod_assert.ok(err instanceof VError);
mod_assert.ok(err instanceof SError);
mod_assert.equal(err.message, '');
mod_assert.ok(err.cause() === undefined);
stack = cleanStack(err.stack);
mod_assert.equal(stack, [
    'SError',
    '    at Object.<anonymous> (tst.serror.js)'
].join('\n') + '\n' + nodestack);

/* simple case */
err = new SError('hello %d %ss', 3, 'world');
mod_assert.equal(err.message, 'hello 3 worlds');

/* include a cause */
suberr = err;
err = new SError(suberr, 'something wrong%s', '?');
mod_assert.equal(err.message, 'something wrong?: hello 3 worlds');
mod_assert.ok(err.cause() === suberr);

/* include options */
err = new SError({
    'cause': suberr,
    'constructorOpt': arguments.callee
}, 'something wrong?');
mod_assert.equal(err.message, 'something wrong?: hello 3 worlds');
mod_assert.ok(err.cause() === suberr);
stack = cleanStack(err.stack);
mod_assert.equal(stack, [
    'SError: something wrong?: hello 3 worlds'
].join('\n') + '\n' + nodestack);

/* bad arguments */
mod_assert.throws(function () { err = new SError('foo%sbar', null); },
    /attempted to print undefined or null as a string/);
mod_assert.throws(function () { err = new SError('foo%sbar', null); },
    /attempted to print undefined or null as a string/);
console.log('tests passed');

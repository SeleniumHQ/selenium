/*
 * This program attempts to determine what's possible with Node.js Error
 * objects, particularly around the properties we'd like to have:
 *
 *    - "name" property can be set and read
 *    - "name" property appears correct in toString()
 *    - "message" property can be set and read
 *    - "message" property appears correct in toString()
 *    - instanceof Error is true
 *    - ... even for second- and third-level subclasses
 *    - instanceof is true for each parent class
 *    - "stack" exists
 *    - "stack" is a lazy property
 *    - "stack" is correct (shows the right stack trace)
 *    - other properties can be added
 *
 * In both v0.10.28 and v0.11.14-pre, the "err.name" and "err.message"
 * properties can be set both before and after fetching "err.stack", and their
 * values are always correct in err.toString().
 *
 * In v0.10.28, the values of "err.name" and "err.message" as of the *first*
 * time "err.stack" is accessed are immortalized in the "err.stack" value.  As a
 * result, if you set "err.name" and "err.message" in subclass constructors, we
 * should be fine.
 *
 * In v0.11.14-pre, the initial values of "err.name" and "err.message" are
 * immortalized in the "err.stack" value, so if these are changed after
 * construction, "err.stack" will always refer to the constructor name and
 * initial message.  This is unfortunate, but probably also not a big deal.
 */
var VError = require('../lib/verror');

var errorname = 'OtherName';
var message = 'my sample error';
var omessage = 'other error message';

function main()
{
	console.log('node %s', process.version);
	runBattery(Error);
	console.log('===============================');
	runBattery(VError);
}

function runBattery(klass)
{
	var name, error;

	name = klass.name;

	error = new klass(message);
	printErrorInfo(name, 'simple', error);

	error.name = errorname;
	printErrorInfo(name, 'changed "name" after fetching stack', error);

	error = new klass(message);
	error.name = errorname;
	printErrorInfo(name, 'changed "name" before fetching stack', error);

	error = new klass(message);
	error.message = omessage;
	printErrorInfo(name, 'changed "message" before fetching stack', error);

	error.message = message;
	printErrorInfo(name, 'changed "message" back after fetching stack',
	    error);

	error = new klass(message);
	error.otherprop = 'otherpropvalue';
	printErrorInfo(name, 'with "otherprop" property', error);
}

function printErrorInfo(classname, label, err)
{
	console.log('------------------');
	console.log('test: %s, %s', classname, label);
	console.log('instanceof Error: %s', err instanceof Error);
	console.log('constructor: %s', err.constructor.name);
	console.log('error name: %s', err.name);
	console.log('error message: %s', err.message);
	console.log('error toString: %s', err.toString());
	console.log('has "otherprop": %s', err.hasOwnProperty('otherprop'));
	console.log('error stack: %s', err.stack);
	console.log('inspect: ', err);
}

main();

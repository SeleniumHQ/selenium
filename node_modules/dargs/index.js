'use strict';
var numberIsNan = require('number-is-nan');

function createArg(key, val, separator) {
	key = key.replace(/[A-Z]/g, '-$&').toLowerCase();
	return '--' + key + (val ? separator + val : '');
}

function match(arr, val) {
	return arr.some(function (x) {
		return x instanceof RegExp ? x.test(val) : x === val;
	});
}

function createAliasArg(key, val) {
	return '-' + key + (val ? ' ' + val : '');
}

module.exports = function (input, opts) {
	var args = [];
	var extraArgs = [];

	opts = opts || {};

	var separator = opts.useEquals === false ? ' ' : '=';

	Object.keys(input).forEach(function (key) {
		var val = input[key];
		var argFn = createArg;

		if (Array.isArray(opts.excludes) && match(opts.excludes, key)) {
			return;
		}

		if (Array.isArray(opts.includes) && !match(opts.includes, key)) {
			return;
		}

		if (typeof opts.aliases === 'object' && opts.aliases[key]) {
			key = opts.aliases[key];
			argFn = createAliasArg;
		}

		if (key === '_') {
			if (!Array.isArray(val)) {
				throw new TypeError('Expected key \'_\' to be an array, but found ' + (typeof val));
			}

			extraArgs = val;
			return;
		}

		if (val === true) {
			args.push(argFn(key, ''));
		}

		if (val === false && !opts.ignoreFalse) {
			args.push(argFn('no-' + key));
		}

		if (typeof val === 'string') {
			args.push(argFn(key, val, separator));
		}

		if (typeof val === 'number' && !numberIsNan(val)) {
			args.push(argFn(key, String(val), separator));
		}

		if (Array.isArray(val)) {
			val.forEach(function (arrVal) {
				args.push(argFn(key, arrVal, separator));
			});
		}
	});

	extraArgs.forEach(function (extraArgVal) {
		args.push(String(extraArgVal));
	});

	return args;
};

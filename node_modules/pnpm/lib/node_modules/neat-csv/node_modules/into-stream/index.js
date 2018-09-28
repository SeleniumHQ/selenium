'use strict';
var from = require('from2');

module.exports = function (x) {
	if (Array.isArray(x)) {
		x = x.slice();
	}

	return from(function (size, cb) {
		if (x.length === 0) {
			cb(null, null);
			return;
		}

		if (Array.isArray(x)) {
			cb(null, x.shift());
			return;
		}

		var chunk = x.slice(0, size);
		x = x.slice(size);
		cb(null, chunk);
	});
};

module.exports.obj = function (x) {
	if (Array.isArray(x)) {
		x = x.slice();
	}

	return from.obj(function (size, cb) {
		if (Array.isArray(x)) {
			if (x.length === 0) {
				cb(null, null);
				return;
			}

			cb(null, x.shift());
			return;
		}

		this.push(x);
		cb(null, null);
	});
};

'use strict';
const pMap = require('p-map');

class EndError extends Error {} // eslint-disable-line unicorn/custom-error-definition

const filter = filterer => (x, i) => Promise.resolve(filterer(x, i)).then(val => {
	if (!val) {
		throw new EndError();
	}

	return val;
});

module.exports = (iterable, filterer, opts) => pMap(iterable, filter(filterer), opts)
	.then(() => true)
	.catch(err => {
		if (err instanceof EndError) {
			return false;
		}

		throw err;
	});

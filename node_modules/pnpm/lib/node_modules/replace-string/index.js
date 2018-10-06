'use strict';
module.exports = (input, needle, replacement, opts) => {
	opts = Object.assign({}, opts);

	if (typeof input !== 'string') {
		throw new TypeError(`Expected input to be a string, got ${typeof input}`);
	}

	if (!(typeof needle === 'string' && needle.length > 0) ||
		!(typeof replacement === 'string' || typeof replacement === 'function')) {
		return input;
	}

	let ret = '';
	let matchCount = 0;
	let prevIndex = opts.fromIndex > 0 ? opts.fromIndex : 0;

	if (prevIndex > input.length) {
		return input;
	}

	while (true) { // eslint-disable-line no-constant-condition
		const index = input.indexOf(needle, prevIndex);

		if (index === -1) {
			break;
		}

		matchCount++;

		const replaceStr = typeof replacement === 'string' ? replacement : replacement(needle, matchCount, input);

		// Get the initial part of the string on the first iteration
		const beginSlice = matchCount === 1 ? 0 : prevIndex;

		ret += input.slice(beginSlice, index) + replaceStr;

		prevIndex = index + needle.length;
	}

	if (matchCount === 0) {
		return input;
	}

	return ret + input.slice(prevIndex);
};

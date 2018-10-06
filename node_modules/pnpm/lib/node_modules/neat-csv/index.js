'use strict';
const intoStream = require('into-stream');
const csvParser = require('csv-parser');
const getStream = require('get-stream');

module.exports = (input, opts) => {
	if (typeof input === 'string' || Buffer.isBuffer(input)) {
		input = intoStream(input);
	}

	return getStream.array(input.pipe(csvParser(opts)));
};

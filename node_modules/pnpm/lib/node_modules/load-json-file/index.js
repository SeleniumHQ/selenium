'use strict';
const path = require('path');
const fs = require('graceful-fs');
const stripBom = require('strip-bom');
const parseJson = require('parse-json');
const pify = require('pify');

const parse = (data, filePath, options = {}) => {
	data = stripBom(data);

	if (typeof options.beforeParse === 'function') {
		data = options.beforeParse(data);
	}

	return parseJson(data, options.reviver, path.relative(process.cwd(), filePath));
};

const loadJsonFile = (filePath, options) => pify(fs.readFile)(filePath, 'utf8').then(data => parse(data, filePath, options));

module.exports = loadJsonFile;
module.exports.default = loadJsonFile;
module.exports.sync = (filePath, options) => parse(fs.readFileSync(filePath, 'utf8'), filePath, options);

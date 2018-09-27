'use strict';
const path = require('path');
const fs = require('graceful-fs');
const writeFileAtomic = require('write-file-atomic');
const sortKeys = require('sort-keys');
const makeDir = require('make-dir');
const pify = require('pify');
const detectIndent = require('detect-indent');

const init = (fn, filePath, data, options) => {
	if (!filePath) {
		throw new TypeError('Expected a filepath');
	}

	if (data === undefined) {
		throw new TypeError('Expected data to stringify');
	}

	options = Object.assign({
		indent: '\t',
		sortKeys: false
	}, options);

	if (options.sortKeys) {
		data = sortKeys(data, {
			deep: true,
			compare: typeof options.sortKeys === 'function' ? options.sortKeys : undefined
		});
	}

	return fn(filePath, data, options);
};

const readFile = filePath => pify(fs.readFile)(filePath, 'utf8').catch(() => {});

const main = (filePath, data, options) => {
	return (options.detectIndent ? readFile(filePath) : Promise.resolve())
		.then(string => {
			const indent = string ? detectIndent(string).indent : options.indent;
			const json = JSON.stringify(data, options.replacer, indent);

			return pify(writeFileAtomic)(filePath, `${json}\n`, {mode: options.mode});
		});
};

const mainSync = (filePath, data, options) => {
	let {indent} = options;

	if (options.detectIndent) {
		try {
			const file = fs.readFileSync(filePath, 'utf8');
			// eslint-disable-next-line prefer-destructuring
			indent = detectIndent(file).indent;
		} catch (error) {
			if (error.code !== 'ENOENT') {
				throw error;
			}
		}
	}

	const json = JSON.stringify(data, options.replacer, indent);

	return writeFileAtomic.sync(filePath, `${json}\n`, {mode: options.mode});
};

const writeJsonFile = (filePath, data, options) => {
	return makeDir(path.dirname(filePath), {fs})
		.then(() => init(main, filePath, data, options));
};

module.exports = writeJsonFile;
module.exports.default = writeJsonFile;
module.exports.sync = (filePath, data, options) => {
	makeDir.sync(path.dirname(filePath), {fs});
	init(mainSync, filePath, data, options);
};

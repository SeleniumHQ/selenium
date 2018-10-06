'use strict';
const got = require('got');
const isPlainObj = require('is-plain-obj');

function ghGot(path, opts) {
	if (typeof path !== 'string') {
		return Promise.reject(new TypeError(`Expected 'path' to be a string, got ${typeof path}`));
	}

	const env = process.env;

	opts = Object.assign({
		json: true,
		token: env.GITHUB_TOKEN,
		endpoint: env.GITHUB_ENDPOINT ? env.GITHUB_ENDPOINT.replace(/[^/]$/, '$&/') : 'https://api.github.com/'
	}, opts);

	opts.headers = Object.assign({
		'accept': 'application/vnd.github.v3+json',
		'user-agent': 'https://github.com/sindresorhus/gh-got'
	}, opts.headers);

	if (opts.token) {
		opts.headers.authorization = `token ${opts.token}`;
	}

	// https://developer.github.com/v3/#http-verbs
	if (opts.method && opts.method.toLowerCase() === 'put' && !opts.body) {
		opts.headers['content-length'] = 0;
	}

	// TODO: remove this when Got eventually supports it
	// https://github.com/sindresorhus/got/issues/174
	if (isPlainObj(opts.body)) {
		opts.headers['content-type'] = 'application/json';
		opts.body = JSON.stringify(opts.body);
	}

	const url = /^https?/.test(path) ? path : opts.endpoint + path;

	if (opts.stream) {
		return got.stream(url, opts);
	}

	return got(url, opts);
}

const helpers = [
	'get',
	'post',
	'put',
	'patch',
	'head',
	'delete'
];

ghGot.stream = (url, opts) => ghGot(url, Object.assign({}, opts, {
	json: false,
	stream: true
}));

for (const x of helpers) {
	const method = x.toUpperCase();
	ghGot[x] = (url, opts) => ghGot(url, Object.assign({}, opts, {method}));
	ghGot.stream[x] = (url, opts) => ghGot.stream(url, Object.assign({}, opts, {method}));
}

module.exports = ghGot;

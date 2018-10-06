'use strict';
const childProcess = require('child_process');
const pify = require('pify');
const neatCsv = require('neat-csv');
const sec = require('sec');

module.exports = opts => {
	if (process.platform !== 'win32') {
		return Promise.reject(new Error('Windows only'));
	}

	opts = opts || {};

	const args = ['/nh', '/fo', 'csv'];

	if (opts.verbose) {
		args.push('/v');
	}

	if (opts.system && opts.username && opts.password) {
		args.push(
			'/s', opts.system,
			'/u', opts.username,
			'/p', opts.password
		);
	}

	if (Array.isArray(opts.filter)) {
		for (const filter of opts.filter) {
			args.push('/fi', filter);
		}
	}

	const defaultHeaders = [
		'imageName',
		'pid',
		'sessionName',
		'sessionNumber',
		'memUsage'
	];

	const verboseHeaders = defaultHeaders.concat([
		'status',
		'username',
		'cpuTime',
		'windowTitle'
	]);

	const headers = opts.verbose ? verboseHeaders : defaultHeaders;

	return pify(childProcess.execFile)('tasklist', args)
		// `INFO:` means no matching tasks. See #9.
		.then(stdout => stdout.startsWith('INFO:') ? [] : neatCsv(stdout, {headers}))
		.then(data => data.map(task => {
			// Normalize task props
			task.pid = Number(task.pid);
			task.sessionNumber = Number(task.sessionNumber);
			task.memUsage = Number(task.memUsage.replace(/[^\d]/g, '')) * 1024;

			if (opts.verbose) {
				task.cpuTime = sec(task.cpuTime);
			}

			return task;
		}));
};

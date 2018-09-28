'use strict';
const psList = require('ps-list');

const fn = (proc, x) => {
	if (typeof proc === 'string') {
		return x.name === proc;
	}

	return x.pid === proc;
};

module.exports = proc => psList().then(list => list.some(x => fn(proc, x)));
module.exports.all = procs => psList().then(list => new Map(procs.map(x => [x, list.some(y => fn(x, y))])));
module.exports.filterExists = procs => psList().then(list => procs.filter(x => list.some(y => fn(x, y))));

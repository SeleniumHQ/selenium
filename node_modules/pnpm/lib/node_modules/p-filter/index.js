'use strict';
const pMap = require('p-map');

module.exports = (iterable, filterer, opts) =>
	pMap(iterable, (el, i, arr) => Promise.all([filterer(el, i, arr), el]), opts)
		.then(values => values.filter(x => Boolean(x[0])).map(x => x[1]));

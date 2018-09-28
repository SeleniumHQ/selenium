'use strict';
const pMap = require('p-map');

module.exports = (iterable, opts) => pMap(iterable, el => el(), opts);

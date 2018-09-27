'use strict';
module.exports = x => x.replace(/^[\r\n]+/, '').replace(/[\r\n]+$/, '');
module.exports.start = x => x.replace(/^[\r\n]+/, '');
module.exports.end = x => x.replace(/[\r\n]+$/, '');

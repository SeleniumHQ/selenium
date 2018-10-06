'use strict';

var BN = require('asn1.js').bignum;

module.exports = function base64ToBigNum (val) {
	val = new Buffer(val, 'base64');
	val = new BN(val, 10, 'be').iabs();
	return val;
};

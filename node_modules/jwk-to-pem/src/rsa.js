'use strict';

var asn1 = require('asn1.js');

var b64ToBn = require('./b64-to-bn');

var Version = asn1.define('Version', function () {
	this.int();
});

var RSAPrivateKey = asn1.define('RSAPrivateKey', function () {
	this.seq().obj(
		this.key('version').use(Version),
		this.key('modulus').int(),
		this.key('publicExponent').int(),
		this.key('privateExponent').int(),
		this.key('prime1').int(),
		this.key('prime2').int(),
		this.key('exponent1').int(),
		this.key('exponent2').int(),
		this.key('coefficient').int()
	);
});

var RSAPublicKey = asn1.define('RSAPublicKey', function () {
	this.seq().obj(
		this.key('modulus').int(),
		this.key('publicExponent').int()
	);
});

function rsaJwkToBuffer (jwk, opts) {
	if ('string' !== typeof jwk.e) {
		throw new TypeError('Expected "jwk.e" to be a String');
	}

	if ('string' !== typeof jwk.n) {
		throw new TypeError('Expected "jwk.n" to be a String');
	}

	if (opts.private) {
		if ('string' !== typeof jwk.d) {
			throw new TypeError('Expected "jwk.d" to be a String');
		}

		if ('string' !== typeof jwk.p) {
			throw new TypeError('Expected "jwk.p" to be a String');
		}

		if ('string' !== typeof jwk.q) {
			throw new TypeError('Expected "jwk.q" to be a String');
		}

		if ('string' !== typeof jwk.dp) {
			throw new TypeError('Expected "jwk.dp" to be a String');
		}

		if ('string' !== typeof jwk.dq) {
			throw new TypeError('Expected "jwk.dq" to be a String');
		}

		if ('string' !== typeof jwk.qi) {
			throw new TypeError('Expected "jwk.qi" to be a String');
		}
	}

	var pem;
	if (opts.private) {
		pem = RSAPrivateKey.encode({
			version: 0,
			modulus: b64ToBn(jwk.n),
			publicExponent: b64ToBn(jwk.e),
			privateExponent: b64ToBn(jwk.d),
			prime1: b64ToBn(jwk.p),
			prime2: b64ToBn(jwk.q),
			exponent1: b64ToBn(jwk.dp),
			exponent2: b64ToBn(jwk.dq),
			coefficient: b64ToBn(jwk.qi)
		}, 'pem', {
			label: 'RSA PRIVATE KEY'
		});
	} else {
		pem = RSAPublicKey.encode({
			modulus: b64ToBn(jwk.n),
			publicExponent: b64ToBn(jwk.e)
		}, 'pem', {
			label: 'RSA PUBLIC KEY'
		});
	}

	// This is in an if incase asn1.js adds a trailing \n
	// istanbul ignore else
	if ('\n' !== pem.slice(-1)) {
		pem += '\n';
	}

	return pem;
}

module.exports = rsaJwkToBuffer;

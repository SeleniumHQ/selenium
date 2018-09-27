'use strict';

var asn1 = require('asn1.js'),
	curves = require('./ec-curves'),
	rfc3280 = require('asn1.js-rfc3280');

var b64ToBn = require('./b64-to-bn');

function ecJwkToBuffer (jwk, opts) {
	if ('string' !== typeof jwk.crv) {
		throw new TypeError('Expected "jwk.crv" to be a String');
	}

	var hasD = 'string' === typeof jwk.d;
	var xyTypes = hasD
		? ['undefined', 'string']
		: ['string'];

	if (-1 === xyTypes.indexOf(typeof jwk.x)) {
		throw new TypeError('Expected "jwk.x" to be a String');
	}

	if (-1 === xyTypes.indexOf(typeof jwk.y)) {
		throw new TypeError('Expected "jwk.y" to be a String');
	}

	if (opts.private && !hasD) {
		throw new TypeError('Expected "jwk.d" to be a String');
	}

	var curve = curves[jwk.crv];
	if (!curve) {
		throw new Error('Unsupported curve "' + jwk.crv + '"');
	}

	var key = {};

	var hasPub = jwk.x && jwk.y;
	if (hasPub) {
		key.pub = {
			x: b64ToBn(jwk.x),
			y: b64ToBn(jwk.y)
		};
	}

	if (opts.private || !hasPub) {
		key.priv = b64ToBn(jwk.d);
	}

	key = curve.keyPair(key);

	var keyValidation = key.validate();
	if (!keyValidation.result) {
		throw new Error('Invalid key for curve: "' + keyValidation.reason + '"');
	}

	var result = keyToPem(jwk.crv, key, opts);

	return result;
}

function keyToPem (crv, key, opts) {
	var oid;
	switch (crv) {
		case 'P-256': {
			oid = [1, 2, 840, 10045, 3, 1, 7];
			break;
		}
		case 'P-384': {
			oid = [1, 3, 132, 0, 34];
			break;
		}
		case 'P-521': {
			oid = [1, 3, 132, 0, 35];
			break;
		}
		default: {
			throw new Error('Unsupported curve "' + crv + '"');
		}
	}

	var compact = false;
	var subjectPublicKey = key.getPublic(compact, 'hex');
	subjectPublicKey = new Buffer(subjectPublicKey, 'hex');
	subjectPublicKey = {
		unused: 0,
		data: subjectPublicKey
	};

	var parameters = ECParameters.encode({
		type: 'namedCurve',
		value: oid
	}, 'der');

	var result;
	if (opts.private) {
		var privateKey = key.getPrivate('hex');
		privateKey = new Buffer(privateKey, 'hex');

		result = ECPrivateKey.encode({
			version: ecPrivkeyVer1,
			privateKey: privateKey,
			parameters: parameters,
			publicKey: subjectPublicKey
		}, 'pem', {
			label: 'EC PRIVATE KEY'
		});
	} else {
		result = rfc3280.SubjectPublicKeyInfo.encode({
			algorithm: {
				algorithm: [1, 2, 840, 10045, 2, 1],
				parameters: parameters
			},
			subjectPublicKey: subjectPublicKey
		}, 'pem', {
			label: 'PUBLIC KEY'
		});
	}

	// This is in an if incase asn1.js adds a trailing \n
	// istanbul ignore else
	if ('\n' !== result.slice(-1)) {
		result += '\n';
	}

	return result;
}

var ECParameters = asn1.define('ECParameters', function () {
	this.choice({
		namedCurve: this.objid()
	});
});

var ecPrivkeyVer1 = 1;

var ECPrivateKey = asn1.define('ECPrivateKey', function () {
	this.seq().obj(
		this.key('version').int(),
		this.key('privateKey').octstr(),
		this.key('parameters').explicit(0).optional().any(),
		this.key('publicKey').explicit(1).optional().bitstr()
	);
});

module.exports = ecJwkToBuffer;

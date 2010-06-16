/*
    http://www.JSON.org/json2.js
    2010-03-20

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
*/
// http://www.JSON.org/json2.js and modified and simplified

var androiddriver_escapable98234 = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
var androiddriver_meta98234 = {	'\b' : '\\b', 	'\t' : '\\t', 	'\n' : '\\n', 	'\f' : '\\f', 	'\r' : '\\r', 	'"' : '\\"', 	'\\' : '\\\\' };

var androiddriver_quote98234 = function() {
	var string=arguments[0];
	androiddriver_escapable98234.lastIndex = 0;
	return androiddriver_escapable98234.test(string) ? '"' + string.replace(androiddriver_escapable98234,
			function(a) {
				var c = androiddriver_meta98234[a];
				return typeof c === 'string' ? c : '\\u' + ('0000' + a
						.charCodeAt(0).toString(16)).slice(-4);
			}) + '"' : '"' + string + '"';
}

var androiddriver_str98234 = function() {
	var key=arguments[0]; 
	var holder=arguments[1];
	var i, // The loop counter.
	k, // The member key.
	v, // The member value.
	length, mind = '', partial, value = holder[key];
	if (value && typeof value === 'object'
			&& typeof value.toJSON === 'function') {
		value = value.toJSON(key);
	}
	switch (typeof value) {
	case 'string':
		return androiddriver_quote98234(value);
	case 'number':
		return isFinite(value) ? String(value) : 'null';
	case 'boolean':
	case 'null':
		return String(value);
	case 'object':
		if (!value) {
			return 'null';
		}
		partial = [];
		if (Object.prototype.toString.apply(value) === '[object Array]') {
			length = value.length;
			for (i = 0; i < length; i += 1) {
				partial[i] = androiddriver_str98234(i, value) || 'null';
			}
			v = partial.length === 0 ? '[]' : '[' + partial.join(',') + ']';
			return v;
		}
		for (k in value) {
			if (Object.hasOwnProperty.call(value, k)) {
				v = androiddriver_str98234(k, value);
				if (v) {
					partial.push(androiddriver_quote98234(k) + (':') + v);
				}
			}
		}
		v = partial.length === 0 ? '{}' : '{' + partial.join(',') + '}';
		return v;
	}
}

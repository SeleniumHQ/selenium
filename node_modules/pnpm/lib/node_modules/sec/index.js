'use strict';
module.exports = function (str) {
	var parts = str.split(':');
	var sec = 0;
	var min = 1;

	while (parts.length > 0) {
		sec += min * parseInt(parts.pop(), 10);
		min *= 60;
	}

	return sec;
};

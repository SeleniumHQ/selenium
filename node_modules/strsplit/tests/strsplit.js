#!/usr/bin/env node

var mod_fs = require('fs');

var strsplit = require('../lib/strsplit');
var buffer = '';

process.stdin.resume();
process.stdin.on('data', function (chunk) {
	var i, line;

	buffer += chunk.toString('utf8');

	i = buffer.indexOf('\n');
	while (i != -1) {
		line = buffer.substr(0, i);
		buffer = buffer.substr(i + 1);
		i = buffer.indexOf('\n');
		processLine(line);
	}
});

function processLine(line)
{
	var parts, rv;

	if (line.length === 0 || line[0] == '#') {
		console.log(line);
		return;
	}

	parts = line.split(';');
	if (parts.length != 3) {
		console.log('line garbled: %s', line);
		return;
	}

	rv = strsplit(parts[2], new RegExp(parts[1]), Math.floor(parts[0]));
	console.log(rv.join(';'));
}

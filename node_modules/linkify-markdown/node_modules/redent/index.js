'use strict';
const stripIndent = require('strip-indent');
const indentString = require('indent-string');

module.exports = (str, count, indent) => indentString(stripIndent(str), count || 0, indent);

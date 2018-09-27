var chars = require("../chars").chars;
var char = require("../util").char;

var yes = char(181);
var no = char(183);

booleanCharset = {};
booleanCharset[yes] = true;
booleanCharset[no] = false;

exports.charset = booleanCharset;

/*
 * Format for Selenium Remote Control Perl client.
 */

load('remoteControl.js');

function formatHeader(testCase) {
	var formatLocal = testCase.formatLocal(this.name);
	var header = options.header;
	this.lastIndent = "";
	formatLocal.header = header;
	return formatLocal.header;
}

function formatFooter(testCase) {
	var formatLocal = testCase.formatLocal(this.name);
	formatLocal.footer = options.footer;
	return formatLocal.footer;
}

string = function(value) {
	value = value.replace(/\"/mg, '\\"');
	value = value.replace(/\n/mg, '\\n');
	value = value.replace(/@/mg, '\\@');
	value = value.replace(/\$/mg, '\\$');
	return '"' + value + '"';
}

function assertTrue(expression) {
	expression.suffix = "_ok";
	return expression.toString() + ";";
}

function assertFalse(expression) {
	return "ok(not " + expression.toString() + ");";
}

var verifyTrue = assertTrue;
var verifyFalse = assertFalse;

function assignToVariable(type, variable, expression) {
	if (type == 'String[]') {
		return "my @" + variable + " = " + expression.toString();
	} else {
		return "my $" + variable + " = " + expression.toString();
	}
}

function waitFor(expression) {
	if (expression.negative) {
		return "sleep 1 while " + expression.invert().toString() + ";";
	} else {
		return "sleep 1 until " + expression.toString() + ";";
	}
}

function assertOrVerifyFailure(line, isAssert) {
	// TODO
	return "assert_raise(Exception) { " + line + "}";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " eq " + this.e2.toString();
}

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " ne " + this.e2.toString();
}

Equals.prototype.assert = function() {
	if (!this.e2.args) {
		return "is(" + this.e1 + ", " + this.e2 + ");";
	} else {
		var expression = this.e2;
		expression.suffix = "_is";
		expression.noGet = true;
		expression.args.push(this.e1);
		return expression.toString() + ";";
	}
}

Equals.prototype.verify = Equals.prototype.assert;

NotEquals.prototype.assert = function() {
	if (!this.e2.args) {
		return "isnt(" + this.e1 + ", " + this.e2 + ");";
	} else {
		var expression = this.e2;
		expression.suffix = "_isnt";
		expression.noGet = true;
		expression.args.push(this.e1);
		return expression.toString() + ";";
	}
}

NotEquals.prototype.verify = NotEquals.prototype.assert;

RegexpMatch.prototype.toString = function() {
	return this.expression + " =~ /" + this.pattern.replace(/\//g, "\\/") + "/";
}

RegexpNotMatch.prototype.toString = function() {
	return notOperator() + "(" + RegexpMatch.prototype.toString.call(this) + ")";
}

EqualsArray.useUniqueVariableForAssertion = false;

EqualsArray.prototype.length = function() {
	return "@" + this.variableName;
}

EqualsArray.prototype.item = function(index) {
	return "$" + this.variableName + "[" + index + "]";
}

function pause(milliseconds) {
	return "sleep(" + (parseInt(milliseconds) / 1000) + ");";
}

function echo(message) {
	return "print(" + xlateArgument(message) + ");"
}

function statement(expression) {
	expression.suffix = "_ok";
	return expression.toString() + ";";
}

function array(value) {
	var str = '(';
	for (var i = 0; i < value.length; i++) {
		str += string(value[i]);
		if (i < value.length - 1) str += ", ";
	}
	str += ')';
	return str;
}

CallSelenium.prototype.toString = function() {
	var result = '';
	if (this.negative) {
		result += '!';
	}
	if (options.receiver) {
		result += options.receiver + '->';
	}
	var command = underscore(this.message);
	if (this.noGet) {
		command = command.replace(/^get_/, '');
	}
	result += command;
	if (this.suffix) {
		result += this.suffix;
	}
	result += '(';
	for (var i = 0; i < this.args.length; i++) {
		result += this.args[i];
		if (i < this.args.length - 1) {
			result += ', ';
		}
	}
	result += ')';
	return result;
}

function formatComment(comment) {
	return comment.comment.replace(/.+/mg, function(str) {
			return "# " + str;
		});
}

this.options = {
	receiver: "$sel",
	header: 
		'use strict;\n' +
		'use warnings;\n' +
		'use Test::WWW::Selenium;\n' +
		'use Time::HiRes qw(sleep);\n' +
		'use Test::More "no_plan";\n' +
		'\n' +
		'my $sel = Test::WWW::Selenium->new( host => "localhost", \n' +
		'                                    port => 4444, \n' +
		'                                    browser => "*firefox", \n' +
		'                                    browser_url => "http://localhost:4444" );\n' +
		'\n',
	footer: "",
	indent: "4"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />' +
	'<description>Header</description>' +
	'<textbox id="options_header" multiline="true" flex="1" rows="4"/>' +
	'<description>Footer</description>' +
	'<textbox id="options_footer" multiline="true" flex="1" rows="4"/>' +
	'<description>Indent</description>' +
	'<menulist id="options_indent"><menupopup>' +
	'<menuitem label="Tab" value="tab"/>' +
	'<menuitem label="1 space" value="1"/>' +
	'<menuitem label="2 spaces" value="2"/>' +
	'<menuitem label="3 spaces" value="3"/>' +
	'<menuitem label="4 spaces" value="4"/>' +
	'<menuitem label="5 spaces" value="5"/>' +
	'<menuitem label="6 spaces" value="6"/>' +
	'<menuitem label="7 spaces" value="7"/>' +
	'<menuitem label="8 spaces" value="8"/>' +
	'</menupopup></menulist>';

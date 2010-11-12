/*
 * Format for Selenium Remote Control Perl client.
 */

var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/remoteControl.js', this);

this.name = "perl-rc";

// method name will not be used in this format
function testMethodName(testName) {
	return testName;
}

var originalFormatCommands = formatCommands;
formatCommands = function(commands) {
	this.tests = 0;
	var lines = originalFormatCommands(commands);
	if (this.tests == 0) {
		lines += addIndent("pass;\n");
	}
	return lines;
}

var formatter = this;

string = function(value) {
	if (value != null) {
		value = value.replace(/\\/g, '\\\\');
		value = value.replace(/\"/g, '\\"');
		value = value.replace(/\r/g, '\\r');
		value = value.replace(/\n/g, '\\n');
		value = value.replace(/@/g, '\\@');
		value = value.replace(/\$/g, '\\$');
		return '"' + value + '"';
	} else {
		return '""';
	}
}

variableName = function(value) {
	return "$" + value;
}

concatString = function(array) {
	return array.join(" . ");
}

function assertTrue(expression) {
	if (formatter.assertOrVerifyFailureOnNext) {
		return expression.toString() + " or die;";
	} else {
		formatter.tests++;
		if (expression.assertable) {
			expression.suffix = "_ok";
			return expression.toString() + ";";
		} else {
			return "ok(" + expression.toString() + ");";
		}
	}
}

function assertFalse(expression) {
	if (formatter.assertOrVerifyFailureOnNext) {
		return expression.toString() + " and die;";
	} else {
		formatter.tests++;
		return "ok(not " + expression.toString() + ");";
	}
}

var verifyTrue = assertTrue;
var verifyFalse = assertFalse;

function joinExpression(expression) {
    return "join(',', " + expression.toString() + ")";
}

function assignToVariable(type, variable, expression) {
	if (type == 'String[]') {
		return "my @" + variable + " = " + expression.toString();
	} else {
		return "my $" + variable + " = " + expression.toString();
	}
}

function waitFor(expression) {
	return "WAIT: {\n" +
		indents(1) + "for (1..60) {\n" +
		indents(2) + "if (eval { " + expression.toString() + " }) { pass; last WAIT }\n" +
		indents(2) + "sleep(1);\n" +
		indents(1) + "}\n" +
		indents(1) + 'fail("timeout");\n' +
		"}";
}

function assertOrVerifyFailure(line, isAssert) {
	return 'dies_ok { ' + line + ' };';
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " eq " + this.e2.toString();
}

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " ne " + this.e2.toString();
}

Equals.prototype.assert = function() {
	if (formatter.assertOrVerifyFailureOnNext) {
		return assertTrue(this);
	} else {
		formatter.tests++;
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
}

Equals.prototype.verify = Equals.prototype.assert;

NotEquals.prototype.assert = function() {
	if (formatter.assertOrVerifyFailureOnNext) {
		return assertTrue(this);
	} else {
		if (!this.e2.args) {
			return "isnt(" + this.e1 + ", " + this.e2 + ");";
		} else {
			formatter.tests++;
			var expression = this.e2;
			expression.suffix = "_isnt";
			expression.noGet = true;
			expression.args.push(this.e1);
			return expression.toString() + ";";
		}
	}
}

NotEquals.prototype.verify = NotEquals.prototype.assert;

RegexpMatch.prototype.toString = function() {
	return this.expression + " =~ /" + this.pattern.replace(/\//g, "\\/") + "/";
}

RegexpNotMatch.prototype.toString = function() {
	return notOperator() + "(" + RegexpMatch.prototype.toString.call(this) + ")";
}

function ifCondition(expression, callback) {
    return "if (" + expression.toString() + ") {\n" + callback() + "}";
}

function pause(milliseconds) {
	return "sleep(" + (parseInt(milliseconds) / 1000) + ");";
}

function echo(message) {
	return "print(" + xlateArgument(message) + ' . "\\n");'
}

function statement(expression) {
	if (!formatter.assertOrVerifyFailureOnNext) {
		formatter.tests++;
		expression.suffix = "_ok";
	}
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

function nonBreakingSpace() {
    return "\"\\x{00A0}\"";
}

CallSelenium.prototype.assertable = true;

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
	rcHost: "localhost",
	rcPort: "4444",
	environment: "*chrome",
	header: 
		'use strict;\n' +
		'use warnings;\n' +
		'use Time::HiRes qw(sleep);\n' +
		'use Test::WWW::Selenium;\n' +
		'use Test::More "no_plan";\n' +
		'use Test::Exception;\n' +
		'\n' +
		'my ${receiver} = Test::WWW::Selenium->new( host => "${rcHost}", \n' +
		'                                    port => ${rcPort}, \n' +
		'                                    browser => "${environment}", \n' +
		'                                    browser_url => "${baseURL}" );\n' +
		'\n',
	footer: "",
	indent: "4",
	initialIndents: '0'
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />' +
	'<description>Selenium RC host</description>' +
	'<textbox id="options_rcHost" />' +
	'<description>Selenium RC port</description>' +
	'<textbox id="options_rcPort" />' +
	'<description>Environment</description>' +
	'<textbox id="options_environment" />' +
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

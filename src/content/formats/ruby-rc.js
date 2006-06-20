/*
 * Format for Selenium Remote Control Ruby client.
 */

load('remoteControl.js');

this.name = "ruby-rc";

function formatHeader(testCase) {
	var className = testCase.name;
	if (!className) {
		className = "NewTest";
	}
	var formatLocal = testCase.formatLocal(this.name);
	methodName = 'test_' + underscore(className.replace(/Test$/, "").replace(/^Test/, "").
									  replace(/^[A-Z]/, function(str) { return str.toLowerCase() }));
	var header = options.header.replace(/\$\{className\}/, className).
		replace(/\$\{methodName\}/, methodName);
	this.lastIndent = "\t\t";
	this.header = header;
	return header;
}

function formatFooter(testCase) {
	this.footer = options.footer;
	return footer;
}

function assertTrue(expression) {
	return "assert " + expression.toString();
}

function assertFalse(expression) {
	return "assert !" + expression.toString();
}

function assignToVariable(type, variable, expression) {
	return variable + " = " + expression.toString();
}

function waitFor(expression) {
	if (expression.negative) {
		return "assert !60.times{ break unless (" + expression.invert().toString() + " rescue true); sleep 1 }"
	} else {
		return "assert !60.times{ break if (" + expression.toString() + " rescue false); sleep 1 }"
	}
}

function assertOrVerifyFailure(line, isAssert) {
	return "assert_raise(Kernel) { " + line + "}";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " == " + this.e2.toString();
}

Equals.prototype.assert = function() {
	return "assert_equal " + this.e1.toString() + ", " + this.e2.toString();
}

Equals.prototype.verify = Equals.prototype.assert;

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " != " + this.e2.toString();
}

NotEquals.prototype.assert = function() {
	return "assert_not_equal " + this.e1.toString() + ", " + this.e2.toString();
}

NotEquals.prototype.verify = NotEquals.prototype.assert;

RegexpMatch.prototype.toString = function() {
	return "/" + this.pattern.replace(/\//g, "\\/") + "/ =~ " + this.expression;
}

RegexpNotMatch.prototype.toString = function() {
	return notOperator() + "(" + RegexpMatch.prototype.toString.call(this) + ")";
}

function pause(milliseconds) {
	return "sleep " + (parseInt(milliseconds) / 1000);
}

function echo(message) {
	return "p " + xlateArgument(message);
}

function statement(expression) {
	expression.noBraces = true;
	return expression.toString();
}

function array(value) {
	var str = '[';
	for (var i = 0; i < value.length; i++) {
		str += string(value[i]);
		if (i < value.length - 1) str += ", ";
	}
	str += ']';
	return str;
}

CallSelenium.prototype.toString = function() {
	var result = '';
	if (this.negative) {
		result += '!';
	}
	if (options.receiver) {
		result += options.receiver + '.';
	}
	result += underscore(this.message);
	if (!this.noBraces && this.args.length > 0) {
		result += '(';
	} else if (this.args.length > 0) {
		result += ' ';
	}
	for (var i = 0; i < this.args.length; i++) {
		result += this.args[i];
		if (i < this.args.length - 1) {
			result += ', ';
		}
	}
	if (!this.noBraces && this.args.length > 0) {
		result += ')';
	}
	return result;
}

function formatComment(comment) {
	return comment.comment.replace(/.+/mg, function(str) {
			return indent() + "# " + str;
		});
}

this.options = {
	receiver: "@selenium",
	header: 
		'require "selenium"\n' +
		'require "test/unit"\n' +
		'\n' +
		'class ${className} < Test::Unit::TestCase\n' +
		'\tdef setup\n' +
		'\t\t@selenium = Selenium::SeleneseInterpreter.new("localhost", 4444, "*firefox", "http://localhost:4444", 10000);\n' +
		'\t\t@selenium.start\n' +
		'\tend\n' +
		'\t\n' +
		'\tdef teardown\n' +
		'\t\t@selenium.stop\n' +
		'\tend\n' +
		'\t\n' +
		'\tdef ${methodName}\n',
	footer:
		"\tend\n" +
		"end\n"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />';


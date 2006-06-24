/*
 * Format for Selenium Remote Control Perl client.
 */

load('remoteControl.js');

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
	return "$" + variable + " = " + expression.toString();
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
	var expression = this.e2;
	expression.suffix = "_is";
	expression.noGet = true;
	expression.args.push(this.e1);
	return expression.toString() + ";";
}

Equals.prototype.verify = Equals.prototype.assert;

NotEquals.prototype.assert = function() {
	var expression = this.e2;
	expression.suffix = "_isnt";
	expression.noGet = true;
	expression.args.push(this.e1);
	return expression.toString() + ";";
}

NotEquals.prototype.verify = NotEquals.prototype.assert;

RegexpMatch.prototype.toString = function() {
	return this.expression + " =~ /" + this.pattern.replace(/\//g, "\\/") + "/";
}

RegexpNotMatch.prototype.toString = function() {
	return notOperator() + "(" + RegexpMatch.prototype.toString.call(this) + ")";
}

function statement(expression) {
	expression.suffix = "_ok";
	return expression.toString() + ";";
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
	receiver: "$sel"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />';


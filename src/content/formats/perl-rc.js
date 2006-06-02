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
	return expression.toString();
}

function assertFalse(expression) {
	return "ok(not " + expression.toString() + ")";
}

function assignToVariable(type, variable, expression) {
	return "$" + variable + " = " + expression.toString();
}

function waitFor(expression) {
	if (expression.negative) {
		return "sleep 1 while " + expression.not().toString() + ";";
	} else {
		return "sleep 1 until " + expression.toString() + ";";
	}
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " eq " + this.e2.toString();
}

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " ne " + this.e2.toString();
}

function assertEquals(expected, expression) {
	expression.suffix = "_is";
	expression.noGet = true;
	expression.args.push(expected);
	return expression.toString();
}

function assertNotEquals(expected, expression) {
	expression.suffix = "_isnt";
	expression.noGet = true;
	expression.args.push(expected);
	return expression.toString();
}

function statement(expression) {
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
	return indent() + "# " + comment.comment;
}

this.options = {
	receiver: "$sel"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />';


/*
 * Format for Selenium Remote Control Ruby client.
 */

load('remoteControl.js');

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
		return "sleep 1 while " + expression.not().toString();
	} else {
		return "sleep 1 until " + expression.toString();
	}
}

function equals(e1, e2) {
	return new Equals(e1, e2);
}

function Equals(e1, e2) {
	this.e1 = e1;
	this.e2 = e2;
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " == " + this.e2.toString();
}

Equals.prototype.not = function() {
	return new NotEquals(this.e1, this.e2);
}

function NotEquals(e1, e2) {
	this.e1 = e1;
	this.e2 = e2;
	this.negative = true;
}

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " != " + this.e2.toString();
}

NotEquals.prototype.not = function() {
	return new Equals(this.e1, this.e2);
}

function assertEquals(e1, e2) {
	return "assert_equal " + e1.toString() + ", " + e2.toString();
}

function assertNotEquals(e1, e2) {
	return "assert_not_equal " + e1.toString() + ", " + e2.toString();
}

function string(value) {
	value = value.replace(/\"/mg, '\\"');
	value = value.replace(/\n/mg, '\\n');
	return '"' + value + '"';
}

function statement(expression) {
	expression.noBraces = true;
	return expression.toString();
}

function CallSelenium(message) {
	this.message = underscore(message);
	this.args = [];
}

CallSelenium.prototype.not = function() {
	var call = new CallSelenium(this.message);
	call.args = this.args;
	call.negative = !this.negative;
	return call;
}

CallSelenium.prototype.toString = function() {
	var result = '';
	if (this.negative) {
		result += '!';
	}
	if (options.receiver) {
		result += options.receiver + '.';
	}
	result += this.message;
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
	return indent() + "# " + comment.comment;
}

this.options = {
	receiver: "@selenium"
};

this.configForm = 
	'<description>Receiver for each command</description>' +
	'<textbox id="options_receiver" />';


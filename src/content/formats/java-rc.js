/*
 * Format for Selenium Remote Control Java client.
 */

load('remoteControl.js');

function assertTrue(expression) {
	return "assertTrue(" + expression.toString() + ")";
}

function assignToVariable(type, variable, expression) {
	return type + " " + variable + " = " + expression.toString();
}

function waitFor(expression) {
	return "while (" + expression.not().toString() + ") { Thread.sleep(1000); }";
}

function equals(e1, e2) {
	return new Equals(e1, e2);
}

function Equals(e1, e2) {
	this.e1 = e1;
	this.e2 = e2;
}

Equals.prototype.toString = function() {
	return this.e1.toString() + ".equals(" + this.e2.toString() + ")";
}

Equals.prototype.not = function() {
	return new NotEquals(this.e1, this.e2);
}

function NotEquals(e1, e2) {
	this.e1 = e1;
	this.e2 = e2;
}

NotEquals.prototype.toString = function() {
	return "!" + this.e1.toString() + ".equals(" + this.e2.toString() + ")";
}

function assertEquals(e1, e2) {
	return "assertEquals(" + e1.toString() + ", " + e2.toString() + ")";
}

function string(value) {
	value = value.replace(/\"/mg, '\\"');
	value = value.replace(/\n/mg, '\\n');
	return '"' + value + '"';
}

function statement(expression) {
	return expression.toString() + ';';
}

function CallSelenium(message) {
	this.message = message;
	this.args = [];
}

CallSelenium.prototype.not = function() {
	var call = new CallSelenium(this.message);
	call.args = this.args;
	call.negate = true;
	return call;
}

CallSelenium.prototype.toString = function() {
	var result = '';
	if (this.negate) {
		result += '!';
	}
	if (options.receiver) {
		result += options.receiver + '.';
	}
	result += this.message;
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
	return indent() + "// " + comment.comment;
}

this.options = {
	receiver: "selenium"
};

this.configForm = 
	'<description>Variable name of Selenium instance</description>' +
	'<textbox id="options_receiver" />';


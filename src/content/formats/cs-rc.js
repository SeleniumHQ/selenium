/*
 * Format for Selenium Remote Control .NET (C#) client.
 */

load('remoteControl.js');

function capitalize(string) {
	return string.replace(/^[a-z]/, function(str) { return str.toUpperCase(); });
}

function assertTrue(expression) {
	return "Assert.IsTrue(" + expression.toString() + ")";
}

function assertFalse(expression) {
	return "Assert.IsFalse(" + expression.toString() + ")";
}

var verifyTrue = assertTrue;
var verifyFalse = assertFalse;

function assignToVariable(type, variable, expression) {
	return capitalize(type) + " " + variable + " = " + expression.toString();
}

function waitFor(expression) {
	return "while (" + expression.invert().toString() + ") { Thread.Sleep(1000); }";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " == " + this.e2.toString();
}

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " != " + this.e2.toString();
}

Equals.prototype.assert = function() {
	return "Assert.AreEqual(" + this.e1.toString() + ", " + this.e2.toString() + ")";
}

Equals.prototype.verify = Equals.prototype.assert;

NotEquals.prototype.assert = function() {
	return "Assert.AreNotEqual(" + this.e1.toString() + ", " + this.e2.toString() + ")";
}

NotEquals.prototype.verify = NotEquals.prototype.assert;

RegexpMatch.prototype.toString = function() {
	return "Regex.IsMatch(" + this.expression + ", " + string(this.pattern) + ")";
}

function statement(expression) {
	return expression.toString() + ';';
}

CallSelenium.prototype.toString = function() {
	var result = '';
	if (this.negative) {
		result += '!';
	}
	if (options.receiver) {
		result += options.receiver + '.';
	}
	result += capitalize(this.message);
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
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />';


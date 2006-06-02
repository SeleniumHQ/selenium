/*
 * Format for Selenium Remote Control Python client.
 */

load('remoteControl.js');

string = function(value) {
	value = value.replace(/\"/mg, '\\"');
	value = value.replace(/\n/mg, '\\n');
	var unicode = false;
	for (var i = 0; i < value.length; i++) {
		if (value.charCodeAt(i) >= 128) {
			unicode = true;
		}
	}
	return (unicode ? 'u' : '') + '"' + value + '"';
}

function assertTrue(expression) {
	return "self.failUnless(" + expression.toString() + ")";
}

function assertFalse(expression) {
	return "self.failIf(" + expression.toString() + ")";
}

function assignToVariable(type, variable, expression) {
	return variable + " = " + expression.toString();
}

function waitFor(expression) {
	return "while " + expression.not().toString() + ": time.sleep(1)";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " == " + this.e2.toString();
}

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " != " + this.e2.toString();
}

function assertEquals(e1, e2) {
	return "self.assertEqual(" + e1.toString() + ", " + e2.toString() + ")";
}

function assertNotEquals(e1, e2) {
	return "self.assertNotEqual(" + e1.toString() + ", " + e2.toString() + ")";
}

function statement(expression) {
	return expression.toString();
}

CallSelenium.prototype.toString = function() {
	var result = '';
	if (this.negative) {
		result += 'not ';
	}
	if (options.receiver) {
		result += options.receiver + '.';
	}
	result += underscore(this.message);
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
	receiver: "sel"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />';


/*
 * Format for Selenium Remote Control Ruby client.
 */

load('remoteControl.js');

this.name = "ruby-rc";

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

Equals.prototype.toString = function() {
	return this.e1.toString() + " == " + this.e2.toString();
}

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " != " + this.e2.toString();
}

function assertEquals(e1, e2) {
	return "assert_equal " + e1.toString() + ", " + e2.toString();
}

function assertNotEquals(e1, e2) {
	return "assert_not_equal " + e1.toString() + ", " + e2.toString();
}

function statement(expression) {
	expression.noBraces = true;
	return expression.toString();
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
	return indent() + "# " + comment.comment;
}

this.options = {
	receiver: "@selenium"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />';


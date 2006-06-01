/*
 * Format for Selenium Remote Control Ruby client.
 */

load('remoteControl.js');

function assertTrue(expression) {
	return "assert " + expression.toString();
}

function assignToVariable(type, variable, expression) {
	return variable + " = " + expression.toString();
}

function waitFor(expression) {
	return "sleep 1 until " + expression.toString();
}

function equals(e1, e2) {
	return e1.toString() + " == " + e2.toString();
}

function assertEquals(e1, e2) {
	return "assert_equal " + e1.toString() + ", " + e2.toString();
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

CallSelenium.prototype.toString = function() {
	var result = '';
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


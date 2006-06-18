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
		return "assert !60.times{|i| break unless (" + expression.not().toString() + " rescue true); sleep 1}"
	} else {
		return "assert !60.times{|i| break if (" + expression.toString() + " rescue false); sleep 1}"
	}
}

function assertOrVerifyFailure(line, isAssert) {
	return "assert_raise(Exception) { " + line + "}";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " == " + this.e2.toString();
}

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " != " + this.e2.toString();
}

SeleniumEquals.prototype.toString = function() {
	// TODO
	return string(this.pattern.toString()) + " == " + this.expression.toString();
}

function assertEquals(e1, e2) {
	return "assert_equal " + e1.toString() + ", " + e2.toString();
}

function verifyEquals(e1, e2) {
	return "assert_equal " + e1.toString() + ", " + e2.toString();
}

function assertNotEquals(e1, e2) {
	return "assert_not_equal " + e1.toString() + ", " + e2.toString();
}

function verifyNotEquals(e1, e2) {
	return "assert_not_equal " + e1.toString() + ", " + e2.toString();
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
	receiver: "@selenium"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />';


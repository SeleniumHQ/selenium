/*
 * Format for Selenium Remote Control Python client.
 */

load('remoteControl.js');

string = function(value) {
	value = value.replace(/\"/g, '\\"');
	value = value.replace(/\n/g, '\\n');
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

var verifyTrue = assertTrue;
var verifyFalse = assertFalse;

function assignToVariable(type, variable, expression) {
	return variable + " = " + expression.toString();
}

function waitFor(expression) {
	return "while " + expression.invert().toString() + ": time.sleep(1)";
}

function assertOrVerifyFailure(line, isAssert) {
	// TODO
	return "assert_raise(Exception) { " + line + "}";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " == " + this.e2.toString();
}

Equals.prototype.assert = function() {
	return "self.assertEqual(" + this.e1.toString() + ", " + this.e2.toString() + ")";
}

Equals.prototype.verify = Equals.prototype.assert;

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " != " + this.e2.toString();
}

NotEquals.prototype.assert = function() {
	return "self.assertNotEqual(" + this.e1.toString() + ", " + this.e2.toString() + ")";
}

NotEquals.prototype.verify = NotEquals.prototype.assert;

RegexpMatch.prototype.toString = function() {
	var str = this.pattern;
	if (str.match(/\"/) || str.match(/\n/)) {
		str = str.replace(/\\/g, "\\\\");
		str = str.replace(/\"/g, '\\"');
		str = str.replace(/\n/g, '\\n');
		return '"' + str + '"';
	} else {
		str = 'r"' + str + '"';
	}
	return "re.search(" + str + ", " + this.expression + ")";
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
	return comment.comment.replace(/.+/mg, function(str) {
			return "# " + str;
		});
}

this.options = {
	receiver: "sel"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />';


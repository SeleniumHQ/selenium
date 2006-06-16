/*
 * Format for Selenium Remote Control Java client.
 */

load('remoteControl.js');

this.name = "java-rc";

function formatHeader(testCase) {
	var className = testCase.name;
	if (!className) {
		className = "NewTest";
	}
	var formatLocal = testCase.formatLocal(this.name);
	if (!formatLocal.packageName) {
		formatLocal.packageName = options.packageName;
	}
	var methodName = "test" + className;
	methodName = methodName.replace(/Test$/, "");
	var header = "";
	if (formatLocal.packageName) {
		header += "package " + formatLocal.packageName + ";\n\n";
	}
	header +=
		"import com.thoughtworks.selenium.*;\n" +
		"\n" +
        "public class " + className + " extends SeleneseTestCase {\n" + 
        "\tpublic void " + methodName + "() throws Exception {\n";
	this.lastIndent = "\t\t";
	this.header = header;
	return header;
}

function formatFooter(testCase) {
	var footer = 
		"\t}\n" +
		"}\n";
	this.footer = footer;
	return footer;
}

function assertTrue(expression) {
	return "assertTrue(" + expression.toString() + ")";
}

function assertFalse(expression) {
	return "assertFalse(" + expression.toString() + ")";
}

function assignToVariable(type, variable, expression) {
	return type + " " + variable + " = " + expression.toString();
}

function waitFor(expression) {
	return "while (" + expression.not().toString() + ") { Thread.sleep(1000); }";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + ".equals(" + this.e2.toString() + ")";
}

NotEquals.prototype.toString = function() {
	return "!" + this.e1.toString() + ".equals(" + this.e2.toString() + ")";
}

function assertEquals(e1, e2) {
	return "assertEquals(" + e1.toString() + ", " + e2.toString() + ")";
}

function assertNotEquals(e1, e2) {
	return "assertNotEquals(" + e1.toString() + ", " + e2.toString() + ")";
}

function pause(milliseconds) {
	return "Thread.sleep(" + parseInt(milliseconds) + ");";
}

function statement(expression) {
	return expression.toString() + ';';
}

function array(value) {
	var str = 'new String[] {';
	for (var i = 0; i < value.length; i++) {
		str += string(value[i]);
		if (i < value.length - 1) str += ", ";
	}
	str += '}';
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
	return comment.comment.replace(/.+/mg, function(str) {
			return indent() + "// " + str;
		});
}

this.options = {
	receiver: "selenium"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />';


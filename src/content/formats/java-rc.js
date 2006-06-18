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
        "public class " + className + " extends " + options.superClass + " {\n" + 
        "\tpublic void " + methodName + "() throws Exception {\n";
	this.lastIndent = "\t\t";
	this.header = header;
	return header;
}

function formatFooter(testCase) {
	var footer = 
		"\t\tcheckForVerificationErrors();\n" +
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
	return "for (int second = 0;; second++) {\n" +
		indent() + "\tif (second >= 60) fail(\"timeout\");\n" +
		indent() + "\ttry { if (" + expression.toString() + ") break; } catch (Exception e) {}\n" +
		indent() + "\tThread.sleep(1000);\n" +
		indent() + "}\n";
	//return "while (" + not(expression).toString() + ") { Thread.sleep(1000); }";
}

function assertOrVerifyFailure(line, isAssert) {
	var message = '"expected failure"';
	var failStatement = isAssert ? "fail(" + message  + ");" : 
		"verificationErrors.append(" + message + ");";
	return "try { " + line + " " + failStatement + " } catch (Throwable e) {}";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + ".equals(" + this.e2.toString() + ")";
}

NotEquals.prototype.toString = function() {
	return "!" + this.e1.toString() + ".equals(" + this.e2.toString() + ")";
}

SeleniumEquals.prototype.toString = function() {
	return "seleniumEquals(" + string(this.pattern) + ", " + this.expression + ")";
}

function assertEquals(e1, e2) {
	return "assertEquals(" + e1.toString() + ", " + e2.toString() + ")";
}

function verifyEquals(e1, e2) {
	return "verifyEquals(" + e1.toString() + ", " + e2.toString() + ")";
}

function assertNotEquals(e1, e2) {
	return "assertNotEquals(" + e1.toString() + ", " + e2.toString() + ")";
}

function verifyNotEquals(e1, e2) {
	return "verifyNotEquals(" + e1.toString() + ", " + e2.toString() + ")";
}

function pause(milliseconds) {
	return "Thread.sleep(" + parseInt(milliseconds) + ");";
}

function echo(message) {
	return "System.out.println(" + xlateArgument(message) + ");";
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
	receiver: "selenium",
	packageName: "",
	superClass: "SeleneseTestCase"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />';


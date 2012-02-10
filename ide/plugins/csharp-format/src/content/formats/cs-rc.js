/*
 * Format for Selenium Remote Control .NET (C#) client.
 */

var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/remoteControl.js', this);

this.name = "cs-rc";

function testMethodName(testName) {
	return "The" + capitalize(testName) + "Test";
}

function assertTrue(expression) {
	return "Assert.IsTrue(" + expression.toString() + ");";
}

function assertFalse(expression) {
	return "Assert.IsFalse(" + expression.toString() + ");";
}

function verify(statement) {
	return "try\n" +
	  "{\n" +
	  indents(1) + statement + "\n" +
	  "}\n" +
	  "catch (AssertionException e)\n" +
	  "{\n" +
	  indents(1) + "verificationErrors.Append(e.Message);\n" +
	  "}";
}

function verifyTrue(expression) {
	return verify(assertTrue(expression));
}

function verifyFalse(expression) {
	return verify(assertFalse(expression));
}

function joinExpression(expression) {
    return "String.Join(\",\", " + expression.toString() + ")";
}

function assignToVariable(type, variable, expression) {
	return capitalize(type) + " " + variable + " = " + expression.toString();
}

function waitFor(expression) {
	return "for (int second = 0;; second++) {\n" +
	  indents(1) + 'if (second >= 60) Assert.Fail("timeout");\n' +
	  indents(1) + "try\n" +
	  indents(1) + "{\n" +
	  (expression.setup ? indents(2) + expression.setup() + "\n" : "") +
	  indents(2) + "if (" + expression.toString() + ") break;\n" +
	  indents(1) + "}\n" +
	  indents(1) + "catch (Exception)\n" +
	  indents(1) + "{}\n" +
	  indents(1) + "Thread.Sleep(1000);\n" +
	  "}";
}

function assertOrVerifyFailure(line, isAssert) {
	var message = '"expected failure"';
	var failStatement = isAssert ? "Assert.Fail(" + message + ");" : 
		"verificationErrors.Append(" + message + ");";
	return "try\n" +
	  "{\n" +
		line + "\n" +
		failStatement + "\n" +
	  "}\n" +
	  "catch (Exception) {}\n";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " == " + this.e2.toString();
};

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " != " + this.e2.toString();
};

Equals.prototype.assert = function() {
	return "Assert.AreEqual(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

Equals.prototype.verify = function() {
	return verify(this.assert());
};

NotEquals.prototype.assert = function() {
	return "Assert.AreNotEqual(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

NotEquals.prototype.verify = function() {
	return verify(this.assert());
};

RegexpMatch.prototype.toString = function() {
	return "Regex.IsMatch(" + this.expression + ", " + string(this.pattern) + ")";
};

function pause(milliseconds) {
	return "Thread.Sleep(" + parseInt(milliseconds, 10) + ");";
}

function echo(message) {
	return "Console.WriteLine(" + xlateArgument(message) + ");";
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

function nonBreakingSpace() {
    return "\"\\u00a0\"";
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
};

function formatComment(comment) {
	return comment.comment.replace(/.+/mg, function(str) {
			return "// " + str;
		});
}

function defaultExtension() {
  return this.options.defaultExtension;
}

this.options = {
    receiver: "selenium",
	rcHost: "localhost",
	rcPort: "4444",
	environment: "*chrome",
	namespace: "SeleniumTests",
    indent:	'tab',
    initialIndents:	'3',
    header:
    	'using System;\n' +
    	'using System.Text;\n' +
    	'using System.Text.RegularExpressions;\n' +
    	'using System.Threading;\n' +
    	'using NUnit.Framework;\n' +
    	'using Selenium;\n' +
    	'\n' +
    	'namespace ${namespace}\n' +
    	'{\n' +
    	indents(1) + '[TestFixture]\n' +
    	indents(1) + 'public class ${className}\n' +
    	indents(1) + '{\n' +
    	indents(2) + 'private ISelenium selenium;\n' +
    	indents(2) + 'private StringBuilder verificationErrors;\n' +
    	indents(2) + '\n' +
    	indents(2) + '[SetUp]\n' +
    	indents(2) + 'public void SetupTest()\n' +
    	indents(2) + '{\n' +
    	indents(3) + '${receiver} = new DefaultSelenium("${rcHost}", ${rcPort}, "${environment}", "${baseURL}");\n' +
    	indents(3) + '${receiver}.Start();\n' +
    	indents(3) + 'verificationErrors = new StringBuilder();\n' +
    	indents(2) + '}\n' +
    	indents(2) + '\n' +
    	indents(2) + '[TearDown]\n' +
    	indents(2) + 'public void TeardownTest()\n' +
    	indents(2) + '{\n' +
    	indents(3) + 'try\n' +
    	indents(3) + '{\n' +
    	indents(4) + '${receiver}.Stop();\n' +
    	indents(3) + '}\n' +
    	indents(3) + 'catch (Exception)\n' +
    	indents(3) + '{\n' +
    	indents(4) + '// Ignore errors if unable to close the browser\n' +
    	indents(3) + '}\n' +
    	indents(3) + 'Assert.AreEqual("", verificationErrors.ToString());\n' +
    	indents(2) + '}\n' +
    	indents(2) + '\n' +
    	indents(2) + '[Test]\n' +
    	indents(2) + 'public void ${methodName}()\n' +
    	indents(2) + '{\n',
    footer:
    	indents(2) + '}\n' +
    	indents(1) + '}\n' +
    	'}\n',
    configForm:
    	'<description>Variable for Selenium instance</description>' +
    	'<textbox id="options_receiver" />' +
    	'<description>Selenium RC host</description>' +
    	'<textbox id="options_rcHost" />' +
    	'<description>Selenium RC port</description>' +
    	'<textbox id="options_rcPort" />' +
    	'<description>Environment</description>' +
    	'<textbox id="options_environment" />' +
    	'<description>Namespace</description>' +
    	'<textbox id="options_namespace" />',
    defaultExtension: "cs"
};
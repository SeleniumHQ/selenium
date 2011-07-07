/*
 * Formatter for Selenium 2 / WebDriver .NET (C#) client.
 */

var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/webdriver.js', this);

function testClassName(testName) {
  return testName.split(/[^0-9A-Za-z]+/).map(
      function(x) {
        return capitalize(x);
      }).join('');
}

function testMethodName(testName) {
  return "The" + capitalize(testName) + "Test";
}

function nonBreakingSpace() {
  return "\"\\u00a0\"";
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

Equals.prototype.toString = function() {
  return this.e1.toString() + " == " + this.e2.toString();
};

Equals.prototype.assert = function() {
  return "Assert.AreEqual(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

Equals.prototype.verify = function() {
  return verify(this.assert());
};

NotEquals.prototype.toString = function() {
  return this.e1.toString() + " != " + this.e2.toString();
};

NotEquals.prototype.assert = function() {
  return "Assert.AreNotEqual(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

NotEquals.prototype.verify = function() {
  return verify(this.assert());
};

function joinExpression(expression) {
  return "String.Join(\",\", " + expression.toString() + ")";
}

function statement(expression) {
  return expression.toString() + ';';
}

function assignToVariable(type, variable, expression) {
  return capitalize(type) + " " + variable + " = " + expression.toString();
}

function ifCondition(expression, callback) {
  return "if (" + expression.toString() + ")\n{\n" + callback() + "}";
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

RegexpMatch.patternToString = function(pattern) {
  if (pattern != null) {
    //value = value.replace(/^\s+/, '');
    //value = value.replace(/\s+$/, '');
    pattern = pattern.replace(/\\/g, '\\\\');
    pattern = pattern.replace(/\"/g, '\\"');
    pattern = pattern.replace(/\r/g, '\\r');
    pattern = pattern.replace(/\n/g, '(\\n|\\r\\n)');
    return '"' + pattern + '"';
  } else {
    return '""';
  }
};

RegexpMatch.prototype.toString = function() {
  return "Regex.IsMatch(" + this.expression + ", " + RegexpMatch.patternToString(this.pattern) + ")";
};

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

function pause(milliseconds) {
  return "Thread.Sleep(" + parseInt(milliseconds, 10) + ");";
}

function echo(message) {
  return "Console.WriteLine(" + xlateArgument(message) + ");";
}

function formatComment(comment) {
  return comment.comment.replace(/.+/mg, function(str) {
    return "// " + str;
  });
}

this.options = {
  receiver: "driver",
  showSelenese: 'false',
  namespace: "SeleniumTests",
  indent: '4',
  initialIndents:  '3',
  header:
      'using System;\n' +
          'using System.Text;\n' +
          'using System.Text.RegularExpressions;\n' +
          'using System.Threading;\n' +
          'using NUnit.Framework;\n' +
          'using OpenQA.Selenium;\n' +
          'using OpenQA.Selenium.Firefox;\n' +
          '\n' +
          'namespace ${namespace}\n' +
          '{\n' +
          '    [TestFixture]\n' +
          '    public class ${className}\n' +
          '    {\n' +
          '        private IWebDriver driver;\n' +
          '        private StringBuilder verificationErrors;\n' +
          '        private string baseURL;\n' +
          '        \n' +
          '        [SetUp]\n' +
          '        public void SetupTest()\n' +
          '        {\n' +
          '            ${receiver} = new FirefoxDriver();\n' +
          '            baseURL = "${baseURL}";\n' +
          '            verificationErrors = new StringBuilder();\n' +
          '        }\n' +
          '        \n' +
          '        [TearDown]\n' +
          '        public void TeardownTest()\n' +
          '        {\n' +
          '            try\n' +
          '            {\n' +
          '                ${receiver}.Quit();\n' +
          '            }\n' +
          '            catch (Exception)\n' +
          '            {\n' +
          '                // Ignore errors if unable to close the browser\n' +
          '            }\n' +
          '            Assert.AreEqual("", verificationErrors.ToString());\n' +
          '        }\n' +
          '        \n' +
          '        [Test]\n' +
          '        public void ${methodName}()\n' +
          '        {\n',
  footer:
      '        }\n' +
          "        private bool IsElementPresent(By by)\n" +
          "        {\n" +
          "            try\n" +
          "            {\n" +
          "                driver.FindElement(by);\n" +
          "                return true;\n" +
          "            }\n" +
          "            catch (NoSuchElementException)\n" +
          "            {\n" +
          "                return false;\n" +
          "            }\n" +
          "        }\n" +
          '    }\n' +
          '}\n'
};
this.configForm = '<description>Variable for Selenium instance</description>' +
    '<textbox id="options_receiver" />' +
    '<description>Namespace</description>' +
    '<textbox id="options_namespace" />' +
    '<checkbox id="options_showSelenese" label="Show Selenese"/>';

this.name = "C# (WebDriver)";
this.testcaseExtension = ".cs";
this.suiteExtension = ".cs";
this.webdriver = true;

WDAPI.Driver = function() {
  this.ref = options.receiver;
};

WDAPI.Driver.searchContext = function(locatorType, locator) {
  var locatorString = xlateArgument(locator);
  switch (locatorType) {
    case 'xpath':
      return 'By.XPath(' + locatorString + ')';
    case 'css':
      return 'By.CssSelector(' + locatorString + ')';
    case 'id':
      return 'By.Id(' + locatorString + ')';
    case 'link':
      return 'By.LinkText(' + locatorString + ')';
    case 'name':
      return 'By.Name(' + locatorString + ')';
    case 'tag_name':
      return 'By.TagName(' + locatorString + ')';
  }
  throw 'Error: unknown strategy [' + locatorType + '] for locator [' + locator + ']';
};

WDAPI.Driver.prototype.back = function() {
  return this.ref + ".Navigate().Back()";
};

WDAPI.Driver.prototype.close = function() {
  return this.ref + ".Close()";
};

WDAPI.Driver.prototype.findElement = function(locatorType, locator) {
  return new WDAPI.Element(this.ref + ".FindElement(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.findElements = function(locatorType, locator) {
  return new WDAPI.ElementList(this.ref + ".FindElements(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.getCurrentUrl = function() {
  return this.ref + ".Url";
};

WDAPI.Driver.prototype.get = function(url) {
  return this.ref + ".Navigate().GoToUrl(" + url + ")";
};

WDAPI.Driver.prototype.getTitle = function() {
  return this.ref + ".Title";
};

WDAPI.Driver.prototype.refresh = function() {
  return this.ref + ".Navigate().Refresh()";
};

WDAPI.Element = function(ref) {
  this.ref = ref;
};

WDAPI.Element.prototype.clear = function() {
  return this.ref + ".Clear()";
};

WDAPI.Element.prototype.click = function() {
  return this.ref + ".Click()";
};

WDAPI.Element.prototype.getAttribute = function(attributeName) {
  return this.ref + ".GetAttribute(" + xlateArgument(attributeName) + ")";
};

WDAPI.Element.prototype.getText = function() {
  return this.ref + ".Text";
};

WDAPI.Element.prototype.isDisplayed = function() {
  return this.ref + ".Displayed";
};

WDAPI.Element.prototype.isSelected = function() {
  return this.ref + ".Selected";
};

WDAPI.Element.prototype.sendKeys = function(text) {
  return this.ref + ".SendKeys(" + xlateArgument(text) + ")";
};

WDAPI.Element.prototype.submit = function() {
  return this.ref + ".Submit()";
};

WDAPI.ElementList = function(ref) {
  this.ref = ref;
};

WDAPI.ElementList.prototype.getItem = function(index) {
  return this.ref + "[" + index + "]";
};

WDAPI.ElementList.prototype.getSize = function() {
  return this.ref + ".Count";
};

WDAPI.ElementList.prototype.isEmpty = function() {
  return this.ref + ".Count == 0";
};

WDAPI.Utils = function() {
};

WDAPI.Utils.isElementPresent = function(how, what) {
  return "IsElementPresent(" + WDAPI.Driver.searchContext(how, what) + ")";
};

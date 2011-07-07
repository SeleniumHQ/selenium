/*
 * Formatter for Selenium 2 / WebDriver Java client.
 */

var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/webdriver.js', this);

function useSeparateEqualsForArray() {
  return true;
}

function testClassName(testName) {
  return testName.split(/[^0-9A-Za-z]+/).map(
      function(x) {
        return capitalize(x);
      }).join('');
}

function testMethodName(testName) {
  return "test" + testClassName(testName);
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
  if (this.e1.toString().match(/^\d+$/)) {
    // int
    return this.e1.toString() + " == " + this.e2.toString();
  } else {
    // string
    return this.e1.toString() + ".equals(" + this.e2.toString() + ")";
  }
};

Equals.prototype.assert = function() {
  return "assertEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

Equals.prototype.verify = function() {
  return verify(this.assert());
};

NotEquals.prototype.toString = function() {
  return "!" + this.e1.toString() + ".equals(" + this.e2.toString() + ")";
};

NotEquals.prototype.assert = function() {
  return "assertThat(" + this.e1.toString() + ", is(not(" + this.e2.toString() + ")));";
};

NotEquals.prototype.verify = function() {
  return verify(this.assert());
};

function joinExpression(expression) {
  return "join(" + expression.toString() + ", ',')";
}

function statement(expression) {
  var s = expression.toString();
  if (s.length == 0) {
    return null;
  }
  return s + ';';
}

function assignToVariable(type, variable, expression) {
  return type + " " + variable + " = " + expression.toString();
}

function ifCondition(expression, callback) {
  return "if (" + expression.toString() + ") {\n" + callback() + "}";
}

function assertTrue(expression) {
  return "assertTrue(" + expression.toString() + ");";
}

function assertFalse(expression) {
  return "assertFalse(" + expression.toString() + ");";
}

function verify(statement) {
  return "try {\n" +
      indents(1) + statement + "\n" +
      "} catch (Error e) {\n" +
      indents(1) + "verificationErrors.append(e.toString());\n" +
      "}";
}

function verifyTrue(expression) {
  return verify(assertTrue(expression));
}

function verifyFalse(expression) {
  return verify(assertFalse(expression));
}

RegexpMatch.prototype.toString = function() {
  if (this.pattern.match(/^\^/) && this.pattern.match(/\$$/)) {
    return this.expression + ".matches(" + string(this.pattern) + ")";
  } else {
    return "Pattern.compile(" + string(this.pattern) + ").matcher(" + this.expression + ").find()";
  }
};

function waitFor(expression) {
  return "for (int second = 0;; second++) {\n" +
      "\tif (second >= 60) fail(\"timeout\");\n" +
      "\ttry { " + (expression.setup ? expression.setup() + " " : "") +
      "if (" + expression.toString() + ") break; } catch (Exception e) {}\n" +
      "\tThread.sleep(1000);\n" +
      "}\n";
}

function assertOrVerifyFailure(line, isAssert) {
  var message = '"expected failure"';
  var failStatement = "fail(" + message + ");";
  return "try { " + line + " " + failStatement + " } catch (Throwable e) {}";
}

function pause(milliseconds) {
  return "Thread.sleep(" + parseInt(milliseconds, 10) + ");";
}

function echo(message) {
  return "System.out.println(" + xlateArgument(message) + ");";
}

function formatComment(comment) {
  return comment.comment.replace(/.+/mg, function(str) {
    return "// " + str;
  });
}

/**
 * Returns a string representing the suite for this formatter language.
 *
 * @param testSuite  the suite to format
 * @param filename   the file the formatted suite will be saved as
 */
function formatSuite(testSuite, filename) {
  var suiteClass = /^(\w+)/.exec(filename)[1];
  suiteClass = suiteClass[0].toUpperCase() + suiteClass.substring(1);

  var formattedSuite = "import junit.framework.Test;\n"
      + "import junit.framework.TestSuite;\n"
      + "\n"
      + "public class " + suiteClass + " {\n"
      + "\n"
      + indents(1) + "public static Test suite() {\n"
      + indents(2) + "TestSuite suite = new TestSuite();\n";

  for (var i = 0; i < testSuite.tests.length; ++i) {
    var testClass = testSuite.tests[i].getTitle();
    formattedSuite += indents(2)
        + "suite.addTestSuite(" + testClass + ".class);\n";
  }

  formattedSuite += indents(2) + "return suite;\n"
      + indents(1) + "}\n"
      + "\n"
      + indents(1) + "public static void main(String[] args) {\n"
      + indents(2) + "junit.textui.TestRunner.run(suite());\n"
      + indents(1) + "}\n"
      + "}\n";

  return formattedSuite;
}

this.options = {
  receiver: "driver",
  environment: "*chrome",
  packageName: "com.example.tests",
  indent:    'tab',
  initialIndents:    '2',
  showSelenese: 'false'
};

options.header =
    "package ${packageName};\n" +
        "\n" +
        "import java.util.regex.Pattern;\n" +
        "import java.util.concurrent.TimeUnit;\n" +
        "import org.junit.*;\n" +
        "import static org.junit.Assert.*;\n" +
        "import static org.hamcrest.CoreMatchers.*;\n" +
        "import org.openqa.selenium.*;\n" +
        "import org.openqa.selenium.firefox.FirefoxDriver;\n" +
        "import org.openqa.selenium.support.ui.Select;\n" +
        "\n" +
        "public class ${className} {\n" +
        "\tprivate WebDriver driver;\n" +
        "\tprivate String baseUrl=\"\";\n" +
        "\tprivate StringBuffer verificationErrors = new StringBuffer();\n" +
        "\t@Before\n" +
        "\tpublic void setUp() throws Exception {\n" +
        "\t\tdriver = new FirefoxDriver();\n" +
        "\t\tdriver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);\n" +
        "\t}\n" +
        "\n" +
        "\t@Test\n" +
        "\tpublic void ${methodName}() throws Exception {\n";

options.footer =
    "\t}\n" +
        "\n" +
        "\t@After\n" +
        "\tpublic void tearDown() throws Exception {\n" +
        "\t\tdriver.quit();\n" +
        "\t\tString verificationErrorString = verificationErrors.toString();\n" +
        "\t\tif (!\"\".equals(verificationErrorString)) {\n" +
        "\t\t\tfail(verificationErrorString);\n" +
        "\t\t}\n" +
        "\t}\n" +
        "\n" +
        "\tprivate boolean isElementPresent(By by) {\n" +
        "\t\ttry {\n" +
        "\t\t\tdriver.findElement(by);\n" +
        "\t\t\treturn true;\n" +
        "\t\t} catch (NoSuchElementException e) {\n" +
        "\t\t\treturn false;\n" +
        "\t\t}\n" +
        "\t}\n" +
        "}\n";

this.configForm =
    '<description>Variable for Selenium instance</description>' +
        '<textbox id="options_receiver" />' +
        '<description>Environment</description>' +
        '<textbox id="options_environment" />' +
        '<description>Package</description>' +
        '<textbox id="options_packageName" />' +
        '<checkbox id="options_showSelenese" label="Show Selenese"/>';

this.name = "JUnit 4 (WebDriver)";
this.testcaseExtension = ".java";
this.suiteExtension = ".java";
this.webdriver = true;

WDAPI.Driver = function() {
  this.ref = options.receiver;
};

WDAPI.Driver.searchContext = function(locatorType, locator) {
  var locatorString = xlateArgument(locator);
  switch (locatorType) {
    case 'xpath':
      return 'By.xpath(' + locatorString + ')';
    case 'css':
      return 'By.cssSelector(' + locatorString + ')';
    case 'id':
      return 'By.id(' + locatorString + ')';
    case 'link':
      return 'By.linkText(' + locatorString + ')';
    case 'name':
      return 'By.name(' + locatorString + ')';
    case 'tag_name':
      return 'By.tagName(' + locatorString + ')';
  }
  throw 'Error: unknown strategy [' + locatorType + '] for locator [' + locator + ']';
};

WDAPI.Driver.prototype.back = function() {
  return this.ref + ".navigate().back()";
};

WDAPI.Driver.prototype.close = function() {
  return this.ref + ".close()";
};

WDAPI.Driver.prototype.findElement = function(locatorType, locator) {
  return new WDAPI.Element(this.ref + ".findElement(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.findElements = function(locatorType, locator) {
  return new WDAPI.ElementList(this.ref + ".findElements(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.getCurrentUrl = function() {
  return this.ref + ".getCurrentUrl()";
};

WDAPI.Driver.prototype.get = function(url) {
  return this.ref + ".get(" + url + ")";
};

WDAPI.Driver.prototype.getTitle = function() {
  return this.ref + ".getTitle()";
};

WDAPI.Driver.prototype.refresh = function() {
  return this.ref + ".navigate().refresh()";
};

WDAPI.Element = function(ref) {
  this.ref = ref;
};

WDAPI.Element.prototype.clear = function() {
  return this.ref + ".clear()";
};

WDAPI.Element.prototype.click = function() {
  return this.ref + ".click()";
};

WDAPI.Element.prototype.getAttribute = function(attributeName) {
  return this.ref + ".getAttribute(" + xlateArgument(attributeName) + ")";
};

WDAPI.Element.prototype.getText = function() {
  return this.ref + ".getText()";
};

WDAPI.Element.prototype.isDisplayed = function() {
  return this.ref + ".isDisplayed()";
};

WDAPI.Element.prototype.isSelected = function() {
  return this.ref + ".isSelected()";
};

WDAPI.Element.prototype.sendKeys = function(text) {
  return this.ref + ".sendKeys(" + xlateArgument(text) + ")";
};

WDAPI.Element.prototype.submit = function() {
  return this.ref + ".submit()";
};

WDAPI.ElementList = function(ref) {
  this.ref = ref;
};

WDAPI.ElementList.prototype.getItem = function(index) {
  return this.ref + "[" + index + "]";
};

WDAPI.ElementList.prototype.getSize = function() {
  return this.ref + ".size()";
};

WDAPI.ElementList.prototype.isEmpty = function() {
  return this.ref + ".isEmpty()";
};

WDAPI.Utils = function() {
};

WDAPI.Utils.isElementPresent = function(how, what) {
  return "isElementPresent(" + WDAPI.Driver.searchContext(how, what) + ")";
};

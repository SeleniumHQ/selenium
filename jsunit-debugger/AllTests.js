load( "jsunit-debugger/JsUtil.js" );
load( "jsunit-debugger/JsUnit.js" );

load("src/main/resources/unittest/fake-browser.js");
load("src/main/resources/unittest/dummy-logging.js");
load("src/main/resources/unittest/jsmock/mock.js");
load("src/main/resources/core/lib/prototype.js");
load("src/main/resources/core/scripts/htmlutils.js");
load("src/main/resources/core/scripts/selenium-api.js");
load("src/main/resources/core/scripts/selenium-browserbot.js");
load("src/main/resources/core/scripts/selenium-browserdetect.js");
load("src/main/resources/core/scripts/selenium-commandhandlers.js");
load("src/main/resources/core/scripts/selenium-executionloop.js");
load("src/main/resources/core/scripts/selenium-logging.js");
load("src/main/resources/core/scripts/selenium-remoterunner.js");
load("src/main/resources/core/scripts/selenium-testrunner.js");
load("src/main/resources/core/scripts/ui-element.js");
load("src/main/resources/core/xpath/xmltoken.js");
load("src/main/resources/core/xpath/util.js");
load("src/main/resources/core/xpath/dom.js");
load("src/main/resources/core/xpath/xpath.js");

load("src/test/resources/AlertHandlingTest.js");
load("src/test/resources/BrowserBotFrameFinderTest.js");
load("src/test/resources/SampleTest.js");

var stringWriter = new StringWriter();
var runner = new EmbeddedTextTestRunner(new XMLResultPrinter(stringWriter));
var collector = new TestCaseCollector(this);
var tests = collector.collectTests();
var result = runner.run(tests);
print(stringWriter.get());
JsUtil.prototype.quit( result );
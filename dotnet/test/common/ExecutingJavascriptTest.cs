using System;
using System.Collections.Generic;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ExecutingJavascriptTest : DriverTestFixture
    {
        [Test]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAString()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return document.title;");

            Assert.That(result, Is.InstanceOf<string>());
            Assert.That(result, Is.EqualTo("XHTML Test Page"));
        }

        [Test]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnALong()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return document.title.length;");

            Assert.That(result, Is.InstanceOf<long>());
            Assert.That((long)result, Is.EqualTo((long)"XHTML Test Page".Length));
        }

        [Test]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return document.getElementById('id1');");

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.InstanceOf<IWebElement>());
        }

        [Test]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnABoolean()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return true;");

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.InstanceOf<bool>());
            Assert.That((bool)result, Is.True);
        }

        [Test]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAStringArray()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            List<object> expectedResult = new List<object>();
            expectedResult.Add("zero");
            expectedResult.Add("one");
            expectedResult.Add("two");
            object result = ExecuteScript("return ['zero', 'one', 'two'];");
            Assert.That(result, Is.InstanceOf<ReadOnlyCollection<object>>());
            ReadOnlyCollection<object> list = (ReadOnlyCollection<object>)result;
            Assert.That(list, Is.EqualTo(expectedResult.AsReadOnly()));
        }

        [Test]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAnArray()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            List<object> expectedResult = new List<object>();
            expectedResult.Add("zero");
            List<object> subList = new List<object>();
            subList.Add(true);
            subList.Add(false);
            expectedResult.Add(subList.AsReadOnly());
            object result = ExecuteScript("return ['zero', [true, false]];");
            Assert.That(result, Is.InstanceOf<ReadOnlyCollection<object>>());
            ReadOnlyCollection<object> list = (ReadOnlyCollection<object>)result;
            Assert.That(result, Is.EqualTo(expectedResult.AsReadOnly()));
        }

        [Test]
        public void ShouldBeAbleToExecuteJavascriptAndReturnABasicObjectLiteral()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;

            object result = ExecuteScript("return {abc: '123', tired: false};");
            Assert.That(result, Is.InstanceOf<Dictionary<string, object>>());
            Dictionary<string, object> map = (Dictionary<string, object>)result;

            Dictionary<string, object> expected = new Dictionary<string, object>();
            expected.Add("abc", "123");
            expected.Add("tired", false);

            Assert.AreEqual(expected.Count, map.Count, "Expected:<" + expected.Count + ">, but was:<" + map.Count + ">");
            foreach (string expectedKey in expected.Keys)
            {
                Assert.That(map, Does.ContainKey(expectedKey));
                Assert.That(map[expectedKey], Is.EqualTo(expected[expectedKey]));
            }
        }

        [Test]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAnObjectLiteral()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;

            Dictionary<string, object> expectedPerson = new Dictionary<string, object>();
            expectedPerson.Add("first", "John");
            expectedPerson.Add("last", "Doe");
            Dictionary<string, object> expectedResult = new Dictionary<string, object>();
            expectedResult.Add("foo", "bar");
            List<object> subList = new List<object>() { "a", "b", "c" };
            expectedResult.Add("baz", subList.AsReadOnly());
            expectedResult.Add("person", expectedPerson);

            object result = ExecuteScript(
                "return {foo:'bar', baz: ['a', 'b', 'c'], " +
                    "person: {first: 'John',last: 'Doe'}};");
            Assert.That(result, Is.InstanceOf<Dictionary<string, object>>());

            Dictionary<string, object> map = (Dictionary<string, object>)result;
            Assert.That(map, Has.Count.EqualTo(3));
            foreach (string expectedKey in expectedResult.Keys)
            {
                Assert.That(map, Does.ContainKey(expectedKey));
            }

            Assert.That(map["foo"], Is.EqualTo("bar"));
            Assert.That((ReadOnlyCollection<object>)map["baz"], Is.EqualTo((ReadOnlyCollection<object>)expectedResult["baz"]));

            Dictionary<string, object> person = (Dictionary<string, object>) map["person"];
            Assert.That(person, Has.Count.EqualTo(2));
            Assert.That(person["first"], Is.EqualTo("John"));
            Assert.That(person["last"], Is.EqualTo("Doe"));
        }

        [Test]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAComplexObject()
        {
            driver.Url = javascriptPage;

            object result = ExecuteScript("return window.location;");

            Assert.That(result, Is.InstanceOf<Dictionary<string, object>>());
            Dictionary<string, object> map = (Dictionary<string, object>)result;
            Assert.AreEqual("http:", map["protocol"]);
            Assert.AreEqual(javascriptPage, map["href"]);
        }

        [Test]
        public void PassingAndReturningALongShouldReturnAWholeNumber()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            long expectedResult = 1L;
            object result = ExecuteScript("return arguments[0];", expectedResult);
            Assert.That(result, Is.InstanceOf<int>().Or.InstanceOf<long>());
            Assert.That(result, Is.EqualTo((long)expectedResult));
        }

        [Test]
        public void PassingAndReturningADoubleShouldReturnADecimal()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            double expectedResult = 1.2;
            object result = ExecuteScript("return arguments[0];", expectedResult);
            Assert.That(result, Is.InstanceOf<float>().Or.InstanceOf<double>());
            Assert.That(result, Is.EqualTo((double)expectedResult));
        }

        [Test]
        public void ShouldThrowAnExceptionWhenTheJavascriptIsBad()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;
            Assert.That(() => ExecuteScript("return squiggle();"), Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, ".NET language bindings do not properly parse JavaScript stack trace")]
        [IgnoreBrowser(Browser.Edge, ".NET language bindings do not properly parse JavaScript stack trace")]
        [IgnoreBrowser(Browser.Firefox, ".NET language bindings do not properly parse JavaScript stack trace")]
        [IgnoreBrowser(Browser.IE, ".NET language bindings do not properly parse JavaScript stack trace")]
        [IgnoreBrowser(Browser.Safari, ".NET language bindings do not properly parse JavaScript stack trace")]
        public void ShouldThrowAnExceptionWithMessageAndStacktraceWhenTheJavascriptIsBad()
        {
            driver.Url = xhtmlTestPage;
            string js = "function functionB() { throw Error('errormessage'); };"
                        + "function functionA() { functionB(); };"
                        + "functionA();";
            Exception ex = Assert.Catch(() => ExecuteScript(js));
            Assert.That(ex, Is.InstanceOf<WebDriverException>());
            Assert.That(ex.Message.Contains("errormessage"), "Exception message does not contain 'errormessage'");
            Assert.That(ex.StackTrace.Contains("functionB"), "Exception message does not contain 'functionB'");
        }

        [Test]
        public void ShouldBeAbleToCallFunctionsDefinedOnThePage()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            ExecuteScript("displayMessage('I like cheese');");
            string text = driver.FindElement(By.Id("result")).Text;

            Assert.AreEqual("I like cheese", text.Trim());
        }

        [Test]
        public void ShouldBeAbleToPassAStringAsAnArgument()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            string text = (string)ExecuteScript("return arguments[0] == 'Hello!' ? 'Hello!' : 'Goodbye!';", "Hello!");
            Assert.AreEqual("Hello!", text);
        }

        [Test]
        public void ShouldBeAbleToPassABooleanAsAnArgument()
        {

            string function = "return arguments[0] == true ? true : false;";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            bool result = (bool)ExecuteScript(function, true);
            Assert.That(result, Is.True);

            result = (bool)ExecuteScript(function, false);
            Assert.That(result, Is.False);
        }

        [Test]
        public void ShouldBeAbleToPassANumberAsAnArgument()
        {
            string functionTemplate = "return arguments[0] == {0} ? {0} : 0;";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            string function = string.Format(functionTemplate, 3);
            long result = (long)ExecuteScript(function, 3);
            Assert.AreEqual(3, result);

            function = string.Format(functionTemplate, -3);
            result = (long)ExecuteScript(function, -3);
            Assert.AreEqual(-3, result);

            function = string.Format(functionTemplate, 2147483647);
            result = (long)ExecuteScript(function, 2147483647);
            Assert.AreEqual(2147483647, result);

            function = string.Format(functionTemplate, -2147483647);
            result = (long)ExecuteScript(function, -2147483647);
            Assert.AreEqual(-2147483647, result);
        }

        [Test]

        public void ShouldBeAbleToPassAWebElementAsArgument()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            IWebElement button = driver.FindElement(By.Id("plainButton"));
            string value = (string)ExecuteScript("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];", button);

            Assert.AreEqual("plainButton", value);
        }

        [Test]
        public void PassingArrayAsOnlyArgumentShouldFlattenArray()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            object[] array = new object[] { "zero", 1, true, 3.14159 };
            long length = (long)ExecuteScript("return arguments[0].length", array);
            Assert.AreEqual(array.Length, length);
        }

        [Test]
        public void ShouldBeAbleToPassAnArrayAsAdditionalArgument()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            object[] array = new object[] { "zero", 1, true, 3.14159, false };
            long length = (long)ExecuteScript("return arguments[1].length", "string", array);
            Assert.AreEqual(array.Length, length);
        }

        [Test]
        public void ShouldBeAbleToPassACollectionAsArgument()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            List<object> collection = new List<object>();
            collection.Add("Cheddar");
            collection.Add("Brie");
            collection.Add(7);
            long length = (long)ExecuteScript("return arguments[0].length", collection);
            Assert.AreEqual(collection.Count, length);
        }


        public void ShouldThrowAnExceptionIfAnArgumentIsNotValid()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            Assert.That(() => ExecuteScript("return arguments[0];", driver), Throws.InstanceOf<ArgumentException>());
        }

        [Test]
        public void ShouldBeAbleToPassInMoreThanOneArgument()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            string result = (string)ExecuteScript("return arguments[0] + arguments[1];", "one", "two");

            Assert.AreEqual("onetwo", result);
        }

        [Test]
        public void ShouldBeAbleToGrabTheBodyOfFrameOnceSwitchedTo()
        {
            driver.Url = richTextPage;

            driver.SwitchTo().Frame("editFrame");
            IWebElement body = (IWebElement)((IJavaScriptExecutor)driver).ExecuteScript("return document.body");

            Assert.AreEqual("", body.Text);
        }

        // This is a duplicate test of ShouldBeAbleToExecuteScriptAndReturnElementsList.
        // It's here and commented only to make comparison with the Java language bindings
        // tests easier.
        //[Test]
        //public void testShouldBeAbleToReturnAnArrayOfWebElements()
        //{
        //    driver.Url = formsPage;

        //    ReadOnlyCollection<IWebElement> items = (ReadOnlyCollection<IWebElement>)((IJavaScriptExecutor)driver)
        //        .ExecuteScript("return document.getElementsByName('snack');");

        //    Assert.That(items.Count, Is.Not.EqualTo(0));
        //}

        [Test]
        public void JavascriptStringHandlingShouldWorkAsExpected()
        {
            driver.Url = javascriptPage;

            string value = (string)ExecuteScript("return '';");
            Assert.AreEqual("", value);

            value = (string)ExecuteScript("return undefined;");
            Assert.That(value, Is.Null);

            value = (string)ExecuteScript("return ' '");
            Assert.AreEqual(" ", value);
        }

        [Test]
        public void ShouldBeAbleToExecuteABigChunkOfJavascriptCode()
        {
            driver.Url = javascriptPage;
            string path = System.IO.Path.Combine(Environment.EnvironmentManager.Instance.CurrentDirectory, ".." + System.IO.Path.DirectorySeparatorChar + "..");
            string[] fileList = System.IO.Directory.GetFiles(path, "jquery-1.2.6.min.js", System.IO.SearchOption.AllDirectories);
            if (fileList.Length > 0)
            {
                string jquery = System.IO.File.ReadAllText(fileList[0]);
                Assert.That(jquery.Length, Is.GreaterThan(50000));
                ExecuteScript(jquery, null);
            }
        }

        [Test]
        public void ShouldBeAbleToExecuteScriptAndReturnElementsList()
        {
            driver.Url = formsPage;
            String scriptToExec = "return document.getElementsByName('snack');";

            object resultObject = ((IJavaScriptExecutor)driver).ExecuteScript(scriptToExec);

            ReadOnlyCollection<IWebElement> resultsList = (ReadOnlyCollection<IWebElement>)resultObject;

            Assert.That(resultsList.Count, Is.GreaterThan(0));
        }

        [Test]
        public void ShouldBeAbleToCreateAPersistentValue()
        {
            driver.Url = formsPage;

            ExecuteScript("document.alerts = []");
            ExecuteScript("document.alerts.push('hello world');");
            string text = (string)ExecuteScript("return document.alerts.shift()");

            Assert.AreEqual("hello world", text);
        }

        [Test]
        public void ShouldBeAbleToHandleAnArrayOfElementsAsAnObjectArray()
        {
            driver.Url = formsPage;

            ReadOnlyCollection<IWebElement> forms = driver.FindElements(By.TagName("form"));
            object[] args = new object[] { forms };

            string name = (string)((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0][0].tagName", args);

            Assert.AreEqual("form", name.ToLower());
        }

        [Test]
        public void ShouldBeAbleToPassADictionaryAsAParameter()
        {
            driver.Url = simpleTestPage;

            List<int> nums = new List<int>() { 1, 2 };
            Dictionary<string, object> args = new Dictionary<string, object>();
            args["bar"] = "test";
            args["foo"] = nums;

            object res = ((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0]['foo'][1]", args);

            Assert.AreEqual(2, (long)res);
        }

        [Test]
        public void ShouldThrowAnExceptionWhenArgumentsWithStaleElementPassed()
        {
            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;
            if (executor == null)
            {
                return;
            }

            driver.Url = simpleTestPage;

            IWebElement el = driver.FindElement(By.Id("oneline"));

            driver.Url = simpleTestPage;

            Dictionary<string, object> args = new Dictionary<string, object>();
            args["key"] = new object[] { "a", new object[] { "zero", 1, true, 3.14159, false, el }, "c" };
            Assert.That(() => executor.ExecuteScript("return undefined;", args), Throws.InstanceOf<StaleElementReferenceException>());
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Browser does not return Date object.")]
        [IgnoreBrowser(Browser.Edge, "Browser does not return Date object.")]
        public void ShouldBeAbleToReturnADateObject()
        {
            driver.Url = simpleTestPage;

            string date = (string)ExecuteScript("return new Date();");
            DateTime.Parse(date);
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Driver returns object that allows getting text.")]
        [IgnoreBrowser(Browser.Edge, "Driver returns object that allows getting text.")]
        [IgnoreBrowser(Browser.Firefox, "Driver does not return the documentElement object.")]
        [IgnoreBrowser(Browser.IE, "Driver does not return the documentElement object.")]
        [IgnoreBrowser(Browser.Safari, "Driver does not return the documentElement object.")]
        public void ShouldReturnDocumentElementIfDocumentIsReturned()
        {
            driver.Url = simpleTestPage;

            object value = ExecuteScript("return document");

            Assert.That(value, Is.InstanceOf<IWebElement>());
            Assert.That(((IWebElement)value).Text, Does.Contain("A single line of text"));
        }

        [Test]
        public void ShouldHandleObjectThatThatHaveToJSONMethod()
        {
            driver.Url = simpleTestPage;

            object value = ExecuteScript("return window.performance.timing");

            Assert.That(value, Is.InstanceOf<Dictionary<string, object>>());
        }

        [Test]
        public void ShouldHandleRecursiveStructures()
        {
            driver.Url = simpleTestPage;

            Assert.That(() => ExecuteScript("var obj1 = {}; var obj2 = {}; obj1['obj2'] = obj2; obj2['obj1'] = obj1; return obj1"), Throws.InstanceOf<WebDriverException>());
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
        [Ignore("Reason for ignore: Failure indicates hang condition, which would break the test suite. Really needs a timeout set.")]
        public void ShouldThrowExceptionIfExecutingOnNoPage()
        {
            bool exceptionCaught = false;
            try
            {
                ((IJavaScriptExecutor)driver).ExecuteScript("return 1;");
            }
            catch (WebDriverException)
            {
                exceptionCaught = true;
            }

            if (!exceptionCaught)
            {
                Assert.Fail("Expected an exception to be caught");
            }
        }

        [Test]
        public void ExecutingLargeJavaScript()
        {
            string script = "// stolen from injectableSelenium.js in WebDriver\nvar browserbot = {\n\n    triggerEvent: function(element, eventType, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {\n        canBubble = (typeof(canBubble) == undefined) ? true: canBubble;\n        if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject) {\n            // IE\n            var evt = this.createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);\n            element.fireEvent('on' + eventType,evt);\n        } else {\n            var evt = document.createEvent('HTMLEvents');\n\n            try {\n                evt.shiftKey = shiftKeyDown;\n       evt.metaKey = metaKeyDown;\n                evt.altKey = altKeyDown;\n             evt.ctrlKey = controlKeyDown;\n            } catch(e) {\n      // Nothing sane to do\n                }\n\n            evt.initEvent(eventType, canBubble, true);\n            return element.dispatchEvent(evt);\n  }\n    },\n\n    getVisibleText: function() {\n        var selection = getSelection();\n        var range = document.createRange();\n        range.selectNodeContents(document.documentElement);\n        selection.addRange(range);\nvar string = selection.toString();\n        selection.removeAllRanges();\n\n    return string;\n    },\n\n    getOuterHTML: function(element) {\n        if(element.outerHTML) {\n            return element.outerHTML;\n        } else if(typeof(XMLSerializer) != undefined) {\n            return new XMLSerializer().serializeToString(element);\n        } else {\n            throw \"can't get outerHTML in this browser\";\n        }\n    }\n\n\n};return browserbot.getOuterHTML.apply(browserbot, arguments);";
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.TagName("body"));
            object x = ExecuteScript(script, element);
        }

        [Test]

        public void ShouldBeAbleToPassMoreThanOneStringAsArguments()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            string text = (string)ExecuteScript("return arguments[0] + arguments[1] + arguments[2] + arguments[3];", "Hello,", " ", "world", "!");

            Assert.AreEqual("Hello, world!", text);
        }

        [Test]
        public void ShouldBeAbleToPassMoreThanOneBooleanAsArguments()
        {

            string function = "return (arguments[0] ? 'True' : 'False') + (arguments[1] ? 'True' : 'False');";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            string text = (string)ExecuteScript(function, true, true);
            Assert.AreEqual("TrueTrue", text);

            text = (string)ExecuteScript(function, false, true);
            Assert.AreEqual("FalseTrue", text);

            text = (string)ExecuteScript(function, true, false);
            Assert.AreEqual("TrueFalse", text);

            text = (string)ExecuteScript(function, false, false);
            Assert.AreEqual("FalseFalse", text);
        }

        [Test]
        public void ShouldBeAbleToPassMoreThanOneNumberAsArguments()
        {
            string function = "return arguments[0]+arguments[1];";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            long result = (long)ExecuteScript(function, 30, 12);
            Assert.AreEqual(42, result);

            result = (long)ExecuteScript(function, -30, -12);
            Assert.AreEqual(-42, result);

            result = (long)ExecuteScript(function, 2147483646, 1);
            Assert.AreEqual(2147483647, result);

            result = (long)ExecuteScript(function, -2147483646, -1);
            Assert.AreEqual(-2147483647, result);

        }

        [Test]
        public void ShouldBeAbleToPassADoubleAsAnArgument()
        {
            string function = "return arguments[0];";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            double result = (double)ExecuteScript(function, (double)4.2);
            Assert.AreEqual(4.2, result);

            result = (double)ExecuteScript(function, (double)-4.2);
            Assert.AreEqual(-4.2, result);

            result = (double)ExecuteScript(function, (float)4.2);
            Assert.AreEqual(4.2, result);

            result = (double)ExecuteScript(function, (float)-4.2);
            Assert.AreEqual(-4.2, result);

            result = (long)ExecuteScript(function, (double)4.0);
            Assert.AreEqual(4, result);

            result = (long)ExecuteScript(function, (double)-4.0);
            Assert.AreEqual(-4, result);
        }

        [Test]
        public void ShouldBeAbleToPassMoreThanOneDoubleAsArguments()
        {
            String function = "return arguments[0]+arguments[1];";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            double result = (double)ExecuteScript(function, 30.1, 12.1);
            Assert.AreEqual(42.2, result);

            result = (double)ExecuteScript(function, -30.1, -12.1);
            Assert.AreEqual(-42.2, result);

            result = (double)ExecuteScript(function, 2147483646.1, 1.0);
            Assert.AreEqual(2147483647.1, result);

            result = (double)ExecuteScript(function, -2147483646.1, -1.0);
            Assert.AreEqual(-2147483647.1, result);

        }

        [Test]
        public void ShouldBeAbleToPassMoreThanOneWebElementAsArguments()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            IWebElement button = driver.FindElement(By.Id("plainButton"));
            IWebElement dynamo = driver.FindElement(By.Id("dynamo"));
            string value = (string)ExecuteScript("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'] + arguments[1].innerHTML;", button, dynamo);

            Assert.AreEqual("plainButtonWhat's for dinner?", value);
        }

        [Test]
        public void ShouldBeAbleToPassInMixedArguments()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            IWebElement dynamo = driver.FindElement(By.Id("dynamo"));
            string result = (string)ExecuteScript("return arguments[0].innerHTML + arguments[1].toString() + arguments[2].toString() + arguments[3] + arguments[4]",
                dynamo,
                42,
                4.2,
                "Hello, World!",
                true);

            Assert.AreEqual("What's for dinner?424.2Hello, World!true", result);

        }

        [Test]
        public void ShouldBeAbleToPassInAndRetrieveDates()
        {
            string function = "displayMessage(arguments[0]);";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, "2014-05-20T20:00:00+08:00");
            IWebElement element = driver.FindElement(By.Id("result"));
            string text = element.Text;
            Assert.AreEqual("2014-05-20T20:00:00+08:00", text);
        }

        private object ExecuteScript(String script, params Object[] args)
        {
            object toReturn = ((IJavaScriptExecutor)driver).ExecuteScript(script, args);
            return toReturn;
        }
    }
}

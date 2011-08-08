using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ExecutingJavascriptTest : DriverTestFixture
    {
        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAString()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return document.title;");

            Assert.IsTrue(result is String);
            Assert.AreEqual("XHTML Test Page", result);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnALong()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return document.title.length;");

            Assert.IsTrue(result is long, result.GetType().Name);
            Assert.AreEqual((long)"XHTML Test Page".Length, (long)result);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return document.getElementById('id1');");

            Assert.IsNotNull(result);
            Assert.IsTrue(result is IWebElement);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnABoolean()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return true;");

            Assert.IsNotNull(result);
            Assert.IsTrue(result is Boolean);
            Assert.IsTrue((Boolean)result);
        }

        [Test]
        [Category("Javascript")]
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
            Assert.IsTrue(result is ReadOnlyCollection<object>, "result was: " + result + " (" + result.GetType().Name + ")");
            ReadOnlyCollection<object> list = (ReadOnlyCollection<object>)result;
            Assert.IsTrue(CompareLists(expectedResult.AsReadOnly(), list));
        }

        [Test]
        [Category("Javascript")]
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
            Assert.IsTrue(result is ReadOnlyCollection<object>, "result was: " + result + " (" + result.GetType().Name + ")");
            ReadOnlyCollection<object> list = (ReadOnlyCollection<object>)result;
            Assert.IsTrue(CompareLists(expectedResult.AsReadOnly(), list));
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToExecuteJavascriptAndReturnABasicObjectLiteral()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;

            object result = ExecuteScript("return {abc: '123', tired: false};");
            Assert.IsTrue(result is Dictionary<string, object>, "result was: " + result.GetType().ToString());
            Dictionary<string, object> map = (Dictionary<string, object>)result;

            Dictionary<string, object> expected = new Dictionary<string, object>();
            expected.Add("abc", "123");
            expected.Add("tired", false);

            Assert.AreEqual(expected.Count, map.Count, "Expected:<" + expected.Count + ">, but was:<" + map.Count + ">");
            foreach (string expectedKey in expected.Keys)
            {
                Assert.IsTrue(map.ContainsKey(expectedKey));
                Assert.AreEqual(expected[expectedKey], map[expectedKey]);
            }
        }

        [Test]
        [Category("Javascript")]
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
            Assert.IsTrue(result is Dictionary<string, object>, "result was: " + result.GetType().ToString());

            Dictionary<string, object> map = (Dictionary<string, object>)result;
            Assert.AreEqual(3, map.Count, "Expected:<" + expectedResult.Count + ">, but was:<" + map.Count + ">");
            foreach (string expectedKey in expectedResult.Keys)
            {
                Assert.IsTrue(map.ContainsKey(expectedKey));
            }

            Assert.AreEqual("bar", map["foo"]);
            Assert.IsTrue(CompareLists((ReadOnlyCollection<object>)expectedResult["baz"], (ReadOnlyCollection<object>)map["baz"]));

            Dictionary<string, object> person = (Dictionary<string, object>) map["person"];
            Assert.AreEqual(2, person.Count);
            Assert.AreEqual("John", person["first"]);
            Assert.AreEqual("Doe", person["last"]);
        }

        [Test]
        [Category("Javascript")]
        public void PassingAndReturningALongShouldReturnAWholeNumber()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            long expectedResult = 1L;
            object result = ExecuteScript("return arguments[0];", expectedResult);
            Assert.IsTrue(result is int || result is long, "Expected result to be an Integer or Long but was a " + result.GetType().Name);
            Assert.AreEqual((long)expectedResult, result);
        }

        [Test]
        [Category("Javascript")]
        public void PassingAndReturningADoubleShouldReturnADecimal()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            double expectedResult = 1.2;
            object result = ExecuteScript("return arguments[0];", expectedResult);
            Assert.IsTrue(result is float || result is double, "Expected result to be a Double or Float but was a " + result.GetType().Name);
            Assert.AreEqual((double)expectedResult, result);
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(InvalidOperationException))]
        public void ShouldThrowAnExceptionWhenTheJavascriptIsBad()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;
            ExecuteScript("return squiggle();");
        }

        [Test]
        [Category("Javascript")]
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
        [Category("Javascript")]
        public void ShouldBeAbleToPassAStringAsAnArgument()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript("displayMessage(arguments[0]);", "Hello!");
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("Hello!", text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassABooleanAsAnArgument()
        {

            string function = "displayMessage(arguments[0] ? 'True' : 'False');";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, true);
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("True", text);

            ExecuteScript(function, false);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("False", text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassANumberAsAnArgument()
        {
            string function = "displayMessage(arguments[0]);";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, 3);
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("3", text);

            ExecuteScript(function, -3);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-3", text);

            ExecuteScript(function, 2147483647);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("2147483647", text);

            ExecuteScript(function, -2147483647);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-2147483647", text);

        }

        [Test]
        [Category("Javascript")]
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
        [Category("Javascript")]
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
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.Remote)]
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
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Remote)]
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


        [ExpectedException(typeof(ArgumentException))]
        public void ShouldThrowAnExceptionIfAnArgumentIsNotValid()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            ExecuteScript("return arguments[0];", driver);
        }

        [Test]
        [Category("Javascript")]
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
        [Category("Javascript")]
        public void ShouldBeAbleToGrabTheBodyOfFrameOnceSwitchedTo()
        {
            driver.Url = richTextPage;

            driver.SwitchTo().Frame("editFrame");
            IWebElement body = (IWebElement)((IJavaScriptExecutor)driver).ExecuteScript("return document.body");

            Assert.AreEqual("", body.Text);
        }

        [Test]
        [Category("Javascript")]
        public void JavascriptStringHandlingShouldWorkAsExpected()
        {
            driver.Url = javascriptPage;

            string value = (string)ExecuteScript("return '';");
            Assert.AreEqual("", value);

            value = (string)ExecuteScript("return undefined;");
            Assert.IsNull(value);

            value = (string)ExecuteScript("return ' '");
            Assert.AreEqual(" ", value);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToExecuteABigChunkOfJavascriptCode()
        {
            driver.Url = javascriptPage;
            string[] fileList = System.IO.Directory.GetFiles("..\\..", "jquery-1.2.6.min.js", System.IO.SearchOption.AllDirectories);
            if (fileList.Length > 0)
            {
                string jquery = System.IO.File.ReadAllText(fileList[0]);
                Assert.IsTrue(jquery.Length > 50000);
                ExecuteScript(jquery, null);
            }
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IPhone)]
        public void ShouldBeAbleToExecuteScriptAndReturnElementsList()
        {
            driver.Url = formsPage;
            String scriptToExec = "return document.getElementsByName('snack');";

            object resultObject = ((IJavaScriptExecutor)driver).ExecuteScript(scriptToExec);

            ReadOnlyCollection<IWebElement> resultsList = (ReadOnlyCollection<IWebElement>)resultObject;

            Assert.Greater(resultsList.Count, 0);
        }

        [Test]
        [NeedsFreshDriver(BeforeTest = true, AfterTest = true)]
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
        [Category("Javascript")]
        public void ShouldBeAbleToCreateAPersistentValue()
        {
            driver.Url = formsPage;

            ExecuteScript("document.alerts = []");
            ExecuteScript("document.alerts.push('hello world');");
            string text = (string)ExecuteScript("return document.alerts.shift()");

            Assert.AreEqual("hello world", text);
        }


        ///////////////////////////////////////////////////////
        // Tests below here are unique to the .NET bindings.
        ///////////////////////////////////////////////////////

        [Test]
        public void ExecutingLargeJavaScript()
        {
            string script = "// stolen from injectableSelenium.js in WebDriver\nvar browserbot = {\n\n    triggerEvent: function(element, eventType, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {\n        canBubble = (typeof(canBubble) == undefined) ? true: canBubble;\n        if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject) {\n            // IE\n            var evt = this.createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);\n            element.fireEvent('on' + eventType,evt);\n        } else {\n            var evt = document.createEvent('HTMLEvents');\n\n            try {\n                evt.shiftKey = shiftKeyDown;\n       evt.metaKey = metaKeyDown;\n                evt.altKey = altKeyDown;\n             evt.ctrlKey = controlKeyDown;\n            } catch(e) {\n      // Nothing sane to do\n                }\n\n            evt.initEvent(eventType, canBubble, true);\n            return element.dispatchEvent(evt);\n  }\n    },\n\n    getVisibleText: function() {\n        var selection = getSelection();\n        var range = document.createRange();\n        range.selectNodeContents(document.documentElement);\n        selection.addRange(range);\nvar string = selection.toString();\n        selection.removeAllRanges();\n\n    return string;\n    },\n\n    getOuterHTML: function(element) {\n        if(element.outerHTML) {\n            return element.outerHTML;\n        } else if(typeof(XMLSerializer) != undefined) {\n            return new XMLSerializer().serializeToString(element);\n        } else {\n            throw \"can't get outerHTML in this browser\";\n        }\n    }\n\n\n};return browserbot.getOuterHTML.apply(browserbot, arguments);";
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.TagName("body"));
            object x = ExecuteScript(script, element);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassMoreThanOneStringAsArguments()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            ExecuteScript("displayMessage(arguments[0] + arguments[1] + arguments[2] + arguments[3]);", "Hello,", " ", "world", "!");

            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("Hello, world!", text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassMoreThanOneBooleanAsArguments()
        {

            string function = "displayMessage((arguments[0] ? 'True' : 'False') + (arguments[1] ? 'True' : 'False'));";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, true, true);
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("TrueTrue", text);

            ExecuteScript(function, false, true);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("FalseTrue", text);

            ExecuteScript(function, true, false);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("TrueFalse", text);

            ExecuteScript(function, false, false);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("FalseFalse", text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassMoreThanOneNumberAsArguments()
        {
            string function = "displayMessage(arguments[0]+arguments[1]);";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, 30, 12);
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("42", text);

            ExecuteScript(function, -30, -12);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-42", text);

            ExecuteScript(function, 2147483646, 1);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("2147483647", text);

            ExecuteScript(function, -2147483646, -1);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-2147483647", text);

        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassADoubleAsAnArgument()
        {
            string function = "displayMessage(arguments[0]);";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, (double)4.2);
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("4.2", text);

            ExecuteScript(function, (double)-4.2);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-4.2", text);

            ExecuteScript(function, (float)4.2);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("4.2", text);

            ExecuteScript(function, (float)-4.2);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-4.2", text);

            ExecuteScript(function, (double)4.0);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("4", text);

            ExecuteScript(function, (double)-4.0);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-4", text);

        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassMoreThanOneDoubleAsArguments()
        {
            String function = "displayMessage(arguments[0]+arguments[1]);";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, 30, 12);
            String text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("42", text);

            ExecuteScript(function, -30, -12);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-42", text);

            ExecuteScript(function, 2147483646, 1);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("2147483647", text);

            ExecuteScript(function, -2147483646, -1);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-2147483647", text);

        }

        [Test]
        [Category("Javascript")]
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
        [Category("Javascript")]
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

        private bool CompareLists(ReadOnlyCollection<object> first, ReadOnlyCollection<object> second)
        {
            if (first.Count != second.Count)
            {
                return false;
            }

            for (int i = 0; i < first.Count; ++i)
            {
                if (first[i] is ReadOnlyCollection<object>)
                {
                    if (!(second[i] is ReadOnlyCollection<object>))
                    {
                        return false;
                    }
                    else
                    {
                        if (!CompareLists((ReadOnlyCollection<object>)first[i], (ReadOnlyCollection<object>)second[i]))
                        {
                            return false;
                        }
                    }
                }
                else
                {
                    if (!first[i].Equals(second[i]))
                    {
                        return false;
                    }
                }
            }
            return true;
        }

        private object ExecuteScript(String script, params Object[] args)
        {
            return ((IJavaScriptExecutor)driver).ExecuteScript(script, args);
        }
    }
}

using System;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ExecutingAsyncJavascriptTest : DriverTestFixture
    {
        private IJavaScriptExecutor executor;
        private TimeSpan originalTimeout = TimeSpan.MinValue;

        [SetUp]
        public void SetUpEnvironment()
        {
            if (driver is IJavaScriptExecutor)
            {
                executor = (IJavaScriptExecutor)driver;
            }

            try
            {
                originalTimeout = driver.Manage().Timeouts().AsynchronousJavaScript;
            }
            catch (NotImplementedException)
            {
                // For driver implementations that do not support getting timeouts,
                // just set a default 30-second timeout.
                originalTimeout = TimeSpan.FromSeconds(30);
            }

            driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(1);
        }

        [TearDown]
        public void TearDownEnvironment()
        {
            driver.Manage().Timeouts().AsynchronousJavaScript = originalTimeout;
        }

        [Test]
        public void ShouldNotTimeoutIfCallbackInvokedImmediately()
        {
            driver.Url = ajaxyPage;
            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1](123);");
            Assert.That(result, Is.InstanceOf<long>());
            Assert.That((long)result, Is.EqualTo(123));
        }

        [Test]
        public void ShouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NeitherNullNorUndefined()
        {
            driver.Url = ajaxyPage;
            Assert.That((long)executor.ExecuteAsyncScript("arguments[arguments.length - 1](123);"), Is.EqualTo(123));
            driver.Url = ajaxyPage;
            Assert.That(executor.ExecuteAsyncScript("arguments[arguments.length - 1]('abc');").ToString(), Is.EqualTo("abc"));
            driver.Url = ajaxyPage;
            Assert.That((bool)executor.ExecuteAsyncScript("arguments[arguments.length - 1](false);"), Is.False);
            driver.Url = ajaxyPage;
            Assert.That((bool)executor.ExecuteAsyncScript("arguments[arguments.length - 1](true);"), Is.True);
        }

        [Test]
        public void ShouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NullAndUndefined()
        {
            driver.Url = ajaxyPage;
            Assert.That(executor.ExecuteAsyncScript("arguments[arguments.length - 1](null);"), Is.Null);
            Assert.That(executor.ExecuteAsyncScript("arguments[arguments.length - 1]();"), Is.Null);
        }

        [Test]
        public void ShouldBeAbleToReturnAnArrayLiteralFromAnAsyncScript()
        {
            driver.Url = ajaxyPage;

            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1]([]);");
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.InstanceOf<ReadOnlyCollection<object>>());
            Assert.That((ReadOnlyCollection<object>)result, Has.Count.EqualTo(0));
        }

        [Test]
        public void ShouldBeAbleToReturnAnArrayObjectFromAnAsyncScript()
        {
            driver.Url = ajaxyPage;

            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1](new Array());");
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.InstanceOf<ReadOnlyCollection<object>>());
            Assert.That((ReadOnlyCollection<object>)result, Has.Count.EqualTo(0));
        }

        [Test]
        public void ShouldBeAbleToReturnArraysOfPrimitivesFromAsyncScripts()
        {
            driver.Url = ajaxyPage;

            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1]([null, 123, 'abc', true, false]);");
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.InstanceOf<ReadOnlyCollection<object>>());
            ReadOnlyCollection<object> resultList = result as ReadOnlyCollection<object>;
            Assert.That(resultList.Count, Is.EqualTo(5));
            Assert.That(resultList[0], Is.Null);
            Assert.That((long)resultList[1], Is.EqualTo(123));
            Assert.That(resultList[2].ToString(), Is.EqualTo("abc"));
            Assert.That((bool)resultList[3], Is.True);
            Assert.That((bool)resultList[4], Is.False);
        }

        [Test]
        public void ShouldBeAbleToReturnWebElementsFromAsyncScripts()
        {
            driver.Url = ajaxyPage;

            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1](document.body);");
            Assert.That(result, Is.InstanceOf<IWebElement>());
            Assert.That(((IWebElement)result).TagName.ToLower(), Is.EqualTo("body"));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "https://bugs.chromium.org/p/chromedriver/issues/detail?id=4525")]
        public void ShouldBeAbleToReturnArraysOfWebElementsFromAsyncScripts()
        {
            driver.Url = ajaxyPage;

            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1]([document.body, document.body]);");
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.InstanceOf<ReadOnlyCollection<IWebElement>>());
            ReadOnlyCollection<IWebElement> resultsList = (ReadOnlyCollection<IWebElement>)result;
            Assert.That(resultsList, Has.Count.EqualTo(2));
            Assert.That(resultsList[0], Is.InstanceOf<IWebElement>());
            Assert.That(resultsList[1], Is.InstanceOf<IWebElement>());
            Assert.That(((IWebElement)resultsList[0]).TagName.ToLower(), Is.EqualTo("body"));
            Assert.That(((IWebElement)resultsList[0]), Is.EqualTo((IWebElement)resultsList[1]));
        }

        [Test]
        public void ShouldTimeoutIfScriptDoesNotInvokeCallback()
        {
            driver.Url = ajaxyPage;
            Assert.That(() => executor.ExecuteAsyncScript("return 1 + 2;"), Throws.InstanceOf<WebDriverTimeoutException>());
        }

        [Test]
        public void ShouldTimeoutIfScriptDoesNotInvokeCallbackWithAZeroTimeout()
        {
            driver.Url = ajaxyPage;
            Assert.That(() => executor.ExecuteAsyncScript("window.setTimeout(function() {}, 0);"), Throws.InstanceOf<WebDriverTimeoutException>());
        }

        [Test]
        public void ShouldNotTimeoutIfScriptCallsbackInsideAZeroTimeout()
        {
            driver.Url = ajaxyPage;
            executor.ExecuteAsyncScript(
                "var callback = arguments[arguments.length - 1];" +
                "window.setTimeout(function() { callback(123); }, 0)");
        }

        [Test]
        public void ShouldTimeoutIfScriptDoesNotInvokeCallbackWithLongTimeout()
        {
            driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromMilliseconds(500);
            driver.Url = ajaxyPage;
            Assert.That(() => executor.ExecuteAsyncScript(
                "var callback = arguments[arguments.length - 1];" +
                "window.setTimeout(callback, 1500);"), Throws.InstanceOf<WebDriverTimeoutException>());
        }

        [Test]
        public void ShouldDetectPageLoadsWhileWaitingOnAnAsyncScriptAndReturnAnError()
        {
            driver.Url = ajaxyPage;
            Assert.That(() => executor.ExecuteAsyncScript("window.location = '" + dynamicPage + "';"), Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        public void ShouldCatchErrorsWhenExecutingInitialScript()
        {
            driver.Url = ajaxyPage;
            Assert.That(() => executor.ExecuteAsyncScript("throw Error('you should catch this!');"), Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        public void ShouldNotTimeoutWithMultipleCallsTheFirstOneBeingSynchronous()
        {
            driver.Url = ajaxyPage;
            driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromMilliseconds(1000);
            Assert.That((bool)executor.ExecuteAsyncScript("arguments[arguments.length - 1](true);"), Is.True);
            Assert.That((bool)executor.ExecuteAsyncScript("var cb = arguments[arguments.length - 1]; window.setTimeout(function(){cb(true);}, 9);"), Is.True);
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, ".NET language bindings do not properly parse JavaScript stack trace")]
        [IgnoreBrowser(Browser.Edge, ".NET language bindings do not properly parse JavaScript stack trace")]
        [IgnoreBrowser(Browser.Firefox, ".NET language bindings do not properly parse JavaScript stack trace")]
        [IgnoreBrowser(Browser.IE, ".NET language bindings do not properly parse JavaScript stack trace")]
        [IgnoreBrowser(Browser.Safari, ".NET language bindings do not properly parse JavaScript stack trace")]
        public void ShouldCatchErrorsWithMessageAndStacktraceWhenExecutingInitialScript()
        {
            driver.Url = ajaxyPage;
            string js = "function functionB() { throw Error('errormessage'); };"
                        + "function functionA() { functionB(); };"
                        + "functionA();";
            Exception ex = Assert.Catch(() => executor.ExecuteAsyncScript(js));
            Assert.That(ex, Is.InstanceOf<WebDriverException>());
            Assert.That(ex.Message.Contains("errormessage"));
            Assert.That(ex.StackTrace.Contains("functionB"));
        }

        [Test]
        public void ShouldBeAbleToExecuteAsynchronousScripts()
        {
            // Reset the timeout to the 30-second default instead of zero.
            driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(30);
            driver.Url = ajaxyPage;

            IWebElement typer = driver.FindElement(By.Name("typer"));
            typer.SendKeys("bob");
            Assert.AreEqual("bob", typer.GetAttribute("value"));

            driver.FindElement(By.Id("red")).Click();
            driver.FindElement(By.Name("submit")).Click();

            Assert.AreEqual(1, GetNumberOfDivElements(), "There should only be 1 DIV at this point, which is used for the butter message");

            driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(10);
            string text = (string)executor.ExecuteAsyncScript(
                "var callback = arguments[arguments.length - 1];"
                + "window.registerListener(arguments[arguments.length - 1]);");
            Assert.AreEqual("bob", text);
            Assert.AreEqual("", typer.GetAttribute("value"));

            Assert.AreEqual(2, GetNumberOfDivElements(), "There should be 1 DIV (for the butter message) + 1 DIV (for the new label)");
        }

        [Test]
        public void ShouldBeAbleToPassMultipleArgumentsToAsyncScripts()
        {
            driver.Url = ajaxyPage;
            long result = (long)executor.ExecuteAsyncScript("arguments[arguments.length - 1](arguments[0] + arguments[1]);", 1, 2);
            Assert.AreEqual(3, result);
        }

        [Test]
        public void ShouldBeAbleToMakeXMLHttpRequestsAndWaitForTheResponse()
        {
            string script =
                "var url = arguments[0];" +
                "var callback = arguments[arguments.length - 1];" +
                // Adapted from http://www.quirksmode.org/js/xmlhttp.html
                "var XMLHttpFactories = [" +
                "  function () {return new XMLHttpRequest()}," +
                "  function () {return new ActiveXObject('Msxml2.XMLHTTP')}," +
                "  function () {return new ActiveXObject('Msxml3.XMLHTTP')}," +
                "  function () {return new ActiveXObject('Microsoft.XMLHTTP')}" +
                "];" +
                "var xhr = false;" +
                "while (!xhr && XMLHttpFactories.length) {" +
                "  try {" +
                "    xhr = XMLHttpFactories.shift().call();" +
                "  } catch (e) {}" +
                "}" +
                "if (!xhr) throw Error('unable to create XHR object');" +
                "xhr.open('GET', url, true);" +
                "xhr.onreadystatechange = function() {" +
                "  if (xhr.readyState == 4) callback(xhr.responseText);" +
                "};" +
                "xhr.send();";

            driver.Url = ajaxyPage;
            driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(3);
            string response = (string)executor.ExecuteAsyncScript(script, sleepingPage + "?time=2");
            Assert.AreEqual("<html><head><title>Done</title></head><body>Slept for 2s</body></html>", response.Trim());
        }

        [Test]
		public void ThrowsIfScriptTriggersAlert()
        {
            driver.Url = simpleTestPage;
            driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(5);
            ((IJavaScriptExecutor)driver).ExecuteAsyncScript(
                "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('Look! An alert!'); }, 50);");
            Assert.That(() => driver.Title, Throws.InstanceOf<UnhandledAlertException>());

            string title = driver.Title;
        }

        [Test]
        public void ThrowsIfAlertHappensDuringScript()
        {
            driver.Url = slowLoadingAlertPage;
            driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(5);
            ((IJavaScriptExecutor)driver).ExecuteAsyncScript("setTimeout(arguments[0], 1000);");
            Assert.That(() => driver.Title, Throws.InstanceOf<UnhandledAlertException>());

            // Shouldn't throw
            string title = driver.Title;
        }

        [Test]
        public void ThrowsIfScriptTriggersAlertWhichTimesOut()
        {
            driver.Url = simpleTestPage;
            driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(5);
            ((IJavaScriptExecutor)driver)
                .ExecuteAsyncScript("setTimeout(function() { window.alert('Look! An alert!'); }, 50);");
            Assert.That(() => driver.Title, Throws.InstanceOf<UnhandledAlertException>());

            // Shouldn't throw
            string title = driver.Title;
        }

        [Test]
        public void ThrowsIfAlertHappensDuringScriptWhichTimesOut()
        {
            driver.Url = slowLoadingAlertPage;
            driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(5);
            ((IJavaScriptExecutor)driver).ExecuteAsyncScript("");
            Assert.That(() => driver.Title, Throws.InstanceOf<UnhandledAlertException>());

            // Shouldn't throw
            string title = driver.Title;
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "Driver chooses not to return text from unhandled alert")]
        public void IncludesAlertTextInUnhandledAlertException()
        {
            driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(5);
            string alertText = "Look! An alert!";
            ((IJavaScriptExecutor)driver).ExecuteAsyncScript(
                "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('" + alertText
                + "'); }, 50);");
            Assert.That(() => driver.Title, Throws.InstanceOf<UnhandledAlertException>().With.Property("AlertText").EqualTo(alertText));
        }

        private long GetNumberOfDivElements()
        {
            IJavaScriptExecutor jsExecutor = driver as IJavaScriptExecutor;
            // Selenium does not support "findElements" yet, so we have to do this through a script.
            return (long)jsExecutor.ExecuteScript("return document.getElementsByTagName('div').length;");
        }
    }
}

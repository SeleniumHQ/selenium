using System;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    [IgnoreBrowser(Browser.Safari)]
    public class ExecutingAsyncJavascriptTest : DriverTestFixture
    {
        private IJavaScriptExecutor executor;

        [SetUp]
        public void SetUpEnvironment()
        {
            if (driver is IJavaScriptExecutor)
            {
                executor = (IJavaScriptExecutor)driver;
            }

            driver.Manage().Timeouts().SetScriptTimeout(TimeSpan.FromMilliseconds(0));
        }

        [Test]
        public void ShouldNotTimeoutIfCallbackInvokedImmediately()
        {
            driver.Url = ajaxyPage;
            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1](123);");
            Assert.IsInstanceOf<long>(result);
            Assert.AreEqual(123, (long)result);
        }

        [Test]
        public void ShouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NeitherNullNorUndefined()
        {
            driver.Url = ajaxyPage;
            Assert.AreEqual(123, (long)executor.ExecuteAsyncScript("arguments[arguments.length - 1](123);"));
            driver.Url = ajaxyPage;
            Assert.AreEqual("abc", executor.ExecuteAsyncScript("arguments[arguments.length - 1]('abc');").ToString());
            driver.Url = ajaxyPage;
            Assert.IsFalse((bool)executor.ExecuteAsyncScript("arguments[arguments.length - 1](false);"));
            driver.Url = ajaxyPage;
            Assert.IsTrue((bool)executor.ExecuteAsyncScript("arguments[arguments.length - 1](true);"));
        }

        [Test]
        public void ShouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NullAndUndefined()
        {
            driver.Url = ajaxyPage;
            Assert.IsNull(executor.ExecuteAsyncScript("arguments[arguments.length - 1](null);"));
            Assert.IsNull(executor.ExecuteAsyncScript("arguments[arguments.length - 1]();"));
        }

        [Test]
        public void ShouldBeAbleToReturnAnArrayLiteralFromAnAsyncScript()
        {
            driver.Url = ajaxyPage;

            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1]([]);");
            Assert.IsNotNull(result);
            Assert.IsInstanceOf<ReadOnlyCollection<object>>(result);
            Assert.AreEqual(0, ((ReadOnlyCollection<object>)result).Count);
        }

        [Test]
        public void ShouldBeAbleToReturnAnArrayObjectFromAnAsyncScript()
        {
            driver.Url = ajaxyPage;

            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1](new Array());");
            Assert.IsNotNull(result);
            Assert.IsInstanceOf<ReadOnlyCollection<object>>(result);
            Assert.AreEqual(0, ((ReadOnlyCollection<object>)result).Count);
        }

        [Test]
        public void ShouldBeAbleToReturnArraysOfPrimitivesFromAsyncScripts()
        {
            driver.Url = ajaxyPage;

            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1]([null, 123, 'abc', true, false]);");
            Assert.IsNotNull(result);
            Assert.IsInstanceOf<ReadOnlyCollection<object>>(result);
            ReadOnlyCollection<object> resultList = result as ReadOnlyCollection<object>;
            Assert.AreEqual(5, resultList.Count);
            Assert.IsNull(resultList[0]);
            Assert.AreEqual(123, (long)resultList[1]);
            Assert.AreEqual("abc", resultList[2].ToString());
            Assert.IsTrue((bool)resultList[3]);
            Assert.IsFalse((bool)resultList[4]);
        }

        [Test]
        public void ShouldBeAbleToReturnWebElementsFromAsyncScripts()
        {
            driver.Url = ajaxyPage;

            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1](document.body);");
            Assert.IsInstanceOf<IWebElement>(result);
            Assert.AreEqual("body", ((IWebElement)result).TagName.ToLower());
        }

        [Test]
        public void ShouldBeAbleToReturnArraysOfWebElementsFromAsyncScripts()
        {
            driver.Url = ajaxyPage;

            object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1]([document.body, document.body]);");
            Assert.IsNotNull(result);
            Assert.IsInstanceOf<ReadOnlyCollection<IWebElement>>(result);
            ReadOnlyCollection<IWebElement> resultsList = (ReadOnlyCollection<IWebElement>)result;
            Assert.AreEqual(2, resultsList.Count);
            Assert.IsInstanceOf<IWebElement>(resultsList[0]);
            Assert.IsInstanceOf<IWebElement>(resultsList[1]);
            Assert.AreEqual("body", ((IWebElement)resultsList[0]).TagName.ToLower());
            Assert.AreEqual(((IWebElement)resultsList[0]), ((IWebElement)resultsList[1]));
        }

        [Test]
        public void ShouldTimeoutIfScriptDoesNotInvokeCallback()
        {
            driver.Url = ajaxyPage;
            Assert.Throws<WebDriverTimeoutException>(() => executor.ExecuteAsyncScript("return 1 + 2;"));
        }

        [Test]
        public void ShouldTimeoutIfScriptDoesNotInvokeCallbackWithAZeroTimeout()
        {
            driver.Url = ajaxyPage;
            Assert.Throws<WebDriverTimeoutException>(() => executor.ExecuteAsyncScript("window.setTimeout(function() {}, 0);"));
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
            driver.Manage().Timeouts().SetScriptTimeout(TimeSpan.FromMilliseconds(500));
            driver.Url = ajaxyPage;
            Assert.Throws<WebDriverTimeoutException>(() => executor.ExecuteAsyncScript(
                "var callback = arguments[arguments.length - 1];" +
                "window.setTimeout(callback, 1500);"));
        }

        [Test]
        public void ShouldDetectPageLoadsWhileWaitingOnAnAsyncScriptAndReturnAnError()
        {
            driver.Url = ajaxyPage;
            driver.Manage().Timeouts().SetScriptTimeout(TimeSpan.FromMilliseconds(100));
            Assert.Throws<InvalidOperationException>(() => executor.ExecuteAsyncScript("window.location = '" + dynamicPage + "';"));
        }

        [Test]
        public void ShouldCatchErrorsWhenExecutingInitialScript()
        {
            driver.Url = ajaxyPage;
            Assert.Throws<InvalidOperationException>(() => executor.ExecuteAsyncScript("throw Error('you should catch this!');"));
        }

        [Test]
        public void ShouldBeAbleToExecuteAsynchronousScripts()
        {
            driver.Url = ajaxyPage;

            IWebElement typer = driver.FindElement(By.Name("typer"));
            typer.SendKeys("bob");
            Assert.AreEqual("bob", typer.GetAttribute("value"));

            driver.FindElement(By.Id("red")).Click();
            driver.FindElement(By.Name("submit")).Click();

            Assert.AreEqual(1, GetNumberOfDivElements(), "There should only be 1 DIV at this point, which is used for the butter message");

            driver.Manage().Timeouts().SetScriptTimeout(TimeSpan.FromSeconds(10));
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
            driver.Manage().Timeouts().SetScriptTimeout(TimeSpan.FromSeconds(3));
            string response = (string)executor.ExecuteAsyncScript(script, sleepingPage + "?time=2");
            Assert.AreEqual("<html><head><title>Done</title></head><body>Slept for 2s</body></html>", response.Trim());
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Chrome, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Edge, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.HtmlUnit, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.IE, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.IPhone, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Opera, "Does not handle async alerts")]
        public void ThrowsIfScriptTriggersAlert()
        {
            driver.Url = simpleTestPage;
            driver.Manage().Timeouts().SetScriptTimeout(TimeSpan.FromSeconds(5));
            try
            {
                ((IJavaScriptExecutor)driver).ExecuteAsyncScript(
                    "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('Look! An alert!'); }, 50);");
                Assert.Fail("Expected UnhandledAlertException");
            }
            catch (UnhandledAlertException)
            {
                // Expected exception
            }
            // Shouldn't throw
            string title = driver.Title;
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Chrome, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Edge, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.HtmlUnit, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.IE, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.IPhone, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Opera, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Safari, "Does not handle async alerts")]
        public void ThrowsIfAlertHappensDuringScript()
        {
            driver.Url = slowLoadingAlertPage;
            driver.Manage().Timeouts().SetScriptTimeout(TimeSpan.FromSeconds(5));
            try
            {
                ((IJavaScriptExecutor)driver).ExecuteAsyncScript("setTimeout(arguments[0], 1000);");
                Assert.Fail("Expected UnhandledAlertException");
            }
            catch (UnhandledAlertException)
            {
                //Expected exception
            }
            // Shouldn't throw
            string title = driver.Title;
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Chrome, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Edge, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.HtmlUnit, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.IE, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.IPhone, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Opera, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Safari, "Does not handle async alerts")]
        public void ThrowsIfScriptTriggersAlertWhichTimesOut()
        {
            driver.Url = simpleTestPage;
            driver.Manage().Timeouts().SetScriptTimeout(TimeSpan.FromSeconds(5));
            try
            {
                ((IJavaScriptExecutor)driver)
                    .ExecuteAsyncScript("setTimeout(function() { window.alert('Look! An alert!'); }, 50);");
                Assert.Fail("Expected UnhandledAlertException");
            }
            catch (UnhandledAlertException)
            {
                // Expected exception
            }
            // Shouldn't throw
            string title = driver.Title;
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Chrome, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Edge, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.HtmlUnit, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.IE, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.IPhone, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Opera, "Does not handle async alerts")]
        public void ThrowsIfAlertHappensDuringScriptWhichTimesOut()
        {
            driver.Url = slowLoadingAlertPage;
            driver.Manage().Timeouts().SetScriptTimeout(TimeSpan.FromSeconds(5));
            try
            {
                ((IJavaScriptExecutor)driver).ExecuteAsyncScript("");
                Assert.Fail("Expected UnhandledAlertException");
            }
            catch (UnhandledAlertException)
            {
                //Expected exception
            }
            // Shouldn't throw
            string title = driver.Title;
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Chrome, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Edge, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.HtmlUnit, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.IE, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.IPhone, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Opera, "Does not handle async alerts")]
        [IgnoreBrowser(Browser.Safari, "Does not handle async alerts")]
        public void IncludesAlertTextInUnhandledAlertException()
        {
            driver.Manage().Timeouts().SetScriptTimeout(TimeSpan.FromSeconds(5));
            string alertText = "Look! An alert!";
            try
            {
                ((IJavaScriptExecutor)driver).ExecuteAsyncScript(
                    "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('" + alertText
                    + "'); }, 50);");
                Assert.Fail("Expected UnhandledAlertException");
            }
            catch (UnhandledAlertException e)
            {
                Assert.AreEqual(alertText, e.AlertText);
            }
        }

        private long GetNumberOfDivElements()
        {
            IJavaScriptExecutor jsExecutor = driver as IJavaScriptExecutor;
            // Selenium does not support "findElements" yet, so we have to do this through a script.
            return (long)jsExecutor.ExecuteScript("return document.getElementsByTagName('div').length;");
        }
    }
}

// <copyright file="ExecutingAsyncJavascriptTests.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class ExecutingAsyncJavascriptTests : DriverTestFixture
{
    private IJavaScriptExecutor executor;
    private TimeSpan originalTimeout = TimeSpan.MinValue;

    [SetUp]
    public void SetUpEnvironment()
    {
        if (Driver is IJavaScriptExecutor)
        {
            executor = (IJavaScriptExecutor)Driver;
        }

        try
        {
            originalTimeout = Driver.Manage().Timeouts().AsynchronousJavaScript;
        }
        catch (NotImplementedException)
        {
            // For driver implementations that do not support getting timeouts,
            // just set a default 30-second timeout.
            originalTimeout = TimeSpan.FromSeconds(30);
        }

        Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(1);
    }

    [TearDown]
    public void TearDownEnvironment()
    {
        Driver.Manage().Timeouts().AsynchronousJavaScript = originalTimeout;
    }

    [Test]
    public void ShouldNotTimeoutIfCallbackInvokedImmediately()
    {
        Driver.Url = Urls.AjaxyPage;
        object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1](123);");
        Assert.That(result, Is.InstanceOf<long>());
        Assert.That((long)result, Is.EqualTo(123));
    }

    [Test]
    public void ShouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NeitherNullNorUndefined()
    {
        Driver.Url = Urls.AjaxyPage;
        Assert.That((long)executor.ExecuteAsyncScript("arguments[arguments.length - 1](123);"), Is.EqualTo(123));
        Driver.Url = Urls.AjaxyPage;
        Assert.That(executor.ExecuteAsyncScript("arguments[arguments.length - 1]('abc');").ToString(), Is.EqualTo("abc"));
        Driver.Url = Urls.AjaxyPage;
        Assert.That((bool)executor.ExecuteAsyncScript("arguments[arguments.length - 1](false);"), Is.False);
        Driver.Url = Urls.AjaxyPage;
        Assert.That((bool)executor.ExecuteAsyncScript("arguments[arguments.length - 1](true);"), Is.True);
    }

    [Test]
    public void ShouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NullAndUndefined()
    {
        Driver.Url = Urls.AjaxyPage;
        Assert.That(executor.ExecuteAsyncScript("arguments[arguments.length - 1](null);"), Is.Null);
        Assert.That(executor.ExecuteAsyncScript("arguments[arguments.length - 1]();"), Is.Null);
    }

    [Test]
    public void ShouldBeAbleToReturnAnArrayLiteralFromAnAsyncScript()
    {
        Driver.Url = Urls.AjaxyPage;

        object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1]([]);");
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.InstanceOf<ReadOnlyCollection<object>>());
        Assert.That((ReadOnlyCollection<object>)result, Has.Count.EqualTo(0));
    }

    [Test]
    public void ShouldBeAbleToReturnAnArrayObjectFromAnAsyncScript()
    {
        Driver.Url = Urls.AjaxyPage;

        object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1](new Array());");
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.InstanceOf<ReadOnlyCollection<object>>());
        Assert.That((ReadOnlyCollection<object>)result, Has.Count.EqualTo(0));
    }

    [Test]
    public void ShouldBeAbleToReturnArraysOfPrimitivesFromAsyncScripts()
    {
        Driver.Url = Urls.AjaxyPage;

        object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1]([null, 123, 'abc', true, false]);");
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.InstanceOf<ReadOnlyCollection<object>>());
        ReadOnlyCollection<object> resultList = result as ReadOnlyCollection<object>;
        Assert.That(resultList, Has.Count.EqualTo(5));
        Assert.That(resultList[0], Is.Null);
        Assert.That((long)resultList[1], Is.EqualTo(123));
        Assert.That(resultList[2].ToString(), Is.EqualTo("abc"));
        Assert.That((bool)resultList[3], Is.True);
        Assert.That((bool)resultList[4], Is.False);
    }

    [Test]
    public void ShouldBeAbleToReturnWebElementsFromAsyncScripts()
    {
        Driver.Url = Urls.AjaxyPage;

        object result = executor.ExecuteAsyncScript("arguments[arguments.length - 1](document.body);");
        Assert.That(result, Is.InstanceOf<IWebElement>());
        Assert.That(((IWebElement)result).TagName.ToLower(), Is.EqualTo("body"));
    }

    [Test]
    public void ShouldBeAbleToReturnArraysOfWebElementsFromAsyncScripts()
    {
        Driver.Url = Urls.AjaxyPage;

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
        Driver.Url = Urls.AjaxyPage;
        Assert.That(() => executor.ExecuteAsyncScript("return 1 + 2;"), Throws.InstanceOf<WebDriverTimeoutException>());
    }

    [Test]
    public void ShouldTimeoutIfScriptDoesNotInvokeCallbackWithAZeroTimeout()
    {
        Driver.Url = Urls.AjaxyPage;
        Assert.That(() => executor.ExecuteAsyncScript("window.setTimeout(function() {}, 0);"), Throws.InstanceOf<WebDriverTimeoutException>());
    }

    [Test]
    public void ShouldNotTimeoutIfScriptCallsbackInsideAZeroTimeout()
    {
        Driver.Url = Urls.AjaxyPage;
        executor.ExecuteAsyncScript(
            "var callback = arguments[arguments.length - 1];" +
            "window.setTimeout(function() { callback(123); }, 0)");
    }

    [Test]
    public void ShouldTimeoutIfScriptDoesNotInvokeCallbackWithLongTimeout()
    {
        Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromMilliseconds(500);
        Driver.Url = Urls.AjaxyPage;
        Assert.That(() => executor.ExecuteAsyncScript(
            "var callback = arguments[arguments.length - 1];" +
            "window.setTimeout(callback, 1500);"), Throws.InstanceOf<WebDriverTimeoutException>());
    }

    [Test]
    public void ShouldDetectPageLoadsWhileWaitingOnAnAsyncScriptAndReturnAnError()
    {
        Driver.Url = Urls.AjaxyPage;
        Assert.That(() => executor.ExecuteAsyncScript("window.location = '" + Urls.DynamicPage + "';"), Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void ShouldCatchErrorsWhenExecutingInitialScript()
    {
        Driver.Url = Urls.AjaxyPage;
        Assert.That(() => executor.ExecuteAsyncScript("throw Error('you should catch this!');"), Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void ShouldNotTimeoutWithMultipleCallsTheFirstOneBeingSynchronous()
    {
        Driver.Url = Urls.AjaxyPage;
        Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromMilliseconds(1000);
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
        Driver.Url = Urls.AjaxyPage;
        string js = "function functionB() { throw Error('errormessage'); };"
                    + "function functionA() { functionB(); };"
                    + "functionA();";

        Assert.That(
            () => executor.ExecuteAsyncScript(js),
            Throws.InstanceOf<WebDriverException>()
            .With.Message.Contains("errormessage")
            .And.Property(nameof(WebDriverException.StackTrace)).Contains("functionB"));
    }

    [Test]
    public void ShouldBeAbleToExecuteAsynchronousScripts()
    {
        // Reset the timeout to the 30-second default instead of zero.
        Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(30);
        Driver.Url = Urls.AjaxyPage;

        IWebElement typer = Driver.FindElement(By.Name("typer"));
        typer.SendKeys("bob");
        Assert.That(typer.GetAttribute("value"), Is.EqualTo("bob"));

        Driver.FindElement(By.Id("red")).Click();
        Driver.FindElement(By.Name("submit")).Click();

        Assert.That(GetNumberOfDivElements(), Is.EqualTo(1), "There should only be 1 DIV at this point, which is used for the butter message");

        Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(10);
        string text = (string)executor.ExecuteAsyncScript(
            "var callback = arguments[arguments.length - 1];"
            + "window.registerListener(arguments[arguments.length - 1]);");
        Assert.That(text, Is.EqualTo("bob"));
        Assert.That(typer.GetAttribute("value"), Is.Empty);

        Assert.That(GetNumberOfDivElements(), Is.EqualTo(2), "There should be 1 DIV (for the butter message) + 1 DIV (for the new label)");
    }

    [Test]
    public void ShouldBeAbleToPassMultipleArgumentsToAsyncScripts()
    {
        Driver.Url = Urls.AjaxyPage;
        long result = (long)executor.ExecuteAsyncScript("arguments[arguments.length - 1](arguments[0] + arguments[1]);", 1, 2);
        Assert.That(result, Is.EqualTo(3));
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

        Driver.Url = Urls.AjaxyPage;
        Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(3);
        string response = (string)executor.ExecuteAsyncScript(script, Urls.SleepingPage + "?time=2");
        Assert.That(response.Trim(), Is.EqualTo("<html><head><title>Done</title></head><body>Slept for 2s</body></html>"));
    }

    [Test]
    public void ThrowsIfScriptTriggersAlert()
    {
        Driver.Url = Urls.SimpleTestPage;
        Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(5);
        ((IJavaScriptExecutor)Driver).ExecuteAsyncScript(
            "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('Look! An alert!'); }, 50);");
        Assert.That(() => Driver.Title, Throws.InstanceOf<UnhandledAlertException>());

        string title = Driver.Title;
    }

    [Test]
    public void ThrowsIfAlertHappensDuringScript()
    {
        Driver.Url = Urls.SlowLoadingAlertPage;
        Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(5);
        ((IJavaScriptExecutor)Driver).ExecuteAsyncScript("setTimeout(arguments[0], 1000);");
        Assert.That(() => Driver.Title, Throws.InstanceOf<UnhandledAlertException>());

        // Shouldn't throw
        string title = Driver.Title;
    }

    [Test]
    public void ThrowsIfScriptTriggersAlertWhichTimesOut()
    {
        Driver.Url = Urls.SimpleTestPage;
        Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(5);
        ((IJavaScriptExecutor)Driver)
            .ExecuteAsyncScript("setTimeout(function() { window.alert('Look! An alert!'); }, 50);");
        Assert.That(() => Driver.Title, Throws.InstanceOf<UnhandledAlertException>());

        // Shouldn't throw
        string title = Driver.Title;
    }

    [Test]
    public void ThrowsIfAlertHappensDuringScriptWhichTimesOut()
    {
        Driver.Url = Urls.SlowLoadingAlertPage;
        Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(5);
        ((IJavaScriptExecutor)Driver).ExecuteAsyncScript("");
        Assert.That(() => Driver.Title, Throws.InstanceOf<UnhandledAlertException>());

        // Shouldn't throw
        string title = Driver.Title;
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Driver chooses not to return text from unhandled alert")]
    public void IncludesAlertTextInUnhandledAlertException()
    {
        Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(5);
        string alertText = "Look! An alert!";
        ((IJavaScriptExecutor)Driver).ExecuteAsyncScript(
            "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('" + alertText
            + "'); }, 50);");
        Assert.That(() => Driver.Title, Throws.InstanceOf<UnhandledAlertException>().With.Property("AlertText").EqualTo(alertText));
    }

    private long GetNumberOfDivElements()
    {
        IJavaScriptExecutor jsExecutor = Driver as IJavaScriptExecutor;
        // Selenium does not support "findElements" yet, so we have to do this through a script.
        return (long)jsExecutor.ExecuteScript("return document.getElementsByTagName('div').length;");
    }
}

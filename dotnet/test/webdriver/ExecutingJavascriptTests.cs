// <copyright file="ExecutingJavascriptTests.cs" company="Selenium Committers">
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
using OpenQA.Selenium.Tests.Infrastructure.Environment;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class ExecutingJavascriptTests : DriverTestFixture
{
    [Test]
    public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAString()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.XhtmlTestPage;

        object result = ExecuteScript("return document.title;");

        Assert.That(result, Is.InstanceOf<string>());
        Assert.That(result, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnALong()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.XhtmlTestPage;

        object result = ExecuteScript("return document.title.length;");

        Assert.That(result, Is.InstanceOf<long>());
        Assert.That((long)result, Is.EqualTo((long)"XHTML Test Page".Length));
    }

    [Test]
    public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.XhtmlTestPage;

        object result = ExecuteScript("return document.getElementById('id1');");

        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.InstanceOf<IWebElement>());
    }

    [Test]
    public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnABoolean()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.XhtmlTestPage;

        object result = ExecuteScript("return true;");

        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.InstanceOf<bool>());
        Assert.That((bool)result, Is.True);
    }

    [Test]
    public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAStringArray()
    {
        if (!(Driver is IJavaScriptExecutor))
        {
            return;
        }

        Driver.Url = Urls.JavascriptPage;
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
        if (!(Driver is IJavaScriptExecutor))
        {
            return;
        }

        Driver.Url = Urls.JavascriptPage;
        List<object> expectedResult = new List<object>();
        expectedResult.Add("zero");
        List<object> subList = new List<object>();
        subList.Add(true);
        subList.Add(false);
        expectedResult.Add(subList.AsReadOnly());
        object result = ExecuteScript("return ['zero', [true, false]];");
        Assert.That(result, Is.InstanceOf<ReadOnlyCollection<object>>());
        Assert.That(result, Is.EqualTo(expectedResult.AsReadOnly()));
    }

    [Test]
    public void ShouldBeAbleToExecuteJavascriptAndReturnABasicObjectLiteral()
    {
        if (!(Driver is IJavaScriptExecutor))
        {
            return;
        }

        Driver.Url = Urls.JavascriptPage;

        object result = ExecuteScript("return {abc: '123', tired: false};");
        Assert.That(result, Is.InstanceOf<Dictionary<string, object>>());
        Dictionary<string, object> map = (Dictionary<string, object>)result;

        Dictionary<string, object> expected = new Dictionary<string, object>();
        expected.Add("abc", "123");
        expected.Add("tired", false);

        Assert.That(map, Has.Count.EqualTo(expected.Count), "Expected:<" + expected.Count + ">, but was:<" + map.Count + ">");
        foreach (string expectedKey in expected.Keys)
        {
            Assert.That(map, Does.ContainKey(expectedKey));
            Assert.That(map[expectedKey], Is.EqualTo(expected[expectedKey]));
        }
    }

    [Test]
    public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAnObjectLiteral()
    {
        if (!(Driver is IJavaScriptExecutor))
        {
            return;
        }

        Driver.Url = Urls.JavascriptPage;

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

        Dictionary<string, object> person = (Dictionary<string, object>)map["person"];
        Assert.That(person, Has.Count.EqualTo(2));
        Assert.That(person["first"], Is.EqualTo("John"));
        Assert.That(person["last"], Is.EqualTo("Doe"));
    }

    [Test]
    public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAComplexObject()
    {
        Driver.Url = Urls.JavascriptPage;

        object result = ExecuteScript("return window.location;");

        Assert.That(result, Is.InstanceOf<Dictionary<string, object>>());
        Dictionary<string, object> map = (Dictionary<string, object>)result;
        Assert.That(map["protocol"], Is.EqualTo("http:"));
        Assert.That(map["href"], Is.EqualTo(Urls.JavascriptPage));
    }

    [Test]
    public void PassingAndReturningALongShouldReturnAWholeNumber()
    {
        if (!(Driver is IJavaScriptExecutor))
        {
            return;
        }

        Driver.Url = Urls.JavascriptPage;
        long expectedResult = 1L;
        object result = ExecuteScript("return arguments[0];", expectedResult);
        Assert.That(result, Is.InstanceOf<int>().Or.InstanceOf<long>());
        Assert.That(result, Is.EqualTo((long)expectedResult));
    }

    [Test]
    public void PassingAndReturningADoubleShouldReturnADecimal()
    {
        if (!(Driver is IJavaScriptExecutor))
        {
            return;
        }

        Driver.Url = Urls.JavascriptPage;
        double expectedResult = 1.2;
        object result = ExecuteScript("return arguments[0];", expectedResult);
        Assert.That(result, Is.InstanceOf<float>().Or.InstanceOf<double>());
        Assert.That(result, Is.EqualTo((double)expectedResult));
    }

    [Test]
    public void ShouldThrowAnExceptionWhenTheJavascriptIsBad()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.XhtmlTestPage;
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
        Driver.Url = Urls.XhtmlTestPage;
        string js = "function functionB() { throw Error('errormessage'); };"
                    + "function functionA() { functionB(); };"
                    + "functionA();";

        Assert.That(
           () => ExecuteScript(js),
           Throws.InstanceOf<WebDriverException>()
           .With.Message.Contains("errormessage")
           .And.Property(nameof(WebDriverException.StackTrace)).Contains("functionB"));
    }

    [Test]
    public void ShouldBeAbleToCallFunctionsDefinedOnThePage()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;
        ExecuteScript("displayMessage('I like cheese');");
        string text = Driver.FindElement(By.Id("result")).Text;

        Assert.That(text.Trim(), Is.EqualTo("I like cheese"));
    }

    [Test]
    public void ShouldBeAbleToPassAStringAsAnArgument()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;

        string text = (string)ExecuteScript("return arguments[0] == 'Hello!' ? 'Hello!' : 'Goodbye!';", "Hello!");
        Assert.That(text, Is.EqualTo("Hello!"));
    }

    [Test]
    public void ShouldBeAbleToPassABooleanAsAnArgument()
    {

        string function = "return arguments[0] == true ? true : false;";

        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;

        bool result = (bool)ExecuteScript(function, true);
        Assert.That(result, Is.True);

        result = (bool)ExecuteScript(function, false);
        Assert.That(result, Is.False);
    }

    [Test]
    public void ShouldBeAbleToPassANumberAsAnArgument()
    {
        string functionTemplate = "return arguments[0] == {0} ? {0} : 0;";

        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;

        string function = string.Format(functionTemplate, 3);
        long result = (long)ExecuteScript(function, 3);
        Assert.That(result, Is.EqualTo(3));

        function = string.Format(functionTemplate, -3);
        result = (long)ExecuteScript(function, -3);
        Assert.That(result, Is.EqualTo(-3));

        function = string.Format(functionTemplate, 2147483647);
        result = (long)ExecuteScript(function, 2147483647);
        Assert.That(result, Is.EqualTo(2147483647));

        function = string.Format(functionTemplate, -2147483647);
        result = (long)ExecuteScript(function, -2147483647);
        Assert.That(result, Is.EqualTo(-2147483647));
    }

    [Test]

    public void ShouldBeAbleToPassAWebElementAsArgument()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;
        IWebElement button = Driver.FindElement(By.Id("plainButton"));
        string value = (string)ExecuteScript("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];", button);

        Assert.That(value, Is.EqualTo("plainButton"));
    }

    [Test]
    public void PassingArrayAsOnlyArgumentShouldFlattenArray()
    {
        if (!(Driver is IJavaScriptExecutor))
        {
            return;
        }

        Driver.Url = Urls.JavascriptPage;
        object[] array = new object[] { "zero", 1, true, 3.14159 };
        long length = (long)ExecuteScript("return arguments[0].length", array);
        Assert.That(length, Is.EqualTo(array.Length));
    }

    [Test]
    public void ShouldBeAbleToPassAnArrayAsAdditionalArgument()
    {
        if (!(Driver is IJavaScriptExecutor))
        {
            return;
        }

        Driver.Url = Urls.JavascriptPage;
        object[] array = new object[] { "zero", 1, true, 3.14159, false };
        long length = (long)ExecuteScript("return arguments[1].length", "string", array);
        Assert.That(length, Is.EqualTo(array.Length));
    }

    [Test]
    public void ShouldBeAbleToPassACollectionAsArgument()
    {
        if (!(Driver is IJavaScriptExecutor))
        {
            return;
        }

        Driver.Url = Urls.JavascriptPage;
        List<object> collection = new List<object>();
        collection.Add("Cheddar");
        collection.Add("Brie");
        collection.Add(7);
        long length = (long)ExecuteScript("return arguments[0].length", collection);
        Assert.That(length, Is.EqualTo(collection.Count));
    }

    [Test]
    public void ShouldThrowAnExceptionIfAnArgumentIsNotValid()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;

        Assert.That(
            () => ExecuteScript("return arguments[0];", Driver),
            Throws.ArgumentException.With.Message.StartsWith("Argument is of an illegal type: "));
    }

    [Test]
    public void ShouldBeAbleToPassInMoreThanOneArgument()
    {
        if (!(Driver is IJavaScriptExecutor))
        {
            return;
        }

        Driver.Url = Urls.JavascriptPage;
        string result = (string)ExecuteScript("return arguments[0] + arguments[1];", "one", "two");

        Assert.That(result, Is.EqualTo("onetwo"));
    }

    [Test]
    public void ShouldBeAbleToGrabTheBodyOfFrameOnceSwitchedTo()
    {
        Driver.Url = Urls.RichTextPage;

        Driver.SwitchTo().Frame("editFrame");
        IWebElement body = (IWebElement)((IJavaScriptExecutor)Driver).ExecuteScript("return document.body");

        Assert.That(body.Text, Is.Empty);
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
        Driver.Url = Urls.JavascriptPage;

        string value = (string)ExecuteScript("return '';");
        Assert.That(value, Is.Empty);

        value = (string)ExecuteScript("return undefined;");
        Assert.That(value, Is.Null);

        value = (string)ExecuteScript("return ' '");
        Assert.That(value, Is.EqualTo(" "));
    }

    [Test]
    public void ShouldBeAbleToExecuteABigChunkOfJavascriptCode()
    {
        Driver.Url = Urls.JavascriptPage;
        string path = System.IO.Path.Combine(EnvironmentManager.Instance.CurrentDirectory, ".." + System.IO.Path.DirectorySeparatorChar + "..");
        string[] fileList = System.IO.Directory.GetFiles(path, "jquery-1.2.6.min.js", System.IO.SearchOption.AllDirectories);
        if (fileList.Length > 0)
        {
            string jquery = System.IO.File.ReadAllText(fileList[0]);
            Assert.That(jquery, Has.Length.GreaterThan(50000));
            ExecuteScript(jquery, null);
        }
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    public async Task ShouldBeAbleToPinJavascriptCodeAndExecuteRepeatedly()
    {
        using IJavaScriptEngine jsEngine = new JavaScriptEngine(Driver);

        Driver.Url = Urls.XhtmlTestPage;

        PinnedScript script = await jsEngine.PinScript("return document.title;");
        for (int i = 0; i < 5; i++)
        {
            object result = ((IJavaScriptExecutor)Driver).ExecuteScript(script);

            Assert.That(result, Is.InstanceOf<string>());
            Assert.That(result, Is.EqualTo("XHTML Test Page"));
        }

        await jsEngine.UnpinScript(script);

        Assert.That(
            () => ((IJavaScriptExecutor)Driver).ExecuteScript(script),
            Throws.TypeOf<JavaScriptException>());
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    [IgnoreBrowser(Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    public async Task ShouldBeAbleToAddInitializationScriptAndExecuteOnNewDocument()
    {
        const string ScriptValue = "alert('notice')";
        const string ScriptName = "AlertScript";

        using IJavaScriptEngine jsEngine = new JavaScriptEngine(Driver);

        var initScript = await jsEngine.AddInitializationScript(ScriptName, ScriptValue);

        Assert.That(initScript, Is.Not.Null);
        Assert.That(initScript.ScriptSource, Is.EqualTo(ScriptValue));
        Assert.That(initScript.ScriptName, Is.EqualTo(ScriptName));
        Assert.That(initScript.ScriptId, Is.Not.Null);

        await jsEngine.StartEventMonitoring();

        Driver.Navigate().Refresh();
        Driver.SwitchTo().Alert().Accept();

        Assert.That(jsEngine.InitializationScripts, Does.Contain(initScript));
        await jsEngine.RemoveInitializationScript(ScriptName);

        Driver.Navigate().Refresh();
        Assert.That(() => Driver.SwitchTo().Alert().Accept(), Throws.TypeOf<NoAlertPresentException>());

        Assert.That(jsEngine.InitializationScripts, Does.Not.Contain(initScript));

        await jsEngine.AddInitializationScript(ScriptName, ScriptValue);

        Driver.Navigate().Refresh();
        Driver.SwitchTo().Alert().Accept();
        Assert.That(jsEngine.InitializationScripts, Does.Contain(initScript));

        await jsEngine.ClearInitializationScripts();

        Driver.Navigate().Refresh();
        Assert.That(() => Driver.SwitchTo().Alert().Accept(), Throws.TypeOf<NoAlertPresentException>());
        Assert.That(jsEngine.InitializationScripts, Is.Empty);

        await jsEngine.AddInitializationScript(ScriptName, ScriptValue);
        Driver.Navigate().Refresh();
        Driver.SwitchTo().Alert().Accept();

        await jsEngine.ClearAll();
        Driver.Navigate().Refresh();
        Assert.That(() => Driver.SwitchTo().Alert().Accept(), Throws.TypeOf<NoAlertPresentException>());
        Assert.That(jsEngine.InitializationScripts, Is.Empty);
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    [IgnoreBrowser(Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    public async Task ShouldBeAbleToAddAndRemoveScriptCallbackBinding()
    {
        const string ScriptValue = "alert('Hello world')";
        const string ScriptName = "alert";

        using IJavaScriptEngine jsEngine = new JavaScriptEngine(Driver);

        var executedBindings = new List<string>();
        jsEngine.JavaScriptCallbackExecuted += AddToList;
        await jsEngine.AddInitializationScript(ScriptName, ScriptValue);
        await jsEngine.StartEventMonitoring();

        Driver.Navigate().Refresh();
        Driver.SwitchTo().Alert().Accept();

        await jsEngine.AddScriptCallbackBinding(ScriptName);

        Driver.Navigate().Refresh();
        Assert.That(() => Driver.SwitchTo().Alert().Accept(), Throws.TypeOf<NoAlertPresentException>());

        Assert.That(executedBindings, Does.Contain(ScriptName));
        int oldCount = executedBindings.Count;
        Driver.Navigate().Refresh();

        Assert.That(executedBindings, Has.Count.GreaterThan(oldCount));
        Assert.That(jsEngine.ScriptCallbackBindings, Does.Contain(ScriptName));
        oldCount = executedBindings.Count;

        await jsEngine.RemoveScriptCallbackBinding(ScriptName);
        Assert.That(jsEngine.ScriptCallbackBindings, Is.Empty);
        await jsEngine.AddScriptCallbackBinding(ScriptName);
        Assert.That(jsEngine.ScriptCallbackBindings, Does.Contain(ScriptName));
        await jsEngine.ClearScriptCallbackBindings();
        Assert.That(jsEngine.ScriptCallbackBindings, Is.Empty);

        jsEngine.JavaScriptCallbackExecuted -= AddToList;
        Driver.Navigate().Refresh();
        Assert.That(executedBindings, Has.Count.EqualTo(oldCount));

        void AddToList(object sender, JavaScriptCallbackExecutedEventArgs e) => executedBindings.Add(e.BindingName);
    }

    [Test]
    public void ShouldBeAbleToExecuteScriptAndReturnElementsList()
    {
        Driver.Url = Urls.FormsPage;
        String scriptToExec = "return document.getElementsByName('snack');";

        object resultObject = ((IJavaScriptExecutor)Driver).ExecuteScript(scriptToExec);

        ReadOnlyCollection<IWebElement> resultsList = (ReadOnlyCollection<IWebElement>)resultObject;

        Assert.That(resultsList, Is.Not.Empty);
    }

    [Test]
    public void ShouldBeAbleToCreateAPersistentValue()
    {
        Driver.Url = Urls.FormsPage;

        ExecuteScript("document.alerts = []");
        ExecuteScript("document.alerts.push('hello world');");
        string text = (string)ExecuteScript("return document.alerts.shift()");

        Assert.That(text, Is.EqualTo("hello world"));
    }

    [Test]
    public void ShouldBeAbleToHandleAnArrayOfElementsAsAnObjectArray()
    {
        Driver.Url = Urls.FormsPage;

        ReadOnlyCollection<IWebElement> forms = Driver.FindElements(By.TagName("form"));
        object[] args = new object[] { forms };

        string name = (string)((IJavaScriptExecutor)Driver).ExecuteScript("return arguments[0][0].tagName", args);

        Assert.That(name, Is.EqualTo("form").IgnoreCase);
    }

    [Test]
    public void ShouldBeAbleToPassADictionaryAsAParameter()
    {
        Driver.Url = Urls.SimpleTestPage;

        List<int> nums = new List<int>() { 1, 2 };
        Dictionary<string, object> args = new Dictionary<string, object>();
        args["bar"] = "test";
        args["foo"] = nums;

        object res = ((IJavaScriptExecutor)Driver).ExecuteScript("return arguments[0]['foo'][1]", args);

        Assert.That((long)res, Is.EqualTo(2));
    }

    [Test]
    public void ShouldThrowAnExceptionWhenArgumentsWithStaleElementPassed()
    {
        if (Driver is not IJavaScriptExecutor executor)
        {
            return;
        }

        Driver.Url = Urls.SimpleTestPage;

        IWebElement el = Driver.FindElement(By.Id("oneline"));

        Driver.Url = Urls.SimpleTestPage;

        Dictionary<string, object> args = new Dictionary<string, object>();
        args["key"] = new object[] { "a", new object[] { "zero", 1, true, 3.14159, false, el }, "c" };
        Assert.That(
            () => executor.ExecuteScript("return undefined;", args),
            Throws.TypeOf<StaleElementReferenceException>());
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "Browser does not return Date object.")]
    [IgnoreBrowser(Browser.Edge, "Browser does not return Date object.")]
    public void ShouldBeAbleToReturnADateObject()
    {
        Driver.Url = Urls.SimpleTestPage;

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
        Driver.Url = Urls.SimpleTestPage;

        object value = ExecuteScript("return document");

        Assert.That(value, Is.InstanceOf<IWebElement>());
        Assert.That(((IWebElement)value).Text, Does.Contain("A single line of text"));
    }

    [Test]
    public void ShouldHandleObjectThatThatHaveToJSONMethod()
    {
        Driver.Url = Urls.SimpleTestPage;

        object value = ExecuteScript("return window.performance.timing");

        Assert.That(value, Is.InstanceOf<Dictionary<string, object>>());
    }

    [Test]
    public void ShouldHandleRecursiveStructures()
    {
        Driver.Url = Urls.SimpleTestPage;

        Assert.That(
            () => ExecuteScript(
                """
                var obj1 = {};
                var obj2 = {};
                obj1['obj2'] = obj2;
                obj2['obj1'] = obj1;
                return obj1
                """
                ),
            Throws.TypeOf<JavaScriptException>());
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
    [Ignore("Reason for ignore: Failure indicates hang condition, which would break the test suite. Really needs a timeout set.")]
    public void ShouldThrowExceptionIfExecutingOnNoPage()
    {
        Assert.That(
            () => ((IJavaScriptExecutor)Driver).ExecuteScript("return 1;"),
            Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void ExecutingLargeJavaScript()
    {
        string script = """
            // stolen from injectableSelenium.js in WebDriver
            var browserbot = {

                triggerEvent: function(element, eventType, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
                    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;

                    if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject) {
                        // IE
                        var evt = this.createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);
                        element.fireEvent('on' + eventType,evt);
                    } else {
                        var evt = document.createEvent('HTMLEvents');

                        try {
                            evt.shiftKey = shiftKeyDown;
                            evt.metaKey = metaKeyDown;
                            evt.altKey = altKeyDown;
                            evt.ctrlKey = controlKeyDown;
                        } catch(e) {
                            // Nothing sane to do
                        }

                        evt.initEvent(eventType, canBubble, true);
                        return element.dispatchEvent(evt);
                    }
                },

                getVisibleText: function() {
                    var selection = getSelection();
                    var range = document.createRange();
                    range.selectNodeContents(document.documentElement);
                    selection.addRange(range);

                    var string = selection.toString();
                    selection.removeAllRanges();

                    return string;
                },

                getOuterHTML: function(element) {
                    if(element.outerHTML) {
                        return element.outerHTML;
                    } else if(typeof(XMLSerializer) != undefined) {
                        return new XMLSerializer().serializeToString(element);
                    } else {
                        throw "can't get outerHTML in this browser";
                    }
                }
            };

            return browserbot.getOuterHTML.apply(browserbot, arguments);
            """;

        Driver.Url = Urls.JavascriptPage;
        IWebElement element = Driver.FindElement(By.TagName("body"));
        object x = ExecuteScript(script, element);
    }

    [Test]

    public void ShouldBeAbleToPassMoreThanOneStringAsArguments()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;
        string text = (string)ExecuteScript("return arguments[0] + arguments[1] + arguments[2] + arguments[3];", "Hello,", " ", "world", "!");

        Assert.That(text, Is.EqualTo("Hello, world!"));
    }

    [Test]
    public void ShouldBeAbleToPassMoreThanOneBooleanAsArguments()
    {

        string function = "return (arguments[0] ? 'True' : 'False') + (arguments[1] ? 'True' : 'False');";

        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;

        string text = (string)ExecuteScript(function, true, true);
        Assert.That(text, Is.EqualTo("TrueTrue"));

        text = (string)ExecuteScript(function, false, true);
        Assert.That(text, Is.EqualTo("FalseTrue"));

        text = (string)ExecuteScript(function, true, false);
        Assert.That(text, Is.EqualTo("TrueFalse"));

        text = (string)ExecuteScript(function, false, false);
        Assert.That(text, Is.EqualTo("FalseFalse"));
    }

    [Test]
    public void ShouldBeAbleToPassMoreThanOneNumberAsArguments()
    {
        string function = "return arguments[0]+arguments[1];";

        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;

        long result = (long)ExecuteScript(function, 30, 12);
        Assert.That(result, Is.EqualTo(42));

        result = (long)ExecuteScript(function, -30, -12);
        Assert.That(result, Is.EqualTo(-42));

        result = (long)ExecuteScript(function, 2147483646, 1);
        Assert.That(result, Is.EqualTo(2147483647));

        result = (long)ExecuteScript(function, -2147483646, -1);
        Assert.That(result, Is.EqualTo(-2147483647));

    }

    [Test]
    public void ShouldBeAbleToPassADoubleAsAnArgument()
    {
        string function = "return arguments[0];";

        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;

        double result = (double)ExecuteScript(function, (double)4.2);
        Assert.That(result, Is.EqualTo(4.2));

        result = (double)ExecuteScript(function, (double)-4.2);
        Assert.That(result, Is.EqualTo(-4.2));

        result = (double)ExecuteScript(function, (float)4.2);
        Assert.That(result, Is.EqualTo(4.2));

        result = (double)ExecuteScript(function, (float)-4.2);
        Assert.That(result, Is.EqualTo(-4.2));

        result = (long)ExecuteScript(function, (double)4.0);
        Assert.That(result, Is.EqualTo(4));

        result = (long)ExecuteScript(function, (double)-4.0);
        Assert.That(result, Is.EqualTo(-4));
    }

    [Test]
    public void ShouldBeAbleToPassMoreThanOneDoubleAsArguments()
    {
        String function = "return arguments[0]+arguments[1];";

        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;

        double result = (double)ExecuteScript(function, 30.1, 12.1);
        Assert.That(result, Is.EqualTo(42.2));

        result = (double)ExecuteScript(function, -30.1, -12.1);
        Assert.That(result, Is.EqualTo(-42.2));

        result = (double)ExecuteScript(function, 2147483646.1, 1.0);
        Assert.That(result, Is.EqualTo(2147483647.1));

        result = (double)ExecuteScript(function, -2147483646.1, -1.0);
        Assert.That(result, Is.EqualTo(-2147483647.1));

    }

    [Test]
    public void ShouldBeAbleToPassMoreThanOneWebElementAsArguments()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;
        IWebElement button = Driver.FindElement(By.Id("plainButton"));
        IWebElement dynamo = Driver.FindElement(By.Id("dynamo"));
        string value = (string)ExecuteScript("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'] + arguments[1].innerHTML;", button, dynamo);

        Assert.That(value, Is.EqualTo("plainButtonWhat's for dinner?"));
    }

    [Test]
    public void ShouldBeAbleToPassInMixedArguments()
    {
        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;

        IWebElement dynamo = Driver.FindElement(By.Id("dynamo"));
        string result = (string)ExecuteScript("return arguments[0].innerHTML + arguments[1].toString() + arguments[2].toString() + arguments[3] + arguments[4]",
            dynamo,
            42,
            4.2,
            "Hello, World!",
            true);

        Assert.That(result, Is.EqualTo("What's for dinner?424.2Hello, World!true"));

    }

    [Test]
    public void ShouldBeAbleToPassInAndRetrieveDates()
    {
        string function = "displayMessage(arguments[0]);";

        if (!(Driver is IJavaScriptExecutor))
            return;

        Driver.Url = Urls.JavascriptPage;

        ExecuteScript(function, "2014-05-20T20:00:00+08:00");
        IWebElement element = Driver.FindElement(By.Id("result"));
        string text = element.Text;
        Assert.That(text, Is.EqualTo("2014-05-20T20:00:00+08:00"));
    }

    private object ExecuteScript(String script, params Object[] args)
    {
        object toReturn = ((IJavaScriptExecutor)Driver).ExecuteScript(script, args);
        return toReturn;
    }
}

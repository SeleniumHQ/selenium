// <copyright file="AlertsTests.cs" company="Selenium Committers">
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

using OpenQA.Selenium.Tests.Infrastructure.Environment;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class AlertsTests : DriverTestFixture
{
    [Test]
    public void ShouldBeAbleToOverrideTheWindowAlertMethod()
    {
        Driver.Url = CreateAlertPage("cheese");

        ((IJavaScriptExecutor)Driver).ExecuteScript(
            "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
        Driver.FindElement(By.Id("alert")).Click();
    }

    [Test]
    public void ShouldAllowUsersToAcceptAnAlertManually()
    {
        Driver.Url = CreateAlertPage("cheese");

        Driver.FindElement(By.Id("alert")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert.Accept();

        // If we can perform any action, we're good to go
        Assert.That(Driver.Title, Is.EqualTo("Testing Alerts"));
    }

    [Test]
    public void ShouldThrowArgumentNullExceptionWhenKeysNull()
    {
        Driver.Url = CreateAlertPage("cheese");

        Driver.FindElement(By.Id("alert")).Click();
        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        try
        {
            Assert.That(
                () => alert.SendKeys(null),
                Throws.ArgumentNullException);
        }
        finally
        {
            alert.Accept();
        }
    }

    [Test]
    public void ShouldAllowUsersToAcceptAnAlertWithNoTextManually()
    {
        Driver.Url = CreateAlertPage("");

        Driver.FindElement(By.Id("alert")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert.Accept();

        // If we can perform any action, we're good to go
        Assert.That(Driver.Title, Is.EqualTo("Testing Alerts"));
    }

    [Test]
    public void ShouldAllowUsersToDismissAnAlertManually()
    {
        Driver.Url = CreateAlertPage("cheese");

        Driver.FindElement(By.Id("alert")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert.Dismiss();

        // If we can perform any action, we're good to go
        Assert.That(Driver.Title, Is.EqualTo("Testing Alerts"));
    }

    [Test]
    public void ShouldAllowAUserToAcceptAPrompt()
    {
        Driver.Url = CreatePromptPage(null);

        Driver.FindElement(By.Id("prompt")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert.Accept();

        // If we can perform any action, we're good to go
        Assert.That(Driver.Title, Is.EqualTo("Testing Prompt"));
    }

    [Test]
    public void ShouldAllowAUserToDismissAPrompt()
    {
        Driver.Url = CreatePromptPage(null);

        Driver.FindElement(By.Id("prompt")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert.Dismiss();

        // If we can perform any action, we're good to go
        Assert.That(Driver.Title, Is.EqualTo("Testing Prompt"));
    }

    [Test]
    public void ShouldAllowAUserToSetTheValueOfAPrompt()
    {
        Driver.Url = CreatePromptPage(null);

        Driver.FindElement(By.Id("prompt")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert.SendKeys("cheese");
        alert.Accept();

        string result = Driver.FindElement(By.Id("text")).Text;
        Assert.That(result, Is.EqualTo("cheese"));
    }

    [Test]
    public void SettingTheValueOfAnAlertThrows()
    {
        Driver.Url = CreateAlertPage("cheese");

        Driver.FindElement(By.Id("alert")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");

        try
        {
            Assert.That(
                () => alert.SendKeys("cheese"),
                Throws.TypeOf<ElementNotInteractableException>());
        }
        finally
        {
            alert.Accept();
        }
    }

    [Test]
    public void ShouldAllowTheUserToGetTheTextOfAnAlert()
    {
        Driver.Url = CreateAlertPage("cheese");

        Driver.FindElement(By.Id("alert")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        string value = alert.Text;
        alert.Accept();

        Assert.That(value, Is.EqualTo("cheese"));
    }

    [Test]
    public void ShouldAllowTheUserToGetTheTextOfAPrompt()
    {
        Driver.Url = CreatePromptPage(null);

        Driver.FindElement(By.Id("prompt")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        string value = alert.Text;
        alert.Accept();

        Assert.That(value, Is.EqualTo("Enter something"));
    }

    [Test]
    public void AlertShouldNotAllowAdditionalCommandsIfDismissed()
    {
        Driver.Url = CreateAlertPage("cheese");

        Driver.FindElement(By.Id("alert")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert.Dismiss();

        Assert.That(
            () => alert.Text,
            Throws.TypeOf<NoAlertPresentException>());
    }

    [Test]
    public void ShouldAllowUsersToAcceptAnAlertInAFrame()
    {
        string iframe = Urls.CreateInlinePage(new InlinePage()
            .WithBody("<a href='#' id='alertInFrame' onclick='alert(\"framed cheese\");'>click me</a>"));
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
            .WithTitle("Testing Alerts")
            .WithBody(String.Format("<iframe src='{0}' name='iframeWithAlert'></iframe>", iframe)));

        Driver.SwitchTo().Frame("iframeWithAlert");

        Driver.FindElement(By.Id("alertInFrame")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert.Accept();

        // If we can perform any action, we're good to go
        Assert.That(Driver.Title, Is.EqualTo("Testing Alerts"));
    }

    [Test]
    public void ShouldAllowUsersToAcceptAnAlertInANestedFrame()
    {
        string iframe = Urls.CreateInlinePage(new InlinePage()
            .WithBody("<a href='#' id='alertInFrame' onclick='alert(\"framed cheese\");'>click me</a>"));
        string iframe2 = Urls.CreateInlinePage(new InlinePage()
            .WithBody(string.Format("<iframe src='{0}' name='iframeWithAlert'></iframe>", iframe)));
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
            .WithTitle("Testing Alerts")
            .WithBody(string.Format("<iframe src='{0}' name='iframeWithIframe'></iframe>", iframe2)));

        Driver.SwitchTo().Frame("iframeWithIframe").SwitchTo().Frame("iframeWithAlert");

        Driver.FindElement(By.Id("alertInFrame")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert.Accept();

        // If we can perform any action, we're good to go
        Assert.That(Driver.Title, Is.EqualTo("Testing Alerts"));
    }

    [Test]
    public void SwitchingToMissingAlertThrows()
    {
        Driver.Url = CreateAlertPage("cheese");

        Assert.That(
            () => AlertToBePresent(),
            Throws.TypeOf<NoAlertPresentException>());
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void SwitchingToMissingAlertInAClosedWindowThrows()
    {
        string blank = Urls.CreateInlinePage(new InlinePage());
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
            .WithBody(String.Format(
                "<a id='open-new-window' href='{0}' target='newwindow'>open new window</a>", blank)));

        string mainWindow = Driver.CurrentWindowHandle;
        try
        {
            Driver.FindElement(By.Id("open-new-window")).Click();
            WaitFor(WindowHandleCountToBe(2), "Window count was not 2");
            WaitFor(WindowWithName("newwindow"), "Could not find window with name 'newwindow'");
            Driver.Close();
            WaitFor(WindowHandleCountToBe(1), "Window count was not 1");

            Assert.That(
                () => AlertToBePresent().Accept(),
                Throws.TypeOf<NoSuchWindowException>());

        }
        finally
        {
            Driver.SwitchTo().Window(mainWindow);
            WaitFor(ElementTextToEqual(Driver.FindElement(By.Id("open-new-window")), "open new window"), "Could not find element with text 'open new window'");
        }
    }

    [Test]
    public void PromptShouldUseDefaultValueIfNoKeysSent()
    {
        Driver.Url = CreatePromptPage("This is a default value");
        Driver.FindElement(By.Id("prompt")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert.Accept();

        IWebElement element = Driver.FindElement(By.Id("text"));
        WaitFor(ElementTextToEqual(element, "This is a default value"), "Element text was not 'This is a default value'");
        Assert.That(element.Text, Is.EqualTo("This is a default value"));
    }

    [Test]
    public void PromptShouldHaveNullValueIfDismissed()
    {
        Driver.Url = CreatePromptPage("This is a default value");
        Driver.FindElement(By.Id("prompt")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert.Dismiss();
        IWebElement element = Driver.FindElement(By.Id("text"));
        WaitFor(ElementTextToEqual(element, "null"), "Element text was not 'null'");
        Assert.That(element.Text, Is.EqualTo("null"));
    }

    [Test]
    [IgnoreBrowser(Browser.Remote)]
    public void HandlesTwoAlertsFromOneInteraction()
    {
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
            .WithScripts(
                """
                function setInnerText(id, value) {
                  document.getElementById(id).innerHTML = '<p>' + value + '</p>';
                }

                function displayTwoPrompts() {
                  setInnerText('text1', prompt('First'));
                  setInnerText('text2', prompt('Second'));
                }
                """)
            .WithBody(
                """
                <a href='#' id='double-prompt' onclick='displayTwoPrompts();'>click me</a>
                <div id='text1'></div>
                <div id='text2'></div>
                """));

        Driver.FindElement(By.Id("double-prompt")).Click();

        IAlert alert1 = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert1.SendKeys("brie");
        alert1.Accept();

        IAlert alert2 = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        alert2.SendKeys("cheddar");
        alert2.Accept();

        IWebElement element1 = Driver.FindElement(By.Id("text1"));
        WaitFor(ElementTextToEqual(element1, "brie"), "Element text was not 'brie'");
        Assert.That(element1.Text, Is.EqualTo("brie"));
        IWebElement element2 = Driver.FindElement(By.Id("text2"));
        WaitFor(ElementTextToEqual(element2, "cheddar"), "Element text was not 'cheddar'");
        Assert.That(element2.Text, Is.EqualTo("cheddar"));
    }

    [Test]
    public void ShouldHandleAlertOnPageLoad()
    {
        string pageWithOnLoad = Urls.CreateInlinePage(new InlinePage()
            .WithOnLoad("""javascript:alert("onload")""")
            .WithBody("<p>Page with onload event handler</p>"));
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
            .WithBody(string.Format("<a id='open-page-with-onload-alert' href='{0}'>open new page</a>", pageWithOnLoad)));

        Driver.FindElement(By.Id("open-page-with-onload-alert")).Click();

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        string value = alert.Text;
        alert.Accept();

        Assert.That(value, Is.EqualTo("onload"));
        IWebElement element = Driver.FindElement(By.TagName("p"));
        WaitFor(ElementTextToEqual(element, "Page with onload event handler"), "Element text was not 'Page with onload event handler'");
    }

    [Test]

    public void ShouldHandleAlertOnPageLoadUsingGet()
    {
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
            .WithOnLoad("javascript:alert(\"onload\")")
            .WithBody("<p>Page with onload event handler</p>"));

        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        string value = alert.Text;
        alert.Accept();

        Assert.That(value, Is.EqualTo("onload"));
        WaitFor(ElementTextToEqual(Driver.FindElement(By.TagName("p")), "Page with onload event handler"), "Could not find element with text 'Page with onload event handler'");
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [IgnoreBrowser(Browser.Chrome, "Test with onLoad alert hangs Chrome.")]
    [IgnoreBrowser(Browser.Edge, "Test with onLoad alert hangs Edge.")]
    [IgnoreBrowser(Browser.Safari, "Safari driver does not allow commands in any window when an alert is active")]
    public void ShouldNotHandleAlertInAnotherWindow()
    {
        string pageWithOnLoad = Urls.CreateInlinePage(new InlinePage()
            .WithOnLoad("javascript:alert(\"onload\")")
            .WithBody("<p>Page with onload event handler</p>"));
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
            .WithBody(string.Format(
                "<a id='open-new-window' href='{0}' target='newwindow'>open new window</a>", pageWithOnLoad)));

        string mainWindow = Driver.CurrentWindowHandle;
        string onloadWindow = null;
        try
        {
            Driver.FindElement(By.Id("open-new-window")).Click();
            List<String> allWindows = new List<string>(Driver.WindowHandles);
            allWindows.Remove(mainWindow);
            Assert.That(allWindows, Has.One.Items);
            onloadWindow = allWindows[0];

            Assert.That(() =>
            {
                IWebElement el = Driver.FindElement(By.Id("open-new-window"));
                WaitFor<IAlert>(AlertToBePresent, TimeSpan.FromSeconds(5), "No alert found");
            },
            Throws.InstanceOf<WebDriverException>());

        }
        finally
        {
            Driver.SwitchTo().Window(onloadWindow);
            WaitFor<IAlert>(AlertToBePresent, "No alert found").Dismiss();
            Driver.Close();
            Driver.SwitchTo().Window(mainWindow);
            WaitFor(ElementTextToEqual(Driver.FindElement(By.Id("open-new-window")), "open new window"), "Could not find element with text 'open new window'");
        }
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Driver chooses not to return text from unhandled alert")]
    public void IncludesAlertTextInUnhandledAlertException()
    {
        Driver.Url = CreateAlertPage("cheese");

        Driver.FindElement(By.Id("alert")).Click();
        WaitFor<IAlert>(AlertToBePresent, "No alert found");

        Assert.That(
            () => Driver.Title,
            Throws.TypeOf<UnhandledAlertException>().With.Property(nameof(UnhandledAlertException.AlertText)).EqualTo("cheese"));
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void CanQuitWhenAnAlertIsPresent()
    {
        Driver.Url = CreateAlertPage("cheese");
        Driver.FindElement(By.Id("alert")).Click();
        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        EnvironmentManager.Instance.CloseCurrentDriver();
    }

    [Test]
    public void ShouldHandleAlertOnFormSubmit()
    {
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
            .WithTitle("Testing Alerts").
            WithBody("<form id='theForm' action='javascript:alert(\"Tasty cheese\");'>",
                "<input id='unused' type='submit' value='Submit'>",
                "</form>"));

        IWebElement element = Driver.FindElement(By.Id("theForm"));
        element.Submit();
        IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
        string text = alert.Text;
        alert.Accept();

        Assert.That(text, Is.EqualTo("Tasty cheese"));
        Assert.That(Driver.Title, Is.EqualTo("Testing Alerts"));
    }

    private IAlert AlertToBePresent()
    {
        return Driver.SwitchTo().Alert();
    }

    private string CreateAlertPage(string alertText)
    {
        return Urls.CreateInlinePage(new InlinePage()
            .WithTitle("Testing Alerts")
            .WithBody("<a href='#' id='alert' onclick='alert(\"" + alertText + "\");'>click me</a>"));
    }

    private string CreatePromptPage(string defaultText)
    {
        return Urls.CreateInlinePage(new InlinePage()
            .WithTitle("Testing Prompt")
            .WithScripts(
                "function setInnerText(id, value) {",
                "  document.getElementById(id).innerHTML = '<p>' + value + '</p>';",
                "}",
                defaultText == null
                  ? "function displayPrompt() { setInnerText('text', prompt('Enter something')); }"
                  : "function displayPrompt() { setInnerText('text', prompt('Enter something', '" + defaultText + "')); }")

            .WithBody(
                "<a href='#' id='prompt' onclick='displayPrompt();'>click me</a>",
                "<div id='text'>acceptor</div>"));
    }

    private void SetSimpleOnBeforeUnload(string returnText)
    {
        ((IJavaScriptExecutor)Driver).ExecuteScript(
            "var returnText = arguments[0]; window.onbeforeunload = function() { return returnText; }",
            returnText);
    }

    private Func<IWebElement> ElementToBePresent(By locator)
    {
        return () =>
        {
            try
            {
                return Driver.FindElement(By.Id("open-page-with-onunload-alert"));
            }
            catch (NoSuchElementException)
            {
                return null;
            }
        };
    }

    private Func<bool> ElementTextToEqual(IWebElement element, string text)
    {
        return () =>
        {
            return element.Text == text;
        };
    }

    private Func<bool> WindowWithName(string name)
    {
        return () =>
        {
            try
            {
                Driver.SwitchTo().Window(name);
                return true;
            }
            catch (NoSuchWindowException)
            {
                return false;
            }
        };
    }

    private Func<bool> WindowHandleCountToBe(int count)
    {
        return () =>
        {
            return Driver.WindowHandles.Count == count;
        };
    }
}

using System;
using System.Collections.Generic;
using NUnit.Framework;
using OpenQA.Selenium.Environment;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class AlertsTest : DriverTestFixture
    {
        [Test]
        public void ShouldBeAbleToOverrideTheWindowAlertMethod()
        {
            driver.Url = CreateAlertPage("cheese");

            ((IJavaScriptExecutor)driver).ExecuteScript(
                "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
            driver.FindElement(By.Id("alert")).Click();
        }

        [Test]
        public void ShouldAllowUsersToAcceptAnAlertManually()
        {
            driver.Url = CreateAlertPage("cheese");

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        public void ShouldThrowArgumentNullExceptionWhenKeysNull()
        {
            driver.Url = CreateAlertPage("cheese");

            driver.FindElement(By.Id("alert")).Click();
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            try
            {
                Assert.That(() => alert.SendKeys(null), Throws.ArgumentNullException);
            }
            finally
            {
                alert.Accept();
            }
        }

        [Test]
        public void ShouldAllowUsersToAcceptAnAlertWithNoTextManually()
        {
            driver.Url = CreateAlertPage("");

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "This is the correct behavior, for the SwitchTo call to throw if it happens before the setTimeout call occurs in the browser and the alert is displayed.")]
        [IgnoreBrowser(Browser.Edge, "This is the correct behavior, for the SwitchTo call to throw if it happens before the setTimeout call occurs in the browser and the alert is displayed.")]
        [IgnoreBrowser(Browser.EdgeLegacy, "This is the correct behavior, for the SwitchTo call to throw if it happens before the setTimeout call occurs in the browser and the alert is displayed.")]
        [IgnoreBrowser(Browser.IE, "This is the correct behavior, for the SwitchTo call to throw if it happens before the setTimeout call occurs in the browser and the alert is displayed.")]
        [IgnoreBrowser(Browser.Firefox, "This is the correct behavior, for the SwitchTo call to throw if it happens before the setTimeout call occurs in the browser and the alert is displayed.")]
        [IgnoreBrowser(Browser.Safari, "This is the correct behavior, for the SwitchTo call to throw if it happens before the setTimeout call occurs in the browser and the alert is displayed.")]
        public void ShouldGetTextOfAlertOpenedInSetTimeout()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithTitle("Testing Alerts")
                .WithScripts(
                    "function slowAlert() { window.setTimeout(function(){ alert('Slow'); }, 200); }")
                .WithBody(
                    "<a href='#' id='slow-alert' onclick='slowAlert();'>click me</a>"));

            driver.FindElement(By.Id("slow-alert")).Click();

            // DO NOT WAIT OR SLEEP HERE.
            // This is a regression test for a bug where only the first switchTo call would throw,
            // and only if it happens before the alert actually loads.
            IAlert alert = driver.SwitchTo().Alert();
            try
            {
                Assert.AreEqual("Slow", alert.Text);
            }
            finally
            {
                alert.Accept();
            }
        }

        [Test]
        public void ShouldAllowUsersToDismissAnAlertManually()
        {
            driver.Url = CreateAlertPage("cheese");

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        public void ShouldAllowAUserToAcceptAPrompt()
        {
            driver.Url = CreatePromptPage(null);

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Prompt", driver.Title);
        }

        [Test]
        public void ShouldAllowAUserToDismissAPrompt()
        {
            driver.Url = CreatePromptPage(null);

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Prompt", driver.Title);
        }

        [Test]
        public void ShouldAllowAUserToSetTheValueOfAPrompt()
        {
            driver.Url = CreatePromptPage(null);

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.SendKeys("cheese");
            alert.Accept();

            string result = driver.FindElement(By.Id("text")).Text;
            Assert.AreEqual("cheese", result);
        }

        [Test]
        public void SettingTheValueOfAnAlertThrows()
        {
            driver.Url = CreateAlertPage("cheese");

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            try
            {
                alert.SendKeys("cheese");
                Assert.Fail("Expected exception");
            }
            catch (ElementNotInteractableException)
            {
            }
            finally
            {
                alert.Accept();
            }
        }

        [Test]
        public void ShouldAllowTheUserToGetTheTextOfAnAlert()
        {
            driver.Url = CreateAlertPage("cheese");

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("cheese", value);
        }

        [Test]
        public void ShouldAllowTheUserToGetTheTextOfAPrompt()
        {
            driver.Url = CreatePromptPage(null);

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("Enter something", value);
        }

        [Test]
        public void AlertShouldNotAllowAdditionalCommandsIfDimissed()
        {
            driver.Url = CreateAlertPage("cheese");

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();
            string text;
            Assert.That(() => text = alert.Text, Throws.InstanceOf<NoAlertPresentException>());
        }

        [Test]
        public void ShouldAllowUsersToAcceptAnAlertInAFrame()
        {
            string iframe = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithBody("<a href='#' id='alertInFrame' onclick='alert(\"framed cheese\");'>click me</a>"));
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithTitle("Testing Alerts")
                .WithBody(String.Format("<iframe src='{0}' name='iframeWithAlert'></iframe>", iframe)));

            driver.SwitchTo().Frame("iframeWithAlert");

            driver.FindElement(By.Id("alertInFrame")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        public void ShouldAllowUsersToAcceptAnAlertInANestedFrame()
        {
            string iframe = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithBody("<a href='#' id='alertInFrame' onclick='alert(\"framed cheese\");'>click me</a>"));
            string iframe2 = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithBody(string.Format("<iframe src='{0}' name='iframeWithAlert'></iframe>", iframe)));
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithTitle("Testing Alerts")
                .WithBody(string.Format("<iframe src='{0}' name='iframeWithIframe'></iframe>", iframe2)));

            driver.SwitchTo().Frame("iframeWithIframe").SwitchTo().Frame("iframeWithAlert");

            driver.FindElement(By.Id("alertInFrame")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        public void SwitchingToMissingAlertThrows()
        {
            driver.Url = CreateAlertPage("cheese");

            Assert.That(() => AlertToBePresent(), Throws.InstanceOf<NoAlertPresentException>());
        }

        [Test]
        public void SwitchingToMissingAlertInAClosedWindowThrows()
        {
            string blank = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage());
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithBody(String.Format(
                    "<a id='open-new-window' href='{0}' target='newwindow'>open new window</a>", blank)));

            string mainWindow = driver.CurrentWindowHandle;
            try
            {
                driver.FindElement(By.Id("open-new-window")).Click();
                WaitFor(WindowHandleCountToBe(2), "Window count was not 2");
                WaitFor(WindowWithName("newwindow"), "Could not find window with name 'newwindow'");
                driver.Close();
                WaitFor(WindowHandleCountToBe(1), "Window count was not 1");

                try
                {
                    AlertToBePresent().Accept();
                    Assert.Fail("Expected exception");
                }
                catch (NoSuchWindowException)
                {
                    // Expected
                }

            }
            finally
            {
                driver.SwitchTo().Window(mainWindow);
                WaitFor(ElementTextToEqual(driver.FindElement(By.Id("open-new-window")), "open new window"), "Could not find element with text 'open new window'");
            }
        }

        [Test]
        public void PromptShouldUseDefaultValueIfNoKeysSent()
        {
            driver.Url = CreatePromptPage("This is a default value");
            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            IWebElement element = driver.FindElement(By.Id("text"));
            WaitFor(ElementTextToEqual(element, "This is a default value"), "Element text was not 'This is a default value'");
            Assert.AreEqual("This is a default value", element.Text);
        }

        [Test]
        public void PromptShouldHaveNullValueIfDismissed()
        {
            driver.Url = CreatePromptPage("This is a default value");
            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();
            IWebElement element = driver.FindElement(By.Id("text"));
            WaitFor(ElementTextToEqual(element, "null"), "Element text was not 'null'");
            Assert.AreEqual("null", element.Text);
        }

        [Test]
        [IgnoreBrowser(Browser.Remote)]
        public void HandlesTwoAlertsFromOneInteraction()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithScripts(
                    "function setInnerText(id, value) {",
                    "  document.getElementById(id).innerHTML = '<p>' + value + '</p>';",
                    "}",
                    "function displayTwoPrompts() {",
                    "  setInnerText('text1', prompt('First'));",
                    "  setInnerText('text2', prompt('Second'));",
                    "}")
                .WithBody(
                    "<a href='#' id='double-prompt' onclick='displayTwoPrompts();'>click me</a>",
                    "<div id='text1'></div>",
                    "<div id='text2'></div>"));

            driver.FindElement(By.Id("double-prompt")).Click();

            IAlert alert1 = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert1.SendKeys("brie");
            alert1.Accept();

            IAlert alert2 = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert2.SendKeys("cheddar");
            alert2.Accept();

            IWebElement element1 = driver.FindElement(By.Id("text1"));
            WaitFor(ElementTextToEqual(element1, "brie"), "Element text was not 'brie'");
            Assert.AreEqual("brie", element1.Text);
            IWebElement element2 = driver.FindElement(By.Id("text2"));
            WaitFor(ElementTextToEqual(element2, "cheddar"), "Element text was not 'cheddar'");
            Assert.AreEqual("cheddar", element2.Text);
        }

        [Test]
        public void ShouldHandleAlertOnPageLoad()
        {
            string pageWithOnLoad = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithOnLoad("javascript:alert(\"onload\")")
                .WithBody("<p>Page with onload event handler</p>"));
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithBody(string.Format("<a id='open-page-with-onload-alert' href='{0}'>open new page</a>", pageWithOnLoad)));

            driver.FindElement(By.Id("open-page-with-onload-alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("onload", value);
            IWebElement element = driver.FindElement(By.TagName("p"));
            WaitFor(ElementTextToEqual(element, "Page with onload event handler"), "Element text was not 'Page with onload event handler'");
        }

        [Test]

        public void ShouldHandleAlertOnPageLoadUsingGet()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithOnLoad("javascript:alert(\"onload\")")
                .WithBody("<p>Page with onload event handler</p>"));

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("onload", value);
            WaitFor(ElementTextToEqual(driver.FindElement(By.TagName("p")), "Page with onload event handler"), "Could not find element with text 'Page with onload event handler'");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Test with onLoad alert hangs Chrome.")]
        [IgnoreBrowser(Browser.Edge, "Test with onLoad alert hangs Edge.")]
        [IgnoreBrowser(Browser.Safari, "Safari driver does not allow commands in any window when an alert is active")]
        public void ShouldNotHandleAlertInAnotherWindow()
        {
            string pageWithOnLoad = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithOnLoad("javascript:alert(\"onload\")")
                .WithBody("<p>Page with onload event handler</p>"));
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithBody(string.Format(
                    "<a id='open-new-window' href='{0}' target='newwindow'>open new window</a>", pageWithOnLoad)));

            string mainWindow = driver.CurrentWindowHandle;
            string onloadWindow = null;
            try
            {
                driver.FindElement(By.Id("open-new-window")).Click();
                List<String> allWindows = new List<string>(driver.WindowHandles);
                allWindows.Remove(mainWindow);
                Assert.AreEqual(1, allWindows.Count);
                onloadWindow = allWindows[0];

                try
                {
                    IWebElement el = driver.FindElement(By.Id("open-new-window"));
                    WaitFor<IAlert>(AlertToBePresent, TimeSpan.FromSeconds(5), "No alert found");
                    Assert.Fail("Expected exception");
                }
                catch (WebDriverException)
                {
                    // An operation timed out exception is expected,
                    // since we're using WaitFor<T>.
                }

            }
            finally
            {
                driver.SwitchTo().Window(onloadWindow);
                WaitFor<IAlert>(AlertToBePresent, "No alert found").Dismiss();
                driver.Close();
                driver.SwitchTo().Window(mainWindow);
                WaitFor(ElementTextToEqual(driver.FindElement(By.Id("open-new-window")), "open new window"), "Could not find element with text 'open new window'");
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "After version 27, Firefox does not trigger alerts on unload.")]
        [IgnoreBrowser(Browser.Chrome, "Chrome does not trigger alerts on unload.")]
        [IgnoreBrowser(Browser.Edge, "Edge does not trigger alerts on unload.")]
        [IgnoreBrowser(Browser.EdgeLegacy, "Edge does not trigger alerts on unload.")]
        public void ShouldHandleAlertOnPageUnload()
        {
            string pageWithOnBeforeUnload = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithOnBeforeUnload("return \"onunload\";")
                .WithBody("<p>Page with onbeforeunload event handler</p>"));
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithBody(string.Format("<a id='open-page-with-onunload-alert' href='{0}'>open new page</a>", pageWithOnBeforeUnload)));

            IWebElement element = WaitFor<IWebElement>(ElementToBePresent(By.Id("open-page-with-onunload-alert")), "Could not find element with id 'open-page-with-onunload-alert'");
            element.Click();
            driver.Navigate().Back();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("onunload", value);
            element = WaitFor<IWebElement>(ElementToBePresent(By.Id("open-page-with-onunload-alert")), "Could not find element with id 'open-page-with-onunload-alert'");
            WaitFor(ElementTextToEqual(element, "open new page"), "Element text was not 'open new page'");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Chrome does not implicitly handle onBeforeUnload alert")]
        [IgnoreBrowser(Browser.Edge, "Edge does not implicitly handle onBeforeUnload alert")]
        [IgnoreBrowser(Browser.Safari, "Safari driver does not implicitly (or otherwise) handle onBeforeUnload alerts")]
        [IgnoreBrowser(Browser.EdgeLegacy, "Edge driver does not implicitly (or otherwise) handle onBeforeUnload alerts")]
        public void ShouldImplicitlyHandleAlertOnPageBeforeUnload()
        {
            string blank = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage().WithTitle("Success"));
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithTitle("Page with onbeforeunload handler")
                .WithBody(String.Format(
                    "<a id='link' href='{0}'>Click here to navigate to another page.</a>", blank)));

            SetSimpleOnBeforeUnload("onbeforeunload message");

            driver.FindElement(By.Id("link")).Click();
            WaitFor(() => driver.Title == "Success", "Title was not 'Success'");
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Test as written does not trigger alert; also onbeforeunload alert on close will hang browser")]
        [IgnoreBrowser(Browser.Chrome, "Test as written does not trigger alert")]
        [IgnoreBrowser(Browser.Edge, "Test as written does not trigger alert")]
        [IgnoreBrowser(Browser.Firefox, "After version 27, Firefox does not trigger alerts on unload.")]
        [IgnoreBrowser(Browser.EdgeLegacy, "Edge does not trigger alerts on unload.")]
        public void ShouldHandleAlertOnWindowClose()
        {
            string pageWithOnBeforeUnload = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithOnBeforeUnload("javascript:alert(\"onbeforeunload\")")
                .WithBody("<p>Page with onbeforeunload event handler</p>"));
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithBody(string.Format(
                    "<a id='open-new-window' href='{0}' target='newwindow'>open new window</a>", pageWithOnBeforeUnload)));

            string mainWindow = driver.CurrentWindowHandle;
            try
            {
                driver.FindElement(By.Id("open-new-window")).Click();
                WaitFor(WindowHandleCountToBe(2), "Window count was not 2");
                WaitFor(WindowWithName("newwindow"), "Could not find window with name 'newwindow'");
                driver.Close();

                IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
                string value = alert.Text;
                alert.Accept();

                Assert.AreEqual("onbeforeunload", value);

            }
            finally
            {
                driver.SwitchTo().Window(mainWindow);
                WaitFor(ElementTextToEqual(driver.FindElement(By.Id("open-new-window")), "open new window"), "Could not find element with text equal to 'open new window'");
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Driver chooses not to return text from unhandled alert")]
        [IgnoreBrowser(Browser.Edge, "Driver chooses not to return text from unhandled alert")]
        [IgnoreBrowser(Browser.EdgeLegacy, "Driver chooses not to return text from unhandled alert")]
        [IgnoreBrowser(Browser.Firefox, "Driver chooses not to return text from unhandled alert")]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.Safari, "Safari driver does not do unhandled alerts")]
        public void IncludesAlertTextInUnhandledAlertException()
        {
            driver.Url = CreateAlertPage("cheese");

            driver.FindElement(By.Id("alert")).Click();
            WaitFor<IAlert>(AlertToBePresent, "No alert found");
            try
            {
                string title = driver.Title;
                Assert.Fail("Expected UnhandledAlertException");
            }
            catch (UnhandledAlertException e)
            {
                Assert.AreEqual("cheese", e.AlertText);
            }
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Browser.Opera)]
        public void CanQuitWhenAnAlertIsPresent()
        {
            driver.Url = CreateAlertPage("cheese");
            driver.FindElement(By.Id("alert")).Click();
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            EnvironmentManager.Instance.CloseCurrentDriver();
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "Safari driver cannot handle alert thrown via JavaScript")]
        public void ShouldHandleAlertOnFormSubmit()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithTitle("Testing Alerts").
                WithBody("<form id='theForm' action='javascript:alert(\"Tasty cheese\");'>",
                    "<input id='unused' type='submit' value='Submit'>",
                    "</form>"));

            IWebElement element = driver.FindElement(By.Id("theForm"));
            element.Submit();
            IAlert alert = driver.SwitchTo().Alert();
            string text = alert.Text;
            alert.Accept();

            Assert.AreEqual("Tasty cheese", text);
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        [IgnoreBrowser(Browser.Safari, "onBeforeUnload dialogs hang Safari")]
        public void ShouldHandleAlertOnPageBeforeUnload()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("pageWithOnBeforeUnloadMessage.html");
            IWebElement element = driver.FindElement(By.Id("navigate"));
            element.Click();
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();
            Assert.That(driver.Url, Does.Contain("pageWithOnBeforeUnloadMessage.html"));

            // Can't move forward or even quit the driver
            // until the alert is accepted.
            element.Click();
            alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();
            WaitFor(() => { return driver.Url.Contains(alertsPage); }, "Browser URL does not contain " + alertsPage);
            Assert.That(driver.Url, Does.Contain(alertsPage));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Browser.Safari, "onBeforeUnload dialogs hang Safari")]
        public void ShouldHandleAlertOnPageBeforeUnloadAlertAtQuit()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("pageWithOnBeforeUnloadMessage.html");
            IWebElement element = driver.FindElement(By.Id("navigate"));
            element.Click();
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");

            // CloserCurrentDriver() contains a call to driver.Quit()
            EnvironmentManager.Instance.CloseCurrentDriver();
        }

        // Disabling test for all browsers. Authentication API is not supported by any driver yet.
        // [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Edge)]
        [IgnoreBrowser(Browser.EdgeLegacy)]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.IE)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldBeAbleToHandleAuthenticationDialog()
        {
            driver.Url = authenticationPage;
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.SetAuthenticationCredentials("test", "test");
            alert.Accept();
            Assert.That(driver.FindElement(By.TagName("h1")).Text, Does.Contain("authorized"));
        }

        // Disabling test for all browsers. Authentication API is not supported by any driver yet.
        // [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Edge)]
        [IgnoreBrowser(Browser.EdgeLegacy)]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.IE)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldBeAbleToDismissAuthenticationDialog()
        {
            driver.Url = authenticationPage;
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();
        }

        // Disabling test for all browsers. Authentication API is not supported by any driver yet.
        // [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Edge)]
        [IgnoreBrowser(Browser.EdgeLegacy)]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldThrowAuthenticatingOnStandardAlert()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.Id("alert")).Click();
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            try
            {
                alert.SetAuthenticationCredentials("test", "test");
                Assert.Fail("Should not be able to Authenticate");
            }
            catch (UnhandledAlertException)
            {
                // this is an expected exception
            }

            // but the next call should be good.
            alert.Dismiss();
        }

        private IAlert AlertToBePresent()
        {
            return driver.SwitchTo().Alert();
        }

        private string CreateAlertPage(string alertText)
        {
            return EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithTitle("Testing Alerts")
                .WithBody("<a href='#' id='alert' onclick='alert(\"" + alertText + "\");'>click me</a>"));
        }

        private string CreatePromptPage(string defaultText)
        {
            return EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
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
            ((IJavaScriptExecutor)driver).ExecuteScript(
                "var returnText = arguments[0]; window.onbeforeunload = function() { return returnText; }",
                returnText);
        }

        private Func<IWebElement> ElementToBePresent(By locator)
        {
            return () =>
            {
                IWebElement foundElement = null;
                try
                {
                    foundElement = driver.FindElement(By.Id("open-page-with-onunload-alert"));
                }
                catch (NoSuchElementException)
                {
                }

                return foundElement;
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
                    driver.SwitchTo().Window(name);
                    return true;
                }
                catch (NoSuchWindowException)
                {
                }

                return false;
            };
        }

        private Func<bool> WindowHandleCountToBe(int count)
        {
            return () =>
            {
                return driver.WindowHandles.Count == count;
            };
        }

    }
}

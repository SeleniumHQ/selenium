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
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldBeAbleToOverrideTheWindowAlertMethod()
        {
            driver.Url = alertsPage;

            ((IJavaScriptExecutor)driver).ExecuteScript(
                "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
            driver.FindElement(By.Id("alert")).Click();
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldAllowUsersToAcceptAnAlertManually()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldAllowUsersToAcceptAnAlertWithNoTextManually()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("empty-alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldGetTextOfAlertOpenedInSetTimeout()
        {
            driver.Url = alertsPage;

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
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldAllowUsersToDismissAnAlertManually()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldAllowAUserToAcceptAPrompt()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldAllowAUserToDismissAPrompt()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldAllowAUserToSetTheValueOfAPrompt()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.SendKeys("cheese");
            alert.Accept();

            string result = driver.FindElement(By.Id("text")).Text;
            Assert.AreEqual("cheese", result);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Chrome, "Chrome does not throw when setting the text of an alert")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void SettingTheValueOfAnAlertThrows()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            try
            {
                alert.SendKeys("cheese");
                Assert.Fail("Expected exception");
            }
            catch (ElementNotVisibleException)
            {
            }
            finally
            {
                alert.Accept();
            }
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldAllowTheUserToGetTheTextOfAnAlert()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("cheese", value);
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldAllowTheUserToGetTheTextOfAPrompt()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("Enter something", value);
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void AlertShouldNotAllowAdditionalCommandsIfDimissed()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();
            string text;
            Assert.Throws<NoAlertPresentException>(() => text = alert.Text);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldAllowUsersToAcceptAnAlertInAFrame()
        {
            driver.Url = alertsPage;
            driver.SwitchTo().Frame("iframeWithAlert");

            driver.FindElement(By.Id("alertInFrame")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldAllowUsersToAcceptAnAlertInANestedFrame()
        {
            driver.Url = alertsPage;

            driver.SwitchTo().Frame("iframeWithIframe").SwitchTo().Frame("iframeWithAlert");

            driver.FindElement(By.Id("alertInFrame")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void SwitchingToMissingAlertThrows()
        {
            driver.Url = alertsPage;

            Assert.Throws<NoAlertPresentException>(() => AlertToBePresent());
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Chrome, "Issue 2764")]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void SwitchingToMissingAlertInAClosedWindowThrows()
        {
            driver.Url = alertsPage;
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
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void PromptShouldUseDefaultValueIfNoKeysSent()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.Id("prompt-with-default")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();

            IWebElement element = driver.FindElement(By.Id("text"));
            WaitFor(ElementTextToEqual(element, "This is a default value"), "Element text was not 'This is a default value'");
            Assert.AreEqual("This is a default value", element.Text);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void PromptShouldHaveNullValueIfDismissed()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.Id("prompt-with-default")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();
            IWebElement element = driver.FindElement(By.Id("text"));
            WaitFor(ElementTextToEqual(element, "null"), "Element text was not 'null'");
            Assert.AreEqual("null", element.Text);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void HandlesTwoAlertsFromOneInteraction()
        {
            driver.Url = alertsPage;
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
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldHandleAlertOnPageLoad()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("open-page-with-onload-alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("onload", value);
            IWebElement element = driver.FindElement(By.TagName("p"));
            WaitFor(ElementTextToEqual(element, "Page with onload event handler"), "Element text was not 'Page with onload event handler'");
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldHandleAlertOnPageLoadUsingGet()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("pageWithOnLoad.html");

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("onload", value);
            WaitFor(ElementTextToEqual(driver.FindElement(By.TagName("p")), "Page with onload event handler"), "Could not find element with text 'Page with onload event handler'");
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Firefox, "Firefox waits too long, may be hangs")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldNotHandleAlertInAnotherWindow()
        {
            driver.Url = alertsPage;

            string mainWindow = driver.CurrentWindowHandle;
            string onloadWindow = null;
            try
            {
                driver.FindElement(By.Id("open-window-with-onload-alert")).Click();
                List<String> allWindows = new List<string>(driver.WindowHandles);
                allWindows.Remove(mainWindow);
                Assert.AreEqual(1, allWindows.Count);
                onloadWindow = allWindows[0];

                try
                {
                    IWebElement el = driver.FindElement(By.Id("open-page-with-onunload-alert"));
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
                WaitFor(ElementTextToEqual(driver.FindElement(By.Id("open-window-with-onload-alert")), "open new window"), "Could not find element with text 'open new window'");
            }
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Firefox, "After version 27, Firefox does not trigger alerts on unload.")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldHandleAlertOnPageUnload()
        {
            driver.Url = alertsPage;

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
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android, "alerts do not pop up when a window is closed")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Firefox, "After version 27, Firefox does not trigger alerts on unload.")]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldHandleAlertOnWindowClose()
        {
            driver.Url = alertsPage;

            string mainWindow = driver.CurrentWindowHandle;
            try
            {
                driver.FindElement(By.Id("open-window-with-onclose-alert")).Click();
                WaitFor(WindowHandleCountToBe(2), "Window count was not 2");
                WaitFor(WindowWithName("onclose"), "Could not find window with name 'onclose'");
                driver.Close();

                IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
                string value = alert.Text;
                alert.Accept();

                Assert.AreEqual("onunload", value);

            }
            finally
            {
                driver.SwitchTo().Window(mainWindow);
                WaitFor(ElementTextToEqual(driver.FindElement(By.Id("open-window-with-onclose-alert")), "open new window"), "Could not find element with text equal to 'open new window'");
            }
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void IncludesAlertTextInUnhandledAlertException()
        {
            driver.Url = alertsPage;

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
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void CanQuitWhenAnAlertIsPresent()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.Id("alert")).Click();
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            EnvironmentManager.Instance.CloseCurrentDriver();
        }

        [Test]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldHandleOnBeforeUnloadAlert()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("pageWithOnBeforeUnloadMessage.html");
            IWebElement element = driver.FindElement(By.Id("navigate"));
            element.Click();
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();
            Assert.IsTrue(driver.Url.Contains("pageWithOnBeforeUnloadMessage.html"));

            // Can't move forward or even quit the driver
            // until the alert is accepted.
            element.Click();
            alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Accept();
            WaitFor(() => { return driver.Url.Contains(alertsPage); }, "Browser URL does not contain " + alertsPage);
            Assert.IsTrue(driver.Url.Contains(alertsPage));
        }

        [Test]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void ShouldHandleOnBeforeUnloadAlertAtClose()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("pageWithOnBeforeUnloadMessage.html");
            IWebElement element = driver.FindElement(By.Id("navigate"));
            element.Click();
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            driver.Quit();
            driver = null;
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldThrowAnExceptionIfAnAlertHasNotBeenDealtWithAndDismissTheAlert()
        {
            IHasCapabilities capabilitiesDriver = driver as IHasCapabilities;
            if (driver == null)
            {
                Assert.Ignore("Cannot get ICapabilities from driver");
            }
            else
            {
                if (!capabilitiesDriver.Capabilities.HasCapability(CapabilityType.UnexpectedAlertBehavior))
                {
                    Assert.Ignore("Driver does not support automatic handling of unexpected alerts");
                }
                else
                {
                    string alertBehavior = capabilitiesDriver.Capabilities.GetCapability(CapabilityType.UnexpectedAlertBehavior).ToString().ToLower();
                    if (alertBehavior != "dismiss")
                    {
                        Assert.Ignore("unexpectedAlertBehaviour capability not set to 'dismiss'");
                    }
                }
            }

            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            try
            {
                string title = driver.Title;
                Assert.Fail("Expected exception");
            }
            catch (UnhandledAlertException)
            {
                // this is an expected exception
            }

            // but the next call should be good.
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Edge)]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IE)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldBeAbleToHandleAuthenticationDialog()
        {
            driver.Url = authenticationPage;
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.SetAuthenticationCredentials("test", "test");
            alert.Accept();
            Assert.IsTrue(driver.FindElement(By.TagName("h1")).Text.Contains("authorized"));
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Edge)]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IE)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
        public void ShouldBeAbleToDismissAuthenticationDialog()
        {
            driver.Url = authenticationPage;
            IAlert alert = WaitFor<IAlert>(AlertToBePresent, "No alert found");
            alert.Dismiss();
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Edge)]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [IgnoreBrowser(Browser.WindowsPhone, "Alert handling not yet implemented on Windows Phone")]
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
                    catch(NoSuchWindowException)
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

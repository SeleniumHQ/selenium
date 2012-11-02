using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System.Collections.ObjectModel;

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
        public void ShouldAllowUsersToAcceptAnAlertManually()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
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
        public void ShouldAllowUsersToAcceptAnAlertWithNoTextManually()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("empty-alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
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
        public void ShouldAllowUsersToDismissAnAlertManually()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
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
        public void ShouldAllowAUserToAcceptAPrompt()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
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
        public void ShouldAllowAUserToDismissAPrompt()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
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
        public void ShouldAllowAUserToSetTheValueOfAPrompt()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
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
        public void SettingTheValueOfAnAlertThrows()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
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
        public void ShouldAllowTheUserToGetTheTextOfAnAlert()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("cheese", value);
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.IE, "Issue number 4594")]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldAllowTheUserToGetTheTextOfAPrompt()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("Enter something", value);
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Chrome, "ChromeDriver.exe returns a JSON response with no status code")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [ExpectedException(typeof(NoAlertPresentException))]
        public void AlertShouldNotAllowAdditionalCommandsIfDimissed()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            alert.Dismiss();
            string text = alert.Text;
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldAllowUsersToAcceptAnAlertInAFrame()
        {
            driver.Url = alertsPage;
            driver.SwitchTo().Frame("iframeWithAlert");

            driver.FindElement(By.Id("alertInFrame")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        public void ShouldAllowUsersToAcceptAnAlertInANestedFrame()
        {
            driver.Url = alertsPage;

            driver.SwitchTo().Frame("iframeWithIframe").SwitchTo().Frame("iframeWithAlert");

            driver.FindElement(By.Id("alertInFrame")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        public void ShouldThrowAnExceptionIfAnAlertHasNotBeenDealtWithAndDismissTheAlert()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
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
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Chrome, "ChromeDriver.exe returns a JSON response with no status code")]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        [ExpectedException(typeof(NoAlertPresentException))]
        public void SwitchingToMissingAlertThrows()
        {
            driver.Url = alertsPage;

            AlertToBePresent();
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void PromptShouldUseDefaultValueIfNoKeysSent()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.Id("prompt-with-default")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            alert.Accept();

            IWebElement element = driver.FindElement(By.Id("text"));
            WaitFor(ElementTextToEqual(element, "This is a default value"));
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
        public void PromptShouldHaveNullValueIfDismissed()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.Id("prompt-with-default")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            alert.Dismiss();
            IWebElement element = driver.FindElement(By.Id("text"));
            WaitFor(ElementTextToEqual(element, "null"));
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
        public void HandlesTwoAlertsFromOneInteraction()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.Id("double-prompt")).Click();

            IAlert alert1 = WaitFor<IAlert>(AlertToBePresent);
            alert1.SendKeys("brie");
            alert1.Accept();

            IAlert alert2 = WaitFor<IAlert>(AlertToBePresent);
            alert2.SendKeys("cheddar");
            alert2.Accept();

            IWebElement element1 = driver.FindElement(By.Id("text1"));
            WaitFor(ElementTextToEqual(element1, "brie"));
            Assert.AreEqual("brie", element1.Text);
            IWebElement element2 = driver.FindElement(By.Id("text2"));
            WaitFor(ElementTextToEqual(element2, "cheddar"));
            Assert.AreEqual("cheddar", element2.Text);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        public void ShouldHandleAlertOnPageLoad()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("open-page-with-onload-alert")).Click();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("onload", value);
            IWebElement element = driver.FindElement(By.TagName("p"));
            WaitFor(ElementTextToEqual(element, "Page with onload event handler"));
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        public void ShouldHandleAlertOnPageLoadUsingGet()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("pageWithOnLoad.html");

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("onload", value);
            WaitFor(ElementTextToEqual(driver.FindElement(By.TagName("p")), "Page with onload event handler"));
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Firefox, "Firefox waits too long, may be hangs")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
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
                    WaitFor<IAlert>(AlertToBePresent, TimeSpan.FromSeconds(5));
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
                WaitFor<IAlert>(AlertToBePresent).Dismiss();
                driver.Close();
                driver.SwitchTo().Window(mainWindow);
                WaitFor(ElementTextToEqual(driver.FindElement(By.Id("open-window-with-onload-alert")), "open new window"));
            }
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        [IgnoreBrowser(Browser.Chrome)]
        public void ShouldHandleAlertOnPageUnload()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("open-page-with-onunload-alert")).Click();
            driver.Navigate().Back();

            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("onunload", value);
            WaitFor(ElementTextToEqual(driver.FindElement(By.Id("open-page-with-onunload-alert")), "open new page"));
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android, "alerts do not pop up when a window is closed")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        public void ShouldHandleAlertOnWindowClose()
        {
            driver.Url = alertsPage;

            string mainWindow = driver.CurrentWindowHandle;
            try
            {
                driver.FindElement(By.Id("open-window-with-onclose-alert")).Click();
                WaitFor(WindowHandleCountToBe(2));
                WaitFor(WindowWithName("onclose"));
                driver.Close();

                IAlert alert = WaitFor<IAlert>(AlertToBePresent);
                string value = alert.Text;
                alert.Accept();

                Assert.AreEqual("onunload", value);

            }
            finally
            {
                driver.SwitchTo().Window(mainWindow);
                WaitFor(ElementTextToEqual(driver.FindElement(By.Id("open-window-with-onclose-alert")), "open new window"));
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
        public void IncludesAlertInUnhandledAlertException()
        {
            driver.Url = alertsPage;

            driver.FindElement(By.Id("alert")).Click();
            WaitFor<IAlert>(AlertToBePresent);
            try
            {
                string title = driver.Title;
                Assert.Fail("Expected UnhandledAlertException");
            }
            catch (UnhandledAlertException e)
            {
                IAlert alert = e.Alert;
                Assert.NotNull(alert);
                Assert.AreEqual("cheese", alert.Text);
            }
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        public void CanQuitWhenAnAlertIsPresent()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.Id("alert")).Click();
            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            EnvironmentManager.Instance.CloseCurrentDriver();
        }

        [Test]
        [IgnoreBrowser(Browser.PhantomJS, "Alert commands not yet implemented in GhostDriver")]
        public void ShouldHandleOnBeforeUnloadAlert()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("onBeforeUnload.html");
            IWebElement element = driver.FindElement(By.Id("navigate"));
            element.Click();
            IAlert alert = WaitFor<IAlert>(AlertToBePresent);
            alert.Dismiss();
            Assert.IsTrue(driver.Url.Contains("onBeforeUnload.html"));

            // Can't move forward or even quit the driver
            // until the alert is accepted.
            element.Click();
            alert.Accept();
            WaitFor(() => { return driver.Url.Contains(alertsPage); });
            Assert.IsTrue(driver.Url.Contains(alertsPage));
        }

        private IAlert AlertToBePresent()
        {
            return driver.SwitchTo().Alert();
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

using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class AlertsTest : DriverTestFixture
    {
        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldBeAbleToOverrideTheWindowAlertMethod()
        {
            driver.Url = alertPage;

            ((IJavaScriptExecutor)driver).ExecuteScript(
                "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
            driver.FindElement(By.Id("alert")).Click();
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldAllowUsersToAcceptAnAlertManually()
        {
            driver.Url = alertPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = driver.SwitchTo().Alert();
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldAllowUsersToDismissAnAlertManually()
        {
            driver.Url = alertPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = driver.SwitchTo().Alert();
            alert.Dismiss();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldAllowAUserToAcceptAPrompt()
        {
            driver.Url = alertPage;

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = driver.SwitchTo().Alert();
            alert.Accept();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldAllowAUserToDismissAPrompt()
        {
            driver.Url = alertPage;

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = driver.SwitchTo().Alert();
            alert.Dismiss();

            // If we can perform any action, we're good to go
            Assert.AreEqual("Testing Alerts", driver.Title);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void testShouldAllowAUserToSetTheValueOfAPrompt()
        {
            driver.Url = alertPage;

            driver.FindElement(By.Id("prompt")).Click();

            IAlert alert = driver.SwitchTo().Alert();
            alert.SendKeys("cheese");
            alert.Accept();

            string result = driver.FindElement(By.Id("text")).Text;
            Assert.AreEqual("cheese", result);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void testShouldAllowTheUserToGetTheTextOfAnAlert()
        {
            driver.Url = alertPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = driver.SwitchTo().Alert();
            string value = alert.Text;
            alert.Accept();

            Assert.AreEqual("cheese", value);
        }

        [Test]
        [Ignore]
        [ExpectedException(typeof(InvalidOperationException))]
        public void ShouldThrowAnExceptionIfAnAlertHasNotBeenDealtWith()
        {
            driver.Url = alertPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = driver.SwitchTo().Alert();
            try
            {
                string title = driver.Title;
            }
            catch (InvalidOperationException)
            {
                // this is an expected exception
            }

            // but the next call should be good.
            Assert.AreEqual("Testing Alerts", driver.Title);
        }


        [Test]
        [Ignore]
        [ExpectedException(typeof(NoAlertPresentException))]
        public void AlertShouldNotAllowAdditionalCommandsIfDimissed()
        {
            driver.Url = alertPage;

            driver.FindElement(By.Id("alert")).Click();

            IAlert alert = driver.SwitchTo().Alert();
            alert.Dismiss();
            string text = alert.Text;
        }

        //private Alert switchToAlert(WebDriver driver) {
        // IWebDriver.TargetLocator locator = driver.SwitchTo();

        //  try {
        //    Method alertMethod = locator.getClass().getMethod("alert");
        //    alertMethod.setAccessible(true);
        //    return (Alert) alertMethod.invoke(locator);
        //  } catch (Exception e) {
        //    e.printStackTrace();
        //  }
        //  return null;
        //}
        //  }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ClickTest : DriverTestFixture
    {
        [SetUp]
        public void SetupMethod()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("clicks.html");
        }

        [TearDown]
        public void TearDownMethod()
        {
            driver.SwitchTo().DefaultContent();
        }

        [Test]
        public void CanClickOnALinkAndFollowIt()
        {
            driver.FindElement(By.Id("normal")).Click();

            Assert.AreEqual("XHTML Test Page", driver.Title);
        }

        [Test]
        [Category("Javascript")]
        public void CanClickOnAnAnchorAndNotReloadThePage()
        {
            ((IJavaScriptExecutor)driver).ExecuteScript("document.latch = true");

            driver.FindElement(By.Id("anchor")).Click();

            bool samePage = (bool)((IJavaScriptExecutor)driver).ExecuteScript("return document.latch");

            Assert.AreEqual(true, samePage, "Latch was reset");
        }

        [Test]
        [IgnoreBrowser(Browser.IPhone, "Frame switching is unsupported")]
        public void CanClickOnALinkThatUpdatesAnotherFrame()
        {
            driver.SwitchTo().Frame("source");

            driver.FindElement(By.Id("otherframe")).Click();
            driver.SwitchTo().DefaultContent().SwitchTo().Frame("target");

            Assert.IsTrue(driver.PageSource.Contains("Hello WebDriver"), "Target did not reload");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IPhone, "Frame switching is unsupported")]
        public void ElementsFoundByJsCanLoadUpdatesInAnotherFrame()
        {
            driver.SwitchTo().Frame("source");

            IWebElement toClick = (IWebElement)((IJavaScriptExecutor)driver).ExecuteScript("return document.getElementById('otherframe');");
            toClick.Click();
            driver.SwitchTo().DefaultContent().SwitchTo().Frame("target");

            Assert.IsTrue(driver.PageSource.Contains("Hello WebDriver"), "Target did not reload");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IPhone, "Frame switching is unsupported")]
        public void JsLoactedElementsCanUpdateFramesIfFoundSomehowElse()
        {
            driver.SwitchTo().Frame("source");

            // Prime the cache of elements
            driver.FindElement(By.Id("otherframe"));

            // This _should_ return the same element
            IWebElement toClick = (IWebElement)((IJavaScriptExecutor)driver).ExecuteScript("return document.getElementById('otherframe');");
            toClick.Click();
            driver.SwitchTo().DefaultContent().SwitchTo().Frame("target");

            Assert.IsTrue(driver.PageSource.Contains("Hello WebDriver"), "Target did not reload");
        }
    }
}

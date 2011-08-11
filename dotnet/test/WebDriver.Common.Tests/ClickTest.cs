using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NUnit.Framework;
using OpenQA.Selenium.Environment;
using OpenQA.Selenium.Remote;

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
        public void JsLocatedElementsCanUpdateFramesIfFoundSomehowElse()
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

        [Test]
        [Category("JavaScript")]
        public void CanClickOnAnElementWithTopSetToANegativeNumber()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("styledPage.html");
            IWebElement searchBox = driver.FindElement(By.Name("searchBox"));
            searchBox.SendKeys("Cheese");
            driver.FindElement(By.Name("btn")).Click();

            string log = driver.FindElement(By.Id("log")).Text;
            Assert.AreEqual("click", log);
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldSetRelatedTargetForMouseOver()
        {
            driver.Url = javascriptPage;

            driver.FindElement(By.Id("movable")).Click();

            string log = driver.FindElement(By.Id("result")).Text;

            // Note: It is not guaranteed that the relatedTarget property of the mouseover
            // event will be the parent, when using native events. Only check that the mouse
            // has moved to this element, not that the parent element was the related target.
            if (this.IsNativeEventsEnabled(driver))
            {
                Assert.IsTrue(log.StartsWith("parent matches?"), "Should have moved to this element.");
            }
            else
            {
                Assert.AreEqual("parent matches? true", log);
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "Firefox has not corrected")]
        [IgnoreBrowser(Browser.Chrome, "Chrome has not corrected")]
        public void ShouldBeAbleToClickLinkContainingLineBreak()
        {
            driver.Url = simpleTestPage;
            driver.FindElement(By.Id("multilinelink")).Click();
            Assert.AreEqual("We Arrive Here", driver.Title);
        }

        [Test]
        [Ignore]
        public void ShouldSetRelatedTargetForMouseOut()
        {
            Assert.Fail("Must. Write. Meamingful. Test (but we don't fire mouse outs synthetically");
        }

        private bool IsNativeEventsEnabled(IWebDriver driver)
        {
            IHasCapabilities capabilitiesDriver = driver as IHasCapabilities;
            if (capabilitiesDriver != null && capabilitiesDriver.Capabilities.HasCapability(CapabilityType.HasNativeEvents) && (bool)capabilitiesDriver.Capabilities.GetCapability(CapabilityType.HasNativeEvents))
            {
                return true;
            }

            return false;
        }
    }
}

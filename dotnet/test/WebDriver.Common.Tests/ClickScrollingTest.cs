using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ClickScrollingTest : DriverTestFixture
    {
        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.HtmlUnit, "scrolling requires rendering")]
        public void ClickingOnAnchorScrollsPage()
        {
            string scrollScript = "var pageY;";
            scrollScript += "if (typeof(window.pageYOffset) == 'number') {";
            scrollScript += "pageY = window.pageYOffset;";
            scrollScript += "} else {";
            scrollScript += "pageY = document.documentElement.scrollTop;";
            scrollScript += "}";
            scrollScript += "return pageY;";

            driver.Url = macbethPage;

            driver.FindElement(By.PartialLinkText("last speech")).Click();

            long yOffset = (long)((IJavaScriptExecutor)driver).ExecuteScript(scrollScript);

            //Focusing on to click, but not actually following,
            //the link will scroll it in to view, which is a few pixels further than 0 
            Assert.Greater(yOffset, 300, "Did not scroll");
        }

        [Test]
        [Ignore]
        // TODO(jimevans): unignore
        public void ShouldNotScrollIfAlreadyScrolledAndElementIsInView()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll3.html");
            driver.FindElement(By.Id("button1")).Click();
            long scrollTop = GetScrollTop();
            driver.FindElement(By.Id("button2")).Click();
            Assert.AreEqual(scrollTop, GetScrollTop());
        }

        private long GetScrollTop()
        {
            return (long)((IJavaScriptExecutor)driver).ExecuteScript("return document.body.scrollTop;");
        }
    }
}

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
        [IgnoreBrowser(Browser.Chrome, "Webkit-based browsers apparently scroll anyway.")]
        [IgnoreBrowser(Browser.IPhone, "Webkit-based browsers apparently scroll anyway.")]
        [IgnoreBrowser(Browser.Safari, "Webkit-based browsers apparently scroll anyway.")]
        [IgnoreBrowser(Browser.PhantomJS, "Webkit-based browsers apparently scroll anyway.")]
        public void ShouldNotScrollIfAlreadyScrolledAndElementIsInView()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll3.html");
            driver.FindElement(By.Id("button1")).Click();
            long scrollTop = GetScrollTop();
            driver.FindElement(By.Id("button2")).Click();
            Assert.AreEqual(scrollTop, GetScrollTop());
        }

        [Test]
        public void ShouldScrollToClickOnAnElementHiddenByOverflow()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_out_of_bounds_overflow.html");
            driver.Url = url;

            IWebElement link = driver.FindElement(By.Id("link"));
            link.Click();
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        public void ShouldBeAbleToClickOnAnElementHiddenByOverflow()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll.html");

            IWebElement link = driver.FindElement(By.Id("line8"));
            // This used to throw a MoveTargetOutOfBoundsException - we don't expect it to
            link.Click();
            Assert.AreEqual("line8", driver.FindElement(By.Id("clicked")).Text);
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldNotScrollOverflowElementsWhichAreVisible()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll2.html");
            IWebElement list = driver.FindElement(By.TagName("ul"));
            IWebElement item = list.FindElement(By.Id("desired"));
            item.Click();
            long yOffset = (long)((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0].scrollTop;", list);
            Assert.AreEqual(0, yOffset, "Should not have scrolled");
        }

        [Test]
        public void ShouldBeAbleToClickRadioButtonScrolledIntoView()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll4.html");
            driver.FindElement(By.Id("radio")).Click();
            // If we don't throw, we're good
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE has special overflow handling")]
        public void ShouldScrollOverflowElementsIfClickPointIsOutOfViewButElementIsInView()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll5.html");
            driver.FindElement(By.Id("inner")).Click();
            Assert.AreEqual("clicked", driver.FindElement(By.Id("clicked")).Text);
        }

        private long GetScrollTop()
        {
            return (long)((IJavaScriptExecutor)driver).ExecuteScript("return document.body.scrollTop;");
        }
    }
}

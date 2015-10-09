using System;
using System.Collections.Generic;
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
            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual("XHTML Test Page", driver.Title);
        }

        [Test]
        [IgnoreBrowser(Browser.Opera, "Not tested")]
        public void CanClickOnALinkThatOverflowsAndFollowIt()
        {
            driver.FindElement(By.Id("overflowLink")).Click();

            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
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
        public void ShouldClickOnFirstBoundingClientRectWithNonZeroSize()
        {
            driver.FindElement(By.Id("twoClientRects")).Click();
            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual("XHTML Test Page", driver.Title);
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
            if (this.IsNativeEventsEnabled)
            {
                Assert.IsTrue(log.StartsWith("parent matches?"), "Should have moved to this element.");
            }
            else
            {
                Assert.AreEqual("parent matches? true", log);
            }
        }

        [Test]
        [Category("JavaScript")]
        [NeedsFreshDriver(AfterTest = true)]
        [IgnoreBrowser(Browser.IPhone, "Doesn't support multiple windows")]
        [IgnoreBrowser(Browser.WindowsPhone, "Doesn't support multiple windows")]
        [IgnoreBrowser(Browser.Opera, "Doesn't support multiple windows")]
        [IgnoreBrowser(Browser.Safari, "Doesn't support multiple windows; Safari: issue 3693")]
        public void ShouldOnlyFollowHrefOnce()
        {
            driver.Url = clicksPage;
            int windowHandlesBefore = driver.WindowHandles.Count;

            driver.FindElement(By.Id("new-window")).Click();
            WaitFor(() => { return driver.WindowHandles.Count >= windowHandlesBefore + 1; }, "Window handles was not " + (windowHandlesBefore + 1).ToString());
            Assert.AreEqual(windowHandlesBefore + 1, driver.WindowHandles.Count);
        }

        [Test]
        [Ignore("Ignored for all browsers")]
        public void ShouldSetRelatedTargetForMouseOut()
        {
            Assert.Fail("Must. Write. Meamingful. Test (but we don't fire mouse outs synthetically");
        }

        [Test]
        [IgnoreBrowser(Browser.WindowsPhone)]
        public void ClickingLabelShouldSetCheckbox()
        {
            driver.Url = formsPage;

            driver.FindElement(By.Id("label-for-checkbox-with-label")).Click();

            Assert.IsTrue(driver.FindElement(By.Id("checkbox-with-label")).Selected, "Should be selected");
        }

        [Test]
        public void CanClickOnALinkWithEnclosedImage()
        {
            driver.FindElement(By.Id("link-with-enclosed-image")).Click();
            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual("XHTML Test Page", driver.Title);
        }

        [Test]
        public void CanClickOnAnImageEnclosedInALink()
        {
            driver.FindElement(By.Id("link-with-enclosed-image")).FindElement(By.TagName("img")).Click();
            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual("XHTML Test Page", driver.Title);
        }

        [Test]
        public void CanClickOnALinkThatContainsTextWrappedInASpan()
        {
            driver.FindElement(By.Id("link-with-enclosed-span")).Click();
            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual("XHTML Test Page", driver.Title);
        }

        [Test]
        public void CanClickOnALinkThatContainsEmbeddedBlockElements()
        {
            driver.FindElement(By.Id("embeddedBlock")).Click();
            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual("XHTML Test Page", driver.Title);
        }

        [Test]
        public void CanClickOnAnElementEnclosedInALink()
        {
            driver.FindElement(By.Id("link-with-enclosed-span")).FindElement(By.TagName("span")).Click();
            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual("XHTML Test Page", driver.Title);
        }

        [Test]
        public void ShouldBeAbleToClickLinkContainingLineBreak()
        {
            driver.Url = simpleTestPage;
            driver.FindElement(By.Id("multilinelink")).Click();
            WaitFor(() => { return driver.Title == "We Arrive Here"; }, "Browser title was not 'We Arrive Here'");
            Assert.AreEqual("We Arrive Here", driver.Title);
        }

        // See http://code.google.com/p/selenium/issues/attachmentText?id=2700
        [Test]
        public void ShouldBeAbleToClickOnAnElementInTheViewport()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_out_of_bounds.html");

            driver.Url = url;
            IWebElement button = driver.FindElement(By.Id("button"));
            button.Click();
        }

        [Test]
        public void ClicksASurroundingStrongTag()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("ClickTest_testClicksASurroundingStrongTag.html");
            driver.FindElement(By.TagName("a")).Click();
            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Element is not clickable")]
        [IgnoreBrowser(Browser.IE, "Map click fails")]
        [IgnoreBrowser(Browser.Opera, "Map click fails")]
        [IgnoreBrowser(Browser.Android, "Not tested")]
        [IgnoreBrowser(Browser.IPhone, "Not tested")]
        public void CanClickAnImageMapArea()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/google_map.html");
            driver.FindElement(By.Id("rectG")).Click();
            WaitFor(() => { return driver.Title == "Target Page 1"; }, "Browser title was not 'Target Page 1'");

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/google_map.html");
            driver.FindElement(By.Id("circleO")).Click();
            WaitFor(() => { return driver.Title == "Target Page 2"; }, "Browser title was not 'Target Page 2'");

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/google_map.html");
            driver.FindElement(By.Id("polyLE")).Click();
            WaitFor(() => { return driver.Title == "Target Page 3"; }, "Browser title was not 'Target Page 3'");
        }

        [Test]
        public void ShouldBeAbleToClickOnAnElementGreaterThanTwoViewports()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_too_big.html");
            driver.Url = url;

            IWebElement element = driver.FindElement(By.Id("click"));

            element.Click();

            WaitFor(() => { return driver.Title == "clicks"; }, "Browser title was not 'clicks'");
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "Fails on Firefox")]
        [IgnoreBrowser(Browser.Chrome, "Fails on Chrome")]
        [IgnoreBrowser(Browser.Opera, "Not Tested")]
        [IgnoreBrowser(Browser.Android, "Not Tested")]
        [IgnoreBrowser(Browser.HtmlUnit, "Not Tested")]
        [IgnoreBrowser(Browser.IPhone, "Not Tested")]
        public void ShouldBeAbleToClickOnAnElementInFrameGreaterThanTwoViewports()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_too_big_in_frame.html");
            driver.Url = url;

            IWebElement frame = driver.FindElement(By.Id("iframe1"));
            driver.SwitchTo().Frame(frame);

            IWebElement element = driver.FindElement(By.Id("click"));

            element.Click();

            WaitFor(() => { return driver.Title == "clicks"; }, "Browser title was not 'clicks'");
        }

        [Test]
        public void ShouldBeAbleToClickOnLinkInAbsolutelyPositionedFooter()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("fixedFooterNoScroll.html");
            driver.Url = url;

            driver.FindElement(By.Id("link")).Click();
            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual("XHTML Test Page", driver.Title);
        }

        [Test]
        public void ShouldBeAbleToClickOnLinkInAbsolutelyPositionedFooterInQuirksMode()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("fixedFooterNoScrollQuirksMode.html");
            driver.Url = url;

            driver.FindElement(By.Id("link")).Click();
            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual("XHTML Test Page", driver.Title);
        }
    }
}

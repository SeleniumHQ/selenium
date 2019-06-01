using System;
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
        public void CanClickOnAnAnchorAndNotReloadThePage()
        {
            ((IJavaScriptExecutor)driver).ExecuteScript("document.latch = true");

            driver.FindElement(By.Id("anchor")).Click();

            bool samePage = (bool)((IJavaScriptExecutor)driver).ExecuteScript("return document.latch");

            Assert.AreEqual(true, samePage, "Latch was reset");
        }

        [Test]
        public void CanClickOnALinkThatUpdatesAnotherFrame()
        {
            driver.SwitchTo().Frame("source");

            driver.FindElement(By.Id("otherframe")).Click();
            driver.SwitchTo().DefaultContent().SwitchTo().Frame("target");

            Assert.That(driver.PageSource, Does.Contain("Hello WebDriver"));
        }

        [Test]
        public void ElementsFoundByJsCanLoadUpdatesInAnotherFrame()
        {
            driver.SwitchTo().Frame("source");

            IWebElement toClick = (IWebElement)((IJavaScriptExecutor)driver).ExecuteScript("return document.getElementById('otherframe');");
            toClick.Click();
            driver.SwitchTo().DefaultContent().SwitchTo().Frame("target");

            Assert.That(driver.PageSource, Does.Contain("Hello WebDriver"));
        }

        [Test]
        public void JsLocatedElementsCanUpdateFramesIfFoundSomehowElse()
        {
            driver.SwitchTo().Frame("source");

            // Prime the cache of elements
            driver.FindElement(By.Id("otherframe"));

            // This _should_ return the same element
            IWebElement toClick = (IWebElement)((IJavaScriptExecutor)driver).ExecuteScript("return document.getElementById('otherframe');");
            toClick.Click();
            driver.SwitchTo().DefaultContent().SwitchTo().Frame("target");

            Assert.That(driver.PageSource, Does.Contain("Hello WebDriver"));
        }

        [Test]
        
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
                Assert.That(log, Does.StartWith("parent matches?"));
            }
            else
            {
                Assert.AreEqual("parent matches? true", log);
            }
        }

        [Test]
        public void ShouldClickOnFirstBoundingClientRectWithNonZeroSize()
        {
            driver.FindElement(By.Id("twoClientRects")).Click();
            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual("XHTML Test Page", driver.Title);
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Browser.Opera, "Doesn't support multiple windows")]
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
        public void ClickingLabelShouldSetCheckbox()
        {
            driver.Url = formsPage;

            driver.FindElement(By.Id("label-for-checkbox-with-label")).Click();

            Assert.That(driver.FindElement(By.Id("checkbox-with-label")).Selected, "Checkbox should be selected");
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
        [IgnoreBrowser(Browser.IE, "Map click fails")]
        [IgnoreBrowser(Browser.Opera, "Map click fails")]
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
        [IgnoreBrowser(Browser.Opera, "Not Tested")]
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
        public void ShouldBeAbleToClickOnRightToLeftLanguageLink()
        {
            String url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_rtl.html");
            driver.Url = url;

            IWebElement element = driver.FindElement(By.Id("ar_link"));
            element.Click();

            WaitFor(() => driver.Title == "clicks", "Expected title to be 'clicks'");
            Assert.AreEqual("clicks", driver.Title);
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

        [Test]
        public void ShouldBeAbleToClickOnLinksWithNoHrefAttribute()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.LinkText("No href"));
            element.Click();

            WaitFor(() => driver.Title == "Changed", "Expected title to be 'Changed'");
            Assert.AreEqual("Changed", driver.Title);
        }

        [Test]
        public void ShouldBeAbleToClickOnALinkThatWrapsToTheNextLine()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/link_that_wraps.html");

            driver.FindElement(By.Id("link")).Click();

            WaitFor(() => driver.Title == "Submitted Successfully!", "Expected title to be 'Submitted Successfully!'");
            Assert.AreEqual("Submitted Successfully!", driver.Title);
        }

        [Test]
        public void ShouldBeAbleToClickOnASpanThatWrapsToTheNextLine()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/span_that_wraps.html");

            driver.FindElement(By.Id("span")).Click();

            WaitFor(() => driver.Title == "Submitted Successfully!", "Expected title to be 'Submitted Successfully!'");
            Assert.AreEqual("Submitted Successfully!", driver.Title);
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Element is properly seen as obscured.")]
        [IgnoreBrowser(Browser.Chrome, "Element is properly seen as obscured.")]
        [IgnoreBrowser(Browser.Edge, "Element is properly seen as obscured.")]
        [IgnoreBrowser(Browser.EdgeLegacy, "Element is properly seen as obscured.")]
        [IgnoreBrowser(Browser.Firefox, "Element is properly seen as obscured.")]
        [IgnoreBrowser(Browser.Safari, "Element is properly seen as obscured.")]
        public void ShouldBeAbleToClickOnAPartiallyOverlappedLinkThatWrapsToTheNextLine()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/wrapped_overlapping_elements.html");

            driver.FindElement(By.Id("link")).Click();

            WaitFor(() => driver.Title == "Submitted Successfully!", "Expected title to be 'Submitted Successfully!'");
            Assert.AreEqual("Submitted Successfully!", driver.Title);
        }

        [Test]
        public void ClickingOnADisabledElementIsANoOp()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/disabled_element.html");

            IWebElement element = driver.FindElement(By.Name("disabled"));
            element.Click();
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        public void ShouldBeAbleToClickLinkContainingLineBreak()
        {
            driver.Url = simpleTestPage;
            driver.FindElement(By.Id("multilinelink")).Click();
            WaitFor(() => { return driver.Title == "We Arrive Here"; }, "Browser title was not 'We Arrive Here'");
            Assert.AreEqual("We Arrive Here", driver.Title);
        }
    }
}

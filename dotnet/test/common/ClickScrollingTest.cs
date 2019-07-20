using System;
using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System.Drawing;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ClickScrollingTest : DriverTestFixture
    {
        [Test]
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
            Assert.That(yOffset, Is.GreaterThan(300), "Did not scroll");
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
        public void ShouldBeAbleToClickOnAnElementHiddenByOverflow()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll.html");

            IWebElement link = driver.FindElement(By.Id("line8"));
            // This used to throw a MoveTargetOutOfBoundsException - we don't expect it to
            link.Click();
            Assert.AreEqual("line8", driver.FindElement(By.Id("clicked")).Text);
        }

        [Test]
        public void ShouldBeAbleToClickOnAnElementHiddenByDoubleOverflow()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_double_overflow_auto.html");

            driver.FindElement(By.Id("link")).Click();
            WaitFor(TitleToBe("Clicked Successfully!"), "Browser title was not 'Clicked Successfully'");
        }

        [Test]
        public void ShouldBeAbleToClickOnAnElementHiddenByYOverflow()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_y_overflow_auto.html");

            driver.FindElement(By.Id("link")).Click();
            WaitFor(TitleToBe("Clicked Successfully!"), "Browser title was not 'Clicked Successfully'");
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Issue #716")]
        [IgnoreBrowser(Browser.Firefox, "Issue #716")]
        public void ShouldBeAbleToClickOnAnElementPartiallyHiddenByOverflow()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_partially_hidden_element.html");

            driver.FindElement(By.Id("btn")).Click();
            WaitFor(TitleToBe("Clicked Successfully!"), "Browser title was not 'Clicked Successfully'");
        }

        [Test]
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
        [IgnoreBrowser(Browser.Chrome, "Webkit-based browsers apparently scroll anyway.")]
        [IgnoreBrowser(Browser.Edge, "Webkit-based browsers apparently scroll anyway.")]
        public void ShouldNotScrollIfAlreadyScrolledAndElementIsInView()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll3.html");
            driver.FindElement(By.Id("button1")).Click();
            long scrollTop = GetScrollTop();
            driver.FindElement(By.Id("button2")).Click();
            Assert.AreEqual(scrollTop, GetScrollTop());
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

        [Test]
        [IgnoreBrowser(Browser.Opera, "Opera fails.")]
        public void ShouldBeAbleToClickElementInAFrameThatIsOutOfView()
        {
            try
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_frame_out_of_view.html");
                driver.SwitchTo().Frame("frame");
                IWebElement element = driver.FindElement(By.Name("checkbox"));
                element.Click();
                Assert.That(element.Selected, "Element is not selected");
            }
            finally
            {
                driver.SwitchTo().DefaultContent();
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Opera, "Opera fails.")]
        public void ShouldBeAbleToClickElementThatIsOutOfViewInAFrame()
        {
            try
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_scrolling_frame.html");
                driver.SwitchTo().Frame("scrolling_frame");
                IWebElement element = driver.FindElement(By.Name("scroll_checkbox"));
                element.Click();
                Assert.That(element.Selected, "Element is not selected");
            }
            finally
            {
                driver.SwitchTo().DefaultContent();
            }
        }

        [Test]
        [Ignore("All tested browses scroll non-scrollable frames")]
        public void ShouldNotBeAbleToClickElementThatIsOutOfViewInANonScrollableFrame()
        {
            try
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_non_scrolling_frame.html");
                driver.SwitchTo().Frame("scrolling_frame");
                IWebElement element = driver.FindElement(By.Name("scroll_checkbox"));
                Assert.That(() => element.Click(), Throws.InstanceOf<WebDriverException>());
            }
            finally
            {
                driver.SwitchTo().DefaultContent();
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Opera, "Opera fails.")]
        public void ShouldBeAbleToClickElementThatIsOutOfViewInAFrameThatIsOutOfView()
        {
            try
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_scrolling_frame_out_of_view.html");
                driver.SwitchTo().Frame("scrolling_frame");
                IWebElement element = driver.FindElement(By.Name("scroll_checkbox"));
                element.Click();
                Assert.That(element.Selected, "Element is not selected");
            }
            finally
            {
                driver.SwitchTo().DefaultContent();
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Opera, "Opera fails.")]
        public void ShouldBeAbleToClickElementThatIsOutOfViewInANestedFrame()
        {
            try
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_nested_scrolling_frames.html");
                driver.SwitchTo().Frame("scrolling_frame");
                driver.SwitchTo().Frame("nested_scrolling_frame");
                IWebElement element = driver.FindElement(By.Name("scroll_checkbox"));
                element.Click();
                Assert.That(element.Selected, "Element is not selected");
            }
            finally
            {
                driver.SwitchTo().DefaultContent();
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Opera, "Opera fails.")]
        public void ShouldBeAbleToClickElementThatIsOutOfViewInANestedFrameThatIsOutOfView()
        {
            try
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_nested_scrolling_frames_out_of_view.html");
                driver.SwitchTo().Frame("scrolling_frame");
                driver.SwitchTo().Frame("nested_scrolling_frame");
                IWebElement element = driver.FindElement(By.Name("scroll_checkbox"));
                element.Click();
                Assert.That(element.Selected, "Element is not selected");
            }
            finally
            {
                driver.SwitchTo().DefaultContent();
            }
        }

        [Test]
        public void ShouldNotScrollWhenGettingElementSize()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll3.html");
            long scrollTop = GetScrollTop();
            Size ignoredSize = driver.FindElement(By.Id("button1")).Size;
            Assert.AreEqual(scrollTop, GetScrollTop());
        }

        [Test]
        public void ShouldBeAbleToClickElementInATallFrame()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_tall_frame.html");
            driver.SwitchTo().Frame("tall_frame");
            IWebElement element = driver.FindElement(By.Name("checkbox"));
            element.Click();
            Assert.That(element.Selected, "Element is not selected");
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        public void ShouldBeAbleToClickInlineTextElementWithChildElementAfterScrolling()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
                .WithBody(
                    "<div style='height: 2000px;'>Force scroll needed</div><label id='wrapper'>wraps a checkbox <input id='check' type='checkbox' checked='checked'/></label>"));
            IWebElement label = driver.FindElement(By.Id("wrapper"));
            label.Click();
            IWebElement checkbox = driver.FindElement(By.Id("check"));
            Assert.IsFalse(checkbox.Selected, "Checkbox should not be selected after click");
        }

        private long GetScrollTop()
        {
            return (long)((IJavaScriptExecutor)driver).ExecuteScript("return document.body.scrollTop;");
        }

        private Func<bool> TitleToBe(string desiredTitle)
        {
            return () =>
            {
                return driver.Title == desiredTitle;
            };
        }
    }
}

using System;
using NUnit.Framework;
using System.Drawing;
using OpenQA.Selenium.Environment;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class VisibilityTest : DriverTestFixture
    {
        [Test]
        [Category("Javascript")]
        public void ShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot()
        {
            driver.Url = javascriptPage;

            Assert.IsTrue(driver.FindElement(By.Id("displayed")).Displayed);
            Assert.IsFalse(driver.FindElement(By.Id("none")).Displayed);
            Assert.IsFalse(driver.FindElement(By.Id("suppressedParagraph")).Displayed);
            Assert.IsFalse(driver.FindElement(By.Id("hidden")).Displayed);
        }

        [Test]
        [Category("Javascript")]
        public void VisibilityShouldTakeIntoAccountParentVisibility()
        {
            driver.Url = javascriptPage;

            IWebElement childDiv = driver.FindElement(By.Id("hiddenchild"));
            IWebElement hiddenLink = driver.FindElement(By.Id("hiddenlink"));

            Assert.IsFalse(childDiv.Displayed);
            Assert.IsFalse(hiddenLink.Displayed);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldCountElementsAsVisibleIfStylePropertyHasBeenSet()
        {
            driver.Url = javascriptPage;

            IWebElement shown = driver.FindElement(By.Id("visibleSubElement"));

            Assert.IsTrue(shown.Displayed);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldModifyTheVisibilityOfAnElementDynamically()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("hideMe"));

            Assert.IsTrue(element.Displayed);

            element.Click();

            Assert.IsFalse(element.Displayed);
        }

        [Test]
        [Category("Javascript")]
        public void HiddenInputElementsAreNeverVisible()
        {
            driver.Url = javascriptPage;

            IWebElement shown = driver.FindElement(By.Name("hidden"));

            Assert.IsFalse(shown.Displayed);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldNotBeAbleToClickOnAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("unclickable"));
            Assert.Throws<ElementNotVisibleException>(() => element.Click());
        }

        [Test]
        [Category("Javascript")]
        public void ShouldNotBeAbleToTypeAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("unclickable"));
            Assert.Throws<ElementNotVisibleException>(() => element.SendKeys("You don't see me"));

            Assert.AreNotEqual(element.GetAttribute("value"), "You don't see me");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldNotBeAbleToSelectAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("untogglable"));
            Assert.Throws<ElementNotVisibleException>(() => element.Click());
        }

        [Test]
        [Category("Javascript")]
        public void ZeroSizedDivIsShownIfDescendantHasSize()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("zero"));
            Size size = element.Size;

            Assert.AreEqual(0, size.Width, "Should have 0 width");
            Assert.AreEqual(0, size.Height, "Should have 0 height");
            Assert.IsTrue(element.Displayed);
        }

        [Test]
        public void ParentNodeVisibleWhenAllChildrenAreAbsolutelyPositionedAndOverflowIsHidden()
        {
            String url = EnvironmentManager.Instance.UrlBuilder.WhereIs("visibility-css.html");
            driver.Url = url;

            IWebElement element = driver.FindElement(By.Id("suggest"));
            Assert.IsTrue(element.Displayed);
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.PhantomJS)]
        public void ElementHiddenByOverflowXIsNotVisible()
        {
            string[] pages = new string[]{
                "overflow/x_hidden_y_hidden.html",
                "overflow/x_hidden_y_scroll.html",
                "overflow/x_hidden_y_auto.html",
            };
            foreach (string page in pages)
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs(page);
                IWebElement right = driver.FindElement(By.Id("right"));
                Assert.IsFalse(right.Displayed, "Failed for " + page);
                IWebElement bottomRight = driver.FindElement(By.Id("bottom-right"));
                Assert.IsFalse(bottomRight.Displayed, "Failed for " + page);
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.PhantomJS)]
        public void ElementHiddenByOverflowYIsNotVisible()
        {
            string[] pages = new string[]{
                "overflow/x_hidden_y_hidden.html",
                "overflow/x_scroll_y_hidden.html",
                "overflow/x_auto_y_hidden.html",
            };
            foreach (string page in pages)
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs(page);
                IWebElement bottom = driver.FindElement(By.Id("bottom"));
                Assert.IsFalse(bottom.Displayed, "Failed for " + page);
                IWebElement bottomRight = driver.FindElement(By.Id("bottom-right"));
                Assert.IsFalse(bottomRight.Displayed, "Failed for " + page);
            }
        }

        [Test]
        public void ElementScrollableByOverflowXIsVisible()
        {
            string[] pages = new string[]{
                "overflow/x_scroll_y_hidden.html",
                "overflow/x_scroll_y_scroll.html",
                "overflow/x_scroll_y_auto.html",
                "overflow/x_auto_y_hidden.html",
                "overflow/x_auto_y_scroll.html",
                "overflow/x_auto_y_auto.html",
            };
            foreach (string page in pages)
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs(page);
                IWebElement right = driver.FindElement(By.Id("right"));
                Assert.IsTrue(right.Displayed, "Failed for " + page);
            }
        }

        [Test]
        public void ElementScrollableByOverflowYIsVisible()
        {
            string[] pages = new string[]{
                "overflow/x_hidden_y_scroll.html",
                "overflow/x_scroll_y_scroll.html",
                "overflow/x_auto_y_scroll.html",
                "overflow/x_hidden_y_auto.html",
                "overflow/x_scroll_y_auto.html",
                "overflow/x_auto_y_auto.html",
            };
            foreach (string page in pages)
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs(page);
                IWebElement bottom = driver.FindElement(By.Id("bottom"));
                Assert.IsTrue(bottom.Displayed, "Failed for " + page);
            }
        }

        [Test]
        public void ElementScrollableByOverflowXAndYIsVisible()
        {
            string[] pages = new string[]{
                "overflow/x_scroll_y_scroll.html",
                "overflow/x_scroll_y_auto.html",
                "overflow/x_auto_y_scroll.html",
                "overflow/x_auto_y_auto.html",
            };
            foreach (string page in pages)
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs(page);
                IWebElement bottomRight = driver.FindElement(By.Id("bottom-right"));
                Assert.IsTrue(bottomRight.Displayed, "Failed for " + page);
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        public void tooSmallAWindowWithOverflowHiddenIsNotAProblem()
        {
            IWindow window = driver.Manage().Window;
            Size originalSize = window.Size;

            try
            {
                // Short in the Y dimension
                window.Size = new Size(1024, 500);

                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("overflow-body.html");

                IWebElement element = driver.FindElement(By.Name("resultsFrame"));
                Assert.IsTrue(element.Displayed);
            }
            finally
            {
                window.Size = originalSize;
            }
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE does not support the hidden attribute")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void ShouldShowElementNotVisibleWithHiddenAttribute()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("hidden.html");
            driver.Url = url;
            IWebElement element = driver.FindElement(By.Id("singleHidden"));
            Assert.IsFalse(element.Displayed);
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE does not support the hidden attribute")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void ShouldShowElementNotVisibleWhenParentElementHasHiddenAttribute()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("hidden.html");
            driver.Url = url;

            IWebElement element = driver.FindElement(By.Id("child"));
            Assert.IsFalse(element.Displayed);
        }

        [Test]
        public void ShouldBeAbleToClickOnElementsWithOpacityZero()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                return;
            }

            driver.Url = clickJackerPage;
            IWebElement element = driver.FindElement(By.Id("clickJacker"));
            Assert.AreEqual("0", element.GetCssValue("opacity"), "Precondition failed: clickJacker should be transparent");
            element.Click();
            Assert.AreEqual("1", element.GetCssValue("opacity"));
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldBeAbleToSelectOptionsFromAnInvisibleSelect()
        {
            driver.Url = formsPage;

            IWebElement select = driver.FindElement(By.Id("invisi_select"));

            ReadOnlyCollection<IWebElement> options = select.FindElements(By.TagName("option"));
            IWebElement apples = options[0];
            IWebElement oranges = options[1];

            Assert.IsTrue(apples.Selected, "Apples should be selected");
            Assert.IsFalse(oranges.Selected, "Oranges shoudl be selected");

            oranges.Click();
            Assert.IsFalse(apples.Selected, "Apples should not be selected");
            Assert.IsTrue(oranges.Selected, "Oranges should be selected");
        }

        [Test]
        [Category("Javascript")]
        public void CorrectlyDetectMapElementsAreShown()
        {
            driver.Url = mapVisibilityPage;

            IWebElement area = driver.FindElement(By.Id("mtgt_unnamed_0"));

            bool isShown = area.Displayed;
            Assert.IsTrue(isShown, "The element and the enclosing map should be considered shown.");
        }

        [Test]
        public void ElementsWithOpacityZeroShouldNotBeVisible()
        {
            driver.Url = clickJackerPage;
            IWebElement element = driver.FindElement(By.Id("clickJacker"));
            Assert.IsFalse(element.Displayed);
        }
    }
}

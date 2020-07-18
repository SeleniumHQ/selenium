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
        public void ShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot()
        {
            driver.Url = javascriptPage;

            Assert.That(driver.FindElement(By.Id("displayed")).Displayed, Is.True, "Element with ID 'displayed' should be displayed");
            Assert.That(driver.FindElement(By.Id("none")).Displayed, Is.False, "Element with ID 'none' should not be displayed");
            Assert.That(driver.FindElement(By.Id("suppressedParagraph")).Displayed, Is.False, "Element with ID 'suppressedParagraph' should not be displayed");
            Assert.That(driver.FindElement(By.Id("hidden")).Displayed, Is.False, "Element with ID 'hidden' should not be displayed");
        }

        [Test]
        public void VisibilityShouldTakeIntoAccountParentVisibility()
        {
            driver.Url = javascriptPage;

            IWebElement childDiv = driver.FindElement(By.Id("hiddenchild"));
            IWebElement hiddenLink = driver.FindElement(By.Id("hiddenlink"));

            Assert.That(childDiv.Displayed, Is.False, "Child div should not be displayed");
            Assert.That(hiddenLink.Displayed, Is.False, "Hidden link should not be displayed");
        }

        [Test]
        public void ShouldCountElementsAsVisibleIfStylePropertyHasBeenSet()
        {
            driver.Url = javascriptPage;

            IWebElement shown = driver.FindElement(By.Id("visibleSubElement"));

            Assert.That(shown.Displayed, Is.True);
        }

        [Test]
        public void ShouldModifyTheVisibilityOfAnElementDynamically()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("hideMe"));

            Assert.That(element.Displayed, Is.True);

            element.Click();

            Assert.That(element.Displayed, Is.False);
        }

        [Test]
        public void HiddenInputElementsAreNeverVisible()
        {
            driver.Url = javascriptPage;

            IWebElement shown = driver.FindElement(By.Name("hidden"));

            Assert.That(shown.Displayed, Is.False);
        }

        [Test]
        public void ShouldNotBeAbleToClickOnAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("unclickable"));
            Assert.That(() => element.Click(), Throws.InstanceOf<ElementNotInteractableException>());
        }

        [Test]
        public void ShouldNotBeAbleToTypeAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("unclickable"));
            Assert.That(() => element.SendKeys("You don't see me"), Throws.InstanceOf<ElementNotInteractableException>());

            Assert.That(element.GetAttribute("value"), Is.Not.EqualTo("You don't see me"));
        }

        [Test]
        public void ZeroSizedDivIsShownIfDescendantHasSize()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("zero"));
            Size size = element.Size;

            Assert.AreEqual(0, size.Width, "Should have 0 width");
            Assert.AreEqual(0, size.Height, "Should have 0 height");
            Assert.That(element.Displayed, Is.True);
        }

        [Test]
        public void ParentNodeVisibleWhenAllChildrenAreAbsolutelyPositionedAndOverflowIsHidden()
        {
            String url = EnvironmentManager.Instance.UrlBuilder.WhereIs("visibility-css.html");
            driver.Url = url;

            IWebElement element = driver.FindElement(By.Id("suggest"));
            Assert.That(element.Displayed, Is.True);
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
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
                Assert.That(right.Displayed, Is.False, "Failed for " + page);
                IWebElement bottomRight = driver.FindElement(By.Id("bottom-right"));
                Assert.That(bottomRight.Displayed, Is.False, "Failed for " + page);
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
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
                Assert.That(bottom.Displayed, Is.False, "Failed for " + page);
                IWebElement bottomRight = driver.FindElement(By.Id("bottom-right"));
                Assert.That(bottomRight.Displayed, Is.False, "Failed for " + page);
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
                Assert.That(right.Displayed, Is.True, "Failed for " + page);
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
                Assert.That(bottom.Displayed, Is.True, "Failed for " + page);
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
                Assert.That(bottomRight.Displayed, Is.True, "Failed for " + page);
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
        public void TooSmallAWindowWithOverflowHiddenIsNotAProblem()
        {
            IWindow window = driver.Manage().Window;
            Size originalSize = window.Size;

            try
            {
                // Short in the Y dimension
                window.Size = new Size(1024, 500);

                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("overflow-body.html");

                IWebElement element = driver.FindElement(By.Name("resultsFrame"));
                Assert.That(element.Displayed, Is.True);
            }
            finally
            {
                window.Size = originalSize;
            }
        }

        [Test]
        public void ShouldShowElementNotVisibleWithHiddenAttribute()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("hidden.html");
            driver.Url = url;
            IWebElement element = driver.FindElement(By.Id("singleHidden"));
            Assert.That(element.Displayed, Is.False);
        }

        [Test]
        public void ShouldShowElementNotVisibleWhenParentElementHasHiddenAttribute()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("hidden.html");
            driver.Url = url;

            IWebElement element = driver.FindElement(By.Id("child"));
            Assert.That(element.Displayed, Is.False);
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
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldBeAbleToSelectOptionsFromAnInvisibleSelect()
        {
            driver.Url = formsPage;

            IWebElement select = driver.FindElement(By.Id("invisi_select"));

            ReadOnlyCollection<IWebElement> options = select.FindElements(By.TagName("option"));
            IWebElement apples = options[0];
            IWebElement oranges = options[1];

            Assert.That(apples.Selected, Is.True, "Apples should be selected");
            Assert.That(oranges.Selected, Is.False, "Oranges should be selected");

            oranges.Click();
            Assert.That(apples.Selected, Is.False, "Apples should not be selected");
            Assert.That(oranges.Selected, Is.True, "Oranges should be selected");
        }

        [Test]
        public void CorrectlyDetectMapElementsAreShown()
        {
            driver.Url = mapVisibilityPage;

            IWebElement area = driver.FindElement(By.Id("mtgt_unnamed_0"));

            bool isShown = area.Displayed;
            Assert.That(isShown, Is.True, "The element and the enclosing map should be considered shown.");
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        public void ShouldNotBeAbleToSelectAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("untogglable"));
            Assert.That(() => element.Click(), Throws.InstanceOf<ElementNotInteractableException>());
        }

        [Test]
        public void ElementsWithOpacityZeroShouldNotBeVisible()
        {
            driver.Url = clickJackerPage;
            IWebElement element = driver.FindElement(By.Id("clickJacker"));
            Assert.That(element.Displayed, Is.False);
        }
    }
}

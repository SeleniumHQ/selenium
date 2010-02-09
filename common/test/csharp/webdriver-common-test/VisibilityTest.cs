using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

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

            Assert.IsTrue(((IRenderedWebElement)driver.FindElement(By.Id("displayed"))).Displayed);
            Assert.IsFalse(((IRenderedWebElement)driver.FindElement(By.Id("none"))).Displayed);
            Assert.IsFalse(((IRenderedWebElement)driver.FindElement(By.Id("suppressedParagraph"))).Displayed);
            Assert.IsFalse(((IRenderedWebElement)driver.FindElement(By.Id("hidden"))).Displayed);
        }

        [Test]
        [Category("Javascript")]
        public void VisibilityShouldTakeIntoAccountParentVisibility()
        {
            driver.Url = javascriptPage;

            IRenderedWebElement childDiv = (IRenderedWebElement)driver.FindElement(By.Id("hiddenchild"));
            IRenderedWebElement hiddenLink = (IRenderedWebElement)driver.FindElement(By.Id("hiddenlink"));

            Assert.IsFalse(childDiv.Displayed);
            Assert.IsFalse(hiddenLink.Displayed);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldCountElementsAsVisibleIfStylePropertyHasBeenSet()
        {
            driver.Url = javascriptPage;

            IRenderedWebElement shown = (IRenderedWebElement)driver.FindElement(By.Id("visibleSubElement"));

            Assert.IsTrue(shown.Displayed);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldModifyTheVisibilityOfAnElementDynamically()
        {
            driver.Url = javascriptPage;

            IRenderedWebElement element = (IRenderedWebElement)driver.FindElement(By.Id("hideMe"));

            Assert.IsTrue(element.Displayed);

            element.Click();

            Assert.IsFalse(element.Displayed);
        }

        [Test]
        [Category("Javascript")]
        public void HiddenInputElementsAreNeverVisible()
        {
            driver.Url = javascriptPage;

            IRenderedWebElement shown = (IRenderedWebElement)driver.FindElement(By.Name("hidden"));

            Assert.IsFalse(shown.Displayed);
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(ElementNotVisibleException))]
        public void ShouldNotBeAbleToClickOnAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("unclickable"));
            element.Click();
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(ElementNotVisibleException))]
        public void ShouldNotBeAbleToToggleAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("untogglable"));
            element.Toggle();
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(ElementNotVisibleException))]
        public void ShouldNotBeAbleToSelectAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("untogglable"));
            element.Select();
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(ElementNotVisibleException))]
        public void ShouldNotBeAbleToTypeAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("unclickable"));
            element.SendKeys("You don't see me");

            Assert.AreNotEqual(element.Value, "You don't see me");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IE, "IE reports zero width and height elements as displayed")]
        public void ShouldNotAllowAnElementWithZeroHeightToBeCountedAsDisplayed()
        {
            driver.Url = javascriptPage;

            IRenderedWebElement zeroHeight = (IRenderedWebElement)driver.FindElement(By.Id("zeroheight"));

            Assert.IsFalse(zeroHeight.Displayed);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IE, "IE reports zero width and height elements as displayed")]
        public void ShouldNotAllowAnElementWithZeroWidthToBeCountedAsDisplayed()
        {
            driver.Url = javascriptPage;

            IRenderedWebElement zeroWidth = (IRenderedWebElement)driver.FindElement(By.Id("zerowidth"));

            Assert.IsFalse(zeroWidth.Displayed);
        }
    }
}

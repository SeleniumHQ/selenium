using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Drawing;
using OpenQA.Selenium.Environment;

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
        public void ShouldNotBeAbleToTypeAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("unclickable"));
            element.SendKeys("You don't see me");

            Assert.AreNotEqual(element.GetAttribute("value"), "You don't see me");
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(ElementNotVisibleException))]
        public void ShouldNotBeAbleToSelectAnElementThatIsNotDisplayed()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("untogglable"));
            element.Click();
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "Div with size 0 is not interpreted as displayed even if descendent has size")]
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
    }
}

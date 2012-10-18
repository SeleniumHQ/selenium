using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class OpacityTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.Chrome, "Chrome does not yet handle opacity")]
        [IgnoreBrowser(Browser.IE, "IE9 handles this correctly; other versions do not")]
        public void ShouldBeAbleToClickOnElementsWithOpacityZero()
        {
            driver.Url = clickJackerPage;
            IWebElement element = driver.FindElement(By.Id("clickJacker"));
            //Assert.AreEqual("0", element.GetCssValue("opacity"), "Precondition failed: clickJacker should be transparent");
            element.Click();
            Assert.AreEqual("1", element.GetCssValue("opacity"));
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.IE)]
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
    }
}

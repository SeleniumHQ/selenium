using System;
using System.Collections.Generic;
using NUnit.Framework;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ElementPropertyTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.Edge)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.PhantomJS)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldReturnNullWhenGettingTheValueOfAPropertyThatIsNotListed()
        {
            driver.Url = simpleTestPage;
            IWebElement head = driver.FindElement(By.XPath("/html"));
            string attribute = head.GetProperty("cheese");
            Assert.IsNull(attribute);
        }

        [Test]
        [IgnoreBrowser(Browser.Edge)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.PhantomJS)]
        [IgnoreBrowser(Browser.Remote)]
        [IgnoreBrowser(Browser.Safari)]
        public void CanRetrieveTheCurrentValueOfAProperty()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("working"));
            Assert.AreEqual(string.Empty, element.GetProperty("value"));
            element.SendKeys("hello world");
            Assert.AreEqual("hello world", element.GetProperty("value"));
        }
    }
}

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
        [IgnoreBrowser(Browser.Remote)]
        public void ShouldReturnNullWhenGettingTheValueOfAPropertyThatIsNotListed()
        {
            driver.Url = simpleTestPage;
            IWebElement head = driver.FindElement(By.XPath("/html"));
            string attribute = head.GetDomProperty("cheese");
            Assert.That(attribute, Is.Null);
        }

        [Test]
        [IgnoreBrowser(Browser.Remote)]
        public void CanRetrieveTheCurrentValueOfAProperty()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("working"));
            Assert.AreEqual(string.Empty, element.GetDomProperty("value"));
            element.SendKeys("hello world");
            Assert.AreEqual("hello world", element.GetDomProperty("value"));
        }
    }
}

using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ElementEqualityTest : DriverTestFixture
    {
        [Test]
        public void ElementEqualityShouldWork()
        {
            driver.Url = (simpleTestPage);

            IWebElement body = driver.FindElement(By.TagName("body"));
            IWebElement xbody = driver.FindElement(By.XPath("//body"));

            Assert.AreEqual(body, xbody);
        }

        [Test]
        public void ElementInequalityShouldWork()
        {
            driver.Url = (simpleTestPage);

            ReadOnlyCollection<IWebElement> ps = driver.FindElements(By.TagName("p"));

            Assert.AreNotEqual(ps[0], ps[1]);
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "HashCode valid only for elements with ID assigned by the driver. Not the case with IE.")]
        public void FindElementHashCodeShouldMatchEquality()
        {
            driver.Url = (simpleTestPage);
            IWebElement body = driver.FindElement(By.TagName("body"));
            IWebElement xbody = driver.FindElement(By.XPath("//body"));

            Assert.AreEqual(body.GetHashCode(), xbody.GetHashCode());
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "HashCode valid only for elements with ID assigned by the driver. Not the case with IE.")]
        public void FindElementsHashCodeShouldMatchEquality()
        {
            driver.Url = (simpleTestPage);
            ReadOnlyCollection<IWebElement> body = driver.FindElements(By.TagName("body"));
            ReadOnlyCollection<IWebElement> xbody = driver.FindElements(By.XPath("//body"));

            Assert.AreEqual(body[0].GetHashCode(), xbody[0].GetHashCode());
        }
    }
}

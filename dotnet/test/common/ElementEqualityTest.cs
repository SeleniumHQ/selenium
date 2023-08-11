using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ElementEqualityTest : DriverTestFixture
    {
        [Test]
        public void SameElementLookedUpDifferentWaysShouldBeEqual()
        {
            driver.Url = (simpleTestPage);

            IWebElement body = driver.FindElement(By.TagName("body"));
            IWebElement xbody = driver.FindElement(By.XPath("//body"));

            Assert.AreEqual(body, xbody);
        }

        [Test]
        public void DifferentElementsShouldNotBeEqual()
        {
            driver.Url = (simpleTestPage);

            ReadOnlyCollection<IWebElement> ps = driver.FindElements(By.TagName("p"));

            Assert.AreNotEqual(ps[0], ps[1]);
        }

        [Test]
        public void SameElementLookedUpDifferentWaysUsingFindElementShouldHaveSameHashCode()
        {
            driver.Url = (simpleTestPage);
            IWebElement body = driver.FindElement(By.TagName("body"));
            IWebElement xbody = driver.FindElement(By.XPath("//body"));

            Assert.AreEqual(body.GetHashCode(), xbody.GetHashCode());
        }

        public void SameElementLookedUpDifferentWaysUsingFindElementsShouldHaveSameHashCode()
        {
            driver.Url = (simpleTestPage);
            ReadOnlyCollection<IWebElement> body = driver.FindElements(By.TagName("body"));
            ReadOnlyCollection<IWebElement> xbody = driver.FindElements(By.XPath("//body"));

            Assert.AreEqual(body[0].GetHashCode(), xbody[0].GetHashCode());
        }

        [Test]
        public void AnElementFoundInViaJsShouldHaveSameId()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("missedJsReference.html");

            driver.SwitchTo().Frame("inner");
            IWebElement first = driver.FindElement(By.Id("oneline"));

            IWebElement element = (IWebElement)((IJavaScriptExecutor)driver).ExecuteScript("return document.getElementById('oneline');");

            Assert.AreEqual(first, element);
        }
    }
}

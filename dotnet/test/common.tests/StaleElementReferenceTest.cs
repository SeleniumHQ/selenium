using NUnit.Framework;
using System.Drawing;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class StaleElementReferenceTest : DriverTestFixture
    {
        [Test]
        public void OldPage()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));
            driver.Url = xhtmlTestPage;
            Assert.Throws<StaleElementReferenceException>(() => elem.Click());
        }

        [Test]
        [Category("Javascript")]
        public void ShouldNotCrashWhenCallingGetSizeOnAnObsoleteElement()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));
            driver.Url = xhtmlTestPage;
            Assert.Throws<StaleElementReferenceException>(() => { Size elementSize = elem.Size; });
        }

        [Test]
        [Category("Javascript")]
        public void ShouldNotCrashWhenQueryingTheAttributeOfAStaleElement()
        {
            driver.Url = xhtmlTestPage;
            IWebElement heading = driver.FindElement(By.XPath("//h1"));
            driver.Url = simpleTestPage;
            Assert.Throws<StaleElementReferenceException>(() => { string className = heading.GetAttribute("class"); });
        }
    }
}

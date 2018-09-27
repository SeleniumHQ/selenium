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
            Assert.That(() => elem.Click(), Throws.InstanceOf<StaleElementReferenceException>());
        }

        [Test]
        public void ShouldNotCrashWhenCallingGetSizeOnAnObsoleteElement()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));
            driver.Url = xhtmlTestPage;
            Assert.That(() => { Size elementSize = elem.Size; }, Throws.InstanceOf<StaleElementReferenceException>());
        }

        [Test]
        public void ShouldNotCrashWhenQueryingTheAttributeOfAStaleElement()
        {
            driver.Url = xhtmlTestPage;
            IWebElement heading = driver.FindElement(By.XPath("//h1"));
            driver.Url = simpleTestPage;
            Assert.That(() => { string className = heading.GetAttribute("class"); }, Throws.InstanceOf<StaleElementReferenceException>());
        }

        [Test]
        public void RemovingAnElementDynamicallyFromTheDomShouldCauseAStaleRefException()
        {
            driver.Url = javascriptPage;

            IWebElement toBeDeleted = driver.FindElement(By.Id("deleted"));
            Assert.That(toBeDeleted.Displayed, Is.True);

            driver.FindElement(By.Id("delete")).Click();

            bool wasStale = WaitFor(() =>
            {
                try
                {
                    string tagName = toBeDeleted.TagName;
                    return false;
                }
                catch (StaleElementReferenceException)
                {
                    return true;
                }
            }, "Element did not become stale.");
            Assert.That(wasStale, Is.True, "Element should be stale at this point");
        }
    }
}

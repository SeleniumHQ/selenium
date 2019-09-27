using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class PartialLinkTextMatchTest : DriverTestFixture
    {
        [Test]
        public void LinkWithFormattingTags()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement res = elem.FindElement(By.PartialLinkText("link with formatting tags"));
            Assert.That(res, Is.Not.Null);
            Assert.AreEqual("link with formatting tags", res.Text);
        }

        [Test]
        public void LinkWithLeadingSpaces()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement res = elem.FindElement(By.PartialLinkText("link with leading space"));
            Assert.That(res, Is.Not.Null);
            Assert.AreEqual("link with leading space", res.Text);
        }

        [Test]
        public void LinkWithTrailingSpace()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement res =
                elem.FindElement(By.PartialLinkText("link with trailing space"));
            Assert.That(res, Is.Not.Null);
            Assert.AreEqual("link with trailing space", res.Text);
        }

        [Test]
        public void FindMultipleElements()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            ReadOnlyCollection<IWebElement> elements = elem.FindElements(By.PartialLinkText("link"));
            Assert.That(elements, Is.Not.Null);
            Assert.AreEqual(6, elements.Count);
        }
        
        [Test]
        public void DriverCanGetLinkByLinkTestIgnoringTrailingWhitespace()
        {
            driver.Url = simpleTestPage;
            IWebElement link = null;
            link = driver.FindElement(By.LinkText("link with trailing space"));
            Assert.AreEqual("linkWithTrailingSpace", link.GetAttribute("id"));
        }

        [Test]
        public void ElementCanGetLinkByLinkTestIgnoringTrailingWhitespace()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement link = null;
            link = elem.FindElement(By.LinkText("link with trailing space"));
            Assert.AreEqual("linkWithTrailingSpace", link.GetAttribute("id"));
        }
    }
}

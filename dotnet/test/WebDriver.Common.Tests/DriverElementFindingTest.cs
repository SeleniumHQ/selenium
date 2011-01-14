using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class DriverElementFindingTest : DriverTestFixture
    {

        #region FindElemement Tests

        [Test]
        public void ShouldFindElementById()
        {
            driver.Url = simpleTestPage;
            IWebElement e = driver.FindElement(By.Id("oneline"));
            Assert.That("A single line of text", Is.EqualTo(e.Text));
        }

        [Test]
        public void ShouldFindElementByLinkText()
        {
            driver.Url = simpleTestPage;
            IWebElement e = driver.FindElement(By.LinkText("link with leading space"));
            Assert.That("link with leading space", Is.EqualTo(e.Text));
        }

        [Test]
        public void ShouldFindElementByName()
        {
            driver.Url = nestedPage;
            IWebElement e = driver.FindElement(By.Name("div1"));
            Assert.That("hello world hello world", Is.EqualTo(e.Text));
        }

        [Test]
        public void ShouldFindElementByXPath()
        {
            driver.Url = simpleTestPage;
            IWebElement e = driver.FindElement(By.XPath("/html/body/p[1]"));
            Assert.That("A single line of text", Is.EqualTo(e.Text));
        }

        [Test]
        public void ShouldFindElementByClassName()
        {
            driver.Url = nestedPage;
            IWebElement e = driver.FindElement(By.ClassName("one"));
            Assert.That("Span with class of one", Is.EqualTo(e.Text));
        }

        [Test]
        public void ShouldFindElementByPartialLinkText()
        {
            driver.Url = simpleTestPage;
            IWebElement e = driver.FindElement(By.PartialLinkText("leading space"));
            Assert.That("link with leading space", Is.EqualTo(e.Text));
        }

        [Test]
        public void ShouldFindElementByTagName()
        {
            driver.Url = simpleTestPage;
            IWebElement e = driver.FindElement(By.TagName("H1"));
            Assert.That("Heading", Is.EqualTo(e.Text));
        }
        #endregion

        //TODO(andre.nogueira): We're not checking the right elements are being returned!
        #region FindElemements Tests

        [Test]
        public void ShouldFindElementsById()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Id("test_id"));
            Assert.That(2, Is.EqualTo(elements.Count));
        }

        [Test]
        public void ShouldFindElementsByLinkText()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.LinkText("hello world"));
            Assert.That(12, Is.EqualTo(elements.Count));
        }

        [Test]
        public void ShouldFindElementsByName()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Name("form1"));
            Assert.That(4, Is.EqualTo(elements.Count));
        }

        [Test]
        public void ShouldFindElementsByXPath()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.XPath("//a"));
            Assert.That(12, Is.EqualTo(elements.Count));
        }

        [Test]
        public void ShouldFindElementsByClassName()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.ClassName("one"));
            Assert.That(3, Is.EqualTo(elements.Count));
        }

        [Test]
        public void ShouldFindElementsByPartialLinkText()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.PartialLinkText("world"));
            Assert.That(12, Is.EqualTo(elements.Count));
        }

        [Test]
        public void ShouldFindElementsByTagName()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.TagName("a"));
            Assert.That(12, Is.EqualTo(elements.Count));
        }
        #endregion
    }
}

using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class XPathElementFindingTest : DriverTestFixture
    {
        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithXPath()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.XPath("//a[@id='Not here']"));
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldThrowAnExceptionWhenThereIsNoLinkToClick()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.XPath("//a[@id='Not here']"));
        }

        [Test]
        public void ShouldFindSingleElementByXPath()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.XPath("//h1"));
            Assert.AreEqual(element.Text, "XHTML Might Be The Future");
        }

        [Test]
        public void ShouldFindElementsByXPath()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> divs = driver.FindElements(By.XPath("//div"));

            Assert.AreEqual(divs.Count, 8);
        }

        [Test]
        public void ShouldBeAbleToFindManyElementsRepeatedlyByXPath()
        {
            driver.Url = xhtmlTestPage;
            String xpathString = "//node()[contains(@id,'id')]";
            Assert.AreEqual(driver.FindElements(By.XPath(xpathString)).Count, 3);

            xpathString = "//node()[contains(@id,'nope')]";
            Assert.AreEqual(driver.FindElements(By.XPath(xpathString)).Count, 0);
        }

        [Test]
        public void ShouldBeAbleToIdentifyElementsByClass()
        {
            driver.Url = xhtmlTestPage;

            String header = driver.FindElement(By.XPath("//h1[@class='header']")).Text;
            Assert.AreEqual(header, "XHTML Might Be The Future");
        }

        [Test]
        public void ShouldBeAbleToSearchForMultipleAttributes()
        {
            driver.Url = formsPage;
            driver.FindElement(By.XPath("//form[@name='optional']/input[@type='submit' and @value='Click!']")).Click();
        }

        [Test]
        public void ShouldLocateElementsWithGivenText()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.XPath("//a[text()='click me']"));
        }
    }
}

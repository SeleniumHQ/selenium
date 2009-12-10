using System;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class MiscTest : DriverTestFixture
    {
        [Test]
        public void ShouldReturnPageSource()
        {
            string pageSource;
            driver.Url = macbethPage;
            pageSource = driver.PageSource;
            Assert.That(pageSource.StartsWith("<HTML><HEAD><TITLE>Macbeth: Entire Play</TITLE>"));
            Assert.That(pageSource.Contains("I have lost my hopes."));
            Assert.That(pageSource.EndsWith("</HTML>"));
        }

        [Test]
        public void ShouldReturnTitle()
        {
            driver.Url = macbethPage;
            Assert.AreEqual(driver.Title, macbethTitle);
        }

        [Test]
        public void ShouldReturnCurrentUrl()
        {
            driver.Url = macbethPage;
            Assert.AreEqual(driver.Url, macbethPage);
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldNotHaveProblemOpeningNonExistingPage()
        {
            driver.Url = "www.doesnotexist.comx";
            IWebElement e = driver.FindElement(By.Id("Bla"));
        }

    }
}

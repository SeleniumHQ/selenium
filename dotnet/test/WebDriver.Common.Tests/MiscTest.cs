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
            driver.Url = simpleTestPage;
            pageSource = driver.PageSource.ToLower();

            Assert.IsTrue(pageSource.StartsWith("<html"));
            Assert.IsTrue(pageSource.EndsWith("</html>"));
            Assert.IsTrue(pageSource.Contains("an inline element"));
            Assert.IsTrue(pageSource.Contains("<p id="));
            Assert.IsTrue(pageSource.Contains("lotsofspaces"));
            Assert.IsTrue(pageSource.Contains("with document.write and with document.write again"));
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
            Assert.AreEqual(macbethPage, driver.Url);

            driver.Url = simpleTestPage;
            Assert.AreEqual(simpleTestPage, driver.Url);

            driver.Url = javascriptPage;
            Assert.AreEqual(javascriptPage, driver.Url);
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

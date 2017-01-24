using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class MiscTest : DriverTestFixture
    {
        [Test]
        public void ShouldReportTheCurrentUrlCorrectly()
        {
            driver.Url = macbethPage;
            Assert.AreEqual(macbethPage, driver.Url);

            driver.Url = simpleTestPage;
            Assert.AreEqual(simpleTestPage, driver.Url);

            driver.Url = javascriptPage;
            Assert.AreEqual(javascriptPage, driver.Url);
        }

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
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.IE)]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldBeAbleToGetTheSourceOfAnXmlDocument()
        {
            driver.Url = simpleXmlDocument;
            string source = driver.PageSource.ToLower();
            source = System.Text.RegularExpressions.Regex.Replace(source, "\\s", string.Empty);
            Assert.AreEqual("<xml><foo><bar>baz</bar></foo></xml>", source);
        }

        ////////////////////////////////////////////////////////
        // Tests below here do not appear in the Java bindings
        ////////////////////////////////////////////////////////

        [Test]
        public void ShouldReturnTitle()
        {
            driver.Url = macbethPage;
            Assert.AreEqual(driver.Title, macbethTitle);
        }

        [Test]
        public void ShouldNotHaveProblemOpeningNonExistingPage()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                Assert.Ignore("Marionette does not handle malformed URLs.");
            }

            driver.Url = "www.doesnotexist.comx";
            Assert.Throws<NoSuchElementException>(() => { IWebElement e = driver.FindElement(By.Id("Bla")); });
        }

    }
}

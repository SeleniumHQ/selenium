using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System.Collections.Generic;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class MiscTest : DriverTestFixture
    {
        [Test]
        public void ShouldReturnTitleOfPageIfSet()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(driver.Title, Is.EqualTo("XHTML Test Page"));

            driver.Url = simpleTestPage;
            Assert.That(driver.Title, Is.EqualTo("Hello WebDriver"));
        }

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
        public void ShouldReturnTagName()
        {
            driver.Url = formsPage;
            IWebElement selectBox = driver.FindElement(By.Id("cheese"));
            Assert.That(selectBox.TagName.ToLower(), Is.EqualTo("input"));
        }

        [Test]
        public void ShouldReturnTheSourceOfAPage()
        {
            string pageSource;
            driver.Url = simpleTestPage;
            pageSource = driver.PageSource.ToLower();

            Assert.That(pageSource, Does.StartWith("<html"));
            Assert.That(pageSource, Does.EndWith("</html>"));
            Assert.That(pageSource, Does.Contain("an inline element"));
            Assert.That(pageSource, Does.Contain("<p id="));
            Assert.That(pageSource, Does.Contain("lotsofspaces"));
            Assert.That(pageSource, Does.Contain("with document.write and with document.write again"));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "returns XML content formatted for display as HTML document")]
        [IgnoreBrowser(Browser.Edge, "returns XML content formatted for display as HTML document")]
        [IgnoreBrowser(Browser.Safari, "returns XML content formatted for display as HTML document")]
        [IgnoreBrowser(Browser.IE, "returns XML content formatted for display as HTML document")]
        [IgnoreBrowser(Browser.EdgeLegacy, "returns XML content formatted for display as HTML document")]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldBeAbleToGetTheSourceOfAnXmlDocument()
        {
            driver.Url = simpleXmlDocument;
            string source = driver.PageSource.ToLower();
            source = System.Text.RegularExpressions.Regex.Replace(source, "\\s", string.Empty);
            Assert.AreEqual("<xml><foo><bar>baz</bar></foo></xml>", source);
        }

        // Test is ignored for all browsers, but is kept here in the source code for
        // ease of comparison to Java test suite.
        //[Test]
        //[IgnoreBrowser(Browser.All, "issue 2282")]
        //public void StimulatesStrangeOnloadInteractionInFirefox()
        //{
        //    driver.Url = documentWrite;

        //    // If this command succeeds, then all is well.
        //    driver.FindElement(By.XPath("//body"));

        //    driver.Url = simpleTestPage;
        //    driver.FindElement(By.Id("links"));
        //}

        [Test]
        public void ClickingShouldNotTrampleWOrHInGlobalScope()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("globalscope.html");
            List<string> values = new List<string>() { "w", "h" };

            foreach (string val in values)
            {
                Assert.AreEqual(val, GetGlobalVar(driver, val));
            }

            driver.FindElement(By.Id("toclick")).Click();

            foreach (string val in values)
            {
                Assert.AreEqual(val, GetGlobalVar(driver, val));
            }
        }

        private string GetGlobalVar(IWebDriver driver, string value)
        {
            object val = ((IJavaScriptExecutor)driver).ExecuteScript("return window." + value + ";");
            return val == null ? "null" : val.ToString();
        }
    }
}

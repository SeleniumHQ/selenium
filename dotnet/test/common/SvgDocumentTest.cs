using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class SvgDocumentTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.Chrome, "Chrome driver does not support clicking on SVG element yet")]
        [IgnoreBrowser(Browser.Edge, "Edge driver does not support clicking on SVG element yet")]
        public void ClickOnSvgElement()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                Assert.Ignore("SVG support only exists in IE9+");
            }

            driver.Url = svgTestPage;
            IWebElement rect = driver.FindElement(By.Id("rect"));

            Assert.AreEqual("blue", rect.GetAttribute("fill"));
            rect.Click();
            Assert.AreEqual("green", rect.GetAttribute("fill"));
        }

        [Test]
        public void ExecuteScriptInSvgDocument()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                Assert.Ignore("SVG support only exists in IE9+");
            }

            driver.Url = svgTestPage;
            IWebElement rect = driver.FindElement(By.Id("rect"));

            Assert.AreEqual("blue", rect.GetAttribute("fill"));
            ((IJavaScriptExecutor)driver).ExecuteScript("document.getElementById('rect').setAttribute('fill', 'yellow');");
            Assert.AreEqual("yellow", rect.GetAttribute("fill"));
        }
    }
}

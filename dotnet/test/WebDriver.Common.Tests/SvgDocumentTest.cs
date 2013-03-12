using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class SvgDocumentTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.HtmlUnit, "SVG tests only in rendered browsers")]
        [IgnoreBrowser(Browser.Opera, "Not tested")]
        public void ClickOnSvgElement()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                return;
            }

            driver.Url = svgTestPage;
            IWebElement rect = driver.FindElement(By.Id("rect"));

            Assert.AreEqual("blue", rect.GetAttribute("fill"));
            rect.Click();
            Assert.AreEqual("green", rect.GetAttribute("fill"));
        }

        [Test]
        [IgnoreBrowser(Browser.HtmlUnit, "SVG tests only in rendered browsers")]
        [IgnoreBrowser(Browser.Opera, "Not tested")]
        public void ExecuteScriptInSvgDocument()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                return;
            }

            driver.Url = svgTestPage;
            IWebElement rect = driver.FindElement(By.Id("rect"));

            Assert.AreEqual("blue", rect.GetAttribute("fill"));
            ((IJavaScriptExecutor)driver).ExecuteScript("document.getElementById('rect').setAttribute('fill', 'yellow');");
            Assert.AreEqual("yellow", rect.GetAttribute("fill"));
        }
    }
}

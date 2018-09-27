using System.Collections.Generic;
using System.Collections.ObjectModel;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class SvgElementTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.Opera, "Not tested")]
        public void ShouldClickOnGraphVisualElements()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                Assert.Ignore("SVG support only exists in IE9+");
            }

            driver.Url = svgPage;
            IWebElement svg = driver.FindElement(By.CssSelector("svg"));

            ReadOnlyCollection<IWebElement> groupElements = svg.FindElements(By.CssSelector("g"));
            Assert.AreEqual(5, groupElements.Count);

            groupElements[1].Click();
            IWebElement resultElement = driver.FindElement(By.Id("result"));
            WaitFor(() => { return resultElement.Text == "slice_red"; }, "Element text was not 'slice_red'");
            Assert.AreEqual("slice_red", resultElement.Text);

            groupElements[2].Click();
            resultElement = driver.FindElement(By.Id("result"));
            WaitFor(() => { return resultElement.Text == "slice_green"; }, "Element text was not 'slice_green'");
            Assert.AreEqual("slice_green", resultElement.Text);
        }

        [Test]
        [IgnoreBrowser(Browser.Opera, "Not tested")]
        public void ShouldClickOnGraphTextElements()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                Assert.Ignore("SVG support only exists in IE9+");
            }

            driver.Url = svgPage;
            IWebElement svg = driver.FindElement(By.CssSelector("svg"));
            ReadOnlyCollection<IWebElement> textElements = svg.FindElements(By.CssSelector("text"));

            IWebElement appleElement = FindAppleElement(textElements);
            Assert.That(appleElement, Is.Not.Null);

            appleElement.Click();
            IWebElement resultElement = driver.FindElement(By.Id("result"));
            WaitFor(() => { return resultElement.Text == "text_apple"; }, "Element text was not 'text_apple'");
            Assert.AreEqual("text_apple", resultElement.Text);
        }

        private IWebElement FindAppleElement(IEnumerable<IWebElement> textElements)
        {
            foreach (IWebElement currentElement in textElements)
            {
                if (currentElement.Text.Contains("Apple"))
                {
                    return currentElement;
                }
            }

            return null;
        }
    }
}

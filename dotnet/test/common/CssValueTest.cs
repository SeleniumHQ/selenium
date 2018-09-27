using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class CssValueTest : DriverTestFixture
    {
        [Test]
        public void ShouldPickUpStyleOfAnElement()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("green-parent"));
            string backgroundColour = element.GetCssValue("background-color");

            Assert.That(backgroundColour, Is.EqualTo("#008000").Or.EqualTo("rgba(0, 128, 0, 1)").Or.EqualTo("rgb(0, 128, 0)"));

            element = driver.FindElement(By.Id("red-item"));
            backgroundColour = element.GetCssValue("background-color");

            Assert.That(backgroundColour, Is.EqualTo("#ff0000").Or.EqualTo("rgba(255, 0, 0, 1)").Or.EqualTo("rgb(255, 0, 0)"));
        }

        [Test]
        public void GetCssValueShouldReturnStandardizedColour()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("colorPage.html");

            IWebElement element = driver.FindElement(By.Id("namedColor"));
            string backgroundColour = element.GetCssValue("background-color");
            Assert.That(backgroundColour, Is.EqualTo("rgba(0, 128, 0, 1)").Or.EqualTo("rgb(0, 128, 0)"));

            element = driver.FindElement(By.Id("rgb"));
            backgroundColour = element.GetCssValue("background-color");
            Assert.That(backgroundColour, Is.EqualTo("rgba(0, 128, 0, 1)").Or.EqualTo("rgb(0, 128, 0)"));
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldAllowInheritedStylesToBeUsed()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("green-item"));
            string backgroundColour = element.GetCssValue("background-color");

            Assert.That(backgroundColour, Is.EqualTo("transparent").Or.EqualTo("rgba(0, 0, 0, 0)"));
        }
    }
}

using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class CssValueTest : DriverTestFixture
    {
        [Test]
        [Category("Javascript")]
        public void ShouldPickUpStyleOfAnElement()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("green-parent"));
            string backgroundColour = element.GetCssValue("background-color");

            Assert.That(backgroundColour, Is.EqualTo("#008000").Or.EqualTo("rgba(0, 128, 0, 1)"));

            element = driver.FindElement(By.Id("red-item"));
            backgroundColour = element.GetCssValue("background-color");

            Assert.That(backgroundColour, Is.EqualTo("#ff0000").Or.EqualTo("rgba(255, 0, 0, 1)"));
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
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

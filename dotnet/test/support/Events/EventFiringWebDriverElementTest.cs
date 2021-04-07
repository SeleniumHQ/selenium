using NUnit.Framework;

namespace OpenQA.Selenium.Support.Events
{
    [TestFixture]
    public class EventFiringWebDriverElementTest : DriverTestFixture
    {
        [SetUp]
        public void Setup()
        {
            driver.Url = formsPage;
        }

        [Test]
        public void CanTakeEventFiringWebElementScreenshot()
        {
            var firingDriver = new EventFiringWebDriver(driver);
            IWebElement element = firingDriver.FindElement(By.Name("checky"));
            Screenshot screenshot = ((ITakesScreenshot)element).GetScreenshot();

            Assert.IsNotNull(screenshot);
        }
    }
}

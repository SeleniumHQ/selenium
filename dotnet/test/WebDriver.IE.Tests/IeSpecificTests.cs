using NUnit.Framework;
using OpenQA.Selenium.IE;

namespace OpenQA.Selenium.IE
{
    [TestFixture]
    public class IeSpecificTests : DriverTestFixture
    {
        [Test]
        // TODO(andre.nogueira): Should this be a IE-only test?
        public void ShouldOpenAndCloseBrowserRepeatedly()
        {
            for (int i = 0; i < 5; i++)
            {
                Environment.EnvironmentManager.Instance.CloseCurrentDriver();
                CreateFreshDriver();
            }
        }

        [Test]
        //[Ignore("Temporarily ignoring test until automatic port finding is enabled")]
        public void ShouldBeAbleToStartMoreThanOneInstanceOfTheIEDriverSimultaneously()
        {
            IWebDriver secondDriver = new InternetExplorerDriver();

            driver.Url = xhtmlTestPage;
            secondDriver.Url = formsPage;

            Assert.AreEqual("XHTML Test Page", driver.Title);
            Assert.AreEqual("We Leave From Here", secondDriver.Title);

            // We only need to quit the second driver if the test passes
            secondDriver.Quit();
        }
    }
}

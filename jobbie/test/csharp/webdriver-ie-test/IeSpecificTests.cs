using NUnit.Framework;
using OpenQa.Selenium.IE;

namespace OpenQa.Selenium
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
                driver.Quit();
                driver = new InternetExplorerDriver();
            }
        }

        [Test]
        public void ShouldSwitchBrowserVisibility()
        {
            /* 
             * This way we can be sure the visibility
             * is switched at least once
             */
            ((InternetExplorerDriver)driver).Visible = true;
            Assert.IsTrue(((InternetExplorerDriver)driver).Visible);
            ((InternetExplorerDriver)driver).Visible = false;
            Assert.IsFalse(((InternetExplorerDriver)driver).Visible);
            ((InternetExplorerDriver)driver).Visible = true;
            Assert.IsTrue(((InternetExplorerDriver)driver).Visible);
        }
    }
}

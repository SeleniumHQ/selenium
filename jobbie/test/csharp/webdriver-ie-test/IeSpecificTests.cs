using NUnit.Framework;
using OpenQA.Selenium.IE;

namespace OpenQA.Selenium
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

using NUnit.Framework;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools
{
    using CurrentCdpVersion = V129;

    [TestFixture]
    public class DevToolsTabsTest : DevToolsTestFixture
    {

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task ClosingTabDoesNotBreakDevToolsSession()
        {
            var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
            await domains.Console.Enable();
            var oldWindowHandle = driver.CurrentWindowHandle;
            driver.SwitchTo().NewWindow(WindowType.Tab);
            driver.SwitchTo().Window(oldWindowHandle);
            driver.Close();
            Assert.That(
                async () =>
                {
                    await domains.Console.Enable();
                },
                Throws.Nothing
            );
        }
    }
}

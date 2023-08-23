using System;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.DevTools
{
    using CurrentCdpVersion = V116;

    [TestFixture]
    public class DevToolsConsoleTest : DevToolsTestFixture
    {
        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifyMessageAdded()
        {
            var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
            string consoleMessage = "Hello Selenium";

            ManualResetEventSlim sync = new ManualResetEventSlim(false);
            EventHandler<CurrentCdpVersion.Console.MessageAddedEventArgs> messageAddedHandler = (sender, e) =>
            {
                Assert.That(e.Message.Text, Is.EqualTo(consoleMessage));
                sync.Set();
            };

            domains.Console.MessageAdded += messageAddedHandler;

            await domains.Console.Enable();

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html");
            ((IJavaScriptExecutor)driver).ExecuteScript("console.log('" + consoleMessage + "');");
            sync.Wait(TimeSpan.FromSeconds(5));
            domains.Console.MessageAdded -= messageAddedHandler;

            await domains.Console.Disable();
        }
    }
}

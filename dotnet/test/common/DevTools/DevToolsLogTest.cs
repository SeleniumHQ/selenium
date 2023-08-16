using System;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.DevTools
{
    using CurrentCdpVersion = V116;

    [TestFixture]
    public class DevToolsLogTest : DevToolsTestFixture
    {
        [Test]
        [Ignore("Unable to open secure url")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifyEntryAddedAndClearLog()
        {
            var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
            ManualResetEventSlim sync = new ManualResetEventSlim(false);
            EventHandler<CurrentCdpVersion.Log.EntryAddedEventArgs> entryAddedHandler = (sender, e) =>
            {
                Assert.That(e.Entry.Text.Contains("404"));
                Assert.That(e.Entry.Level == CurrentCdpVersion.Log.LogEntryLevelValues.Error);
                sync.Set();
            };

            await domains.Log.Enable();
            domains.Log.EntryAdded += entryAddedHandler;

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("notValidPath");
            sync.Wait(TimeSpan.FromSeconds(5));

            domains.Log.EntryAdded -= entryAddedHandler;

            await domains.Log.Clear();
            await domains.Log.Disable();
        }
    }
}

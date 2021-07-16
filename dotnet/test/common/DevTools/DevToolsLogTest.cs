using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.DevTools
{
    [TestFixture]
    public class DevToolsLogTest : DevToolsTestFixture
    {
        [Test]
        [IgnoreBrowser(Selenium.Browser.EdgeLegacy, "Legacy Edge does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifyEntryAddedAndClearLog()
        {
            var domains = session.GetVersionSpecificDomains<V91.DevToolsSessionDomains>();
            ManualResetEventSlim sync = new ManualResetEventSlim(false);
            EventHandler<V91.Log.EntryAddedEventArgs> entryAddedHandler = (sender, e) =>
            {
                Assert.That(e.Entry.Text.Contains("404"));
                Assert.That(e.Entry.Level == V91.Log.LogEntryLevelValues.Error);
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

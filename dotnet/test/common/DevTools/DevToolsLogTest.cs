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
        public async Task VerifyEntryAddedAndClearLog()
        {
            ManualResetEventSlim sync = new ManualResetEventSlim(false);
            EventHandler<Log.EntryAddedEventArgs> entryAddedHandler = (sender, e) =>
            {
                Assert.That(e.Entry.Text.Contains("404"));
                Assert.That(e.Entry.Level == "error");
                sync.Set();
            };

            await session.Log.Enable();
            session.Log.EntryAdded += entryAddedHandler;

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("notValidPath");
            sync.Wait(TimeSpan.FromSeconds(5));

            session.Log.EntryAdded -= entryAddedHandler;

            await session.Log.Clear();
            await session.Log.Disable();
        }
    }
}

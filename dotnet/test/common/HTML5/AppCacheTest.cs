using System;
using NUnit.Framework;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.HTML5
{
    [TestFixture]
    public class AppCacheTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        [IgnoreBrowser(Browser.Chrome, "Not implemented")]
        public void TestAppCacheStatus()
        {
            driver.Url = simpleTestPage;
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromMilliseconds(2000));
            IApplicationCache appCache = ((RemoteWebDriver)driver).ApplicationCache;
            AppCacheStatus status = appCache.GetStatus();
            while (status == AppCacheStatus.DOWNLOADING)
            {
                status = appCache.GetStatus();
            }
            Assert.AreEqual(AppCacheStatus.UNCACHED, status);
        }
    }
}

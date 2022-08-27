using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;

namespace OpenQA.Selenium.DevTools
{
    [TestFixture]
    public class DevToolsPerformanceTest : DevToolsTestFixture
    {
        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task EnableAndDisablePerformance()
        {
            var domains = session.GetVersionSpecificDomains<V104.DevToolsSessionDomains>();
            await domains.Performance.Enable(new V104.Performance.EnableCommandSettings());
            driver.Url = simpleTestPage;
            await domains.Performance.Disable();
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task DisablePerformance()
        {
            var domains = session.GetVersionSpecificDomains<V104.DevToolsSessionDomains>();
            await domains.Performance.Disable();
            driver.Url = simpleTestPage;
            await domains.Performance.Disable();
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task SetTimeDomainTimeTickPerformance()
        {
            var domains = session.GetVersionSpecificDomains<V104.DevToolsSessionDomains>();
            await domains.Performance.Disable();
            await domains.Performance.SetTimeDomain(new V104.Performance.SetTimeDomainCommandSettings()
            {
                TimeDomain = "timeTicks"
            });
            await domains.Performance.Enable(new V104.Performance.EnableCommandSettings());
            driver.Url = simpleTestPage;
            await domains.Performance.Disable();
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task SetTimeDomainsThreadTicksPerformance()
        {
            var domains = session.GetVersionSpecificDomains<V104.DevToolsSessionDomains>();
            await domains.Performance.Disable();
            await domains.Performance.SetTimeDomain(new V104.Performance.SetTimeDomainCommandSettings()
            {
                TimeDomain = "threadTicks"
            });
            await domains.Performance.Enable(new V104.Performance.EnableCommandSettings());
            driver.Url = simpleTestPage;
            await domains.Performance.Disable();
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task GetMetricsByTimeTicks()
        {
            var domains = session.GetVersionSpecificDomains<V104.DevToolsSessionDomains>();
            await domains.Performance.SetTimeDomain(new V104.Performance.SetTimeDomainCommandSettings()
            {
                TimeDomain = "timeTicks"
            });
            await domains.Performance.Enable(new V104.Performance.EnableCommandSettings());
            driver.Url = simpleTestPage;
            var response = await domains.Performance.GetMetrics();
            var metrics = response.Metrics;
            Assert.That(metrics, Is.Not.Null);
            Assert.That(metrics.Length, Is.GreaterThan(0));
            await domains.Performance.Disable();
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task GetMetricsByThreadTicks()
        {
            var domains = session.GetVersionSpecificDomains<V104.DevToolsSessionDomains>();
            await domains.Performance.SetTimeDomain(new V104.Performance.SetTimeDomainCommandSettings()
            {
                TimeDomain = "threadTicks"
            });
            await domains.Performance.Enable(new V104.Performance.EnableCommandSettings());
            driver.Url = simpleTestPage;
            var response = await domains.Performance.GetMetrics();
           var metrics = response.Metrics;
            Assert.That(metrics, Is.Not.Null);
            Assert.That(metrics.Length, Is.GreaterThan(0));
            await domains.Performance.Disable();
        }
    }
}

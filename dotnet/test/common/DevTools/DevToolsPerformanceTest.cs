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
        public async Task EnableAndDisablePerformance()
        {
            await session.Performance.Enable();
            driver.Url = simpleTestPage;
            await session.Performance.Disable();
        }

        [Test]
        public async Task DisablePerformance()
        {
            await session.Performance.Disable();
            driver.Url = simpleTestPage;
            await session.Performance.Disable();
        }

        [Test]
        public async Task SetTimeDomainTimeTickPerformance()
        {
            await session.Performance.Disable();
            await session.Performance.SetTimeDomain(new Performance.SetTimeDomainCommandSettings()
            {
                TimeDomain = "timeTicks"
            });
            await session.Performance.Enable();
            driver.Url = simpleTestPage;
            await session.Performance.Disable();
        }

        [Test]
        public async Task SetTimeDomainsThreadTicksPerformance()
        {
            await session.Performance.Disable();
            await session.Performance.SetTimeDomain(new Performance.SetTimeDomainCommandSettings()
            {
                TimeDomain = "threadTicks"
            });
            await session.Performance.Enable();
            driver.Url = simpleTestPage;
            await session.Performance.Disable();
        }

        [Test]
        public async Task GetMetricsByTimeTicks()
        {
            await session.Performance.SetTimeDomain(new Performance.SetTimeDomainCommandSettings()
            {
                TimeDomain = "timeTicks"
            });
            await session.Performance.Enable();
            driver.Url = simpleTestPage;
            var response = await session.Performance.GetMetrics();
            Performance.Metric[] metrics = response.Metrics;
            Assert.That(metrics, Is.Not.Null);
            Assert.That(metrics.Length, Is.GreaterThan(0));
            await session.Performance.Disable();
        }

        [Test]
        public async Task GetMetricsByThreadTicks()
        {
            await session.Performance.SetTimeDomain(new Performance.SetTimeDomainCommandSettings()
            {
                TimeDomain = "threadTicks"
            });
            await session.Performance.Enable();
            driver.Url = simpleTestPage;
            var response = await session.Performance.GetMetrics();
            Performance.Metric[] metrics = response.Metrics;
            Assert.That(metrics, Is.Not.Null);
            Assert.That(metrics.Length, Is.GreaterThan(0));
            await session.Performance.Disable();
        }
    }
}

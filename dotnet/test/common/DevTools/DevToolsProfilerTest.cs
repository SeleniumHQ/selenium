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
    public class DevToolsProfilerTest : DevToolsTestFixture
    {
        [Test]
        [IgnoreBrowser(Selenium.Browser.EdgeLegacy, "Legacy Edge does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task SimpleStartStopAndGetProfilerTest()
        {
            await session.Profiler.Enable();
            await session.Profiler.Start();
            var response = await session.Profiler.Stop();
            Profiler.Profile profiler = response.Profile;
            ValidateProfile(profiler);
            await session.Profiler.Disable();
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.EdgeLegacy, "Legacy Edge does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task SampleGetBestEffortProfilerTest()
        {
            await session.Profiler.Enable();
            driver.Url = simpleTestPage;
            await session.Profiler.SetSamplingInterval(new Profiler.SetSamplingIntervalCommandSettings()
            {
                Interval = 30
            });

            var response = await session.Profiler.GetBestEffortCoverage();
            var bestEffort = response.Result;
            Assert.That(bestEffort, Is.Not.Null);
            Assert.That(bestEffort.Length, Is.GreaterThan(0));
            await session.Profiler.Disable();
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.EdgeLegacy, "Legacy Edge does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task SampleSetStartPreciseCoverageTest()
        {
            await session.Profiler.Enable();
            driver.Url = simpleTestPage;
            await session.Profiler.StartPreciseCoverage(new Profiler.StartPreciseCoverageCommandSettings()
            {
                CallCount = true,
                Detailed = true
            });
            await session.Profiler.Start();
            var coverageResponse = await session.Profiler.TakePreciseCoverage();
            var pc = coverageResponse.Result;
            Assert.That(pc, Is.Not.Null);
            var response = await session.Profiler.Stop();
            Profiler.Profile profiler = response.Profile;
            ValidateProfile(profiler);
            await session.Profiler.Disable();
        }


        [Test]
        [IgnoreBrowser(Selenium.Browser.EdgeLegacy, "Legacy Edge does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task SampleProfileEvents()
        {
            await session.Profiler.Enable();
            driver.Url = simpleTestPage;
            ManualResetEventSlim startSync = new ManualResetEventSlim(false);
            EventHandler<Profiler.ConsoleProfileStartedEventArgs> consoleProfileStartedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                startSync.Set();
            };
            session.Profiler.ConsoleProfileStarted += consoleProfileStartedHandler;

            await session.Profiler.StartTypeProfile();
            await session.Profiler.Start();
            startSync.Wait(TimeSpan.FromSeconds(5));
            driver.Navigate().Refresh();

            ManualResetEventSlim finishSync = new ManualResetEventSlim(false);
            EventHandler<Profiler.ConsoleProfileFinishedEventArgs> consoleProfileFinishedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                finishSync.Set();
            };
            session.Profiler.ConsoleProfileFinished += consoleProfileFinishedHandler;

            await session.Profiler.StopTypeProfile();
            var response = await session.Profiler.Stop();
            finishSync.Wait(TimeSpan.FromSeconds(5));

            Profiler.Profile profiler = response.Profile;
            ValidateProfile(profiler);
            await session.Profiler.Disable();
        }

        private void ValidateProfile(Profiler.Profile profiler)
        {
            Assert.That(profiler, Is.Not.Null);
            Assert.That(profiler.Nodes, Is.Not.Null);
            Assert.That(profiler.StartTime, Is.Not.Null);
            Assert.That(profiler.EndTime, Is.Not.Null);
            Assert.That(profiler.TimeDeltas, Is.Not.Null);
            foreach (var delta in profiler.TimeDeltas)
            {
                Assert.That(delta, Is.Not.Null);
            }

            foreach (var node in profiler.Nodes)
            {
                Assert.That(node, Is.Not.Null);
                Assert.That(node.CallFrame, Is.Not.Null);
            }
        }
    }
}

// <copyright file="DevToolsPerformanceTest.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using NUnit.Framework;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools;

using CurrentCdpVersion = V138;

[TestFixture]
public class DevToolsPerformanceTest : DevToolsTestFixture
{
    [Test]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task EnableAndDisablePerformance()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        await domains.Performance.Enable(new CurrentCdpVersion.Performance.EnableCommandSettings());
        driver.Url = simpleTestPage;
        await domains.Performance.Disable();
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task DisablePerformance()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        await domains.Performance.Disable();
        driver.Url = simpleTestPage;
        await domains.Performance.Disable();
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task SetTimeDomainTimeTickPerformance()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        await domains.Performance.Disable();
        await domains.Performance.SetTimeDomain(new CurrentCdpVersion.Performance.SetTimeDomainCommandSettings()
        {
            TimeDomain = "timeTicks"
        });
        await domains.Performance.Enable(new CurrentCdpVersion.Performance.EnableCommandSettings());
        driver.Url = simpleTestPage;
        await domains.Performance.Disable();
    }

    [Test]
    [IgnorePlatform("Windows", "Thread time is not supported on this platform")]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task SetTimeDomainsThreadTicksPerformance()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        await domains.Performance.Disable();
        await domains.Performance.SetTimeDomain(new CurrentCdpVersion.Performance.SetTimeDomainCommandSettings()
        {
            TimeDomain = "threadTicks"
        });
        await domains.Performance.Enable(new CurrentCdpVersion.Performance.EnableCommandSettings());
        driver.Url = simpleTestPage;
        await domains.Performance.Disable();
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task GetMetricsByTimeTicks()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        await domains.Performance.SetTimeDomain(new CurrentCdpVersion.Performance.SetTimeDomainCommandSettings()
        {
            TimeDomain = "timeTicks"
        });
        await domains.Performance.Enable(new CurrentCdpVersion.Performance.EnableCommandSettings());
        driver.Url = simpleTestPage;
        var response = await domains.Performance.GetMetrics();
        var metrics = response.Metrics;
        Assert.That(metrics, Is.Not.Null);
        Assert.That(metrics.Length, Is.GreaterThan(0));
        await domains.Performance.Disable();
    }

    [Test]
    [IgnorePlatform("Windows", "Thread time is not supported on this platform")]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task GetMetricsByThreadTicks()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        await domains.Performance.SetTimeDomain(new CurrentCdpVersion.Performance.SetTimeDomainCommandSettings()
        {
            TimeDomain = "threadTicks"
        });
        await domains.Performance.Enable(new CurrentCdpVersion.Performance.EnableCommandSettings());
        driver.Url = simpleTestPage;
        var response = await domains.Performance.GetMetrics();
        var metrics = response.Metrics;
        Assert.That(metrics, Is.Not.Null);
        Assert.That(metrics.Length, Is.GreaterThan(0));
        await domains.Performance.Disable();
    }
}

// <copyright file="SeleniumManagerTest.cs" company="Selenium Committers">
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
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Edge;
using OpenQA.Selenium.Environment;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Safari;
using System;
using System.IO;

namespace OpenQA.Selenium;

[TestFixture]
[Category("SeleniumManager")]
[IgnoreBrowser(Browser.IE, "IE does not use Selenium Manager")]
[IgnoreBrowser(Browser.Safari, "Safari does not need Selenium Manager")]
[IgnoreBrowser(Browser.Remote, "Remote does not use Selenium Manager directly")]
public class SeleniumManagerTest
{
    private static readonly string CacheDirectory = System.Environment.GetEnvironmentVariable("SE_CACHE") ?? Path.Combine(".cache", "selenium");

    private DriverOptions CreateOptionsForCurrentBrowser()
    {
        return EnvironmentManager.Instance.Browser switch
        {
            Browser.Chrome => new ChromeOptions(),
            Browser.Firefox => new FirefoxOptions(),
            Browser.Edge => new EdgeOptions(),
            _ => throw new NotSupportedException($"Browser {EnvironmentManager.Instance.Browser} is not supported for Selenium Manager tests")
        };
    }

    private DriverService CreateServiceForCurrentBrowser(string driverPath)
    {
        return EnvironmentManager.Instance.Browser switch
        {
            Browser.Chrome => ChromeDriverService.CreateDefaultService(driverPath),
            Browser.Firefox => FirefoxDriverService.CreateDefaultService(driverPath),
            Browser.Edge => EdgeDriverService.CreateDefaultService(driverPath),
            _ => throw new NotSupportedException($"Browser {EnvironmentManager.Instance.Browser} is not supported for Selenium Manager tests")
        };
    }

    [Test]
    public void ShouldGetDriverAndBrowserPaths()
    {
        var options = CreateOptionsForCurrentBrowser();
        var driverFinder = new DriverFinder(options);

        string driverPath = driverFinder.GetDriverPath();
        string browserPath = driverFinder.GetBrowserPath();

        Assert.That(File.Exists(driverPath), Is.True, $"Driver path should exist: {driverPath}");
        Assert.That(File.Exists(browserPath), Is.True, $"Browser path should exist: {browserPath}");
        Assert.That(driverPath, Is.SubPathOf(CacheDirectory), $"Driver path should be nested under the cache directory: {driverPath}");
        Assert.That(browserPath, Does.Contain(CacheDirectory), $"Browser path should contain cache directory: {browserPath}");
    }

    [Test]
    public void ShouldStartDriverService()
    {
        var options = CreateOptionsForCurrentBrowser();
        var driverFinder = new DriverFinder(options);

        string driverPath = driverFinder.GetDriverPath();
        var service = CreateServiceForCurrentBrowser(driverPath);

        try
        {
            service.Start();
            Assert.That(service.ServiceUrl, Is.Not.Null);
            Assert.That(service.ServiceUrl.IsAbsoluteUri, Is.True);
        }
        finally
        {
            service.Dispose();
        }
    }
}

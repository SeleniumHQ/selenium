// <copyright file="DriverServiceTests.cs" company="Selenium Committers">
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

using System.ComponentModel;
using System.IO;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Edge;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.IE;
using OpenQA.Selenium.Safari;

namespace OpenQA.Selenium.Tests;

[TestFixture]
[NonParallelizable]
public class DriverServiceTests
{
    private static IEnumerable<TestCaseData> DriverServices()
    {
        yield return new TestCaseData((Func<DriverService>)ChromeDriverService.CreateDefaultService, "SE_CHROMEDRIVER").SetName("Chrome");
        yield return new TestCaseData((Func<DriverService>)EdgeDriverService.CreateDefaultService, "SE_EDGEDRIVER").SetName("Edge");
        yield return new TestCaseData((Func<DriverService>)FirefoxDriverService.CreateDefaultService, "SE_GECKODRIVER").SetName("Firefox");
        yield return new TestCaseData((Func<DriverService>)InternetExplorerDriverService.CreateDefaultService, "SE_IEDRIVER").SetName("InternetExplorer");
        yield return new TestCaseData((Func<DriverService>)SafariDriverService.CreateDefaultService, "SE_SAFARIDRIVER").SetName("Safari");
    }

    [TestCaseSource(nameof(DriverServices))]
    public void StartsDriverFromEnvironmentVariable(Func<DriverService> createService, string environmentVariable)
    {
        string original = Environment.GetEnvironmentVariable(environmentVariable);
        string expectedPath = Path.Combine("path", "to", "driver");
        try
        {
            Environment.SetEnvironmentVariable(environmentVariable, expectedPath);

            Assert.That(
                async () => await createService().StartAsync(),
                Throws.InstanceOf<Win32Exception>().With.Message.Contains(expectedPath));
        }
        finally
        {
            Environment.SetEnvironmentVariable(environmentVariable, original);
        }
    }
}

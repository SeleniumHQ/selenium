// <copyright file="BiDiFixture.cs" company="Selenium Committers">
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
using OpenQA.Selenium.Environment;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi;

[Parallelizable(ParallelScope.All)]
[FixtureLifeCycle(LifeCycle.InstancePerTestCase)]
public class BiDiTestFixture
{
    protected IWebDriver driver;
    protected BiDi bidi;
    protected BrowsingContext.BrowsingContext context;

    protected UrlBuilder UrlBuilder { get; } = EnvironmentManager.Instance.UrlBuilder;

    [SetUp]
    public async Task BiDiSetUp()
    {
        var options = new BiDiEnabledDriverOptions()
        {
            UseWebSocketUrl = true,
            UnhandledPromptBehavior = UnhandledPromptBehavior.Ignore,
        };

        driver = EnvironmentManager.Instance.CreateDriverInstance(options);

        bidi = await driver.AsBiDiAsync();

        context = (await bidi.BrowsingContext.GetTreeAsync())[0].Context;
    }

    [TearDown]
    public async Task BiDiTearDown()
    {
        if (bidi is not null)
        {
            await bidi.DisposeAsync();
        }

        driver?.Dispose();
    }

    public class BiDiEnabledDriverOptions : DriverOptions
    {
        public override void AddAdditionalOption(string capabilityName, object capabilityValue)
        {
        }

        public override ICapabilities ToCapabilities()
        {
            return null;
        }
    }
}

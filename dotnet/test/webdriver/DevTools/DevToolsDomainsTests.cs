// <copyright file="DevToolsDomainsTests.cs" company="Selenium Committers">
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

using OpenQA.Selenium.DevTools;

namespace OpenQA.Selenium.Tests.DevTools;

[TestFixture]
public class DevToolsDomainsTests : DevToolsTestFixture
{
    [Test]
    [IgnoreBrowser(Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task VerifyVersionSpecificDomainsAccessors()
    {
        var domains = ((DevToolsSession)session).Domains;

        Assert.That(domains.Log, Is.SameAs(domains.Log));
        Assert.That(domains.Network, Is.SameAs(domains.Network));
        Assert.That(domains.Target, Is.SameAs(domains.Target));
        Assert.That(domains.JavaScript, Is.SameAs(domains.JavaScript));
    }
}

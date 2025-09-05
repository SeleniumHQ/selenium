// <copyright file="DevToolsLogTest.cs" company="Selenium Committers">
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
using System;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools;

using CurrentCdpVersion = V139;

[TestFixture]
public class DevToolsLogTest : DevToolsTestFixture
{
    [Test]
    [Ignore("Unable to open secure url")]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task VerifyEntryAddedAndClearLog()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        ManualResetEventSlim sync = new ManualResetEventSlim(false);
        EventHandler<CurrentCdpVersion.Log.EntryAddedEventArgs> entryAddedHandler = (sender, e) =>
        {
            Assert.That(e.Entry.Text.Contains("404"));
            Assert.That(e.Entry.Level == CurrentCdpVersion.Log.LogEntryLevelValues.Error);
            sync.Set();
        };

        await domains.Log.Enable();
        domains.Log.EntryAdded += entryAddedHandler;

        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("notValidPath");
        sync.Wait(TimeSpan.FromSeconds(5));

        domains.Log.EntryAdded -= entryAddedHandler;

        await domains.Log.Clear();
        await domains.Log.Disable();
    }
}

// <copyright file="DevToolsSecurityTest.cs" company="Selenium Committers">
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
public class DevToolsSecurityTest : DevToolsTestFixture
{
    //[Test]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task LoadInsecureWebsite()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        await domains.Security.Enable();

        await domains.Security.SetIgnoreCertificateErrors(new CurrentCdpVersion.Security.SetIgnoreCertificateErrorsCommandSettings()
        {
            Ignore = false
        });

        string summary = null;
        ManualResetEventSlim sync = new ManualResetEventSlim(false);
        EventHandler<CurrentCdpVersion.Security.SecurityStateChangedEventArgs> securityStateChangedHandler = (sender, e) =>
        {
            summary = e.Summary;
            sync.Set();
        };
        domains.Security.SecurityStateChanged += securityStateChangedHandler;

        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsSecurityTest");
        sync.Wait(TimeSpan.FromSeconds(5));

        await domains.Security.Disable();

        Assert.That(driver.PageSource, Contains.Substring("Security Test"));
        Assert.That(summary, Contains.Substring("This page has a non-HTTPS secure origin"));
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task LoadSecureWebsite()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        await domains.Security.Enable();

        await domains.Security.SetIgnoreCertificateErrors(new CurrentCdpVersion.Security.SetIgnoreCertificateErrorsCommandSettings()
        {
            Ignore = true
        });

        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsSecurityTest");
        Assert.That(driver.PageSource, Contains.Substring("Security Test"));
    }
}

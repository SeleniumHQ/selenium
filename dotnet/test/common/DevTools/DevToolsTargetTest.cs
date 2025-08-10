// <copyright file="DevToolsTargetTest.cs" company="Selenium Committers">
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

using CurrentCdpVersion = V138;

[TestFixture]
public class DevToolsTargetTest : DevToolsTestFixture
{
    private int id = 138;

    [Test]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task GetTargetActivateAndAttach()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html");
        var response = await domains.Target.GetTargets(new CurrentCdpVersion.Target.GetTargetsCommandSettings());
        CurrentCdpVersion.Target.TargetInfo[] allTargets = response.TargetInfos;
        foreach (CurrentCdpVersion.Target.TargetInfo targetInfo in allTargets)
        {
            ValidateTarget(targetInfo);
            await domains.Target.ActivateTarget(new CurrentCdpVersion.Target.ActivateTargetCommandSettings()
            {
                TargetId = targetInfo.TargetId
            });
            var attachResponse = await domains.Target.AttachToTarget(new CurrentCdpVersion.Target.AttachToTargetCommandSettings()
            {
                TargetId = targetInfo.TargetId,
                Flatten = true
            });
            ValidateSession(attachResponse.SessionId);
            var getInfoResponse = await domains.Target.GetTargetInfo(new CurrentCdpVersion.Target.GetTargetInfoCommandSettings()
            {
                TargetId = targetInfo.TargetId
            });
            ValidateTargetInfo(getInfoResponse.TargetInfo);
        }
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task GetTargetAndSendMessageToTarget()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        CurrentCdpVersion.Target.TargetInfo[] allTargets = null;
        string sessionId = null;
        CurrentCdpVersion.Target.TargetInfo targetInfo = null;
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html");
        ManualResetEventSlim sync = new ManualResetEventSlim(false);
        domains.Target.ReceivedMessageFromTarget += (sender, e) =>
        {
            ValidateMessage(e);
            sync.Set();
        };
        var targetsResponse = await domains.Target.GetTargets(new CurrentCdpVersion.Target.GetTargetsCommandSettings());
        allTargets = targetsResponse.TargetInfos;
        ValidateTargetsInfos(allTargets);
        ValidateTarget(allTargets[0]);
        targetInfo = allTargets[0];
        await domains.Target.ActivateTarget(new CurrentCdpVersion.Target.ActivateTargetCommandSettings()
        {
            TargetId = targetInfo.TargetId
        });

        var attachResponse = await domains.Target.AttachToTarget(new CurrentCdpVersion.Target.AttachToTargetCommandSettings()
        {
            TargetId = targetInfo.TargetId,
            Flatten = false
        });
        sessionId = attachResponse.SessionId;
        ValidateSession(sessionId);
        await domains.Target.SendMessageToTarget(new CurrentCdpVersion.Target.SendMessageToTargetCommandSettings()
        {
            Message = "{\"id\":" + id + ",\"method\":\"Page.bringToFront\"}",
            SessionId = sessionId,
            TargetId = targetInfo.TargetId
        });
        sync.Wait(TimeSpan.FromSeconds(5));
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
    [IgnoreBrowser(Selenium.Browser.Edge, "We run it in Chrome and Edge releases are usually late.")]
    public async Task CreateAndContentLifeCycle()
    {
        var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
        EventHandler<CurrentCdpVersion.Target.TargetCreatedEventArgs> targetCreatedHandler = (sender, e) =>
        {
            ValidateTargetInfo(e.TargetInfo);
        };
        domains.Target.TargetCreated += targetCreatedHandler;

        EventHandler<CurrentCdpVersion.Target.TargetCrashedEventArgs> targetCrashedHandler = (sender, e) =>
        {
            ValidateTargetCrashed(e);
        };
        domains.Target.TargetCrashed += targetCrashedHandler;

        EventHandler<CurrentCdpVersion.Target.TargetDestroyedEventArgs> targetDestroyedHandler = (sender, e) =>
        {
            ValidateTargetId(e.TargetId);
        };
        domains.Target.TargetDestroyed += targetDestroyedHandler;

        EventHandler<CurrentCdpVersion.Target.TargetInfoChangedEventArgs> targetInfoChangedHandler = (sender, e) =>
        {
            ValidateTargetInfo(e.TargetInfo);
        };
        domains.Target.TargetInfoChanged += targetInfoChangedHandler;

        var response = await domains.Target.CreateTarget(new CurrentCdpVersion.Target.CreateTargetCommandSettings()
        {
            Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html"),
            NewWindow = true,
            Background = false
        });

        ValidateTargetId(response.TargetId);
        await domains.Target.SetDiscoverTargets(new CurrentCdpVersion.Target.SetDiscoverTargetsCommandSettings()
        {
            Discover = true
        });

        var closeResponse = await domains.Target.CloseTarget(new CurrentCdpVersion.Target.CloseTargetCommandSettings()
        {
            TargetId = response.TargetId
        });

        Assert.That(closeResponse, Is.Not.Null);
        Assert.That(closeResponse.Success, Is.True);
    }

    private void ValidateTargetCrashed(CurrentCdpVersion.Target.TargetCrashedEventArgs targetCrashed)
    {
        Assert.That(targetCrashed, Is.Not.Null);
        Assert.That(targetCrashed.ErrorCode, Is.Not.Null);
        Assert.That(targetCrashed.Status, Is.Not.Null);
        Assert.That(targetCrashed.TargetId, Is.Not.Null);
    }

    private void ValidateTargetId(string targetId)
    {
        Assert.That(targetId, Is.Not.Null);
    }

    private void ValidateMessage(CurrentCdpVersion.Target.ReceivedMessageFromTargetEventArgs messageFromTarget)
    {
        Assert.That(messageFromTarget, Is.Not.Null);
        Assert.That(messageFromTarget.Message, Is.Not.Null);
        Assert.That(messageFromTarget.SessionId, Is.Not.Null);
        Assert.That(messageFromTarget.Message, Is.EqualTo("{\"id\":" + id + ",\"result\":{}}"));
    }

    private void ValidateTargetInfo(CurrentCdpVersion.Target.TargetInfo targetInfo)
    {
        Assert.That(targetInfo, Is.Not.Null);
        Assert.That(targetInfo.TargetId, Is.Not.Null);
        Assert.That(targetInfo.Title, Is.Not.Null);
        Assert.That(targetInfo.Type, Is.Not.Null);
        Assert.That(targetInfo.Url, Is.Not.Null);
    }

    private void ValidateTargetsInfos(CurrentCdpVersion.Target.TargetInfo[] targets)
    {
        Assert.That(targets, Is.Not.Null);
        Assert.That(targets.Length, Is.GreaterThan(0));
    }

    private void ValidateTarget(CurrentCdpVersion.Target.TargetInfo targetInfo)
    {
        Assert.That(targetInfo, Is.Not.Null);
        Assert.That(targetInfo.TargetId, Is.Not.Null);
        Assert.That(targetInfo.Title, Is.Not.Null);
        Assert.That(targetInfo.Type, Is.Not.Null);
        Assert.That(targetInfo.Url, Is.Not.Null);
    }

    private void ValidateSession(string sessionId)
    {
        Assert.That(sessionId, Is.Not.Null);
    }
}

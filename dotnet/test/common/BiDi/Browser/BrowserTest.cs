// <copyright file="BrowserTest.cs" company="Selenium Committers">
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
using System.Linq;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Browser;

class BrowserTest : BiDiTestFixture
{
    [Test]
    public async Task CanCreateUserContext()
    {
        var userContext = await bidi.Browser.CreateUserContextAsync();

        Assert.That(userContext, Is.Not.Null);
    }

    [Test]
    public async Task CanGetUserContexts()
    {
        var userContext1 = await bidi.Browser.CreateUserContextAsync();
        var userContext2 = await bidi.Browser.CreateUserContextAsync();

        var userContextsResult = await bidi.Browser.GetUserContextsAsync();

        Assert.That(userContextsResult, Is.Not.Null);
        Assert.That(userContextsResult.UserContexts, Has.Count.GreaterThanOrEqualTo(2));
        Assert.That(userContextsResult.UserContexts.Select(contextInfo => contextInfo.UserContext), Does.Contain(userContext1.UserContext));
        Assert.That(userContextsResult.UserContexts.Select(contextInfo => contextInfo.UserContext), Does.Contain(userContext2.UserContext));
    }

    [Test]
    public async Task CanRemoveUserContext()
    {
        var userContext1 = await bidi.Browser.CreateUserContextAsync();
        var userContext2 = await bidi.Browser.CreateUserContextAsync();

        await userContext2.UserContext.RemoveAsync();

        var userContextsResult = await bidi.Browser.GetUserContextsAsync();

        Assert.That(userContextsResult.UserContexts.Select(contextInfo => contextInfo.UserContext), Does.Contain(userContext1.UserContext));
        Assert.That(userContextsResult.UserContexts.Select(contextInfo => contextInfo.UserContext), Does.Not.Contain(userContext2.UserContext));
    }

    [Test]
    public async Task CanGetClientWindows()
    {
        var clientWindowsResult = await bidi.Browser.GetClientWindowsAsync();

        Assert.That(clientWindowsResult, Is.Not.Null);
        Assert.That(clientWindowsResult.ClientWindows, Has.Count.GreaterThanOrEqualTo(1));
        Assert.That(clientWindowsResult.ClientWindows[0].ClientWindow, Is.Not.Null);
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.Chrome, "Not supported yet?")]
    [IgnoreBrowser(Selenium.Browser.Edge, "Not supported yet?")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Not supported yet?")]
    public async Task CanSetDownloadBehaviorAllowed()
    {
        var result = await bidi.Browser.SetDownloadBehaviorAllowedAsync("/my/path");

        Assert.That(result, Is.Not.Null);
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.Chrome, "Not supported yet?")]
    [IgnoreBrowser(Selenium.Browser.Edge, "Not supported yet?")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Not supported yet?")]
    public async Task CanSetDownloadBehaviorAllowedDefault()
    {
        var result = await bidi.Browser.SetDownloadBehaviorAllowedAsync();

        Assert.That(result, Is.Not.Null);
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.Chrome, "Not supported yet?")]
    [IgnoreBrowser(Selenium.Browser.Edge, "Not supported yet?")]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Not supported yet?")]
    public async Task CanSetDownloadBehaviorDenied()
    {
        var result = await bidi.Browser.SetDownloadBehaviorDeniedAsync();

        Assert.That(result, Is.Not.Null);
    }
}

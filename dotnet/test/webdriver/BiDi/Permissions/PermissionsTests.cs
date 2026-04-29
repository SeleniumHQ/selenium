// <copyright file="PermissionsTests.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.BrowsingContext;
using OpenQA.Selenium.BiDi.Permissions;
using OpenQA.Selenium.BiDi.Script;
using OpenQA.Selenium.Tests.Infrastructure.Environment;

namespace OpenQA.Selenium.Tests.BiDi.Permissions;

internal class PermissionsTests : BiDiTestFixture
{
    [Test]
    public async Task SettingPermissionsTest()
    {
        var userContext = await bidi.Browser.CreateUserContextAsync();
        var window = (await bidi.BrowsingContext.CreateAsync(ContextType.Window, new()
        {
            ReferenceContext = context,
            UserContext = userContext.UserContext,
            Background = true
        })).Context;

        var newPage = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
            .WithBody("<div>new page</div>"));

        await window.NavigateAsync(newPage);

        var before = await window.Script.CallFunctionAsync("""
            async () => (await navigator.permissions.query({ name: "geolocation" })).state
            """, awaitPromise: true, new() { UserActivation = true, });

        Assert.That(before.AsSuccessResult(), Is.EqualTo(new StringRemoteValue("prompt")));

        var permissions = bidi.AsPermissions();

        await permissions.SetPermissionAsync(new PermissionDescriptor("geolocation"), PermissionState.Denied, newPage, new() { UserContext = userContext.UserContext });

        var after = await window.Script.CallFunctionAsync("""
            async () => (await navigator.permissions.query({ name: "geolocation" })).state
            """, awaitPromise: true, new() { UserActivation = true });

        Assert.That(after.AsSuccessResult(), Is.EqualTo(new StringRemoteValue("denied")));
    }
}

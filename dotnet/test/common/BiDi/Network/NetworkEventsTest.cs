// <copyright file="NetworkEventsTest.cs" company="Selenium Committers">
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
using OpenQA.Selenium.BiDi.BrowsingContext;
using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Network;

class NetworkEventsTest : BiDiTestFixture
{
    [Test]
    public async Task CanListenToBeforeRequestSentEvent()
    {
        TaskCompletionSource<BeforeRequestSentEventArgs> tcs = new();

        await using var subscription = await context.Network.OnBeforeRequestSentAsync(tcs.SetResult);

        await context.NavigateAsync(UrlBuilder.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        var req = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(req.Context, Is.EqualTo(context));
        Assert.That(req.Request, Is.Not.Null);
        Assert.That(req.Request.Method, Is.EqualTo("GET"));
        Assert.That(req.Request.Url, Does.Contain("bidi/logEntryAdded.html"));
        Assert.That(req.Initiator.Type, Is.EqualTo(InitiatorType.Other));
    }

    [Test]
    public async Task CanListenToResponseStartedEvent()
    {
        TaskCompletionSource<ResponseStartedEventArgs> tcs = new();

        await using var subscription = await context.Network.OnResponseStartedAsync(tcs.SetResult);

        await context.NavigateAsync(UrlBuilder.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        var res = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(res.Context, Is.EqualTo(context));
        Assert.That(res.Request, Is.Not.Null);
        Assert.That(res.Request.Method, Is.EqualTo("GET"));
        Assert.That(res.Request.Url, Does.Contain("bidi/logEntryAdded.html"));
        Assert.That(res.Response.Headers, Is.Not.Empty);
        Assert.That(res.Response.Status, Is.EqualTo(200));
    }

    [Test]
    public async Task CanListenToResponseCompletedEvent()
    {
        TaskCompletionSource<ResponseCompletedEventArgs> tcs = new();

        await using var subscription = await context.Network.OnResponseCompletedAsync(tcs.SetResult);

        await context.NavigateAsync(UrlBuilder.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        var res = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(res.Context, Is.EqualTo(context));
        Assert.That(res.Request, Is.Not.Null);
        Assert.That(res.Request.Method, Is.EqualTo("GET"));
        Assert.That(res.Request.Url, Does.Contain("bidi/logEntryAdded.html"));
        Assert.That(res.Response.Url, Does.Contain("bidi/logEntryAdded.html"));
        Assert.That(res.Response.Headers, Is.Not.Empty);
        Assert.That(res.Response.Status, Is.EqualTo(200));
    }

    [Test]
    public async Task CanListenToBeforeRequestSentEventWithCookie()
    {
        TaskCompletionSource<BeforeRequestSentEventArgs> tcs = new();

        await context.NavigateAsync(UrlBuilder.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        driver.Manage().Cookies.AddCookie(new("foo", "bar"));

        await using var subscription = await bidi.Network.OnBeforeRequestSentAsync(tcs.SetResult);

        await context.ReloadAsync();

        var req = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(req.Request.Cookies, Has.Count.EqualTo(1));
        Assert.That(req.Request.Cookies[0].Name, Is.EqualTo("foo"));
        Assert.That((req.Request.Cookies[0].Value as StringBytesValue).Value, Is.EqualTo("bar"));
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.Chrome)]
    [IgnoreBrowser(Selenium.Browser.Edge)]
    public async Task CanListenToOnAuthRequiredEvent()
    {
        TaskCompletionSource<AuthRequiredEventArgs> tcs = new();

        await using var subscription = await context.Network.OnAuthRequiredAsync(tcs.SetResult);

        driver.Url = UrlBuilder.WhereIs("basicAuth");

        var res = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(res.Context, Is.EqualTo(context));
        Assert.That(res.Request, Is.Not.Null);
        Assert.That(res.Request.Method, Is.EqualTo("GET"));
        Assert.That(res.Request.Url, Does.Contain("basicAuth"));
        Assert.That(res.Response.Headers, Is.Not.Null.And.Count.GreaterThanOrEqualTo(1));
        Assert.That(res.Response.Status, Is.EqualTo(401));
    }

    [Test]
    public async Task CanListenToFetchError()
    {
        TaskCompletionSource<FetchErrorEventArgs> tcs = new();

        await using var subscription = await context.Network.OnFetchErrorAsync(tcs.SetResult);

        try
        {
            await context.NavigateAsync("https://not_a_valid_url.test", new() { Wait = ReadinessState.Complete });
        }
        catch (Exception) { }

        var res = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(res.Context, Is.EqualTo(context));
        Assert.That(res.Request, Is.Not.Null);
        Assert.That(res.Request.Method, Is.EqualTo("GET"));
        Assert.That(res.Request.Url, Does.Contain("https://not_a_valid_url.test"));
        Assert.That(res.Request.Headers.Count, Is.GreaterThanOrEqualTo(1));
        Assert.That(res.Navigation, Is.Not.Null);
        Assert.That(res.ErrorText, Does.Contain("net::ERR_NAME_NOT_RESOLVED").Or.Contain("NS_ERROR_UNKNOWN_HOST"));
    }
}

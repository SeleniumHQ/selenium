// <copyright file="NetworkTest.cs" company="Selenium Committers">
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
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Network;

class NetworkTest : BiDiTestFixture
{
    [Test]
    public async Task CanAddIntercept()
    {
        await using var intercept = await bidi.Network.InterceptRequestAsync(e => Task.CompletedTask);

        Assert.That(intercept, Is.Not.Null);
    }

    [Test]
    public async Task CanAddInterceptStringUrlPattern()
    {
        await using var intercept = await bidi.Network.InterceptRequestAsync(e => Task.CompletedTask, new()
        {
            UrlPatterns = [
                new StringUrlPattern("http://localhost:4444"),
                "http://localhost:4444/"
                ]
        });

        Assert.That(intercept, Is.Not.Null);
    }

    [Test]
    public async Task CanAddInterceptUrlPattern()
    {
        await using var intercept = await bidi.Network.InterceptRequestAsync(e => Task.CompletedTask, options: new()
        {
            UrlPatterns = [new PatternUrlPattern()
            {
                Hostname = "localhost",
                Protocol = "http"
            }]
        });

        Assert.That(intercept, Is.Not.Null);
    }

    [Test]
    public async Task CanContinueRequest()
    {
        int times = 0;
        await using var intercept = await bidi.Network.InterceptRequestAsync(async req =>
        {
            times++;

            await req.ContinueAsync();
        });

        await context.NavigateAsync(UrlBuilder.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        Assert.That(intercept, Is.Not.Null);
        Assert.That(times, Is.GreaterThan(0));
    }

    [Test]
    public async Task CanContinueResponse()
    {
        int times = 0;

        await using var intercept = await bidi.Network.InterceptResponseAsync(async res =>
        {
            times++;

            await res.ContinueAsync();
        });

        await context.NavigateAsync(UrlBuilder.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        Assert.That(intercept, Is.Not.Null);
        Assert.That(times, Is.GreaterThan(0));
    }

    [Test]
    public async Task CanProvideResponse()
    {
        int times = 0;

        await using var intercept = await bidi.Network.InterceptRequestAsync(async req =>
        {
            times++;

            await req.ProvideResponseAsync();
        });

        await context.NavigateAsync(UrlBuilder.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        Assert.That(intercept, Is.Not.Null);
        Assert.That(times, Is.GreaterThan(0));
    }

    [Test]
    public async Task CanProvideResponseWithParameters()
    {
        int times = 0;

        await using var intercept = await bidi.Network.InterceptRequestAsync(async req =>
        {
            times++;

            await req.ProvideResponseAsync(new() { Body = """
                <html>
                    <head>
                        <title>Hello</title>
                    </head>
                    <boody>
                    </body>
                </html>
                """ });
        });

        await context.NavigateAsync(UrlBuilder.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        Assert.That(intercept, Is.Not.Null);
        Assert.That(times, Is.GreaterThan(0));
        Assert.That(driver.Title, Is.EqualTo("Hello"));
    }

    [Test]
    public async Task CanRemoveIntercept()
    {
        var intercept = await bidi.Network.InterceptRequestAsync(_ => Task.CompletedTask);

        await intercept.RemoveAsync();

        // or

        intercept = await context.Network.InterceptRequestAsync(_ => Task.CompletedTask);

        await intercept.DisposeAsync();
    }

    [Test]
    public async Task CanContinueWithAuthCredentials()
    {
        await using var intercept = await bidi.Network.InterceptAuthAsync(async auth =>
        {
            await auth.ContinueAsync(new AuthCredentials("test", "test"));
        });

        await context.NavigateAsync(UrlBuilder.WhereIs("basicAuth"), new() { Wait = ReadinessState.Complete });

        Assert.That(driver.FindElement(By.CssSelector("h1")).Text, Is.EqualTo("authorized"));
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.Firefox)]
    public async Task CanContinueWithDefaultCredentials()
    {
        await using var intercept = await bidi.Network.InterceptAuthAsync(async auth =>
        {
            await auth.ContinueAsync(new ContinueWithAuthDefaultCredentialsOptions());
        });

        var action = async () => await context.NavigateAsync(UrlBuilder.WhereIs("basicAuth"), new() { Wait = ReadinessState.Complete });

        Assert.That(action, Throws.TypeOf<BiDiException>().With.Message.Contain("net::ERR_INVALID_AUTH_CREDENTIALS"));
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.Firefox)]
    public async Task CanContinueWithCanceledCredentials()
    {
        await using var intercept = await bidi.Network.InterceptAuthAsync(async auth =>
        {
            await auth.ContinueAsync(new ContinueWithAuthCancelCredentialsOptions());
        });

        var action = async () => await context.NavigateAsync(UrlBuilder.WhereIs("basicAuth"), new() { Wait = ReadinessState.Complete });

        Assert.That(action, Throws.TypeOf<BiDiException>().With.Message.Contain("net::ERR_HTTP_RESPONSE_CODE_FAILURE"));
    }

    [Test]
    public async Task CanFailRequest()
    {
        await using var intercept = await bidi.Network.InterceptRequestAsync(async req =>
        {
            await req.FailAsync();
        });

        var action = async () => await context.NavigateAsync(UrlBuilder.WhereIs("basicAuth"), new() { Wait = ReadinessState.Complete });

        Assert.That(action, Throws.TypeOf<BiDiException>().With.Message.Contain("net::ERR_FAILED").Or.Message.Contain("NS_ERROR_ABORT"));
    }

    [Test]
    public void CanSetCacheBehavior()
    {
        Assert.That(async () => await bidi.Network.SetCacheBehaviorAsync(CacheBehavior.Default), Throws.Nothing);
        Assert.That(async () => await context.Network.SetCacheBehaviorAsync(CacheBehavior.Default), Throws.Nothing);
    }
}

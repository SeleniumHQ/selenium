// <copyright file="NetworkTests.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi;
using OpenQA.Selenium.BiDi.BrowsingContext;
using OpenQA.Selenium.BiDi.Network;

namespace OpenQA.Selenium.Tests.BiDi.Network;

internal class NetworkTests : BiDiTestFixture
{
    [Test]
    public async Task CanAddDataCollector()
    {
        // Firefox doesn't like int.MaxValue as max encoded data size
        // invalid argument: Expected "maxEncodedDataSize" to be less than the max total data size available (200000000), got 2147483647
        var addDataCollectorResult = await bidi.Network.AddDataCollectorAsync([DataType.Response], 200000000);

        Assert.That(addDataCollectorResult, Is.Not.Null);
        Assert.That(addDataCollectorResult.Collector, Is.Not.Null);

        // or context aware
        addDataCollectorResult = await context.Network.AddDataCollectorAsync([DataType.Response], 200000000);

        Assert.That(addDataCollectorResult, Is.Not.Null);
        Assert.That(addDataCollectorResult.Collector, Is.Not.Null);
    }

    [Test]
    public async Task CanAddIntercept()
    {
        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.BeforeRequestSent]);

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Intercept, Is.Not.Null);
    }

    [Test]
    public async Task CanAddInterceptStringUrlPattern()
    {
        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.BeforeRequestSent], new()
        {
            UrlPatterns = [
                new StringUrlPattern("http://localhost:4444"),
                "http://localhost:4444/"
                ]
        });

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Intercept, Is.Not.Null);
    }

    [Test]
    public async Task CanAddInterceptUrlPattern()
    {
        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.BeforeRequestSent], options: new()
        {
            UrlPatterns = [new PatternUrlPattern()
            {
                Hostname = "localhost",
                Protocol = "http"
            }]
        });

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Intercept, Is.Not.Null);
    }

    [Test]
    public async Task CanContinueRequest()
    {
        int times = 0;

        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.BeforeRequestSent]);

        await context.Network.BeforeRequestSent.SubscribeAsync(async e =>
        {
            if (e.IsBlocked && e.Intercepts?.Contains(result.Intercept) == true)
            {
                times++;

                await bidi.Network.ContinueRequestAsync(e.Request.Request);
            }
        });

        await context.NavigateAsync(Urls.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        Assert.That(times, Is.GreaterThan(0));
    }

    [Test]
    public async Task CanContinueResponse()
    {
        int times = 0;

        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.ResponseStarted]);

        await bidi.Network.ResponseStarted.SubscribeAsync(async e =>
        {
            if (e.IsBlocked && e.Intercepts?.Contains(result.Intercept) == true)
            {
                times++;

                await bidi.Network.ContinueResponseAsync(e.Request.Request);
            }
        });

        await context.NavigateAsync(Urls.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        Assert.That(times, Is.GreaterThan(0));
    }

    [Test]
    public async Task CanProvideResponse()
    {
        int times = 0;

        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.BeforeRequestSent]);

        await bidi.Network.BeforeRequestSent.SubscribeAsync(async e =>
        {
            if (e.IsBlocked && e.Intercepts?.Contains(result.Intercept) == true)
            {
                times++;

                await bidi.Network.ProvideResponseAsync(e.Request.Request);
            }
        });

        await context.NavigateAsync(Urls.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        Assert.That(times, Is.GreaterThan(0));
    }

    [Test]
    public async Task CanProvideResponseWithParameters()
    {
        int times = 0;

        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.BeforeRequestSent]);

        await bidi.Network.BeforeRequestSent.SubscribeAsync(async e =>
        {
            if (e.IsBlocked && e.Intercepts?.Contains(result.Intercept) == true)
            {
                times++;

                await bidi.Network.ProvideResponseAsync(e.Request.Request, new() { Body = """
                    <html>
                        <head>
                            <title>Hello</title>
                        </head>
                        <body>
                        </body>
                    </html>
                    """ });
            }
        });

        await context.NavigateAsync(Urls.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        Assert.That(times, Is.GreaterThan(0));
        Assert.That(driver.Title, Is.EqualTo("Hello"));
    }

    [Test]
    public async Task CanRemoveIntercept()
    {
        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.BeforeRequestSent]);

        Assert.That(
            async () => await bidi.Network.RemoveInterceptAsync(result.Intercept),
            Throws.Nothing);
    }

    [Test]
    public async Task CanContinueWithAuthCredentials()
    {
        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.AuthRequired]);

        await bidi.Network.AuthRequired.SubscribeAsync(async e =>
        {
            if (e.IsBlocked && e.Intercepts?.Contains(result.Intercept) == true)
            {
                await bidi.Network.ContinueWithAuthAsync(e.Request.Request, new ContinueWithAuthCredentials(new AuthCredentials("test", "test")));
            }
        });

        await context.NavigateAsync(Urls.AuthenticationPage, new() { Wait = ReadinessState.Complete });

        Assert.That(driver.FindElement(By.CssSelector("h1")).Text, Is.EqualTo("authorized"));
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Firefox)]
    public async Task CanContinueWithDefaultCredentials()
    {
        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.AuthRequired]);

        await bidi.Network.AuthRequired.SubscribeAsync(async e =>
        {
            if (e.IsBlocked && e.Intercepts?.Contains(result.Intercept) == true)
            {
                await bidi.Network.ContinueWithAuthAsync(e.Request.Request, new ContinueWithAuthDefault());
            }
        });

        Assert.That(
            async () => await context.NavigateAsync(Urls.AuthenticationPage, new() { Wait = ReadinessState.Complete }),
            Throws.TypeOf<BiDiException>().With.Message.Contain("net::ERR_INVALID_AUTH_CREDENTIALS"));
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Firefox)]
    public async Task CanContinueWithCanceledCredentials()
    {
        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.AuthRequired]);

        await bidi.Network.AuthRequired.SubscribeAsync(async e =>
        {
            if (e.IsBlocked && e.Intercepts?.Contains(result.Intercept) == true)
            {
                await bidi.Network.ContinueWithAuthAsync(e.Request.Request, new ContinueWithAuthCancel());
            }
        });

        Assert.That(
            async () => await context.NavigateAsync(Urls.AuthenticationPage, new() { Wait = ReadinessState.Complete }),
            Throws.TypeOf<BiDiException>().With.Message.Contain("net::ERR_HTTP_RESPONSE_CODE_FAILURE"));
    }

    [Test]
    public async Task CanFailRequest()
    {
        var result = await bidi.Network.AddInterceptAsync([InterceptPhase.BeforeRequestSent]);

        await context.Network.BeforeRequestSent.SubscribeAsync(async e =>
        {
            if (e.IsBlocked && e.Intercepts?.Contains(result.Intercept) == true)
            {
                await bidi.Network.FailRequestAsync(e.Request.Request);
            }
        });

        Assert.That(
            async () => await context.NavigateAsync(Urls.AuthenticationPage, new() { Wait = ReadinessState.Complete }),
            Throws.TypeOf<BiDiException>().With.Message.Contain("net::ERR_FAILED").Or.Message.Contain("NS_ERROR_ABORT"));
    }

    [Test]
    public async Task CanGetData()
    {
        // Firefox doesn't like int.MaxValue as max encoded data size
        // invalid argument: Expected "maxEncodedDataSize" to be less than the max total data size available (200000000), got 2147483647
        var collector = await bidi.Network.AddDataCollectorAsync([DataType.Response], 200000000);

        TaskCompletionSource<string> responseBodyCompletionSource = new();

        await using var _ = await bidi.Network.ResponseCompleted.SubscribeAsync(async e =>
        {
            if (e.Response.Url.Contains("simpleTest.html"))
            {
                responseBodyCompletionSource.SetResult((string)await bidi.Network.GetDataAsync(DataType.Response, e.Request.Request));
            }
        });

        await context.NavigateAsync(Urls.SimpleTestPage, new() { Wait = ReadinessState.Complete });

        var responseBody = await responseBodyCompletionSource.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(responseBody, Contains.Substring("Hello WebDriver"));
    }

    [Test]
    public async Task CanDisownData()
    {
        var collector = await bidi.Network.AddDataCollectorAsync([DataType.Response], 200000000);

        await using var stream = await bidi.Network.ResponseCompleted.StreamAsync();

        await context.NavigateAsync(Urls.SimpleTestPage, new() { Wait = ReadinessState.Complete });

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));

        var request = await stream.ReadAllAsync(cts.Token)
            .Where(e => e.Response.Url.Contains("simpleTest.html"))
            .Select(e => e.Request.Request)
            .FirstAsync();

        Assert.That(
            async () => await bidi.Network.DisownDataAsync(DataType.Response, collector.Collector, request),
            Throws.Nothing);
    }

    [Test]
    public void CanSetCacheBehavior()
    {
        Assert.That(
            async () => await bidi.Network.SetCacheBehaviorAsync(CacheBehavior.Default),
            Throws.Nothing);

        Assert.That(
            async () => await context.Network.SetCacheBehaviorAsync(CacheBehavior.Default),
            Throws.Nothing);
    }

    [Test]
    public async Task CanSetExtraHeaders()
    {
        var result = await bidi.Network.SetExtraHeadersAsync(
            [
                new Header("x-test-header", "test-value")
            ]);

        Assert.That(result, Is.Not.Null);
    }
}

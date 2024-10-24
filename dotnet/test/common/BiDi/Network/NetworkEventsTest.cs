using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using OpenQA.Selenium.BiDi.Modules.Network;
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

        Assert.That(req.Request.Cookies.Count, Is.EqualTo(1));
        Assert.That(req.Request.Cookies[0].Name, Is.EqualTo("foo"));
        Assert.That((req.Request.Cookies[0].Value as BytesValue.String).Value, Is.EqualTo("bar"));
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

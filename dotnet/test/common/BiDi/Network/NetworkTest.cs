using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using OpenQA.Selenium.BiDi.Modules.Network;
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
                new UrlPattern.String("http://localhost:4444"),
                "http://localhost:4444/"
                ]
        });

        Assert.That(intercept, Is.Not.Null);
    }

    [Test]
    public async Task CanAddInterceptUrlPattern()
    {
        await using var intercept = await bidi.Network.InterceptRequestAsync(e => Task.CompletedTask, interceptOptions: new()
        {
            UrlPatterns = [new UrlPattern.Pattern()
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
        await using var intercept = await bidi.Network.InterceptRequestAsync(async e =>
        {
            times++;

            await e.Request.Request.ContinueAsync();
        });

        await context.NavigateAsync(UrlBuilder.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        Assert.That(intercept, Is.Not.Null);
        Assert.That(times, Is.GreaterThan(0));
    }

    [Test]
    public async Task CanContinueResponse()
    {
        int times = 0;

        await using var intercept = await bidi.Network.InterceptResponseAsync(async e =>
        {
            times++;

            await e.Request.Request.ContinueResponseAsync();
        });

        await context.NavigateAsync(UrlBuilder.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        Assert.That(intercept, Is.Not.Null);
        Assert.That(times, Is.GreaterThan(0));
    }

    [Test]
    public async Task CanProvideResponse()
    {
        int times = 0;

        await using var intercept = await bidi.Network.InterceptRequestAsync(async e =>
        {
            times++;

            await e.Request.Request.ProvideResponseAsync();
        });

        await context.NavigateAsync(UrlBuilder.WhereIs("bidi/logEntryAdded.html"), new() { Wait = ReadinessState.Complete });

        Assert.That(intercept, Is.Not.Null);
        Assert.That(times, Is.GreaterThan(0));
    }

    [Test]
    public async Task CanProvideResponseWithParameters()
    {
        int times = 0;

        await using var intercept = await bidi.Network.InterceptRequestAsync(async e =>
        {
            times++;

            await e.Request.Request.ProvideResponseAsync(new() { Body = """
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
        await using var intercept = await bidi.Network.InterceptAuthAsync(async e =>
        {
            //TODO Seems it would be better to have method which takes abstract options
            await e.Request.Request.ContinueWithAuthAsync(new AuthCredentials.Basic("test", "test"));
        });

        await context.NavigateAsync(UrlBuilder.WhereIs("basicAuth"), new() { Wait = ReadinessState.Complete });

        Assert.That(driver.FindElement(By.CssSelector("h1")).Text, Is.EqualTo("authorized"));
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.Firefox)]
    public async Task CanContinueWithDefaultCredentials()
    {
        await using var intercept = await bidi.Network.InterceptAuthAsync(async e =>
        {
            await e.Request.Request.ContinueWithAuthAsync(new ContinueWithDefaultAuthOptions());
        });

        var action = async () => await context.NavigateAsync(UrlBuilder.WhereIs("basicAuth"), new() { Wait = ReadinessState.Complete });

        Assert.That(action, Throws.TypeOf<BiDiException>().With.Message.Contain("net::ERR_INVALID_AUTH_CREDENTIALS"));
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.Firefox)]
    public async Task CanContinueWithCanceledCredentials()
    {
        await using var intercept = await bidi.Network.InterceptAuthAsync(async e =>
        {
            await e.Request.Request.ContinueWithAuthAsync(new ContinueWithCancelledAuthOptions());
        });

        var action = async () => await context.NavigateAsync(UrlBuilder.WhereIs("basicAuth"), new() { Wait = ReadinessState.Complete });

        Assert.That(action, Throws.TypeOf<BiDiException>().With.Message.Contain("net::ERR_HTTP_RESPONSE_CODE_FAILURE"));
    }

    [Test]
    public async Task CanFailRequest()
    {
        await using var intercept = await bidi.Network.InterceptRequestAsync(async e =>
        {
            await e.Request.Request.FailAsync();
        });

        var action = async () => await context.NavigateAsync(UrlBuilder.WhereIs("basicAuth"), new() { Wait = ReadinessState.Complete });

        Assert.That(action, Throws.TypeOf<BiDiException>().With.Message.Contain("net::ERR_FAILED").Or.Message.Contain("NS_ERROR_ABORT"));
    }
}

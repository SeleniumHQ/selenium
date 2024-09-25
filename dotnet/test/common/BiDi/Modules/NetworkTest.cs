using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.Network;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Modules;

class NetworkTest : BiDiFixture
{
    [Test]
    public async Task CanListenRequests()
    {
        IList<BeforeRequestSentEventArgs> requests = [];

        await using var subscription = await bidi.Network.OnBeforeRequestSentAsync(requests.Add);

        await context.NavigateAsync("https://selenium.dev", new() { Wait = BrowsingContext.ReadinessState.Complete });

        Assert.That(requests, Is.Not.Empty);
    }

    [Test]
    public async Task Intercept()
    {
        await using var intercept = await bidi.Network.InterceptRequestAsync(async e => await e.Request.Request.ContinueAsync());

        await context.NavigateAsync("https://selenium.dev", new() { Wait = BrowsingContext.ReadinessState.Complete });
    }
}

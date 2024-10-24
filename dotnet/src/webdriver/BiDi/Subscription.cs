using OpenQA.Selenium.BiDi.Communication;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

#nullable enable

namespace OpenQA.Selenium.BiDi;

public class Subscription : IAsyncDisposable
{
    private readonly Broker _broker;
    private readonly Communication.EventHandler _eventHandler;

    internal Subscription(Broker broker, Communication.EventHandler eventHandler)
    {
        _broker = broker;
        _eventHandler = eventHandler;
    }

    public async Task UnsubscribeAsync()
    {
        await _broker.UnsubscribeAsync(_eventHandler).ConfigureAwait(false);
    }

    public async ValueTask DisposeAsync()
    {
        await UnsubscribeAsync().ConfigureAwait(false);
    }
}

public class SubscriptionOptions
{
    public TimeSpan? Timeout { get; set; }
}

public class BrowsingContextsSubscriptionOptions : SubscriptionOptions
{
    public BrowsingContextsSubscriptionOptions(SubscriptionOptions? options)
    {
        Timeout = options?.Timeout;
    }

    public IEnumerable<Modules.BrowsingContext.BrowsingContext>? Contexts { get; set; }
}

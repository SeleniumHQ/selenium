using System.Threading.Tasks;
using System;
using OpenQA.Selenium.BiDi.Communication;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Log;

public sealed class LogModule(Broker broker) : Module(broker)
{
    public async Task<Subscription> OnEntryAddedAsync(Func<Entry, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("log.entryAdded", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnEntryAddedAsync(Action<Entry> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("log.entryAdded", handler, options).ConfigureAwait(false);
    }
}

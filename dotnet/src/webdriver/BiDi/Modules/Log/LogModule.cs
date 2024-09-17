using System.Threading.Tasks;
using System;
using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.Log;

public sealed class LogModule(Broker broker) : Module(broker)
{
    public async Task<Subscription> OnEntryAddedAsync(Func<BaseLogEntry, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("log.entryAdded", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnEntryAddedAsync(Action<BaseLogEntry> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("log.entryAdded", handler, options).ConfigureAwait(false);
    }
}

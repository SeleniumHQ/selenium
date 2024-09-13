using OpenQA.Selenium.BiDi.Modules.Log;
using System.Threading.Tasks;
using System;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

public class BrowsingContextLogModule(BrowsingContext context, LogModule logModule)
{
    public Task<Subscription> OnEntryAddedAsync(Func<BaseLogEntry, Task> handler, SubscriptionOptions options = null)
    {
        return logModule.OnEntryAddedAsync(async args =>
        {
            if (args.Source.Context?.Equals(context) is true)
            {
                await handler(args).ConfigureAwait(false);
            }
        }, options);
    }

    public Task<Subscription> OnEntryAddedAsync(Action<BaseLogEntry> handler, SubscriptionOptions options = null)
    {
        return logModule.OnEntryAddedAsync(args =>
        {
            if (args.Source.Context?.Equals(context) is true)
            {
                handler(args);
            }
        }, options);
    }
}

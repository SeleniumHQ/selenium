using OpenQA.Selenium.BiDi.Log;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public interface IBrowsingContextLogModule
{
    Task<Subscription> OnEntryAddedAsync(Func<LogEntryEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnEntryAddedAsync(Action<LogEntryEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
}

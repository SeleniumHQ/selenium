namespace OpenQA.Selenium.BiDi.Log;

public interface ILogModule
{
    Task<Subscription> OnEntryAddedAsync(Func<LogEntryEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnEntryAddedAsync(Action<LogEntryEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
}

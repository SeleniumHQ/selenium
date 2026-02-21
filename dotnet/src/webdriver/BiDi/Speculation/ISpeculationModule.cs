namespace OpenQA.Selenium.BiDi.Speculation;

public interface ISpeculationModule
{
    Task<Subscription> OnPrefetchStatusUpdatedAsync(Func<PrefetchStatusUpdatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnPrefetchStatusUpdatedAsync(Action<PrefetchStatusUpdatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
}

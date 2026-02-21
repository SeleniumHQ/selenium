namespace OpenQA.Selenium.BiDi.Session;

internal interface ISessionModule
{
    Task<EndResult> EndAsync(EndOptions? options = null, CancellationToken cancellationToken = default);
    Task<NewResult> NewAsync(CapabilitiesRequest capabilities, NewOptions? options = null, CancellationToken cancellationToken = default);
    Task<StatusResult> StatusAsync(StatusOptions? options = null, CancellationToken cancellationToken = default);
    Task<SubscribeResult> SubscribeAsync(IEnumerable<string> events, SubscribeOptions? options = null, CancellationToken cancellationToken = default);
    Task<UnsubscribeResult> UnsubscribeAsync(IEnumerable<Subscription> subscriptions, UnsubscribeByIdOptions? options = null, CancellationToken cancellationToken = default);
}

using OpenQA.Selenium.BiDi.Network;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public interface IBrowsingContextNetworkModule
{
    Task<AddDataCollectorResult> AddDataCollectorAsync(IEnumerable<DataType> dataTypes, int maxEncodedDataSize, ContextAddDataCollectorOptions? options = null, CancellationToken cancellationToken = default);
    Task<Interception> InterceptAuthAsync(Func<InterceptedAuth, Task> handler, InterceptAuthOptions? options = null, CancellationToken cancellationToken = default);
    Task<Interception> InterceptRequestAsync(Func<InterceptedRequest, Task> handler, InterceptRequestOptions? options = null, CancellationToken cancellationToken = default);
    Task<Interception> InterceptResponseAsync(Func<InterceptedResponse, Task> handler, InterceptResponseOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnAuthRequiredAsync(Action<AuthRequiredEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetCacheBehaviorResult> SetCacheBehaviorAsync(CacheBehavior behavior, ContextSetCacheBehaviorOptions? options = null, CancellationToken cancellationToken = default);
}

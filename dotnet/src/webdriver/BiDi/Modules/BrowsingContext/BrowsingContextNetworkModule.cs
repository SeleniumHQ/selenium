using System.Threading.Tasks;
using System;
using OpenQA.Selenium.BiDi.Modules.Network;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

public class BrowsingContextNetworkModule(BrowsingContext context, NetworkModule networkModule)
{
    public async Task<Intercept> InterceptRequestAsync(Func<BeforeRequestSentEventArgs, Task> handler, BrowsingContextAddInterceptOptions? interceptOptions = null, SubscriptionOptions? options = null)
    {
        AddInterceptOptions addInterceptOptions = new(interceptOptions)
        {
            Contexts = [context]
        };

        var intercept = await networkModule.AddInterceptAsync([InterceptPhase.BeforeRequestSent], addInterceptOptions).ConfigureAwait(false);

        await intercept.OnBeforeRequestSentAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] }).ConfigureAwait(false);

        return intercept;
    }

    public async Task<Intercept> InterceptResponseAsync(Func<ResponseStartedEventArgs, Task> handler, BrowsingContextAddInterceptOptions? interceptOptions = null, SubscriptionOptions? options = null)
    {
        AddInterceptOptions addInterceptOptions = new(interceptOptions)
        {
            Contexts = [context]
        };

        var intercept = await networkModule.AddInterceptAsync([InterceptPhase.ResponseStarted], addInterceptOptions).ConfigureAwait(false);

        await intercept.OnResponseStartedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] }).ConfigureAwait(false);

        return intercept;
    }

    public async Task<Intercept> InterceptAuthenticationAsync(Func<AuthRequiredEventArgs, Task> handler, BrowsingContextAddInterceptOptions? interceptOptions = null, SubscriptionOptions? options = null)
    {
        AddInterceptOptions addInterceptOptions = new(interceptOptions)
        {
            Contexts = [context]
        };

        var intercept = await networkModule.AddInterceptAsync([InterceptPhase.AuthRequired], addInterceptOptions).ConfigureAwait(false);

        await intercept.OnAuthRequiredAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] }).ConfigureAwait(false);

        return intercept;
    }

    public Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return networkModule.OnBeforeRequestSentAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] });
    }

    public Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, SubscriptionOptions? options = null)
    {
        return networkModule.OnBeforeRequestSentAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] });
    }

    public Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return networkModule.OnResponseStartedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] });
    }

    public Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return networkModule.OnResponseStartedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] });
    }

    public Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return networkModule.OnResponseCompletedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] });
    }

    public Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return networkModule.OnResponseCompletedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] });
    }

    public Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return networkModule.OnFetchErrorAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] });
    }

    public Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, SubscriptionOptions? options = null)
    {
        return networkModule.OnFetchErrorAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] });
    }

    internal Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return networkModule.OnAuthRequiredAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] });
    }
}

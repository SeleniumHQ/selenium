using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.Network;

public sealed class NetworkModule(Broker broker) : Module(broker)
{
    internal async Task<Intercept> AddInterceptAsync(IEnumerable<InterceptPhase> phases, AddInterceptOptions? options = null)
    {
        var @params = new AddInterceptCommandParameters(phases);

        if (options is not null)
        {
            @params.Contexts = options.Contexts;
            @params.UrlPatterns = options.UrlPatterns;
        }

        var result = await Broker.ExecuteCommandAsync<AddInterceptResult>(new AddInterceptCommand(@params), options).ConfigureAwait(false);

        return result.Intercept;
    }

    internal async Task RemoveInterceptAsync(Intercept intercept, RemoveInterceptOptions? options = null)
    {
        var @params = new RemoveInterceptCommandParameters(intercept);

        await Broker.ExecuteCommandAsync(new RemoveInterceptCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<Intercept> InterceptRequestAsync(Func<BeforeRequestSentEventArgs, Task> handler, AddInterceptOptions? interceptOptions = null, SubscriptionOptions? options = null)
    {
        var intercept = await AddInterceptAsync([InterceptPhase.BeforeRequestSent], interceptOptions).ConfigureAwait(false);

        await intercept.OnBeforeRequestSentAsync(handler, options).ConfigureAwait(false);

        return intercept;
    }

    public async Task<Intercept> InterceptResponseAsync(Func<ResponseStartedEventArgs, Task> handler, AddInterceptOptions? interceptOptions = null, SubscriptionOptions? options = null)
    {
        var intercept = await AddInterceptAsync([InterceptPhase.ResponseStarted], interceptOptions).ConfigureAwait(false);

        await intercept.OnResponseStartedAsync(handler, options).ConfigureAwait(false);

        return intercept;
    }

    public async Task<Intercept> InterceptAuthenticationAsync(Func<AuthRequiredEventArgs, Task> handler, AddInterceptOptions? interceptOptions = null, SubscriptionOptions? options = null)
    {
        var intercept = await AddInterceptAsync([InterceptPhase.AuthRequired], interceptOptions).ConfigureAwait(false);

        await intercept.OnAuthRequiredAsync(handler, options).ConfigureAwait(false);

        return intercept;
    }

    internal async Task ContinueRequestAsync(Request request, ContinueRequestOptions? options = null)
    {
        var @params = new ContinueRequestCommandParameters(request);

        if (options is not null)
        {
            @params.Body = options.Body;
            @params.Cookies = options.Cookies;
            @params.Headers = options.Headers;
            @params.Method = options.Method;
            @params.Url = options.Url;
        }

        await Broker.ExecuteCommandAsync(new ContinueRequestCommand(@params), options).ConfigureAwait(false);
    }

    internal async Task ContinueResponseAsync(Request request, ContinueResponseOptions? options = null)
    {
        var @params = new ContinueResponseCommandParameters(request);

        if (options is not null)
        {
            @params.Cookies = options.Cookies;
            @params.Credentials = options.Credentials;
            @params.Headers = options.Headers;
            @params.ReasonPhrase = options.ReasonPhrase;
            @params.StatusCode = options.StatusCode;
        }

        await Broker.ExecuteCommandAsync(new ContinueResponseCommand(@params), options).ConfigureAwait(false);
    }

    internal async Task FailRequestAsync(Request request, FailRequestOptions? options = null)
    {
        var @params = new FailRequestCommandParameters(request);

        await Broker.ExecuteCommandAsync(new FailRequestCommand(@params), options).ConfigureAwait(false);
    }

    internal async Task ProvideResponseAsync(Request request, ProvideResponseOptions? options = null)
    {
        var @params = new ProvideResponseCommandParameters(request);

        if (options is not null)
        {
            @params.Body = options.Body;
            @params.Cookies = options.Cookies;
            @params.Headers = options.Headers;
            @params.ReasonPhrase = options.ReasonPhrase;
            @params.StatusCode = options.StatusCode;
        }

        await Broker.ExecuteCommandAsync(new ProvideResponseCommand(@params), options).ConfigureAwait(false);
    }

    internal async Task ContinueWithAuthAsync(Request request, AuthCredentials credentials, ContinueWithAuthOptions? options = null)
    {
        await Broker.ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithAuthCredentials(request, credentials)), options).ConfigureAwait(false);
    }

    internal async Task ContinueWithAuthAsync(Request request, ContinueWithDefaultAuthOptions? options = null)
    {
        await Broker.ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithDefaultAuth(request)), options).ConfigureAwait(false);
    }

    internal async Task ContinueWithAuthAsync(Request request, ContinueWithCancelledAuthOptions? options = null)
    {
        await Broker.ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithCancelledAuth(request)), options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.beforeRequestSent", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.beforeRequestSent", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseStarted", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseStarted", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseCompleted", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseCompleted", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.fetchError", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.fetchError", handler, options).ConfigureAwait(false);
    }

    internal async Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.authRequired", handler, options).ConfigureAwait(false);
    }
}

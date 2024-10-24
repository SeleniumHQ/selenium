using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Network;

public class Intercept : IAsyncDisposable
{
    private readonly BiDi _bidi;

    internal Intercept(BiDi bidi, string id)
    {
        _bidi = bidi;
        Id = id;
    }

    internal string Id { get; }

    protected IList<Subscription> OnBeforeRequestSentSubscriptions { get; } = [];
    protected IList<Subscription> OnResponseStartedSubscriptions { get; } = [];
    protected IList<Subscription> OnAuthRequiredSubscriptions { get; } = [];

    public async Task RemoveAsync()
    {
        await _bidi.Network.RemoveInterceptAsync(this).ConfigureAwait(false);

        foreach (var subscription in OnBeforeRequestSentSubscriptions)
        {
            await subscription.UnsubscribeAsync().ConfigureAwait(false);
        }

        foreach (var subscription in OnResponseStartedSubscriptions)
        {
            await subscription.UnsubscribeAsync().ConfigureAwait(false);
        }

        foreach (var subscription in OnAuthRequiredSubscriptions)
        {
            await subscription.UnsubscribeAsync().ConfigureAwait(false);
        }
    }

    public async Task OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        var subscription = await _bidi.Network.OnBeforeRequestSentAsync(async args => await Filter(args, handler), options).ConfigureAwait(false);

        OnBeforeRequestSentSubscriptions.Add(subscription);
    }

    public async Task OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        var subscription = await _bidi.Network.OnResponseStartedAsync(async args => await Filter(args, handler), options).ConfigureAwait(false);

        OnResponseStartedSubscriptions.Add(subscription);
    }

    public async Task OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        var subscription = await _bidi.Network.OnAuthRequiredAsync(async args => await Filter(args, handler), options).ConfigureAwait(false);

        OnAuthRequiredSubscriptions.Add(subscription);
    }

    private async Task Filter(BeforeRequestSentEventArgs args, Func<BeforeRequestSentEventArgs, Task> handler)
    {
        if (args.Intercepts?.Contains(this) is true && args.IsBlocked)
        {
            await handler(args).ConfigureAwait(false);
        }
    }

    private async Task Filter(ResponseStartedEventArgs args, Func<ResponseStartedEventArgs, Task> handler)
    {
        if (args.Intercepts?.Contains(this) is true && args.IsBlocked)
        {
            await handler(args).ConfigureAwait(false);
        }
    }

    private async Task Filter(AuthRequiredEventArgs args, Func<AuthRequiredEventArgs, Task> handler)
    {
        if (args.Intercepts?.Contains(this) is true && args.IsBlocked)
        {
            await handler(args).ConfigureAwait(false);
        }
    }

    public async ValueTask DisposeAsync()
    {
        await RemoveAsync();
    }

    public override bool Equals(object? obj)
    {
        if (obj is Intercept interceptObj) return interceptObj.Id == Id;

        return false;
    }

    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
}

// <copyright file="NetworkModule.HighLevel.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Network;

public partial class NetworkModule
{
    public async Task<Interception> InterceptRequestAsync(Func<InterceptedRequest, Task> handler, InterceptRequestOptions? options = null, CancellationToken cancellationToken = default)
    {
        var interceptResult = await AddInterceptAsync([InterceptPhase.BeforeRequestSent], options, cancellationToken).ConfigureAwait(false);

        Interception interception = new(this, interceptResult.Intercept);

        await interception.OnBeforeRequestSentAsync(async req => await handler(new(req.BiDi, req.Context, req.IsBlocked, req.Navigation, req.RedirectCount, req.Request, req.Timestamp, req.Initiator, req.Intercepts)), null, cancellationToken).ConfigureAwait(false);

        return interception;
    }

    public async Task<Interception> InterceptResponseAsync(Func<InterceptedResponse, Task> handler, InterceptResponseOptions? options = null, CancellationToken cancellationToken = default)
    {
        var interceptResult = await AddInterceptAsync([InterceptPhase.ResponseStarted], options, cancellationToken).ConfigureAwait(false);

        Interception interception = new(this, interceptResult.Intercept);

        await interception.OnResponseStartedAsync(async res => await handler(new(res.BiDi, res.Context, res.IsBlocked, res.Navigation, res.RedirectCount, res.Request, res.Timestamp, res.Response, res.Intercepts)), null, cancellationToken).ConfigureAwait(false);

        return interception;
    }

    public async Task<Interception> InterceptAuthAsync(Func<InterceptedAuth, Task> handler, InterceptAuthOptions? options = null, CancellationToken cancellationToken = default)
    {
        var interceptResult = await AddInterceptAsync([InterceptPhase.AuthRequired], options, cancellationToken).ConfigureAwait(false);

        Interception interception = new(this, interceptResult.Intercept);

        await interception.OnAuthRequiredAsync(async auth => await handler(new(auth.BiDi, auth.Context, auth.IsBlocked, auth.Navigation, auth.RedirectCount, auth.Request, auth.Timestamp, auth.Response, auth.Intercepts)), null, cancellationToken).ConfigureAwait(false);

        return interception;
    }
}

public sealed class InterceptRequestOptions : AddInterceptOptions;

public sealed class InterceptResponseOptions : AddInterceptOptions;

public sealed class InterceptAuthOptions : AddInterceptOptions;

public sealed record InterceptedRequest : BeforeRequestSentEventArgs
{
    internal InterceptedRequest(BiDi bidi, BrowsingContext.BrowsingContext? context, bool isBlocked, BrowsingContext.Navigation? navigation, long redirectCount, RequestData request, DateTimeOffset timestamp, Initiator initiator, IReadOnlyList<Intercept>? intercepts)
        : base(context, isBlocked, navigation, redirectCount, request, timestamp, initiator, intercepts)
    {
        BiDi = bidi;
    }

    public Task ContinueAsync(ContinueRequestOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.Network.ContinueRequestAsync(Request.Request, options, cancellationToken);
    }

    public Task FailAsync(FailRequestOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.Network.FailRequestAsync(Request.Request, options, cancellationToken);
    }

    public Task ProvideResponseAsync(ProvideResponseOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.Network.ProvideResponseAsync(Request.Request, options, cancellationToken);
    }
}

public sealed record InterceptedResponse : ResponseStartedEventArgs
{
    internal InterceptedResponse(BiDi bidi, BrowsingContext.BrowsingContext? context, bool isBlocked, BrowsingContext.Navigation? navigation, long redirectCount, RequestData request, DateTimeOffset timestamp, ResponseData response, IReadOnlyList<Intercept>? intercepts)
        : base(context, isBlocked, navigation, redirectCount, request, timestamp, response, intercepts)
    {
        BiDi = bidi;
    }

    public Task ContinueAsync(ContinueResponseOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.Network.ContinueResponseAsync(Request.Request, options, cancellationToken);
    }
}

public sealed record InterceptedAuth : AuthRequiredEventArgs
{
    internal InterceptedAuth(BiDi bidi, BrowsingContext.BrowsingContext? context, bool IsBlocked, BrowsingContext.Navigation? navigation, long redirectCount, RequestData request, DateTimeOffset timestamp, ResponseData response, IReadOnlyList<Intercept>? intercepts)
        : base(context, IsBlocked, navigation, redirectCount, request, timestamp, response, intercepts)
    {
        BiDi = bidi;
    }

    public Task ContinueAsync(AuthCredentials credentials, ContinueWithAuthCredentialsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.Network.ContinueWithAuthAsync(Request.Request, credentials, options, cancellationToken);
    }

    public Task ContinueAsync(ContinueWithAuthDefaultCredentialsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.Network.ContinueWithAuthAsync(Request.Request, options, cancellationToken);
    }

    public Task ContinueAsync(ContinueWithAuthCancelCredentialsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.Network.ContinueWithAuthAsync(Request.Request, options, cancellationToken);
    }
}

public sealed record Interception(NetworkModule Network, Intercept Intercept) : IAsyncDisposable
{
    IList<Subscription> OnBeforeRequestSentSubscriptions { get; } = [];
    IList<Subscription> OnResponseStartedSubscriptions { get; } = [];
    IList<Subscription> OnAuthRequiredSubscriptions { get; } = [];

    public async Task RemoveAsync(RemoveInterceptOptions? options = null, CancellationToken cancellationToken = default)
    {
        await Network.RemoveInterceptAsync(Intercept, options, cancellationToken).ConfigureAwait(false);

        foreach (var subscription in OnBeforeRequestSentSubscriptions)
        {
            await subscription.UnsubscribeAsync(cancellationToken).ConfigureAwait(false);
        }

        foreach (var subscription in OnResponseStartedSubscriptions)
        {
            await subscription.UnsubscribeAsync(cancellationToken).ConfigureAwait(false);
        }

        foreach (var subscription in OnAuthRequiredSubscriptions)
        {
            await subscription.UnsubscribeAsync(cancellationToken).ConfigureAwait(false);
        }
    }

    public async Task OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var subscription = await Network.OnBeforeRequestSentAsync(async args => await Filter(args, handler), options, cancellationToken).ConfigureAwait(false);

        OnBeforeRequestSentSubscriptions.Add(subscription);
    }

    public async Task OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var subscription = await Network.OnResponseStartedAsync(async args => await Filter(args, handler), options, cancellationToken).ConfigureAwait(false);

        OnResponseStartedSubscriptions.Add(subscription);
    }

    public async Task OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var subscription = await Network.OnAuthRequiredAsync(async args => await Filter(args, handler), options, cancellationToken).ConfigureAwait(false);

        OnAuthRequiredSubscriptions.Add(subscription);
    }

    private async Task Filter(BeforeRequestSentEventArgs args, Func<BeforeRequestSentEventArgs, Task> handler)
    {
        if (args.Intercepts?.Contains(Intercept) is true && args.IsBlocked)
        {
            await handler(args).ConfigureAwait(false);
        }
    }

    private async Task Filter(ResponseStartedEventArgs args, Func<ResponseStartedEventArgs, Task> handler)
    {
        if (args.Intercepts?.Contains(Intercept) is true && args.IsBlocked)
        {
            await handler(args).ConfigureAwait(false);
        }
    }

    private async Task Filter(AuthRequiredEventArgs args, Func<AuthRequiredEventArgs, Task> handler)
    {
        if (args.Intercepts?.Contains(Intercept) is true && args.IsBlocked)
        {
            await handler(args).ConfigureAwait(false);
        }
    }

    public async ValueTask DisposeAsync()
    {
        await RemoveAsync().ConfigureAwait(false);
    }
}

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
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Network;

public partial class NetworkModule
{
    public async Task<Interception> InterceptRequestAsync(Func<InterceptedRequest, Task> handler, InterceptRequestOptions? options = null)
    {
        var interceptResult = await AddInterceptAsync([InterceptPhase.BeforeRequestSent], options).ConfigureAwait(false);

        Interception interception = new(BiDi, interceptResult.Intercept);

        await interception.OnBeforeRequestSentAsync(async req => await handler(new(req.BiDi, req.Context, req.IsBlocked, req.Navigation, req.RedirectCount, req.Request, req.Timestamp, req.Initiator, req.Intercepts))).ConfigureAwait(false);

        return interception;
    }

    public async Task<Interception> InterceptResponseAsync(Func<InterceptedResponse, Task> handler, InterceptResponseOptions? options = null)
    {
        var interceptResult = await AddInterceptAsync([InterceptPhase.ResponseStarted], options).ConfigureAwait(false);

        Interception interception = new(BiDi, interceptResult.Intercept);

        await interception.OnResponseStartedAsync(async res => await handler(new(res.BiDi, res.Context, res.IsBlocked, res.Navigation, res.RedirectCount, res.Request, res.Timestamp, res.Response, res.Intercepts))).ConfigureAwait(false);

        return interception;
    }

    public async Task<Interception> InterceptAuthAsync(Func<InterceptedAuth, Task> handler, InterceptAuthOptions? options = null)
    {
        var interceptResult = await AddInterceptAsync([InterceptPhase.AuthRequired], options).ConfigureAwait(false);

        Interception interception = new(BiDi, interceptResult.Intercept);

        await interception.OnAuthRequiredAsync(async auth => await handler(new(auth.BiDi, auth.Context, auth.IsBlocked, auth.Navigation, auth.RedirectCount, auth.Request, auth.Timestamp, auth.Response, auth.Intercepts))).ConfigureAwait(false);

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

    public Task ContinueAsync(ContinueRequestOptions? options = null)
    {
        return BiDi.Network.ContinueRequestAsync(Request.Request, options);
    }

    public Task FailAsync()
    {
        return BiDi.Network.FailRequestAsync(Request.Request);
    }

    public Task ProvideResponseAsync(ProvideResponseOptions? options = null)
    {
        return BiDi.Network.ProvideResponseAsync(Request.Request, options);
    }
}

public sealed record InterceptedResponse : ResponseStartedEventArgs
{
    internal InterceptedResponse(BiDi bidi, BrowsingContext.BrowsingContext? context, bool isBlocked, BrowsingContext.Navigation? navigation, long redirectCount, RequestData request, DateTimeOffset timestamp, ResponseData response, IReadOnlyList<Intercept>? intercepts)
        : base(context, isBlocked, navigation, redirectCount, request, timestamp, response, intercepts)
    {
        BiDi = bidi;
    }

    public Task ContinueAsync(ContinueResponseOptions? options = null)
    {
        return BiDi.Network.ContinueResponseAsync(Request.Request, options);
    }
}

public sealed record InterceptedAuth : AuthRequiredEventArgs
{
    internal InterceptedAuth(BiDi bidi, BrowsingContext.BrowsingContext? context, bool IsBlocked, BrowsingContext.Navigation? navigation, long redirectCount, RequestData request, DateTimeOffset timestamp, ResponseData response, IReadOnlyList<Intercept>? intercepts)
        : base(context, IsBlocked, navigation, redirectCount, request, timestamp, response, intercepts)
    {
        BiDi = bidi;
    }

    public Task ContinueAsync(AuthCredentials credentials, ContinueWithAuthCredentialsOptions? options = null)
    {
        return BiDi.Network.ContinueWithAuthAsync(Request.Request, credentials, options);
    }

    public Task ContinueAsync(ContinueWithAuthDefaultCredentialsOptions? options = null)
    {
        return BiDi.Network.ContinueWithAuthAsync(Request.Request, options);
    }

    public Task ContinueAsync(ContinueWithAuthCancelCredentialsOptions? options = null)
    {
        return BiDi.Network.ContinueWithAuthAsync(Request.Request, options);
    }
}

public sealed record Interception(BiDi BiDi, Intercept Intercept) : IAsyncDisposable
{
    IList<Subscription> OnBeforeRequestSentSubscriptions { get; } = [];
    IList<Subscription> OnResponseStartedSubscriptions { get; } = [];
    IList<Subscription> OnAuthRequiredSubscriptions { get; } = [];

    public async Task RemoveAsync()
    {
        await BiDi.Network.RemoveInterceptAsync(Intercept).ConfigureAwait(false);

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
        var subscription = await BiDi.Network.OnBeforeRequestSentAsync(async args => await Filter(args, handler), options).ConfigureAwait(false);

        OnBeforeRequestSentSubscriptions.Add(subscription);
    }

    public async Task OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        var subscription = await BiDi.Network.OnResponseStartedAsync(async args => await Filter(args, handler), options).ConfigureAwait(false);

        OnResponseStartedSubscriptions.Add(subscription);
    }

    public async Task OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        var subscription = await BiDi.Network.OnAuthRequiredAsync(async args => await Filter(args, handler), options).ConfigureAwait(false);

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

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
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Network;

public partial class NetworkModule
{
    public async Task<Intercept> InterceptRequestAsync(Func<InterceptedRequest, Task> handler, InterceptRequestOptions? options = null)
    {
        var intercept = await AddInterceptAsync([InterceptPhase.BeforeRequestSent], options).ConfigureAwait(false);

        await intercept.OnBeforeRequestSentAsync(async req => await handler(new(req.BiDi, req.Context, req.IsBlocked, req.Navigation, req.RedirectCount, req.Request, req.Timestamp, req.Initiator))).ConfigureAwait(false);

        return intercept;
    }

    public async Task<Intercept> InterceptResponseAsync(Func<InterceptedResponse, Task> handler, InterceptResponseOptions? options = null)
    {
        var intercept = await AddInterceptAsync([InterceptPhase.ResponseStarted], options).ConfigureAwait(false);

        await intercept.OnResponseStartedAsync(async res => await handler(new(res.BiDi, res.Context, res.IsBlocked, res.Navigation, res.RedirectCount, res.Request, res.Timestamp, res.Response))).ConfigureAwait(false);

        return intercept;
    }

    public async Task<Intercept> InterceptAuthAsync(Func<InterceptedAuth, Task> handler, InterceptAuthOptions? options = null)
    {
        var intercept = await AddInterceptAsync([InterceptPhase.AuthRequired], options).ConfigureAwait(false);

        await intercept.OnAuthRequiredAsync(async auth => await handler(new(auth.BiDi, auth.Context, auth.IsBlocked, auth.Navigation, auth.RedirectCount, auth.Request, auth.Timestamp, auth.Response))).ConfigureAwait(false);

        return intercept;
    }
}

public sealed class InterceptRequestOptions : AddInterceptOptions;

public sealed class InterceptResponseOptions : AddInterceptOptions;

public sealed class InterceptAuthOptions : AddInterceptOptions;

public sealed record InterceptedRequest(BiDi BiDi, BrowsingContext.BrowsingContext? Context, bool IsBlocked, BrowsingContext.Navigation? Navigation, long RedirectCount, RequestData Request, DateTimeOffset Timestamp, Initiator Initiator)
    : BeforeRequestSentEventArgs(BiDi, Context, IsBlocked, Navigation, RedirectCount, Request, Timestamp, Initiator)
{
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

public sealed record InterceptedResponse(BiDi BiDi, BrowsingContext.BrowsingContext? Context, bool IsBlocked, BrowsingContext.Navigation? Navigation, long RedirectCount, RequestData Request, DateTimeOffset Timestamp, ResponseData Response)
    : ResponseStartedEventArgs(BiDi, Context, IsBlocked, Navigation, RedirectCount, Request, Timestamp, Response)
{
    public Task ContinueAsync(ContinueResponseOptions? options = null)
    {
        return BiDi.Network.ContinueResponseAsync(Request.Request, options);
    }
}

public sealed record InterceptedAuth(BiDi BiDi, BrowsingContext.BrowsingContext? Context, bool IsBlocked, BrowsingContext.Navigation? Navigation, long RedirectCount, RequestData Request, DateTimeOffset Timestamp, ResponseData Response)
    : AuthRequiredEventArgs(BiDi, Context, IsBlocked, Navigation, RedirectCount, Request, Timestamp, Response)
{
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

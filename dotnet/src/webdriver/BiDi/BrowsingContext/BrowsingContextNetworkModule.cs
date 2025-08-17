// <copyright file="BrowsingContextNetworkModule.cs" company="Selenium Committers">
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

using System.Threading.Tasks;
using System;
using OpenQA.Selenium.BiDi.Network;
using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public sealed class BrowsingContextNetworkModule(BrowsingContext context, NetworkModule networkModule)
{
    public async Task<Intercept> InterceptRequestAsync(Func<InterceptedRequest, Task> handler, InterceptRequestOptions? options = null)
    {
        AddInterceptOptions addInterceptOptions = new(options)
        {
            Contexts = [context]
        };

        var intercept = await networkModule.AddInterceptAsync([InterceptPhase.BeforeRequestSent], addInterceptOptions).ConfigureAwait(false);

        await intercept.OnBeforeRequestSentAsync(
            async req => await handler(new(req.BiDi, req.Context, req.IsBlocked, req.Navigation, req.RedirectCount, req.Request, req.Timestamp, req.Initiator)),
            new BrowsingContextsSubscriptionOptions(null) { Contexts = [context] }).ConfigureAwait(false);

        return intercept;
    }

    public async Task<Intercept> InterceptResponseAsync(Func<InterceptedResponse, Task> handler, InterceptResponseOptions? options = null)
    {
        AddInterceptOptions addInterceptOptions = new(options)
        {
            Contexts = [context]
        };

        var intercept = await networkModule.AddInterceptAsync([InterceptPhase.ResponseStarted], addInterceptOptions).ConfigureAwait(false);

        await intercept.OnResponseStartedAsync(
            async res => await handler(new(res.BiDi, res.Context, res.IsBlocked, res.Navigation, res.RedirectCount, res.Request, res.Timestamp, res.Response)),
            new BrowsingContextsSubscriptionOptions(null) { Contexts = [context] }).ConfigureAwait(false);

        return intercept;
    }

    public async Task<Intercept> InterceptAuthAsync(Func<InterceptedAuth, Task> handler, InterceptAuthOptions? options = null)
    {
        AddInterceptOptions addInterceptOptions = new(options)
        {
            Contexts = [context]
        };

        var intercept = await networkModule.AddInterceptAsync([InterceptPhase.AuthRequired], addInterceptOptions).ConfigureAwait(false);

        await intercept.OnAuthRequiredAsync(
            async auth => await handler(new(auth.BiDi, auth.Context, auth.IsBlocked, auth.Navigation, auth.RedirectCount, auth.Request, auth.Timestamp, auth.Response)),
            new BrowsingContextsSubscriptionOptions(null) { Contexts = [context] }).ConfigureAwait(false);

        return intercept;
    }

    public Task<EmptyResult> SetCacheBehaviorAsync(CacheBehavior behavior, BrowsingContextSetCacheBehaviorOptions? options = null)
    {
        SetCacheBehaviorOptions setCacheBehaviorOptions = new(options)
        {
            Contexts = [context]
        };

        return networkModule.SetCacheBehaviorAsync(behavior, setCacheBehaviorOptions);
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

    public Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return networkModule.OnAuthRequiredAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] });
    }

    public Task<Subscription> OnAuthRequiredAsync(Action<AuthRequiredEventArgs> handler, SubscriptionOptions? options = null)
    {
        return networkModule.OnAuthRequiredAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [context] });
    }
}

public sealed record InterceptRequestOptions : BrowsingContextAddInterceptOptions;

public sealed record InterceptResponseOptions : BrowsingContextAddInterceptOptions;

public sealed record InterceptAuthOptions : BrowsingContextAddInterceptOptions;

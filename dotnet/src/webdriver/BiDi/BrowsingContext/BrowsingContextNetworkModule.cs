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

using OpenQA.Selenium.BiDi.Network;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public sealed class BrowsingContextNetworkModule(BrowsingContext context, NetworkModule networkModule)
{
    public async Task<Interception> InterceptRequestAsync(Func<InterceptedRequest, Task> handler, InterceptRequestOptions? options = null)
    {
        AddInterceptOptions addInterceptOptions = new(options)
        {
            Contexts = [context]
        };

        var interceptResult = await networkModule.AddInterceptAsync([InterceptPhase.BeforeRequestSent], addInterceptOptions).ConfigureAwait(false);

        Interception interception = new(context.BiDi, interceptResult.Intercept);

        await interception.OnBeforeRequestSentAsync(
            async req => await handler(new(req.BiDi, req.Context, req.IsBlocked, req.Navigation, req.RedirectCount, req.Request, req.Timestamp, req.Initiator, req.Intercepts)),
            new() { Contexts = [context] }).ConfigureAwait(false);

        return interception;
    }

    public async Task<Interception> InterceptResponseAsync(Func<InterceptedResponse, Task> handler, InterceptResponseOptions? options = null)
    {
        AddInterceptOptions addInterceptOptions = new(options)
        {
            Contexts = [context]
        };

        var interceptResult = await networkModule.AddInterceptAsync([InterceptPhase.ResponseStarted], addInterceptOptions).ConfigureAwait(false);

        Interception interception = new(context.BiDi, interceptResult.Intercept);

        await interception.OnResponseStartedAsync(
            async res => await handler(new(res.BiDi, res.Context, res.IsBlocked, res.Navigation, res.RedirectCount, res.Request, res.Timestamp, res.Response, res.Intercepts)),
            new() { Contexts = [context] }).ConfigureAwait(false);

        return interception;
    }

    public async Task<Interception> InterceptAuthAsync(Func<InterceptedAuth, Task> handler, InterceptAuthOptions? options = null)
    {
        AddInterceptOptions addInterceptOptions = new(options)
        {
            Contexts = [context]
        };

        var interceptResult = await networkModule.AddInterceptAsync([InterceptPhase.AuthRequired], addInterceptOptions).ConfigureAwait(false);

        Interception interception = new(context.BiDi, interceptResult.Intercept);

        await interception.OnAuthRequiredAsync(
            async auth => await handler(new(auth.BiDi, auth.Context, auth.IsBlocked, auth.Navigation, auth.RedirectCount, auth.Request, auth.Timestamp, auth.Response, auth.Intercepts)),
            new() { Contexts = [context] }).ConfigureAwait(false);

        return interception;
    }

    public Task<AddDataCollectorResult> AddDataCollectorAsync(IEnumerable<DataType> dataTypes, int maxEncodedDataSize, ContextAddDataCollectorOptions? options = null)
    {
        return networkModule.AddDataCollectorAsync(dataTypes, maxEncodedDataSize, ContextAddDataCollectorOptions.WithContext(options, context));
    }

    public Task<SetCacheBehaviorResult> SetCacheBehaviorAsync(CacheBehavior behavior, ContextSetCacheBehaviorOptions? options = null)
    {
        return networkModule.SetCacheBehaviorAsync(behavior, ContextSetCacheBehaviorOptions.WithContext(options, context));
    }

    public Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return networkModule.OnBeforeRequestSentAsync(async e =>
        {
            if (context.Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, ContextSubscriptionOptions.WithContext(options, context));
    }

    public Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, ContextSubscriptionOptions? options = null)
    {
        return networkModule.OnBeforeRequestSentAsync(e =>
        {
            if (context.Equals(e.Context))
            {
                handler(e);
            }
        }, ContextSubscriptionOptions.WithContext(options, context));
    }

    public Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return networkModule.OnResponseStartedAsync(async e =>
        {
            if (context.Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, ContextSubscriptionOptions.WithContext(options, context));
    }

    public Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, ContextSubscriptionOptions? options = null)
    {
        return networkModule.OnResponseStartedAsync(e =>
        {
            if (context.Equals(e.Context))
            {
                handler(e);
            }
        }, ContextSubscriptionOptions.WithContext(options, context));
    }

    public Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return networkModule.OnResponseCompletedAsync(async e =>
        {
            if (context.Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, ContextSubscriptionOptions.WithContext(options, context));
    }

    public Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, ContextSubscriptionOptions? options = null)
    {
        return networkModule.OnResponseCompletedAsync(e =>
        {
            if (context.Equals(e.Context))
            {
                handler(e);
            }
        }, ContextSubscriptionOptions.WithContext(options, context));
    }

    public Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return networkModule.OnFetchErrorAsync(async e =>
        {
            if (context.Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, ContextSubscriptionOptions.WithContext(options, context));
    }

    public Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, ContextSubscriptionOptions? options = null)
    {
        return networkModule.OnFetchErrorAsync(e =>
        {
            if (context.Equals(e.Context))
            {
                handler(e);
            }
        }, ContextSubscriptionOptions.WithContext(options, context));
    }

    public Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return networkModule.OnAuthRequiredAsync(async e =>
        {
            if (context.Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, ContextSubscriptionOptions.WithContext(options, context));
    }

    public Task<Subscription> OnAuthRequiredAsync(Action<AuthRequiredEventArgs> handler, ContextSubscriptionOptions? options = null)
    {
        return networkModule.OnAuthRequiredAsync(e =>
        {
            if (context.Equals(e.Context))
            {
                handler(e);
            }
        }, ContextSubscriptionOptions.WithContext(options, context));
    }
}

public sealed class InterceptRequestOptions : ContextAddInterceptOptions;

public sealed class InterceptResponseOptions : ContextAddInterceptOptions;

public sealed class InterceptAuthOptions : ContextAddInterceptOptions;

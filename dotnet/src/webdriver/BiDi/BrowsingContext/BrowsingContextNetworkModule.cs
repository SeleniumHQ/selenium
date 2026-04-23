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

namespace OpenQA.Selenium.BiDi.BrowsingContext;

internal sealed class BrowsingContextNetworkModule(BrowsingContext context, INetworkModule networkModule) : IBrowsingContextNetworkModule
{
    public Task<AddDataCollectorResult> AddDataCollectorAsync(IEnumerable<DataType> dataTypes, int maxEncodedDataSize, ContextAddDataCollectorOptions? options = null, CancellationToken cancellationToken = default)
    {
        return networkModule.AddDataCollectorAsync(dataTypes, maxEncodedDataSize, ContextAddDataCollectorOptions.WithContext(options, context), cancellationToken);
    }

    public Task<SetCacheBehaviorResult> SetCacheBehaviorAsync(CacheBehavior behavior, ContextSetCacheBehaviorOptions? options = null, CancellationToken cancellationToken = default)
    {
        return networkModule.SetCacheBehaviorAsync(behavior, ContextSetCacheBehaviorOptions.WithContext(options, context), cancellationToken);
    }

    public Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return networkModule.OnBeforeRequestSentAsync(
            e => HandleBeforeRequestSentAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    public Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return networkModule.OnBeforeRequestSentAsync(
            e => HandleBeforeRequestSent(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    public Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return networkModule.OnResponseStartedAsync(e
         => HandleResponseStartedAsync(e, handler),
         ContextSubscriptionOptions.WithContext(options, context),
         cancellationToken);
    }

    public Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return networkModule.OnResponseStartedAsync(
            e => HandleResponseStarted(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    public Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return networkModule.OnResponseCompletedAsync(
            e => HandleResponseCompletedAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    public Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return networkModule.OnResponseCompletedAsync(
            e => HandleResponseCompleted(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    public Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return networkModule.OnFetchErrorAsync(
            e => HandleFetchErrorAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    public Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return networkModule.OnFetchErrorAsync(
            e => HandleFetchError(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    public Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return networkModule.OnAuthRequiredAsync(
            e => HandleAuthRequiredAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    public Task<Subscription> OnAuthRequiredAsync(Action<AuthRequiredEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return networkModule.OnAuthRequiredAsync(
            e => HandleAuthRequired(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    private async Task HandleBeforeRequestSentAsync(BeforeRequestSentEventArgs e, Func<BeforeRequestSentEventArgs, Task> handler)
    {
        if (context.Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleBeforeRequestSent(BeforeRequestSentEventArgs e, Action<BeforeRequestSentEventArgs> handler)
    {
        if (context.Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleResponseStartedAsync(ResponseStartedEventArgs e, Func<ResponseStartedEventArgs, Task> handler)
    {
        if (context.Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleResponseStarted(ResponseStartedEventArgs e, Action<ResponseStartedEventArgs> handler)
    {
        if (context.Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleResponseCompletedAsync(ResponseCompletedEventArgs e, Func<ResponseCompletedEventArgs, Task> handler)
    {
        if (context.Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleResponseCompleted(ResponseCompletedEventArgs e, Action<ResponseCompletedEventArgs> handler)
    {
        if (context.Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleFetchErrorAsync(FetchErrorEventArgs e, Func<FetchErrorEventArgs, Task> handler)
    {
        if (context.Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleFetchError(FetchErrorEventArgs e, Action<FetchErrorEventArgs> handler)
    {
        if (context.Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleAuthRequiredAsync(AuthRequiredEventArgs e, Func<AuthRequiredEventArgs, Task> handler)
    {
        if (context.Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleAuthRequired(AuthRequiredEventArgs e, Action<AuthRequiredEventArgs> handler)
    {
        if (context.Equals(e.Context))
        {
            handler(e);
        }
    }
}

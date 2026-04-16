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

    public EventSource<BeforeRequestSentEventArgs> BeforeRequestSent => _beforeRequestSent ??= CreateContextEventSource(
        networkModule.BeforeRequestSent, context, static (e, ctx) => ctx.Equals(e.Context));
    private EventSource<BeforeRequestSentEventArgs>? _beforeRequestSent;

    public EventSource<ResponseStartedEventArgs> ResponseStarted => _responseStarted ??= CreateContextEventSource(
        networkModule.ResponseStarted, context, static (e, ctx) => ctx.Equals(e.Context));
    private EventSource<ResponseStartedEventArgs>? _responseStarted;

    public EventSource<ResponseCompletedEventArgs> ResponseCompleted => _responseCompleted ??= CreateContextEventSource(
        networkModule.ResponseCompleted, context, static (e, ctx) => ctx.Equals(e.Context));
    private EventSource<ResponseCompletedEventArgs>? _responseCompleted;

    public EventSource<FetchErrorEventArgs> FetchError => _fetchError ??= CreateContextEventSource(
        networkModule.FetchError, context, static (e, ctx) => ctx.Equals(e.Context));
    private EventSource<FetchErrorEventArgs>? _fetchError;

    public EventSource<AuthRequiredEventArgs> AuthRequired => _authRequired ??= CreateContextEventSource(
        networkModule.AuthRequired, context, static (e, ctx) => ctx.Equals(e.Context));
    private EventSource<AuthRequiredEventArgs>? _authRequired;

    private static EventSource<TEventArgs> CreateContextEventSource<TEventArgs>(
        EventSource<TEventArgs> moduleEventSource,
        BrowsingContext context,
        Func<TEventArgs, BrowsingContext, bool> filter)
        where TEventArgs : EventArgs
    {
        return moduleEventSource.WithContext(
            e => filter(e, context),
            options => WithContext(options, context));
    }

    private static SubscriptionOptions WithContext(SubscriptionOptions? options, BrowsingContext context) => new()
    {
        Contexts = [context],
        Timeout = options?.Timeout
    };
}

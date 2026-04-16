// <copyright file="EventSource.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi;

public sealed class EventSource<TEventArgs> where TEventArgs : EventArgs
{
    private readonly Func<Func<TEventArgs, ValueTask>, Func<TEventArgs, bool>?, SubscriptionOptions?, CancellationToken, Task<Subscription<TEventArgs>>> _onAsyncCore;
    private readonly Func<Func<TEventArgs, bool>?, SubscriptionOptions?, CancellationToken, Task<EventStream<TEventArgs>>> _subscribeAsyncCore;

    internal EventSource(
        Func<Func<TEventArgs, ValueTask>, Func<TEventArgs, bool>?, SubscriptionOptions?, CancellationToken, Task<Subscription<TEventArgs>>> onAsyncCore,
        Func<Func<TEventArgs, bool>?, SubscriptionOptions?, CancellationToken, Task<EventStream<TEventArgs>>> subscribeAsyncCore)
    {
        _onAsyncCore = onAsyncCore;
        _subscribeAsyncCore = subscribeAsyncCore;
    }

    public Task<Subscription<TEventArgs>> OnAsync(Action<TEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);
        return _onAsyncCore(e => { handler(e); return default; }, null, options, cancellationToken);
    }

    public Task<Subscription<TEventArgs>> OnAsync(Func<TEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);
        return _onAsyncCore(e => new ValueTask(handler(e)), null, options, cancellationToken);
    }

    public Task<EventStream<TEventArgs>> SubscribeAsync(SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return _subscribeAsyncCore(null, options, cancellationToken);
    }

    internal EventSource<TEventArgs> WithContext(Func<TEventArgs, bool> filter, Func<SubscriptionOptions?, SubscriptionOptions> mapOptions)
    {
        return new EventSource<TEventArgs>(
            (handler, _, options, ct) => _onAsyncCore(handler, filter, mapOptions(options), ct),
            (_, options, ct) => _subscribeAsyncCore(filter, mapOptions(options), ct));
    }
}

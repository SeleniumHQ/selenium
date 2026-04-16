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
    private readonly IBiDi _bidi;
    internal readonly Func<Func<TEventArgs, ValueTask>, Func<TEventArgs, bool>?, SubscriptionOptions?, CancellationToken, Task<Subscription<TEventArgs>>> _onAsyncCore;
    internal readonly Func<Func<TEventArgs, bool>?, SubscriptionOptions?, CancellationToken, Task<EventStream<TEventArgs>>> _subscribeAsyncCore;
    internal readonly Func<TEventArgs, bool>? _filter;
    internal readonly Func<SubscriptionOptions?, SubscriptionOptions>? _mapOptions;

    internal EventSource(
        IBiDi bidi,
        Func<Func<TEventArgs, ValueTask>, Func<TEventArgs, bool>?, SubscriptionOptions?, CancellationToken, Task<Subscription<TEventArgs>>> onAsyncCore,
        Func<Func<TEventArgs, bool>?, SubscriptionOptions?, CancellationToken, Task<EventStream<TEventArgs>>> subscribeAsyncCore,
        Func<TEventArgs, bool>? filter = null,
        Func<SubscriptionOptions?, SubscriptionOptions>? mapOptions = null)
    {
        _bidi = bidi;
        _onAsyncCore = onAsyncCore;
        _subscribeAsyncCore = subscribeAsyncCore;
        _filter = filter;
        _mapOptions = mapOptions;
    }

    public Task<Subscription<TEventArgs>> OnAsync(Action<TEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return _bidi.OnAsync(this, handler, options, cancellationToken);
    }

    public Task<Subscription<TEventArgs>> OnAsync(Func<TEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return _bidi.OnAsync(this, handler, options, cancellationToken);
    }

    public Task<EventStream<TEventArgs>> SubscribeAsync(SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return _bidi.SubscribeAsync(this, options, cancellationToken);
    }

    internal EventSource<TEventArgs> WithContext(Func<TEventArgs, bool> filter, Func<SubscriptionOptions?, SubscriptionOptions> mapOptions)
    {
        return new EventSource<TEventArgs>(_bidi, _onAsyncCore, _subscribeAsyncCore, filter, mapOptions);
    }
}

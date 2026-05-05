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

public sealed class EventSource<TEventArgs> : IEventSource<TEventArgs> where TEventArgs : EventArgs
{
    private readonly EventDispatcher _dispatcher;
    private readonly EventDescriptor<TEventArgs> _descriptor;

    internal EventSource(EventDispatcher dispatcher, EventDescriptor<TEventArgs> descriptor)
    {
        _dispatcher = dispatcher;
        _descriptor = descriptor;
    }

    Task<ISubscription> IEventSource<TEventArgs>.SubscribeAsync(Action<TEventArgs> handler, CancellationToken cancellationToken)
    {
        return SubscribeAsync(handler, cancellationToken: cancellationToken);
    }

    Task<ISubscription> IEventSource<TEventArgs>.SubscribeAsync(Func<TEventArgs, Task> handler, CancellationToken cancellationToken)
    {
        return SubscribeAsync(handler, cancellationToken: cancellationToken);
    }

    Task<IEventStream<TEventArgs>> IEventSource<TEventArgs>.ReadAllAsync(CancellationToken cancellationToken)
    {
        return ReadAllAsync(cancellationToken: cancellationToken);
    }

    public Task<ISubscription> SubscribeAsync(Action<TEventArgs> handler, SubscriptionOptions? options = null, Func<TEventArgs, bool>? filter = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return _dispatcher.SubscribeAsync<TEventArgs>(_descriptor, e => { handler(e); return default; }, options, filter, cancellationToken);
    }

    public Task<ISubscription> SubscribeAsync(Func<TEventArgs, Task> handler, SubscriptionOptions? options = null, Func<TEventArgs, bool>? filter = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return _dispatcher.SubscribeAsync<TEventArgs>(_descriptor, e => new ValueTask(handler(e)), options, filter, cancellationToken);
    }

    public async Task<IEventStream<TEventArgs>> ReadAllAsync(EventStreamOptions? options = null, Func<TEventArgs, bool>? filter = null, CancellationToken cancellationToken = default)
    {
        return await _dispatcher.SubscribeReaderAsync(_descriptor, options, filter, cancellationToken).ConfigureAwait(false);
    }
}

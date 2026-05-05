// <copyright file="ContextEventSource.cs" company="Selenium Committers">
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

public sealed class ContextEventSource<TEventArgs> : IEventSource<TEventArgs> where TEventArgs : EventArgs
{
    private readonly EventSource<TEventArgs> _source;
    private readonly BrowsingContext.BrowsingContext _context;
    private readonly Func<TEventArgs, bool> _filter;

    internal ContextEventSource(EventSource<TEventArgs> source, BrowsingContext.BrowsingContext context, Func<TEventArgs, bool> filter)
    {
        _source = source;
        _context = context;
        _filter = filter;
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

    public Task<ISubscription> SubscribeAsync(Action<TEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return _source.SubscribeAsync(handler, ContextSubscriptionOptions.WithContext(options, _context), _filter, cancellationToken);
    }

    public Task<ISubscription> SubscribeAsync(Func<TEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return _source.SubscribeAsync(handler, ContextSubscriptionOptions.WithContext(options, _context), _filter, cancellationToken);
    }

    public Task<IEventStream<TEventArgs>> ReadAllAsync(ContextEventStreamOptions? options = null, CancellationToken cancellationToken = default)
    {
        return _source.ReadAllAsync(ContextEventStreamOptions.WithContext(options, _context), _filter, cancellationToken);
    }
}

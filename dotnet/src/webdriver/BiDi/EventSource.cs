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
    private readonly Func<TEventArgs, bool>? _filter;

    internal EventSource(EventDispatcher dispatcher, EventDescriptor<TEventArgs> descriptor)
    {
        _dispatcher = dispatcher;
        _descriptor = descriptor;
    }

    private EventSource(EventDispatcher dispatcher, EventDescriptor<TEventArgs> descriptor, Func<TEventArgs, bool> filter)
    {
        _dispatcher = dispatcher;
        _descriptor = descriptor;
        _filter = filter;
    }

    Task<IEventListener> IEventSource<TEventArgs>.OnAsync(Action<TEventArgs> handler, CancellationToken cancellationToken)
    {
        return OnAsync(handler, cancellationToken: cancellationToken);
    }

    Task<IEventListener> IEventSource<TEventArgs>.OnAsync(Func<TEventArgs, Task> handler, CancellationToken cancellationToken)
    {
        return OnAsync(handler, cancellationToken: cancellationToken);
    }

    Task<IEventReader<TEventArgs>> IEventSource<TEventArgs>.ReadAllAsync(CancellationToken cancellationToken)
    {
        return ReadAllAsync(cancellationToken: cancellationToken);
    }

    IEventSource<TEventArgs> IEventSource<TEventArgs>.Where(Func<TEventArgs, bool> predicate)
    {
        return Where(predicate);
    }

    public Task<IEventListener> OnAsync(Action<TEventArgs> handler, EventListenerOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        var wrapped = WrapHandler(handler);
        return _dispatcher.SubscribeAsync<TEventArgs>(_descriptor, e => { wrapped(e); return default; }, options, cancellationToken);
    }

    public Task<IEventListener> OnAsync(Func<TEventArgs, Task> handler, EventListenerOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        var wrapped = WrapHandler(handler);
        return _dispatcher.SubscribeAsync<TEventArgs>(_descriptor, e => new ValueTask(wrapped(e)), options, cancellationToken);
    }

    public async Task<IEventReader<TEventArgs>> ReadAllAsync(EventReaderOptions? options = null, CancellationToken cancellationToken = default)
    {
        var reader = await _dispatcher.SubscribeReaderAsync(_descriptor, options, cancellationToken).ConfigureAwait(false);

        return _filter is not null
            ? new FilteredEventReader<TEventArgs>(reader, _filter)
            : reader;
    }

    public EventSource<TEventArgs> Where(Func<TEventArgs, bool> predicate)
    {
        ArgumentNullException.ThrowIfNull(predicate);

        var combined = _filter is { } existing
            ? e => existing(e) && predicate(e)
            : predicate;

        return new(_dispatcher, _descriptor, combined);
    }

    private Action<TEventArgs> WrapHandler(Action<TEventArgs> handler)
        => _filter is { } f ? e => { if (f(e)) handler(e); }
    : handler;

    private Func<TEventArgs, Task> WrapHandler(Func<TEventArgs, Task> handler)
        => _filter is { } f ? async e => { if (f(e)) await handler(e).ConfigureAwait(false); }
    : handler;
}

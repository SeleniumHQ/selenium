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
    private readonly EventDescriptor<TEventArgs> _descriptor;
    private readonly Func<TEventArgs, bool>? _filter;
    private readonly Func<SubscriptionOptions?, SubscriptionOptions>? _mapOptions;

    internal EventSource(IBiDi bidi, EventDescriptor<TEventArgs> descriptor)
    {
        _bidi = bidi;
        _descriptor = descriptor;
    }

    private EventSource(IBiDi bidi, EventDescriptor<TEventArgs> descriptor,
        Func<TEventArgs, bool>? filter, Func<SubscriptionOptions?, SubscriptionOptions>? mapOptions)
    {
        _bidi = bidi;
        _descriptor = descriptor;
        _filter = filter;
        _mapOptions = mapOptions;
    }

    public EventDescriptor<TEventArgs> Descriptor => _descriptor;

    public Task<ISubscription> OnAsync(Action<TEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return _bidi.OnEventAsync(_descriptor, WrapHandler(handler), EffectiveOptions(options), cancellationToken);
    }

    public Task<ISubscription> OnAsync(Func<TEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return _bidi.OnEventAsync(_descriptor, WrapHandler(handler), EffectiveOptions(options), cancellationToken);
    }

    public async Task<IEventReader<TEventArgs>> ReadAllAsync(SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var reader = await _bidi.ReadAllEventsAsync(_descriptor, EffectiveOptions(options), cancellationToken).ConfigureAwait(false);

        return _filter is not null
            ? new FilteredEventReader<TEventArgs>(reader, _filter)
            : reader;
    }

    public async Task<TResult> ReadAllAsync<TResult>(Func<IEventReader<TEventArgs>, Task<TResult>> action, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(action);

        await using var reader = await ReadAllAsync(options, cancellationToken).ConfigureAwait(false);

        return await action(reader).ConfigureAwait(false);
    }

    public async Task ReadAllAsync(Func<IEventReader<TEventArgs>, Task> action, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(action);

        await using var reader = await ReadAllAsync(options, cancellationToken).ConfigureAwait(false);

        await action(reader).ConfigureAwait(false);
    }

    public EventSource<TEventArgs> Where(Func<TEventArgs, bool> predicate)
    {
        ArgumentNullException.ThrowIfNull(predicate);

        var combined = _filter is { } existing
            ? e => existing(e) && predicate(e)
            : predicate;

        return new(_bidi, _descriptor, combined, _mapOptions);
    }

    public EventSource<TEventArgs> WithOptions(Func<SubscriptionOptions?, SubscriptionOptions> mapOptions)
    {
        ArgumentNullException.ThrowIfNull(mapOptions);

        return new(_bidi, _descriptor, _filter, mapOptions);
    }

    private Action<TEventArgs> WrapHandler(Action<TEventArgs> handler)
        => _filter is { } f ? e => { if (f(e)) handler(e); } : handler;

    private Func<TEventArgs, Task> WrapHandler(Func<TEventArgs, Task> handler)
        => _filter is { } f ? async e => { if (f(e)) await handler(e).ConfigureAwait(false); } : handler;

    private SubscriptionOptions? EffectiveOptions(SubscriptionOptions? options)
        => _mapOptions?.Invoke(options) ?? options;
}

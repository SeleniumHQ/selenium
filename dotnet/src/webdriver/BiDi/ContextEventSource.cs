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

public sealed class ContextEventSource<TEventArgs> where TEventArgs : EventArgs
{
    private readonly EventSource<TEventArgs> _source;
    private readonly BrowsingContext.BrowsingContext _context;

    internal ContextEventSource(EventSource<TEventArgs> source, BrowsingContext.BrowsingContext context)
    {
        _source = source;
        _context = context;
    }

    public Task<IEventListener> OnAsync(Action<TEventArgs> handler, ContextEventListenerOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return _source.OnAsync(handler, ContextEventListenerOptions.WithContext(options, _context), cancellationToken);
    }

    public Task<IEventListener> OnAsync(Func<TEventArgs, Task> handler, ContextEventListenerOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return _source.OnAsync(handler, ContextEventListenerOptions.WithContext(options, _context), cancellationToken);
    }

    public Task<IEventReader<TEventArgs>> ReadAllAsync(ContextEventReaderOptions? options = null, CancellationToken cancellationToken = default)
    {
        return _source.ReadAllAsync(ContextEventReaderOptions.WithContext(options, _context), cancellationToken);
    }

    public async Task<TResult> ReadAllAsync<TResult>(Func<IEventReader<TEventArgs>, Task<TResult>> action, ContextEventReaderOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(action);

        await using var reader = await ReadAllAsync(options, cancellationToken).ConfigureAwait(false);

        return await action(reader).ConfigureAwait(false);
    }

    public async Task ReadAllAsync(Func<IEventReader<TEventArgs>, Task> action, ContextEventReaderOptions? options = null, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(action);

        await using var reader = await ReadAllAsync(options, cancellationToken).ConfigureAwait(false);

        await action(reader).ConfigureAwait(false);
    }

    public ContextEventSource<TEventArgs> Where(Func<TEventArgs, bool> predicate)
    {
        ArgumentNullException.ThrowIfNull(predicate);

        return new(_source.Where(predicate), _context);
    }
}

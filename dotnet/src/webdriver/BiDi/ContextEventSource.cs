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

internal sealed class ContextEventSource<TEventArgs> : IEventSource<TEventArgs> where TEventArgs : EventArgs
{
    private readonly EventDispatcher _dispatcher;
    private readonly EventDescriptor<TEventArgs> _descriptor;
    private readonly BrowsingContext.BrowsingContext _context;
    private readonly Func<TEventArgs, bool> _filter;

    internal ContextEventSource(EventDispatcher dispatcher, EventDescriptor<TEventArgs> descriptor, BrowsingContext.BrowsingContext context, Func<TEventArgs, bool> filter)
    {
        _dispatcher = dispatcher;
        _descriptor = descriptor;
        _context = context;
        _filter = filter;
    }

    public Task<ISubscription> SubscribeAsync(Action<TEventArgs> handler, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return _dispatcher.SubscribeAsync<TEventArgs>(_descriptor, e => { handler(e); return default; }, [_context], _filter, cancellationToken);
    }

    public Task<ISubscription> SubscribeAsync(Func<TEventArgs, Task> handler, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);

        return _dispatcher.SubscribeAsync<TEventArgs>(_descriptor, e => new ValueTask(handler(e)), [_context], _filter, cancellationToken);
    }

    public async Task<IEventStream<TEventArgs>> StreamAsync(CancellationToken cancellationToken = default)
    {
        return await _dispatcher.SubscribeReaderAsync(_descriptor, [_context], _filter, cancellationToken).ConfigureAwait(false);
    }
}

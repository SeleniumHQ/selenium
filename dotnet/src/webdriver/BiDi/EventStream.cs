// <copyright file="EventStream.cs" company="Selenium Committers">
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

using System.Threading.Channels;

namespace OpenQA.Selenium.BiDi;

public sealed class EventStream<TEventArgs> : IEventSubscription, IAsyncEnumerable<TEventArgs>, IAsyncDisposable
    where TEventArgs : EventArgs
{
    private readonly Func<CancellationToken, ValueTask> _unsubscribe;
    private readonly Func<TEventArgs, bool>? _filter;
    private int _disposed;

    private readonly Channel<TEventArgs> _channel = Channel.CreateUnbounded<TEventArgs>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = false });

    internal EventStream(Func<CancellationToken, ValueTask> unsubscribe, Func<TEventArgs, bool>? filter = null)
    {
        _unsubscribe = unsubscribe;
        _filter = filter;
    }

    void IEventSubscription.Deliver(EventArgs args)
    {
        var typedArgs = (TEventArgs)args;
        if (_filter is null || _filter(typedArgs))
        {
            _channel.Writer.TryWrite(typedArgs);
        }
    }

    void IEventSubscription.Complete(Exception? error)
    {
        _channel.Writer.TryComplete(error);
    }

    public IAsyncEnumerator<TEventArgs> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        return ReadChannelAsync(_channel.Reader, cancellationToken);
    }

    private static async IAsyncEnumerator<TEventArgs> ReadChannelAsync(ChannelReader<TEventArgs> reader, CancellationToken cancellationToken)
    {
        while (await reader.WaitToReadAsync(cancellationToken).ConfigureAwait(false))
        {
            while (reader.TryRead(out var item))
            {
                yield return item;
            }
        }
    }

    public async ValueTask UnsubscribeAsync(CancellationToken cancellationToken = default)
    {
        await _unsubscribe(cancellationToken).ConfigureAwait(false);
    }

    public async ValueTask DisposeAsync()
    {
        if (Interlocked.CompareExchange(ref _disposed, 1, 0) == 0)
        {
            _channel.Writer.TryComplete();
            await UnsubscribeAsync().ConfigureAwait(false);
            GC.SuppressFinalize(this);
        }
    }
}

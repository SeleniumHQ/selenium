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

using System.Runtime.CompilerServices;
using System.Threading.Channels;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

internal sealed class EventStream<TEventArgs> : IEventStream<TEventArgs>, ISubscriptionSink
    where TEventArgs : EventArgs
{
    private static readonly ILogger _logger = Internal.Logging.Log.GetLogger(typeof(EventStream<TEventArgs>));

    private readonly Func<CancellationToken, ValueTask> _unsubscribe;
    private int _disposed;

    private readonly Channel<TEventArgs> _channel = Channel.CreateUnbounded<TEventArgs>(
        new UnboundedChannelOptions { SingleReader = false, SingleWriter = true });

    private readonly Func<TEventArgs, bool>? _filter;

    internal EventStream(Func<CancellationToken, ValueTask> unsubscribe, Func<TEventArgs, bool>? filter = null)
    {
        _unsubscribe = unsubscribe;
        _filter = filter;
    }

    void ISubscriptionSink.Deliver(EventArgs args)
    {
        if (args is not TEventArgs typed)
        {
            throw new InvalidOperationException($"Cannot deliver '{args.GetType()}' to stream expecting '{typeof(TEventArgs)}'.");
        }

        if (_filter is { } f && !f(typed)) return;

        _channel.Writer.TryWrite(typed);
    }

    void ISubscriptionSink.Complete(Exception? error)
    {
        _channel.Writer.TryComplete(error);
    }

    public async IAsyncEnumerable<TEventArgs> ReadAllAsync([EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        if (_disposed != 0) throw new ObjectDisposedException(GetType().FullName);

        while (await _channel.Reader.WaitToReadAsync(cancellationToken).ConfigureAwait(false))
        {
            while (_channel.Reader.TryRead(out var item))
            {
                yield return item;
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (Interlocked.CompareExchange(ref _disposed, 1, 0) == 0)
        {
            try
            {
                await _unsubscribe(default).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.Warn($"Wire unsubscribe failed during dispose: {ex.Message}");
                throw;
            }
            finally
            {
                _channel.Writer.TryComplete();
            }
        }
    }
}

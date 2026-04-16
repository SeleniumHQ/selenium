// <copyright file="Subscription.cs" company="Selenium Committers">
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
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

internal interface IEventSubscription
{
    void Deliver(EventArgs args);
    void Complete(Exception? error = null);
    ValueTask DisposeAsync();
}

public sealed class Subscription<TEventArgs> : IEventSubscription, IAsyncDisposable
    where TEventArgs : EventArgs
{
    private static readonly ILogger Logger = Internal.Logging.Log.GetLogger(typeof(Subscription<>));

    private readonly Func<CancellationToken, ValueTask> _unsubscribe;
    private readonly Func<TEventArgs, bool>? _filter;
    private int _disposed;

    private readonly Channel<TEventArgs> _channel = Channel.CreateUnbounded<TEventArgs>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = true });

    private readonly Task _drainTask;

    internal Subscription(Func<CancellationToken, ValueTask> unsubscribe, Func<TEventArgs, ValueTask> handler, Func<TEventArgs, bool>? filter = null)
    {
        _unsubscribe = unsubscribe;
        _filter = filter;
        _drainTask = Task.Run(() => DrainAsync(handler));
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

            await _drainTask.ConfigureAwait(false);

            GC.SuppressFinalize(this);
        }
    }

    private async Task DrainAsync(Func<TEventArgs, ValueTask> handler)
    {
        while (await _channel.Reader.WaitToReadAsync().ConfigureAwait(false))
        {
            while (_channel.Reader.TryRead(out var args))
            {
                try
                {
                    await handler(args).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    if (Logger.IsEnabled(LogEventLevel.Error))
                    {
                        Logger.Error($"Unhandled error processing BiDi event handler: {ex}");
                    }
                }
            }
        }
    }
}

public sealed record SubscriptionOptions
{
    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; init; }

    public IEnumerable<Browser.UserContext>? UserContexts { get; init; }

    public TimeSpan? Timeout { get; init; }
}

public sealed record ContextSubscriptionOptions
{
    public TimeSpan? Timeout { get; init; }

    internal static SubscriptionOptions WithContext(ContextSubscriptionOptions? options, BrowsingContext.BrowsingContext context) => new()
    {
        Contexts = [context],
        Timeout = options?.Timeout
    };
}

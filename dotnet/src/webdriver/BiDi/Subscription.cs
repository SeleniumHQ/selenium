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

using System.Collections.Concurrent;
using System.Threading.Channels;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

internal interface IEventSubscription
{
    void Deliver(EventArgs args);
    void Complete(Exception? error = null);
    ValueTask DisposeAsync();
}

public sealed class Subscription<TEventArgs> : ISubscription, IEventSubscription
    where TEventArgs : EventArgs
{
    private static readonly ILogger Logger = Internal.Logging.Log.GetLogger(typeof(Subscription<>));

    private readonly Func<CancellationToken, ValueTask> _unsubscribe;
    private readonly Func<TEventArgs, ValueTask> _handler;
    private int _disposed;

    private readonly Channel<TEventArgs> _channel = Channel.CreateUnbounded<TEventArgs>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = true });

    private readonly Task _dispatchTask;
    private readonly ConcurrentDictionary<Task, byte> _activeHandlers = [];

    internal Subscription(Func<CancellationToken, ValueTask> unsubscribe, Func<TEventArgs, ValueTask> handler)
    {
        _unsubscribe = unsubscribe;
        _handler = handler;
        _dispatchTask = Task.Run(DispatchEventsAsync);
    }

    void IEventSubscription.Deliver(EventArgs args)
    {
        _channel.Writer.TryWrite((TEventArgs)args);
    }

    void IEventSubscription.Complete(Exception? error)
    {
        _channel.Writer.TryComplete(error);
    }

    public async ValueTask DisposeAsync()
    {
        if (Interlocked.CompareExchange(ref _disposed, 1, 0) == 0)
        {
            await _unsubscribe(default).ConfigureAwait(false);

            _channel.Writer.TryComplete();

            await _dispatchTask.ConfigureAwait(false);

            var remaining = _activeHandlers.Keys.ToArray();
            if (remaining.Length > 0)
            {
                await Task.WhenAll(remaining).ConfigureAwait(false);
            }

            GC.SuppressFinalize(this);
        }
    }

    private async Task DispatchEventsAsync()
    {
        while (await _channel.Reader.WaitToReadAsync().ConfigureAwait(false))
        {
            while (_channel.Reader.TryRead(out var args))
            {
                var handlerTask = Task.Run(async () =>
                {
                    try
                    {
                        await _handler(args).ConfigureAwait(false);
                    }
                    catch (Exception ex)
                    {
                        if (Logger.IsEnabled(LogEventLevel.Error))
                        {
                            Logger.Error($"Unhandled error processing BiDi event handler: {ex}");
                        }
                    }
                });

                if (handlerTask.IsCompleted)
                    continue;

                _activeHandlers.TryAdd(handlerTask, 0);
                _ = AwaitAndRemoveAsync(handlerTask);
            }
        }
    }

    private async Task AwaitAndRemoveAsync(Task handlerTask)
    {
        try
        {
            await handlerTask.ConfigureAwait(false);
        }
        finally
        {
            _activeHandlers.TryRemove(handlerTask, out _);
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

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

public class Subscription : IAsyncDisposable
{
    private readonly Broker _broker;
    private int _disposed;

    internal Subscription(Session.Subscription subscription, Broker broker, string eventName)
    {
        SubscriptionId = subscription;
        _broker = broker;
        EventName = eventName;
    }

    internal Session.Subscription SubscriptionId { get; }

    internal string EventName { get; }

    internal virtual void Deliver(EventArgs args) { }

    internal virtual void Complete(Exception? error = null) { }

    public async ValueTask UnsubscribeAsync(CancellationToken cancellationToken = default)
    {
        await _broker.UnsubscribeAsync(this, cancellationToken).ConfigureAwait(false);
    }

    public virtual async ValueTask DisposeAsync()
    {
        if (Interlocked.CompareExchange(ref _disposed, 1, 0) == 0)
        {
            await UnsubscribeAsync().ConfigureAwait(false);
            GC.SuppressFinalize(this);
        }
    }
}

public class Subscription<TEventArgs> : Subscription, IAsyncEnumerable<TEventArgs>
    where TEventArgs : EventArgs
{
    private static readonly ILogger Logger = Internal.Logging.Log.GetLogger(typeof(Subscription<>));

    private readonly Channel<TEventArgs> _channel = Channel.CreateUnbounded<TEventArgs>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = false });

    private readonly Func<TEventArgs, ValueTask>? _handler;

    private readonly List<Channel<TEventArgs>> _children = [];

    private readonly Task _drainTask;

    internal Subscription(Session.Subscription subscription, Broker broker, string eventName, Func<TEventArgs, ValueTask>? handler)
        : base(subscription, broker, eventName)
    {
        _handler = handler;
        _drainTask = Task.Run(DrainAsync);
    }

    internal override void Deliver(EventArgs args)
    {
        _channel.Writer.TryWrite((TEventArgs)args);
    }

    internal override void Complete(Exception? error = null)
    {
        _channel.Writer.TryComplete(error);
    }

    public IAsyncEnumerator<TEventArgs> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        var child = Channel.CreateUnbounded<TEventArgs>();
        lock (_children) { _children.Add(child); }
        return ReadChannelAsync(child.Reader, cancellationToken);
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

    public override async ValueTask DisposeAsync()
    {
        Complete();

        await _drainTask.ConfigureAwait(false);

        await base.DisposeAsync().ConfigureAwait(false);
    }

    private async Task DrainAsync()
    {
        while (await _channel.Reader.WaitToReadAsync().ConfigureAwait(false))
        {
            while (_channel.Reader.TryRead(out var args))
            {
                if (_handler is not null)
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
                }

                lock (_children)
                {
                    foreach (var child in _children)
                    {
                        child.Writer.TryWrite(args);
                    }
                }
            }
        }

        // Drain complete — close all child channels
        lock (_children)
        {
            var error = _channel.Reader.Completion.IsFaulted ? _channel.Reader.Completion.Exception?.InnerException : null;
            foreach (var child in _children)
            {
                child.Writer.TryComplete(error);
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

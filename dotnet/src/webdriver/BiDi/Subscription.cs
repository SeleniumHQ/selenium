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

using System.Runtime.ExceptionServices;
using System.Threading.Channels;

namespace OpenQA.Selenium.BiDi;

internal interface ISubscriptionSink
{
    void Deliver(EventArgs args);
    void Complete(Exception? error = null);
    ValueTask DisposeAsync();
}

internal sealed class Subscription<TEventArgs> : ISubscription, ISubscriptionSink
    where TEventArgs : EventArgs
{
    private readonly Func<CancellationToken, ValueTask> _unsubscribe;
    private readonly Func<TEventArgs, ValueTask> _handler;
    private ExceptionDispatchInfo? _handlerError;
    private ExceptionDispatchInfo? _sourceError;
    private int _disposed;

    private readonly Channel<TEventArgs> _channel = Channel.CreateUnbounded<TEventArgs>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = true });

    private readonly Task _dispatchTask;

    internal Subscription(Func<CancellationToken, ValueTask> unsubscribe, Func<TEventArgs, ValueTask> handler)
    {
        _unsubscribe = unsubscribe;
        _handler = handler;
        _dispatchTask = Task.Run(DispatchEventsAsync);
    }

    void ISubscriptionSink.Deliver(EventArgs args)
    {
        if (args is not TEventArgs typed)
        {
            throw new InvalidOperationException($"Cannot deliver '{args.GetType()}' to subscription expecting '{typeof(TEventArgs)}'.");
        }

        _channel.Writer.TryWrite(typed);
    }

    void ISubscriptionSink.Complete(Exception? error)
    {
        _channel.Writer.TryComplete(error);
    }

    public async ValueTask DisposeAsync()
    {
        if (Interlocked.CompareExchange(ref _disposed, 1, 0) == 0)
        {
            Exception? unsubscribeError = null;

            try
            {
                await _unsubscribe(default).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                unsubscribeError = ex;
            }
            finally
            {
                _channel.Writer.TryComplete();

                await _dispatchTask.ConfigureAwait(false);

                GC.SuppressFinalize(this);
            }

            _handlerError?.Throw();
            _sourceError?.Throw();

            if (unsubscribeError is not null)
            {
                ExceptionDispatchInfo.Capture(unsubscribeError).Throw();
            }
        }
    }

    private async Task DispatchEventsAsync()
    {
        try
        {
            while (await _channel.Reader.WaitToReadAsync().ConfigureAwait(false))
            {
                while (_channel.Reader.TryRead(out var args))
                {
                    try
                    {
                        await _handler(args).ConfigureAwait(false);
                    }
                    catch (Exception ex)
                    {
                        _handlerError = ExceptionDispatchInfo.Capture(ex);
                        _channel.Writer.TryComplete(ex);
                        return;
                    }
                }
            }
        }
        catch (Exception ex) when (_handlerError is null)
        {
            _sourceError = ExceptionDispatchInfo.Capture(ex);
        }
    }
}

public sealed record SubscriptionOptions
{
    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; init; }

    public IEnumerable<Browser.UserContext>? UserContexts { get; init; }
}

public sealed record EventStreamOptions
{
    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; init; }

    public IEnumerable<Browser.UserContext>? UserContexts { get; init; }
}

public sealed record ContextSubscriptionOptions
{
    internal static SubscriptionOptions WithContext(ContextSubscriptionOptions? options, BrowsingContext.BrowsingContext context) => new()
    {
        Contexts = [context]
    };
}

public sealed record ContextEventStreamOptions
{
    internal static EventStreamOptions WithContext(ContextEventStreamOptions? options, BrowsingContext.BrowsingContext context) => new()
    {
        Contexts = [context]
    };
}

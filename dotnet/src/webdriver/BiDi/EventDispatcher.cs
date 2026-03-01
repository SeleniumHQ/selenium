// <copyright file="EventDispatcher.cs" company="Selenium Committers">
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
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using System.Threading.Channels;
using OpenQA.Selenium.BiDi.Session;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

internal sealed class EventDispatcher : IAsyncDisposable
{
    private readonly ILogger _logger = Internal.Logging.Log.GetLogger<EventDispatcher>();

    private readonly Func<ISessionModule> _sessionProvider;

    private readonly ConcurrentDictionary<string, EventRegistration> _events = new();

    private readonly Channel<EventItem> _pendingEvents = Channel.CreateUnbounded<EventItem>(new()
    {
        SingleReader = true,
        SingleWriter = true
    });

    private readonly Task _processEventsTask;

    public EventDispatcher(Func<ISessionModule> sessionProvider)
    {
        _sessionProvider = sessionProvider;
        _processEventsTask = Task.Run(ProcessEventsAsync);
    }

    public async Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, EventHandler eventHandler, SubscriptionOptions? options, JsonTypeInfo<TEventArgs> jsonTypeInfo, CancellationToken cancellationToken)
        where TEventArgs : EventArgs
    {
        var registration = _events.GetOrAdd(eventName, _ => new EventRegistration(jsonTypeInfo));

        registration.AddHandler(eventHandler);

        try
        {
            var subscribeResult = await _sessionProvider().SubscribeAsync([eventName], new() { Contexts = options?.Contexts, UserContexts = options?.UserContexts }, cancellationToken).ConfigureAwait(false);

            return new Subscription(subscribeResult.Subscription, this, eventHandler);
        }
        catch
        {
            registration.RemoveHandler(eventHandler);
            throw;
        }
    }

    public async ValueTask UnsubscribeAsync(Subscription subscription, CancellationToken cancellationToken)
    {
        if (_events.TryGetValue(subscription.EventHandler.EventName, out var registration))
        {
            await _sessionProvider().UnsubscribeAsync([subscription.SubscriptionId], null, cancellationToken).ConfigureAwait(false);

            // Wait until all pending events for this method are dispatched
            try
            {
                await registration.DrainAsync(cancellationToken).ConfigureAwait(false);
            }
            finally
            {
                registration.RemoveHandler(subscription.EventHandler);
            }
        }
    }

    public void EnqueueEvent(string method, ReadOnlyMemory<byte> jsonUtf8Bytes, IBiDi bidi)
    {
        if (_events.TryGetValue(method, out var registration))
        {
            if (_pendingEvents.Writer.TryWrite(new EventItem(jsonUtf8Bytes, bidi, registration)))
            {
                registration.IncrementEnqueued();
            }
            else
            {
                if (_logger.IsEnabled(LogEventLevel.Warn))
                {
                    _logger.Warn($"Failed to enqueue BiDi event with method '{method}' for processing. Event will be ignored.");
                }
            }
        }
        else
        {
            if (_logger.IsEnabled(LogEventLevel.Warn))
            {
                _logger.Warn($"Received BiDi event with method '{method}', but no event type mapping was found. Event will be ignored.");
            }
        }
    }

    private async Task ProcessEventsAsync()
    {
        var reader = _pendingEvents.Reader;

        while (await reader.WaitToReadAsync().ConfigureAwait(false))
        {
            while (reader.TryRead(out var evt))
            {
                try
                {
                    var eventArgs = (EventArgs)JsonSerializer.Deserialize(evt.JsonUtf8Bytes.Span, evt.Registration.TypeInfo)!;
                    eventArgs.BiDi = evt.BiDi;

                    foreach (var handler in evt.Registration.GetHandlersSnapshot())
                    {
                        try
                        {
                            await handler.InvokeAsync(eventArgs).ConfigureAwait(false);
                        }
                        catch (Exception ex)
                        {
                            if (_logger.IsEnabled(LogEventLevel.Error))
                            {
                                _logger.Error($"Unhandled error processing BiDi event handler: {ex}");
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    if (_logger.IsEnabled(LogEventLevel.Error))
                    {
                        _logger.Error($"Unhandled error deserializing BiDi event: {ex}");
                    }
                }
                finally
                {
                    evt.Registration.IncrementProcessed();
                }
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        _pendingEvents.Writer.Complete();

        await _processEventsTask.ConfigureAwait(false);

        GC.SuppressFinalize(this);
    }

    private sealed record EventItem(ReadOnlyMemory<byte> JsonUtf8Bytes, IBiDi BiDi, EventRegistration Registration);

    private sealed class EventRegistration(JsonTypeInfo typeInfo)
    {
        private long _enqueueSeq;
        private long _processedSeq;
        private readonly object _drainLock = new();
        private readonly List<EventHandler> _handlers = [];
        private List<(long TargetSeq, TaskCompletionSource<bool> Tcs)>? _drainWaiters;

        public JsonTypeInfo TypeInfo { get; } = typeInfo;

        public void AddHandler(EventHandler handler)
        {
            lock (_drainLock) _handlers.Add(handler);
        }

        public void RemoveHandler(EventHandler handler)
        {
            lock (_drainLock) _handlers.Remove(handler);
        }

        public EventHandler[] GetHandlersSnapshot()
        {
            lock (_drainLock) return [.. _handlers];
        }

        public void IncrementEnqueued() => Interlocked.Increment(ref _enqueueSeq);

        public void IncrementProcessed()
        {
            var processed = Interlocked.Increment(ref _processedSeq);

            lock (_drainLock)
            {
                if (_drainWaiters is null) return;

                for (var i = _drainWaiters.Count - 1; i >= 0; i--)
                {
                    if (_drainWaiters[i].TargetSeq <= processed)
                    {
                        _drainWaiters[i].Tcs.TrySetResult(true);
                        _drainWaiters.RemoveAt(i);
                    }
                }

                if (_drainWaiters.Count == 0) _drainWaiters = null;
            }
        }

        public Task DrainAsync(CancellationToken cancellationToken)
        {
            lock (_drainLock)
            {
                var target = Volatile.Read(ref _enqueueSeq);
                if (Volatile.Read(ref _processedSeq) >= target) return Task.CompletedTask;

                var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
                _drainWaiters ??= [];
                _drainWaiters.Add((target, tcs));

                // Double-check: processing may have caught up between the read and adding the waiter
                if (Volatile.Read(ref _processedSeq) >= target)
                {
                    _drainWaiters.Remove((target, tcs));
                    if (_drainWaiters.Count == 0) _drainWaiters = null;
                    return Task.CompletedTask;
                }

                if (!cancellationToken.CanBeCanceled) return tcs.Task;

                return tcs.Task.ContinueWith(
                    static _ => { },
                    cancellationToken,
                    TaskContinuationOptions.None,
                    TaskScheduler.Default);
            }
        }
    }
}

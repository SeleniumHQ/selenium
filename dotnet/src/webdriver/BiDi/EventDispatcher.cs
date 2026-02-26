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

    private readonly Task _eventEmitterTask;

    private static readonly TaskFactory _myTaskFactory = new(CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskContinuationOptions.None, TaskScheduler.Default);

    public EventDispatcher(Func<ISessionModule> sessionProvider)
    {
        _sessionProvider = sessionProvider;
        _eventEmitterTask = _myTaskFactory.StartNew(ProcessEventsAwaiterAsync).Unwrap();
    }

    public async Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, EventHandler eventHandler, SubscriptionOptions? options, JsonTypeInfo<TEventArgs> jsonTypeInfo, CancellationToken cancellationToken)
        where TEventArgs : EventArgs
    {
        var registration = _events.GetOrAdd(eventName, _ => new EventRegistration(jsonTypeInfo));

        var subscribeResult = await _sessionProvider().SubscribeAsync([eventName], new() { Contexts = options?.Contexts, UserContexts = options?.UserContexts }, cancellationToken).ConfigureAwait(false);

        registration.AddHandler(eventHandler);

        return new Subscription(subscribeResult.Subscription, this, eventHandler);
    }

    public async ValueTask UnsubscribeAsync(Subscription subscription, CancellationToken cancellationToken)
    {
        if (_events.TryGetValue(subscription.EventHandler.EventName, out var registration))
        {
            await _sessionProvider().UnsubscribeAsync([subscription.SubscriptionId], null, cancellationToken).ConfigureAwait(false);

            // Wait until all pending events for this method are dispatched
            await registration.DrainAsync().ConfigureAwait(false);

            registration.RemoveHandler(subscription.EventHandler);
        }
    }

    public void EnqueueEvent(string method, ReadOnlyMemory<byte> jsonUtf8Bytes, IBiDi bidi)
    {
        if (_events.TryGetValue(method, out var registration) && registration.TypeInfo is not null)
        {
            registration.IncrementPending();
            _pendingEvents.Writer.TryWrite(new EventItem(jsonUtf8Bytes, bidi, registration));
        }
        else
        {
            if (_logger.IsEnabled(LogEventLevel.Warn))
            {
                _logger.Warn($"Received BiDi event with method '{method}', but no event type mapping was found. Event will be ignored.");
            }
        }
    }

    private async Task ProcessEventsAwaiterAsync()
    {
        var reader = _pendingEvents.Reader;

        while (await reader.WaitToReadAsync().ConfigureAwait(false))
        {
            while (reader.TryRead(out var evt))
            {
                try
                {
                    // Deserialize on background thread instead of network thread (single parse)
                    var eventArgs = (EventArgs)JsonSerializer.Deserialize(evt.JsonUtf8Bytes.Span, evt.Registration.TypeInfo)!;
                    eventArgs.BiDi = evt.BiDi;

                    foreach (var handler in evt.Registration.GetHandlersSnapshot())
                    {
                        await handler.InvokeAsync(eventArgs).ConfigureAwait(false);
                    }
                }
                catch (Exception ex)
                {
                    if (_logger.IsEnabled(LogEventLevel.Error))
                    {
                        _logger.Error($"Unhandled error processing BiDi event handler: {ex}");
                    }
                }
                finally
                {
                    evt.Registration.DecrementPending();
                }
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        _pendingEvents.Writer.Complete();

        await _eventEmitterTask.ConfigureAwait(false);

        GC.SuppressFinalize(this);
    }

    private sealed record EventItem(ReadOnlyMemory<byte> JsonUtf8Bytes, IBiDi BiDi, EventRegistration Registration);

    private sealed class EventRegistration(JsonTypeInfo typeInfo)
    {
        private int _pendingCount;
        private readonly object _drainLock = new();
        private TaskCompletionSource<bool>? _drainTcs;
        private readonly List<EventHandler> _handlers = [];

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

        public void IncrementPending() => Interlocked.Increment(ref _pendingCount);

        public void DecrementPending()
        {
            if (Interlocked.Decrement(ref _pendingCount) == 0)
            {
                lock (_drainLock)
                {
                    _drainTcs?.TrySetResult(true);
                    _drainTcs = null;
                }
            }
        }

        public ValueTask DrainAsync()
        {
            lock (_drainLock)
            {
                if (Volatile.Read(ref _pendingCount) == 0) return default;

                _drainTcs ??= new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);

                // Double-check: count could have reached 0 between the check and setting TCS
                if (Volatile.Read(ref _pendingCount) == 0)
                {
                    _drainTcs.TrySetResult(true);
                    _drainTcs = null;
                    return default;
                }

                return new ValueTask(_drainTcs.Task);
            }
        }
    }
}

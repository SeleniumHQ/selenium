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
using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization.Metadata;
using System.Threading.Channels;
using OpenQA.Selenium.BiDi.Session;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

internal sealed class EventDispatcher : IAsyncDisposable
{
    private readonly ILogger _logger = Internal.Logging.Log.GetLogger<EventDispatcher>();

    private readonly Func<ISessionModule> _sessionProvider;

    private readonly ConcurrentDictionary<string, EventRegistration> _eventRegistrations = new();

    private readonly ConcurrentDictionary<Task, byte> _runningHandlers = new();

    private readonly Channel<PendingEvent> _pendingEvents = Channel.CreateUnbounded<PendingEvent>(new()
    {
        SingleReader = true,
        SingleWriter = true
    });

    private readonly Task _eventEmitterTask;

    public EventDispatcher(Func<ISessionModule> sessionProvider)
    {
        _sessionProvider = sessionProvider;
        _eventEmitterTask = Task.Run(ProcessEventsAwaiterAsync);
    }

    public async Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, EventHandler eventHandler, SubscriptionOptions? options, JsonTypeInfo<TEventArgs> jsonTypeInfo, CancellationToken cancellationToken)
        where TEventArgs : EventArgs
    {
        var registration = _eventRegistrations.GetOrAdd(eventName, _ => new EventRegistration(jsonTypeInfo));

        var subscribeResult = await _sessionProvider().SubscribeAsync([eventName], new() { Contexts = options?.Contexts, UserContexts = options?.UserContexts }, cancellationToken).ConfigureAwait(false);

        registration.AddHandler(eventHandler);

        return new Subscription(subscribeResult.Subscription, this, eventHandler);
    }

    public async ValueTask UnsubscribeAsync(Subscription subscription, CancellationToken cancellationToken)
    {
        if (_eventRegistrations.TryGetValue(subscription.EventHandler.EventName, out var registration))
        {
            await _sessionProvider().UnsubscribeAsync([subscription.SubscriptionId], null, cancellationToken).ConfigureAwait(false);
            registration.RemoveHandler(subscription.EventHandler);
        }
    }

    public void EnqueueEvent(string method, EventArgs eventArgs)
    {
        _pendingEvents.Writer.TryWrite(new PendingEvent(method, eventArgs));
    }

    private async Task ProcessEventsAwaiterAsync()
    {
        var reader = _pendingEvents.Reader;
        while (await reader.WaitToReadAsync().ConfigureAwait(false))
        {
            while (reader.TryRead(out var result))
            {
                if (_eventRegistrations.TryGetValue(result.Method, out var registration))
                {
                    foreach (var handler in registration.GetHandlers()) // copy-on-write array, safe to iterate
                    {
                        var runningHandlerTask = InvokeHandlerAsync(handler, result.EventArgs);
                        if (!runningHandlerTask.IsCompleted)
                        {
                            _runningHandlers.TryAdd(runningHandlerTask, 0);
                            _ = runningHandlerTask.ContinueWith(static (t, state) => ((ConcurrentDictionary<Task, byte>)state!).TryRemove(t, out _),
                                _runningHandlers, TaskContinuationOptions.ExecuteSynchronously);
                        }
                    }
                }
            }
        }
    }

    private async Task InvokeHandlerAsync(EventHandler handler, EventArgs eventArgs)
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

    public async ValueTask DisposeAsync()
    {
        _pendingEvents.Writer.Complete();

        await _eventEmitterTask.ConfigureAwait(false);

        await Task.WhenAll(_runningHandlers.Keys).ConfigureAwait(false);

        GC.SuppressFinalize(this);
    }

    public bool TryGetJsonTypeInfo(string eventName, [NotNullWhen(true)] out JsonTypeInfo? jsonTypeInfo)
    {
        if (_eventRegistrations.TryGetValue(eventName, out var registration))
        {
            jsonTypeInfo = registration.TypeInfo;
            return true;
        }

        jsonTypeInfo = null;
        return false;
    }

    private readonly record struct PendingEvent(string Method, EventArgs EventArgs);

    private sealed class EventRegistration(JsonTypeInfo typeInfo)
    {
        private readonly object _lock = new();
        private volatile EventHandler[] _handlers = [];

        public JsonTypeInfo TypeInfo { get; } = typeInfo;

        public EventHandler[] GetHandlers() => _handlers;

        public void AddHandler(EventHandler handler)
        {
            lock (_lock) _handlers = [.. _handlers, handler];
        }

        public void RemoveHandler(EventHandler handler)
        {
            lock (_lock) _handlers = Array.FindAll(_handlers, h => h != handler);
        }
    }
}

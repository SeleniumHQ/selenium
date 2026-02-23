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

    private readonly Channel<PendingEvent> _pendingEvents = Channel.CreateUnbounded<PendingEvent>(new()
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

        registration.Handlers.Add(eventHandler);

        return new Subscription(subscribeResult.Subscription, this, eventHandler);
    }

    public async ValueTask UnsubscribeAsync(Subscription subscription, CancellationToken cancellationToken)
    {
        if (_events.TryGetValue(subscription.EventHandler.EventName, out var registration))
        {
            await _sessionProvider().UnsubscribeAsync([subscription.SubscriptionId], null, cancellationToken).ConfigureAwait(false);
            registration.Handlers.Remove(subscription.EventHandler);
        }
    }

    public void EnqueueEvent(string method, ReadOnlyMemory<byte> jsonUtf8Bytes, IBiDi bidi)
    {
        if (_events.TryGetValue(method, out var registration) && registration.TypeInfo is not null)
        {
            _pendingEvents.Writer.TryWrite(new PendingEvent(method, jsonUtf8Bytes, bidi, registration.TypeInfo));
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
            while (reader.TryRead(out var result))
            {
                try
                {
                    if (_events.TryGetValue(result.Method, out var registration))
                    {
                        // Deserialize on background thread instead of network thread (single parse)
                        var eventArgs = (EventArgs)JsonSerializer.Deserialize(result.JsonUtf8Bytes.Span, result.TypeInfo)!;
                        eventArgs.BiDi = result.BiDi;

                        foreach (var handler in registration.Handlers.ToArray()) // copy handlers avoiding modified collection while iterating
                        {
                            await handler.InvokeAsync(eventArgs).ConfigureAwait(false);
                        }
                    }
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
    }

    public async ValueTask DisposeAsync()
    {
        _pendingEvents.Writer.Complete();

        await _eventEmitterTask.ConfigureAwait(false);

        GC.SuppressFinalize(this);
    }

    private readonly record struct PendingEvent(string Method, ReadOnlyMemory<byte> JsonUtf8Bytes, IBiDi BiDi, JsonTypeInfo TypeInfo);

    private sealed class EventRegistration(JsonTypeInfo typeInfo)
    {
        public JsonTypeInfo TypeInfo { get; } = typeInfo;
        public List<EventHandler> Handlers { get; } = [];
    }
}

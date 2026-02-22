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

    private readonly ConcurrentDictionary<string, List<EventHandler>> _eventHandlers = new();
    private readonly Dictionary<string, JsonTypeInfo> _eventTypesMap = [];

    private readonly Channel<EventInfo> _pendingEvents = Channel.CreateUnbounded<EventInfo>(new()
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
        _eventTypesMap[eventName] = jsonTypeInfo;

        var handlers = _eventHandlers.GetOrAdd(eventName, (a) => []);

        var subscribeResult = await _sessionProvider().SubscribeAsync([eventName], new() { Contexts = options?.Contexts, UserContexts = options?.UserContexts }, cancellationToken).ConfigureAwait(false);

        handlers.Add(eventHandler);

        return new Subscription(subscribeResult.Subscription, this, eventHandler);
    }

    public async Task UnsubscribeAsync(Subscription subscription, CancellationToken cancellationToken)
    {
        if (_eventHandlers.TryGetValue(subscription.EventHandler.EventName, out var eventHandlers))
        {
            eventHandlers.Remove(subscription.EventHandler);
        }

        await _sessionProvider().UnsubscribeAsync([subscription.SubscriptionId], null, cancellationToken).ConfigureAwait(false);
    }

    internal bool TryGetEventTypeInfo(string method, out JsonTypeInfo? jsonTypeInfo)
    {
        return _eventTypesMap.TryGetValue(method, out jsonTypeInfo);
    }

    public void EnqueueEvent(string method, ref Utf8JsonReader paramsReader, IBiDi bidi)
    {
        if (_eventTypesMap.TryGetValue(method, out var eventInfo) && eventInfo is not null)
        {
            var eventArgs = (EventArgs)JsonSerializer.Deserialize(ref paramsReader, eventInfo)!;

            eventArgs.BiDi = bidi;

            _pendingEvents.Writer.TryWrite(new EventInfo(method, eventArgs));
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
                    if (_eventHandlers.TryGetValue(result.Method, out var eventHandlers))
                    {
                        if (eventHandlers is not null)
                        {
                            foreach (var handler in eventHandlers.ToArray()) // copy handlers avoiding modified collection while iterating
                            {
                                var args = result.Params;

                                await handler.InvokeAsync(args).ConfigureAwait(false);
                            }
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

    private readonly record struct EventInfo(string Method, EventArgs Params);
}

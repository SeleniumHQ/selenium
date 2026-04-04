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
using System.Threading.Channels;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

internal sealed class EventDispatcher : IAsyncDisposable
{
    private readonly ILogger _logger = Internal.Logging.Log.GetLogger<EventDispatcher>();

    private readonly ConcurrentDictionary<string, HandlerRegistration> _handlerRegistrations = new();

    private readonly ConcurrentDictionary<Task, byte> _runningHandlers = new();

    private readonly Channel<PendingEvent> _pendingEvents = Channel.CreateUnbounded<PendingEvent>(new()
    {
        SingleReader = true,
        SingleWriter = true
    });

    private readonly Task _eventEmitterTask;

    public EventDispatcher()
    {
        _eventEmitterTask = Task.Run(ProcessEventsAwaiterAsync);
    }

    public void AddHandler(string eventName, Func<EventArgs, ValueTask> handler)
    {
        var registration = _handlerRegistrations.GetOrAdd(eventName, _ => new HandlerRegistration());
        registration.AddHandler(handler);
    }

    public void RemoveHandler(string eventName, Func<EventArgs, ValueTask> handler)
    {
        if (_handlerRegistrations.TryGetValue(eventName, out var registration))
        {
            registration.RemoveHandler(handler);
        }
    }

    public void EnqueueEvent(string eventName, EventArgs eventArgs)
    {
        _pendingEvents.Writer.TryWrite(new PendingEvent(eventName, eventArgs));
    }

    private async Task ProcessEventsAwaiterAsync()
    {
        var reader = _pendingEvents.Reader;
        while (await reader.WaitToReadAsync().ConfigureAwait(false))
        {
            while (reader.TryRead(out var result))
            {
                if (_handlerRegistrations.TryGetValue(result.EventName, out var registration))
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

    private async Task InvokeHandlerAsync(Func<EventArgs, ValueTask> handler, EventArgs eventArgs)
    {
        try
        {
            await handler(eventArgs).ConfigureAwait(false);
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

    private readonly record struct PendingEvent(string EventName, EventArgs EventArgs);

    private sealed class HandlerRegistration
    {
        private readonly object _lock = new();
        private volatile Func<EventArgs, ValueTask>[] _handlers = [];

        public Func<EventArgs, ValueTask>[] GetHandlers() => _handlers;

        public void AddHandler(Func<EventArgs, ValueTask> handler)
        {
            lock (_lock) _handlers = [.. _handlers, handler];
        }

        public void RemoveHandler(Func<EventArgs, ValueTask> handler)
        {
            lock (_lock) _handlers = Array.FindAll(_handlers, h => h != handler);
        }
    }
}

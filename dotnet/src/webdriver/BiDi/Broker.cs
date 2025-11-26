// <copyright file="Broker.cs" company="Selenium Committers">
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

using OpenQA.Selenium.Internal.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi;

public sealed class Broker : IAsyncDisposable
{
    private readonly ILogger _logger = Internal.Logging.Log.GetLogger<Broker>();

    private readonly BiDi _bidi;
    private readonly ITransport _transport;

    private readonly ConcurrentDictionary<long, CommandInfo> _pendingCommands = new();
    private readonly BlockingCollection<(string Method, EventArgs Params)> _pendingEvents = [];
    private readonly Dictionary<string, JsonTypeInfo> _eventTypesMap = [];

    private readonly ConcurrentDictionary<string, List<EventHandler>> _eventHandlers = new();

    private long _currentCommandId;

    private static readonly TaskFactory _myTaskFactory = new(CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskContinuationOptions.None, TaskScheduler.Default);

    private Task? _receivingMessageTask;
    private Task? _eventEmitterTask;
    private CancellationTokenSource? _receiveMessagesCancellationTokenSource;

    internal Broker(BiDi bidi, Uri url, JsonSerializerOptions jsonOptions)
    {
        _bidi = bidi;
        _transport = new WebSocketTransport(url);
    }

    public async Task ConnectAsync(CancellationToken cancellationToken)
    {
        await _transport.ConnectAsync(cancellationToken).ConfigureAwait(false);

        _receiveMessagesCancellationTokenSource = new CancellationTokenSource();
        _receivingMessageTask = _myTaskFactory.StartNew(async () => await ReceiveMessagesAsync(_receiveMessagesCancellationTokenSource.Token)).Unwrap();
        _eventEmitterTask = _myTaskFactory.StartNew(ProcessEventsAwaiterAsync).Unwrap();
    }

    private async Task ReceiveMessagesAsync(CancellationToken cancellationToken)
    {
        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                var data = await _transport.ReceiveAsync(cancellationToken).ConfigureAwait(false);

                try
                {
                    ProcessReceivedMessage(data);
                }
                catch (Exception ex)
                {
                    if (_logger.IsEnabled(LogEventLevel.Error))
                    {
                        _logger.Error($"Unhandled error occured while processing remote message: {ex}");
                    }
                }
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            if (_logger.IsEnabled(LogEventLevel.Error))
            {
                _logger.Error($"Unhandled error occured while receiving remote messages: {ex}");
            }

            throw;
        }
    }

    private async Task ProcessEventsAwaiterAsync()
    {
        foreach (var result in _pendingEvents.GetConsumingEnumerable())
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

                            args.BiDi = _bidi;

                            // handle browsing context subscriber
                            if (handler.Contexts is not null && args is BrowsingContextEventArgs browsingContextEventArgs && handler.Contexts.Contains(browsingContextEventArgs.Context))
                            {
                                await handler.InvokeAsync(args).ConfigureAwait(false);
                            }
                            // handle only session subscriber
                            else if (handler.Contexts is null)
                            {
                                await handler.InvokeAsync(args).ConfigureAwait(false);
                            }
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

    public async Task<TResult> ExecuteCommandAsync<TCommand, TResult>(TCommand command, CommandOptions? options, JsonTypeInfo<TCommand> jsonCommandTypeInfo, JsonTypeInfo<TResult> jsonResultTypeInfo)
        where TCommand : Command
        where TResult : EmptyResult
    {
        command.Id = Interlocked.Increment(ref _currentCommandId);
        var tcs = new TaskCompletionSource<EmptyResult>(TaskCreationOptions.RunContinuationsAsynchronously);
        var timeout = options?.Timeout ?? TimeSpan.FromSeconds(30);
        using var cts = new CancellationTokenSource(timeout);
        cts.Token.Register(() => tcs.TrySetCanceled(cts.Token));
        var commandInfo = new CommandInfo(command.Id, tcs, jsonResultTypeInfo);
        _pendingCommands[command.Id] = commandInfo;
        var data = JsonSerializer.SerializeToUtf8Bytes(command, jsonCommandTypeInfo);

        await _transport.SendAsync(data, cts.Token).ConfigureAwait(false);

        return (TResult)await tcs.Task.ConfigureAwait(false);
    }

    public async Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, Action<TEventArgs> action, SubscriptionOptions? options, JsonTypeInfo<TEventArgs> jsonTypeInfo)
        where TEventArgs : EventArgs
    {
        _eventTypesMap[eventName] = jsonTypeInfo;

        var handlers = _eventHandlers.GetOrAdd(eventName, (a) => []);

        var subscribeResult = await _bidi.SessionModule.SubscribeAsync([eventName], new() { Contexts = options?.Contexts, UserContexts = options?.UserContexts }).ConfigureAwait(false);

        var eventHandler = new SyncEventHandler<TEventArgs>(eventName, action, options?.Contexts);

        handlers.Add(eventHandler);

        return new Subscription(subscribeResult.Subscription, this, eventHandler);
    }

    public async Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, Func<TEventArgs, Task> func, SubscriptionOptions? options, JsonTypeInfo<TEventArgs> jsonTypeInfo)
        where TEventArgs : EventArgs
    {
        _eventTypesMap[eventName] = jsonTypeInfo;

        var handlers = _eventHandlers.GetOrAdd(eventName, (a) => []);

        var subscribeResult = await _bidi.SessionModule.SubscribeAsync([eventName], new() { Contexts = options?.Contexts, UserContexts = options?.UserContexts }).ConfigureAwait(false);

        var eventHandler = new AsyncEventHandler<TEventArgs>(eventName, func, options?.Contexts);

        handlers.Add(eventHandler);

        return new Subscription(subscribeResult.Subscription, this, eventHandler);
    }

    public async Task UnsubscribeAsync(Subscription subscription)
    {
        var eventHandlers = _eventHandlers[subscription.EventHandler.EventName];

        eventHandlers.Remove(subscription.EventHandler);

        await _bidi.SessionModule.UnsubscribeAsync([subscription.SubscriptionId]).ConfigureAwait(false);
    }

    public async ValueTask DisposeAsync()
    {
        _pendingEvents.CompleteAdding();

        _receiveMessagesCancellationTokenSource?.Cancel();

        if (_eventEmitterTask is not null)
        {
            await _eventEmitterTask.ConfigureAwait(false);
        }

        _transport.Dispose();

        GC.SuppressFinalize(this);
    }

    private void ProcessReceivedMessage(byte[]? data)
    {
        long? id = default;
        string? type = default;
        string? method = default;
        string? error = default;
        string? message = default;
        Utf8JsonReader resultReader = default;
        Utf8JsonReader paramsReader = default;

        Utf8JsonReader reader = new(new ReadOnlySpan<byte>(data));
        reader.Read();

        reader.Read(); // "{"

        while (reader.TokenType == JsonTokenType.PropertyName)
        {
            string? propertyName = reader.GetString();
            reader.Read();

            switch (propertyName)
            {
                case "id":
                    id = reader.GetInt64();
                    break;

                case "type":
                    type = reader.GetString();
                    break;

                case "method":
                    method = reader.GetString();
                    break;

                case "result":
                    resultReader = reader; // snapshot
                    break;

                case "params":
                    paramsReader = reader; // snapshot
                    break;

                case "error":
                    error = reader.GetString();
                    break;

                case "message":
                    message = reader.GetString();
                    break;
            }

            reader.Skip();
            reader.Read();
        }

        switch (type)
        {
            case "success":
                if (id is null) throw new JsonException("The remote end responded with 'success' message type, but missed required 'id' property.");

                if (_pendingCommands.TryGetValue(id.Value, out var successCommand))
                {
                    successCommand.TaskCompletionSource.SetResult((EmptyResult)JsonSerializer.Deserialize(ref resultReader, successCommand.JsonResultTypeInfo)!);
                    _pendingCommands.TryRemove(id.Value, out _);
                }
                else
                {
                    throw new BiDiException($"The remote end responded with 'success' message type, but no pending command with id {id} was found.");
                }

                break;

            case "event":
                if (method is null) throw new JsonException("The remote end responded with 'event' message type, but missed required 'method' property.");

                if (_eventTypesMap.TryGetValue(method, out var eventInfo))
                {
                    var eventArgs = (EventArgs)JsonSerializer.Deserialize(ref paramsReader, eventInfo)!;

                    var messageEvent = (method, eventArgs);
                    _pendingEvents.Add(messageEvent);
                }
                else
                {
                    throw new BiDiException($"The remote end responded with 'event' message type, but no event type mapping for method '{method}' was found.");
                }

                break;

            case "error":
                if (id is null) throw new JsonException("The remote end responded with 'error' message type, but missed required 'id' property.");

                if (_pendingCommands.TryGetValue(id.Value, out var errorCommand))
                {
                    errorCommand.TaskCompletionSource.SetException(new BiDiException($"{error}: {message}"));
                    _pendingCommands.TryRemove(id.Value, out _);
                }
                else
                {
                    throw new BiDiException($"The remote end responded with 'error' message type, but no pending command with id {id} was found.");
                }

                break;
        }
    }

    class CommandInfo(long id, TaskCompletionSource<EmptyResult> taskCompletionSource, JsonTypeInfo jsonResultTypeInfo)
    {
        public long Id { get; } = id;

        public TaskCompletionSource<EmptyResult> TaskCompletionSource { get; } = taskCompletionSource;

        public JsonTypeInfo JsonResultTypeInfo { get; } = jsonResultTypeInfo;
    };
}

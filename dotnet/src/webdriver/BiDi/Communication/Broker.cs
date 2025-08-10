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

using OpenQA.Selenium.BiDi.Communication.Json;
using OpenQA.Selenium.BiDi.Communication.Json.Converters;
using OpenQA.Selenium.BiDi.Communication.Transport;
using OpenQA.Selenium.Internal.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Communication;

public sealed class Broker : IAsyncDisposable
{
    private readonly ILogger _logger = Internal.Logging.Log.GetLogger<Broker>();

    private readonly BiDi _bidi;
    private readonly ITransport _transport;

    private readonly ConcurrentDictionary<long, CommandInfo> _pendingCommands = new();
    private readonly BlockingCollection<MessageEvent> _pendingEvents = [];
    private readonly Dictionary<string, Type> _eventTypesMap = [];

    private readonly ConcurrentDictionary<string, List<EventHandler>> _eventHandlers = new();

    private long _currentCommandId;

    private static readonly TaskFactory _myTaskFactory = new(CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskContinuationOptions.None, TaskScheduler.Default);

    private Task? _receivingMessageTask;
    private Task? _eventEmitterTask;
    private CancellationTokenSource? _receiveMessagesCancellationTokenSource;

    private readonly BiDiJsonSerializerContext _jsonSerializerContext;

    internal Broker(BiDi bidi, Uri url)
    {
        _bidi = bidi;
        _transport = new WebSocketTransport(url);

        var jsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,

            // BiDi returns special numbers such as "NaN" as strings
            // Additionally, -0 is returned as a string "-0"
            NumberHandling = JsonNumberHandling.AllowNamedFloatingPointLiterals | JsonNumberHandling.AllowReadingFromString,
            Converters =
            {
                new BrowsingContextConverter(_bidi),
                new BrowserUserContextConverter(bidi),
                new BrowserClientWindowConverter(),
                new NavigationConverter(),
                new InterceptConverter(_bidi),
                new RequestConverter(),
                new ChannelConverter(),
                new HandleConverter(_bidi),
                new InternalIdConverter(_bidi),
                new PreloadScriptConverter(_bidi),
                new RealmConverter(_bidi),
                new RealmTypeConverter(),
                new DateTimeOffsetConverter(),
                new PrintPageRangeConverter(),
                new InputOriginConverter(),
                new SubscriptionConverter(),
                new JsonStringEnumConverter(JsonNamingPolicy.CamelCase),

                // https://github.com/dotnet/runtime/issues/72604
                new Json.Converters.Polymorphic.EvaluateResultConverter(),
                new Json.Converters.Polymorphic.RemoteValueConverter(),
                new Json.Converters.Polymorphic.RealmInfoConverter(),
                new Json.Converters.Polymorphic.LogEntryConverter(),
                //

                // Enumerable
                new Json.Converters.Enumerable.GetCookiesResultConverter(),
                new Json.Converters.Enumerable.LocateNodesResultConverter(),
                new Json.Converters.Enumerable.InputSourceActionsConverter(),
                new Json.Converters.Enumerable.GetUserContextsResultConverter(),
                new Json.Converters.Enumerable.GetClientWindowsResultConverter(),
                new Json.Converters.Enumerable.GetRealmsResultConverter(),
                new Json.Converters.Enumerable.GetTreeResultConverter(),
            }
        };

        _jsonSerializerContext = new BiDiJsonSerializerContext(jsonSerializerOptions);
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
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                var data = await _transport.ReceiveAsync(cancellationToken).ConfigureAwait(false);

                ProcessReceivedMessage(data);
            }
            catch (Exception ex)
            {
                if (cancellationToken.IsCancellationRequested is not true && _logger.IsEnabled(LogEventLevel.Error))
                {
                    _logger.Error($"Couldn't process received BiDi remote message: {ex}");
                }
            }
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

    public async Task<TResult> ExecuteCommandAsync<TCommand, TResult>(TCommand command, CommandOptions? options)
        where TCommand : Command
        where TResult : EmptyResult
    {
        var result = await ExecuteCommandCoreAsync(command, options).ConfigureAwait(false);

        return (TResult)result;
    }

    private async Task<EmptyResult> ExecuteCommandCoreAsync<TCommand>(TCommand command, CommandOptions? options)
        where TCommand : Command
    {
        command.Id = Interlocked.Increment(ref _currentCommandId);

        var tcs = new TaskCompletionSource<EmptyResult>(TaskCreationOptions.RunContinuationsAsynchronously);

        var timeout = options?.Timeout ?? TimeSpan.FromSeconds(30);

        using var cts = new CancellationTokenSource(timeout);

        cts.Token.Register(() => tcs.TrySetCanceled(cts.Token));

        _pendingCommands[command.Id] = new(command.Id, command.ResultType, tcs);

        var data = JsonSerializer.SerializeToUtf8Bytes(command, typeof(TCommand), _jsonSerializerContext);

        await _transport.SendAsync(data, cts.Token).ConfigureAwait(false);

        return await tcs.Task.ConfigureAwait(false);
    }

    public async Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, Action<TEventArgs> action, SubscriptionOptions? options = null)
        where TEventArgs : EventArgs
    {
        _eventTypesMap[eventName] = typeof(TEventArgs);

        var handlers = _eventHandlers.GetOrAdd(eventName, (a) => []);

        if (options is BrowsingContextsSubscriptionOptions browsingContextsOptions)
        {
            var subscribeResult = await _bidi.SessionModule.SubscribeAsync([eventName], new() { Contexts = browsingContextsOptions.Contexts }).ConfigureAwait(false);

            var eventHandler = new SyncEventHandler<TEventArgs>(eventName, action, browsingContextsOptions?.Contexts);

            handlers.Add(eventHandler);

            return new Subscription(subscribeResult.Subscription, this, eventHandler);
        }
        else
        {
            var subscribeResult = await _bidi.SessionModule.SubscribeAsync([eventName]).ConfigureAwait(false);

            var eventHandler = new SyncEventHandler<TEventArgs>(eventName, action);

            handlers.Add(eventHandler);

            return new Subscription(subscribeResult.Subscription, this, eventHandler);
        }
    }

    public async Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, Func<TEventArgs, Task> func, SubscriptionOptions? options = null)
        where TEventArgs : EventArgs
    {
        _eventTypesMap[eventName] = typeof(TEventArgs);

        var handlers = _eventHandlers.GetOrAdd(eventName, (a) => []);

        if (options is BrowsingContextsSubscriptionOptions browsingContextsOptions)
        {
            var subscribeResult = await _bidi.SessionModule.SubscribeAsync([eventName], new() { Contexts = browsingContextsOptions.Contexts }).ConfigureAwait(false);

            var eventHandler = new AsyncEventHandler<TEventArgs>(eventName, func, browsingContextsOptions.Contexts);

            handlers.Add(eventHandler);

            return new Subscription(subscribeResult.Subscription, this, eventHandler);
        }
        else
        {
            var subscribeResult = await _bidi.SessionModule.SubscribeAsync([eventName]).ConfigureAwait(false);

            var eventHandler = new AsyncEventHandler<TEventArgs>(eventName, func);

            handlers.Add(eventHandler);

            return new Subscription(subscribeResult.Subscription, this, eventHandler);
        }
    }

    public async Task UnsubscribeAsync(Session.Subscription subscription, EventHandler eventHandler)
    {
        var eventHandlers = _eventHandlers[eventHandler.EventName];

        eventHandlers.Remove(eventHandler);

        if (subscription is not null)
        {
            await _bidi.SessionModule.UnsubscribeAsync([subscription]).ConfigureAwait(false);
        }
        else
        {
            if (eventHandler.Contexts is not null)
            {
                if (!eventHandlers.Any(h => eventHandler.Contexts.Equals(h.Contexts)) && !eventHandlers.Any(h => h.Contexts is null))
                {
                    await _bidi.SessionModule.UnsubscribeAsync([eventHandler.EventName], new() { Contexts = eventHandler.Contexts }).ConfigureAwait(false);
                }
            }
            else
            {
                if (!eventHandlers.Any(h => h.Contexts is not null) && !eventHandlers.Any(h => h.Contexts is null))
                {
                    await _bidi.SessionModule.UnsubscribeAsync([eventHandler.EventName]).ConfigureAwait(false);
                }
            }
        }
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
                    resultReader = reader; // cloning reader with current position
                    break;

                case "params":
                    paramsReader = reader; // cloning reader with current position
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
                    var messageSuccess = JsonSerializer.Deserialize(ref resultReader, successCommand.ResultType, _jsonSerializerContext)!;
                    successCommand.TaskCompletionSource.SetResult((EmptyResult)messageSuccess);
                    _pendingCommands.TryRemove(id.Value, out _);
                }
                else
                {
                    throw new BiDiException($"The remote end responded with 'success' message type, but no pending command with id {id} was found.");
                }

                break;

            case "event":
                if (method is null) throw new JsonException("The remote end responded with 'event' message type, but missed required 'method' property.");

                if (_eventTypesMap.TryGetValue(method, out var eventType))
                {
                    var eventArgs = (EventArgs)JsonSerializer.Deserialize(ref paramsReader, eventType, _jsonSerializerContext)!;

                    var messageEvent = new MessageEvent(method, eventArgs);
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

    class CommandInfo(long id, Type resultType, TaskCompletionSource<EmptyResult> taskCompletionSource)
    {
        public long Id { get; } = id;

        public Type ResultType { get; } = resultType;

        public TaskCompletionSource<EmptyResult> TaskCompletionSource { get; } = taskCompletionSource;
    };
}

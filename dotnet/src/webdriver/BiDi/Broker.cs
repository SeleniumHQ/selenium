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

using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using OpenQA.Selenium.BiDi.Session;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

internal sealed class Broker : IAsyncDisposable
{
    private readonly ILogger _logger = Internal.Logging.Log.GetLogger<Broker>();

    private readonly ITransport _transport;
    private readonly EventDispatcher _eventDispatcher;
    private readonly IBiDi _bidi;

    private readonly ConcurrentDictionary<long, CommandInfo> _pendingCommands = new();

    private long _currentCommandId;

    private static readonly TaskFactory _myTaskFactory = new(CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskContinuationOptions.None, TaskScheduler.Default);

    private readonly Task _receivingMessageTask;
    private readonly CancellationTokenSource _receiveMessagesCancellationTokenSource;

    public Broker(ITransport transport, IBiDi bidi, Func<ISessionModule> sessionProvider)
    {
        _transport = transport;
        _bidi = bidi;
        _eventDispatcher = new EventDispatcher(sessionProvider);

        _receiveMessagesCancellationTokenSource = new CancellationTokenSource();
        _receivingMessageTask = _myTaskFactory.StartNew(async () => await ReceiveMessagesAsync(_receiveMessagesCancellationTokenSource.Token), TaskCreationOptions.LongRunning).Unwrap();
    }

    public Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, EventHandler eventHandler, SubscriptionOptions? options, JsonTypeInfo<TEventArgs> jsonTypeInfo, CancellationToken cancellationToken)
        where TEventArgs : EventArgs
    {
        return _eventDispatcher.SubscribeAsync(eventName, eventHandler, options, jsonTypeInfo, cancellationToken);
    }

    public async Task<TResult> ExecuteCommandAsync<TCommand, TResult>(TCommand command, CommandOptions? options, JsonTypeInfo<TCommand> jsonCommandTypeInfo, JsonTypeInfo<TResult> jsonResultTypeInfo, CancellationToken cancellationToken)
        where TCommand : Command
        where TResult : EmptyResult
    {
        command.Id = Interlocked.Increment(ref _currentCommandId);

        var tcs = new TaskCompletionSource<EmptyResult>(TaskCreationOptions.RunContinuationsAsynchronously);

        using var cts = cancellationToken.CanBeCanceled
            ? CancellationTokenSource.CreateLinkedTokenSource(cancellationToken)
            : new CancellationTokenSource();

        var timeout = options?.Timeout ?? TimeSpan.FromSeconds(30);
        cts.CancelAfter(timeout);

        var data = JsonSerializer.SerializeToUtf8Bytes(command, jsonCommandTypeInfo);
        var commandInfo = new CommandInfo(tcs, jsonResultTypeInfo);
        _pendingCommands[command.Id] = commandInfo;

        using var ctsRegistration = cts.Token.Register(() =>
        {
            tcs.TrySetCanceled(cts.Token);
            _pendingCommands.TryRemove(command.Id, out _);
        });

        try
        {
            await _transport.SendAsync(data, cts.Token).ConfigureAwait(false);
        }
        catch
        {
            _pendingCommands.TryRemove(command.Id, out _);
            throw;
        }

        return (TResult)await tcs.Task.ConfigureAwait(false);
    }

    public async ValueTask DisposeAsync()
    {
        _receiveMessagesCancellationTokenSource.Cancel();

        await _eventDispatcher.DisposeAsync().ConfigureAwait(false);

        try
        {
            await _receivingMessageTask.ConfigureAwait(false);
        }
        catch (OperationCanceledException) when (_receiveMessagesCancellationTokenSource.IsCancellationRequested)
        {
            // Expected when cancellation is requested, ignore.
        }

        _receiveMessagesCancellationTokenSource.Dispose();

        await _transport.DisposeAsync().ConfigureAwait(false);

        GC.SuppressFinalize(this);
    }

    private void ProcessReceivedMessage(byte[] data)
    {
        long? id = default;
        string? type = default;
        string? method = default;
        string? error = default;
        string? message = default;
        Utf8JsonReader resultReader = default;
        long paramsStartIndex = 0;
        long paramsEndIndex = 0;

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
                    paramsStartIndex = reader.TokenStartIndex;
                    break;

                case "error":
                    error = reader.GetString();
                    break;

                case "message":
                    message = reader.GetString();
                    break;
            }

            if (propertyName == "params")
            {
                reader.Skip();
                paramsEndIndex = reader.BytesConsumed;
            }
            else
            {
                reader.Skip();
            }
            reader.Read();
        }

        switch (type)
        {
            case "success":
                if (id is null) throw new BiDiException("The remote end responded with 'success' message type, but missed required 'id' property.");

                if (_pendingCommands.TryGetValue(id.Value, out var command))
                {
                    try
                    {
                        var commandResult = JsonSerializer.Deserialize(ref resultReader, command.JsonResultTypeInfo)
                            ?? throw new BiDiException("Remote end returned null command result in the 'result' property.");

                        command.TaskCompletionSource.SetResult((EmptyResult)commandResult);
                    }
                    catch (Exception ex)
                    {
                        command.TaskCompletionSource.SetException(ex);
                    }
                    finally
                    {
                        _pendingCommands.TryRemove(id.Value, out _);
                    }
                }
                else
                {
                    if (_logger.IsEnabled(LogEventLevel.Warn))
                    {
                        _logger.Warn($"The remote end responded with 'success' message type, but no pending command with id {id} was found. Message content: {System.Text.Encoding.UTF8.GetString(data)}");
                    }
                }

                break;

            case "event":
                if (method is null) throw new BiDiException($"The remote end responded with 'event' message type, but missed required 'method' property. Message content: {System.Text.Encoding.UTF8.GetString(data)}");
                var paramsJsonData = new ReadOnlyMemory<byte>(data, (int)paramsStartIndex, (int)(paramsEndIndex - paramsStartIndex));
                _eventDispatcher.EnqueueEvent(method, paramsJsonData, _bidi);
                break;

            case "error":
                if (id is null) throw new BiDiException($"The remote end responded with 'error' message type, but missed required 'id' property. Message content: {System.Text.Encoding.UTF8.GetString(data)}");

                if (_pendingCommands.TryGetValue(id.Value, out var errorCommand))
                {
                    errorCommand.TaskCompletionSource.SetException(new BiDiException($"{error}: {message}"));
                    _pendingCommands.TryRemove(id.Value, out _);
                }
                else
                {
                    if (_logger.IsEnabled(LogEventLevel.Warn))
                    {
                        _logger.Warn($"The remote end responded with 'error' message type, but no pending command with id {id} was found. Message content: {System.Text.Encoding.UTF8.GetString(data)}");
                    }
                }

                break;
        }
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
                        _logger.Error($"Unhandled error occurred while processing remote message: {ex}");
                    }
                }
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            if (_logger.IsEnabled(LogEventLevel.Error))
            {
                _logger.Error($"Unhandled error occurred while receiving remote messages: {ex}");
            }

            // Fail all pending commands, as the connection is likely broken if we failed to receive messages.
            foreach (var id in _pendingCommands.Keys)
            {
                if (_pendingCommands.TryRemove(id, out var pendingCommand))
                {
                    pendingCommand.TaskCompletionSource.TrySetException(ex);
                }
            }

            throw;
        }
    }

    private readonly record struct CommandInfo(TaskCompletionSource<EmptyResult> TaskCompletionSource, JsonTypeInfo JsonResultTypeInfo);
}

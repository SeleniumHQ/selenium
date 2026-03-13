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

using System.Buffers;
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

    private readonly Task _receivingMessageTask;
    private readonly CancellationTokenSource _receiveMessagesCancellationTokenSource;

    public Broker(ITransport transport, IBiDi bidi, Func<ISessionModule> sessionProvider)
    {
        _transport = transport;
        _bidi = bidi;
        _eventDispatcher = new EventDispatcher(sessionProvider);

        _receiveMessagesCancellationTokenSource = new CancellationTokenSource();
        _receivingMessageTask = Task.Run(() => ReceiveMessagesLoopAsync(_receiveMessagesCancellationTokenSource.Token));
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

        using var sendBuffer = new PooledBufferWriter();

        using (var writer = new Utf8JsonWriter(sendBuffer))
        {
            JsonSerializer.Serialize(writer, command, jsonCommandTypeInfo);
        }

        var commandInfo = new CommandInfo(tcs, jsonResultTypeInfo);
        _pendingCommands[command.Id] = commandInfo;

        using var ctsRegistration = cts.Token.Register(() =>
        {
            tcs.TrySetCanceled(cts.Token);
            _pendingCommands.TryRemove(command.Id, out _);
        });

        try
        {
            if (_logger.IsEnabled(LogEventLevel.Trace))
            {
#if NET8_0_OR_GREATER
                _logger.Trace($"BiDi SND --> {System.Text.Encoding.UTF8.GetString(sendBuffer.WrittenMemory.Span)}");
#else
                _logger.Trace($"BiDi SND --> {System.Text.Encoding.UTF8.GetString(sendBuffer.WrittenMemory.ToArray())}");
#endif
            }

            await _transport.SendAsync(sendBuffer.WrittenMemory, cts.Token).ConfigureAwait(false);
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

    private void ProcessReceivedMessage(ReadOnlySpan<byte> data)
    {
        const int TypeSuccess = 1;
        const int TypeEvent = 2;
        const int TypeError = 3;

        long? id = default;
        int messageType = 0;
        string? method = default;
        string? error = default;
        string? message = default;
        Utf8JsonReader resultReader = default;
        Utf8JsonReader paramsReader = default;

        Utf8JsonReader reader = new(data);
        reader.Read(); // "{"

        reader.Read();

        while (reader.TokenType == JsonTokenType.PropertyName)
        {
            if (reader.ValueTextEquals("id"u8))
            {
                reader.Read();
                id = reader.GetInt64();
            }
            else if (reader.ValueTextEquals("type"u8))
            {
                reader.Read();
                if (reader.ValueTextEquals("success"u8)) messageType = TypeSuccess;
                else if (reader.ValueTextEquals("event"u8)) messageType = TypeEvent;
                else if (reader.ValueTextEquals("error"u8)) messageType = TypeError;
            }
            else if (reader.ValueTextEquals("method"u8))
            {
                reader.Read();
                method = reader.GetString();
            }
            else if (reader.ValueTextEquals("result"u8))
            {
                reader.Read();
                resultReader = reader; // snapshot
            }
            else if (reader.ValueTextEquals("params"u8))
            {
                reader.Read();
                paramsReader = reader; // snapshot
            }
            else if (reader.ValueTextEquals("error"u8))
            {
                reader.Read();
                error = reader.GetString();
            }
            else if (reader.ValueTextEquals("message"u8))
            {
                reader.Read();
                message = reader.GetString();
            }
            else
            {
                reader.Read();
            }

            reader.Skip();
            reader.Read();
        }

        switch (messageType)
        {
            case TypeSuccess:
                if (id is null) throw new BiDiException("The remote end responded with 'success' message type, but missed required 'id' property.");

                if (_pendingCommands.TryGetValue(id.Value, out var command))
                {
                    try
                    {
                        var commandResult = JsonSerializer.Deserialize(ref resultReader, command.JsonResultTypeInfo)
                            ?? throw new BiDiException("Remote end returned null command result in the 'result' property.");

                        command.TaskCompletionSource.TrySetResult((EmptyResult)commandResult);
                    }
                    catch (Exception ex)
                    {
                        command.TaskCompletionSource.TrySetException(ex);
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
                        _logger.Warn($"The remote end responded with 'success' message type, but no pending command with id {id} was found. Message content: {System.Text.Encoding.UTF8.GetString(data.ToArray())}");
                    }
                }

                break;

            case TypeEvent:
                if (method is null) throw new BiDiException($"The remote end responded with 'event' message type, but missed required 'method' property. Message content: {System.Text.Encoding.UTF8.GetString(data.ToArray())}");

                if (!_eventDispatcher.TryGetJsonTypeInfo(method, out var jsonTypeInfo))
                {
                    if (_logger.IsEnabled(LogEventLevel.Warn))
                    {
                        _logger.Warn($"Received BiDi event with method '{method}', but no event type mapping was found. Event will be ignored. Message content: {System.Text.Encoding.UTF8.GetString(data.ToArray())}");
                    }

                    break;
                }

                var eventArgs = JsonSerializer.Deserialize(ref paramsReader, jsonTypeInfo) as EventArgs
                    ?? throw new BiDiException("Remote end returned null event args in the 'params' property.");

                eventArgs.BiDi = _bidi;

                _eventDispatcher.EnqueueEvent(method, eventArgs);
                break;

            case TypeError:
                if (id is null) throw new BiDiException($"The remote end responded with 'error' message type, but missed required 'id' property. Message content: {System.Text.Encoding.UTF8.GetString(data.ToArray())}");

                if (_pendingCommands.TryGetValue(id.Value, out var errorCommand))
                {
                    errorCommand.TaskCompletionSource.TrySetException(new BiDiException($"{error}: {message}"));
                    _pendingCommands.TryRemove(id.Value, out _);
                }
                else
                {
                    if (_logger.IsEnabled(LogEventLevel.Warn))
                    {
                        _logger.Warn($"The remote end responded with 'error' message type, but no pending command with id {id} was found. Message content: {System.Text.Encoding.UTF8.GetString(data.ToArray())}");
                    }
                }

                break;

            default:
                if (_logger.IsEnabled(LogEventLevel.Warn))
                {
                    _logger.Warn($"The remote end responded with unknown message type. Message content: {System.Text.Encoding.UTF8.GetString(data.ToArray())}");
                }

                break;
        }
    }

    private async Task ReceiveMessagesLoopAsync(CancellationToken cancellationToken)
    {
        using var receiveBufferWriter = new PooledBufferWriter();

        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                receiveBufferWriter.Reset();

                await _transport.ReceiveAsync(receiveBufferWriter, cancellationToken).ConfigureAwait(false);

                if (_logger.IsEnabled(LogEventLevel.Trace))
                {
#if NET8_0_OR_GREATER
                    _logger.Trace($"BiDi RCV <-- {System.Text.Encoding.UTF8.GetString(receiveBufferWriter.WrittenMemory.Span)}");
#else
                    _logger.Trace($"BiDi RCV <-- {System.Text.Encoding.UTF8.GetString(receiveBufferWriter.WrittenMemory.ToArray())}");
#endif
                }

                try
                {
                    ProcessReceivedMessage(receiveBufferWriter.WrittenMemory.Span);
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

    private sealed class PooledBufferWriter : IBufferWriter<byte>, IDisposable
    {
        private const int DefaultBufferSize = 1024 * 8;

        private byte[]? _buffer = ArrayPool<byte>.Shared.Rent(DefaultBufferSize);
        private int _written;

        public ReadOnlyMemory<byte> WrittenMemory => new(_buffer, 0, _written);

        public void Reset()
        {
            var buffer = _buffer ?? throw new ObjectDisposedException(nameof(PooledBufferWriter));

            if (buffer.Length > DefaultBufferSize)
            {
                ArrayPool<byte>.Shared.Return(buffer);
                _buffer = ArrayPool<byte>.Shared.Rent(DefaultBufferSize);
            }

            _written = 0;
        }

        public void Advance(int count) => _written += count;

        public Memory<byte> GetMemory(int sizeHint = 0)
        {
            EnsureCapacity(sizeHint);
            return _buffer.AsMemory(_written);
        }

        public Span<byte> GetSpan(int sizeHint = 0)
        {
            EnsureCapacity(sizeHint);
            return _buffer.AsSpan(_written);
        }

        private void EnsureCapacity(int sizeHint)
        {
            var buffer = _buffer ?? throw new ObjectDisposedException(nameof(PooledBufferWriter));

            if (sizeHint <= 0) sizeHint = buffer.Length - _written;
            if (sizeHint <= 0) sizeHint = buffer.Length;

            if (_written + sizeHint > buffer.Length)
            {
                var newSize = Math.Max(buffer.Length * 2, _written + sizeHint);
                var newBuffer = ArrayPool<byte>.Shared.Rent(newSize);
                buffer.AsSpan(0, _written).CopyTo(newBuffer);
                ArrayPool<byte>.Shared.Return(buffer);
                _buffer = newBuffer;
            }
        }

        public void Dispose()
        {
            var buffer = _buffer;

            if (buffer is not null)
            {
                _buffer = null;
                ArrayPool<byte>.Shared.Return(buffer);
            }
        }
    }
}

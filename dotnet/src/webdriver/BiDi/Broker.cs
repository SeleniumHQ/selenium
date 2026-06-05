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
using System.Threading.Channels;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

internal sealed class Broker : IAsyncDisposable
{
    // Limits how many received messages can be buffered before backpressure is applied to the transport.
    private const int ReceivedMessageQueueCapacity = 16;

    // How long to wait for a command response before cancelling.
    private static readonly TimeSpan DefaultCommandTimeout = TimeSpan.FromSeconds(30);

    private readonly ILogger _logger = Internal.Logging.Log.GetLogger<Broker>();

    private readonly ITransport _transport;
    private readonly BiDi _bidi;

    private readonly ConcurrentDictionary<long, CommandInfo> _pendingCommands = new();

    private long _currentCommandId;

    private readonly Channel<PooledBufferWriter> _receivedMessages = Channel.CreateBounded<PooledBufferWriter>(
        new BoundedChannelOptions(ReceivedMessageQueueCapacity) { SingleReader = true, SingleWriter = true, FullMode = BoundedChannelFullMode.Wait });

    private readonly Channel<PooledBufferWriter> _bufferPool = Channel.CreateBounded<PooledBufferWriter>(
        new BoundedChannelOptions(ReceivedMessageQueueCapacity) { SingleReader = false, SingleWriter = false });

    private volatile Exception? _terminalReceiveException;

    private readonly Task _receivingTask;
    private readonly Task _processingTask;
    private readonly CancellationTokenSource _receiveMessagesCancellationTokenSource;

    public Broker(ITransport transport, BiDi bidi)
    {
        _transport = transport;
        _bidi = bidi;

        _receiveMessagesCancellationTokenSource = new CancellationTokenSource();
        _receivingTask = Task.Run(() => ReceiveMessagesAsync(_receiveMessagesCancellationTokenSource.Token));
        _processingTask = Task.Run(ProcessMessagesAsync);
    }

    public async Task<TResult> ExecuteAsync<TParameters, TResult>(Command<TParameters, TResult> descriptor, TParameters @params, CommandOptions? options, CancellationToken cancellationToken)
        where TParameters : Parameters
        where TResult : EmptyResult
    {
        if (_terminalReceiveException is { } terminalException)
        {
            throw new BiDiException("The broker is no longer processing messages due to a transport error.", terminalException);
        }

        var id = Interlocked.Increment(ref _currentCommandId);

        var tcs = new TaskCompletionSource<EmptyResult>(TaskCreationOptions.RunContinuationsAsynchronously);

        using var cts = cancellationToken.CanBeCanceled
            ? CancellationTokenSource.CreateLinkedTokenSource(cancellationToken)
            : new CancellationTokenSource();

        var timeout = options?.Timeout ?? DefaultCommandTimeout;
        cts.CancelAfter(timeout);

        var sendBuffer = RentBuffer();

        try
        {
            using (BiDiContext.Use(_bidi))
            using (var writer = new Utf8JsonWriter(sendBuffer))
            {
                writer.WriteStartObject();
                writer.WriteNumber("id"u8, id);
                writer.WriteString("method"u8, descriptor.Method);
                writer.WritePropertyName("params"u8);

                if (options is { AdditionalData: { IsEmpty: false } additionalData })
                {
                    // Cannot mutate the shared Parameters.Empty singleton; create a fresh instance to hold the extra data.
                    if (ReferenceEquals(@params, Parameters.Empty))
                    {
                        @params = (TParameters)(object)new Parameters();
                    }
                    @params.RawAdditionalData ??= [];
                    foreach (var prop in additionalData)
                    {
                        @params.RawAdditionalData[prop.Name] = prop.Value;
                    }
                }

                JsonSerializer.Serialize(writer, @params, descriptor.ParamsTypeInfo);
                if (options is not null)
                {
                    foreach (var prop in options.AdditionalMessageData)
                    {
                        writer.WritePropertyName(prop.Name);
                        prop.Value.WriteTo(writer);
                    }
                }
                writer.WriteEndObject();
            }
        }
        catch
        {
            ReturnBuffer(sendBuffer);
            throw;
        }

        var commandInfo = new CommandInfo(tcs, descriptor.ResultTypeInfo);
        _pendingCommands[id] = commandInfo;

        using var ctsRegistration = cts.Token.Register(() =>
        {
            tcs.TrySetCanceled(cts.Token);
            _pendingCommands.TryRemove(id, out _);
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
            _pendingCommands.TryRemove(id, out _);
            throw;
        }
        finally
        {
            ReturnBuffer(sendBuffer);
        }

        return (TResult)await tcs.Task.ConfigureAwait(false);
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            // Dispose subscriptions while transport and processing loop are still active,
            // allowing wire unsubscribe commands to be sent and handler drain tasks to complete.
            await _bidi.EventDispatcher.CompleteAllAsync(_terminalReceiveException).ConfigureAwait(false);

            _receiveMessagesCancellationTokenSource.Cancel();

            try
            {
                await _receivingTask.ConfigureAwait(false);
            }
            catch (OperationCanceledException) when (_receiveMessagesCancellationTokenSource.IsCancellationRequested)
            {
                // Expected when cancellation is requested, ignore.
            }

            await _processingTask.ConfigureAwait(false);

            await _transport.DisposeAsync().ConfigureAwait(false);
        }
        finally
        {
            _receiveMessagesCancellationTokenSource.Dispose();

            while (_bufferPool.Reader.TryRead(out var buffer))
            {
                buffer.Dispose();
            }
        }
    }

    private void ProcessReceivedMessage(ReadOnlySpan<byte> data)
    {
        using var scope = BiDiContext.Use(_bidi);
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
        Dictionary<string, JsonElement>? additionalMessageData = null;

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
                var propName = reader.GetString()!;
                reader.Read();
                additionalMessageData ??= [];
                additionalMessageData[propName] = JsonSerializer.Deserialize<JsonElement>(ref reader);
            }

            reader.Skip();
            reader.Read();
        }

        switch (messageType)
        {
            case TypeSuccess:
                if (id is null) throw new BiDiException("The remote end responded with 'success' message type, but missed required 'id' property.");

                if (_pendingCommands.TryRemove(id.Value, out var command))
                {
                    try
                    {
                        var commandResult = JsonSerializer.Deserialize(ref resultReader, command.JsonResultTypeInfo)
                            ?? throw new BiDiException("Remote end returned null command result in the 'result' property.");

                        if (additionalMessageData is not null)
                        {
                            ((EmptyResult)commandResult).AdditionalMessageData = AdditionalData.FromDictionary(additionalMessageData);
                        }

                        command.TaskCompletionSource.TrySetResult((EmptyResult)commandResult);
                    }
                    catch (Exception ex)
                    {
                        command.TaskCompletionSource.TrySetException(ex);
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

                if (!_bidi.EventDispatcher.TryDeserializeAndDispatch(method, ref paramsReader))
                {
                    if (_logger.IsEnabled(LogEventLevel.Warn))
                    {
                        _logger.Warn($"Received BiDi event with method '{method}', but no event type mapping was found. Event will be ignored. Message content: {System.Text.Encoding.UTF8.GetString(data.ToArray())}");
                    }
                }

                break;

            case TypeError:
                if (id is null) throw new BiDiException($"The remote end responded with 'error' message type, but missed required 'id' property. Message content: {System.Text.Encoding.UTF8.GetString(data.ToArray())}");

                if (_pendingCommands.TryRemove(id.Value, out var errorCommand))
                {
                    errorCommand.TaskCompletionSource.TrySetException(new BiDiException($"{error}: {message}"));
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

    private async Task ReceiveMessagesAsync(CancellationToken cancellationToken)
    {
        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                var buffer = RentBuffer();

                try
                {
                    await _transport.ReceiveAsync(buffer, cancellationToken).ConfigureAwait(false);

                    if (_logger.IsEnabled(LogEventLevel.Trace))
                    {
#if NET8_0_OR_GREATER
                        _logger.Trace($"BiDi RCV <-- {System.Text.Encoding.UTF8.GetString(buffer.WrittenMemory.Span)}");
#else
                        _logger.Trace($"BiDi RCV <-- {System.Text.Encoding.UTF8.GetString(buffer.WrittenMemory.ToArray())}");
#endif
                    }

                    await _receivedMessages.Writer.WriteAsync(buffer, cancellationToken).ConfigureAwait(false);
                }
                catch
                {
                    ReturnBuffer(buffer);
                    throw;
                }
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            if (_logger.IsEnabled(LogEventLevel.Error))
            {
                _logger.Error($"Unhandled error occurred while receiving remote messages: {ex}");
            }

            // Propagated via _terminalReceiveException; not rethrown to keep disposal orderly.
            _terminalReceiveException = ex;
        }
        finally
        {
            _receivedMessages.Writer.TryComplete();
        }
    }

    private async Task ProcessMessagesAsync()
    {
        var reader = _receivedMessages.Reader;

        while (await reader.WaitToReadAsync().ConfigureAwait(false))
        {
            while (reader.TryRead(out var buffer))
            {
                try
                {
                    ProcessReceivedMessage(buffer.WrittenMemory.Span);
                }
                catch (Exception ex)
                {
                    if (_logger.IsEnabled(LogEventLevel.Error))
                    {
                        _logger.Error($"Unhandled error occurred while processing remote message: {ex}");
                    }
                }
                finally
                {
                    ReturnBuffer(buffer);
                }
            }
        }

        // Channel is fully drained. Fail any commands that didn't get a response:
        // either with the transport error or cancellation for clean shutdown.
        var terminalException = _terminalReceiveException;

        foreach (var id in _pendingCommands.Keys)
        {
            if (_pendingCommands.TryRemove(id, out var pendingCommand))
            {
                if (terminalException is not null)
                {
                    pendingCommand.TaskCompletionSource.TrySetException(terminalException);
                }
                else
                {
                    pendingCommand.TaskCompletionSource.TrySetCanceled();
                }
            }
        }
    }

    private PooledBufferWriter RentBuffer()
    {
        return _bufferPool.Reader.TryRead(out var buffer) ? buffer : new PooledBufferWriter();
    }

    private void ReturnBuffer(PooledBufferWriter buffer)
    {
        buffer.Reset();
        if (!_bufferPool.Writer.TryWrite(buffer))
        {
            buffer.Dispose();
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

        public void Advance(int count)
        {
            if (count < 0) throw new ArgumentOutOfRangeException(nameof(count));
            if (_written + count > (_buffer?.Length ?? 0)) throw new InvalidOperationException("Cannot advance past the end of the buffer.");

            _written += count;
        }

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

            if (sizeHint <= 0)
            {
                sizeHint = Math.Max(1, buffer.Length - _written);
            }

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

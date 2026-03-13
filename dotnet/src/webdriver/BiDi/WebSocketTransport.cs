// <copyright file="WebSocketTransport.cs" company="Selenium Committers">
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
using System.Net.WebSockets;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

sealed class WebSocketTransport(ClientWebSocket webSocket) : ITransport
{
    private readonly static ILogger _logger = Internal.Logging.Log.GetLogger<WebSocketTransport>();
    private readonly ClientWebSocket _webSocket = webSocket;
    private readonly SemaphoreSlim _socketSendSemaphoreSlim = new(1, 1);

    public static async Task<ITransport> ConnectAsync(Uri uri, Action<ClientWebSocketOptions>? configure, CancellationToken cancellationToken)
    {
        ClientWebSocket webSocket = new();

        try
        {
            configure?.Invoke(webSocket.Options);

            await webSocket.ConnectAsync(uri, cancellationToken).ConfigureAwait(false);
        }
        catch (Exception)
        {
            webSocket.Dispose();
            throw;
        }

        WebSocketTransport webSocketTransport = new(webSocket);

        return webSocketTransport;
    }

    public async Task ReceiveAsync(IBufferWriter<byte> writer, CancellationToken cancellationToken)
    {
#if NET8_0_OR_GREATER
        ValueWebSocketReceiveResult result;

        do
        {
            var memory = writer.GetMemory();

            result = await _webSocket.ReceiveAsync(memory, cancellationToken).ConfigureAwait(false);

            if (result.MessageType == WebSocketMessageType.Close)
            {
                await _webSocket.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None).ConfigureAwait(false);

                throw new WebSocketException(WebSocketError.ConnectionClosedPrematurely,
                    $"The remote end closed the WebSocket connection. Status: {_webSocket.CloseStatus}, Description: {_webSocket.CloseStatusDescription}");
            }

            writer.Advance(result.Count);
        }
        while (!result.EndOfMessage);
#else
        WebSocketReceiveResult result;

        do
        {
            var memory = writer.GetMemory();

            if (!System.Runtime.InteropServices.MemoryMarshal.TryGetArray((ReadOnlyMemory<byte>)memory, out var segment))
            {
                throw new InvalidOperationException($"The {nameof(IBufferWriter<byte>)} must provide array-backed memory.");
            }

            result = await _webSocket.ReceiveAsync(segment, cancellationToken).ConfigureAwait(false);

            if (result.MessageType == WebSocketMessageType.Close)
            {
                await _webSocket.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None).ConfigureAwait(false);

                throw new WebSocketException(WebSocketError.ConnectionClosedPrematurely,
                    $"The remote end closed the WebSocket connection. Status: {result.CloseStatus}, Description: {result.CloseStatusDescription}");
            }

            writer.Advance(result.Count);
        }
        while (!result.EndOfMessage);
#endif
    }

    public async Task SendAsync(ReadOnlyMemory<byte> data, CancellationToken cancellationToken)
    {
        await _socketSendSemaphoreSlim.WaitAsync(cancellationToken).ConfigureAwait(false);

        try
        {
#if NET8_0_OR_GREATER
            await _webSocket.SendAsync(data, WebSocketMessageType.Text, true, cancellationToken).ConfigureAwait(false);
#else
            if (!System.Runtime.InteropServices.MemoryMarshal.TryGetArray(data, out ArraySegment<byte> segment))
            {
                segment = new ArraySegment<byte>(data.ToArray());
            }

            await _webSocket.SendAsync(segment, WebSocketMessageType.Text, true, cancellationToken).ConfigureAwait(false);
#endif
        }
        finally
        {
            _socketSendSemaphoreSlim.Release();
        }
    }

    private bool _disposed;

    public async ValueTask DisposeAsync()
    {
        if (_disposed) return;

        if (_webSocket.State == WebSocketState.Open)
        {
            try
            {
                await _webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                if (_logger.IsEnabled(LogEventLevel.Warn))
                {
                    _logger.Warn($"Error closing WebSocket gracefully: {ex.Message}");
                }
            }
        }

        _webSocket.Dispose();
        _socketSendSemaphoreSlim.Dispose();

        _disposed = true;

        GC.SuppressFinalize(this);
    }
}

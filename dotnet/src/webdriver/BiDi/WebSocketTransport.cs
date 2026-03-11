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
using System.Text;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

sealed class WebSocketTransport(ClientWebSocket webSocket) : ITransport
{
    private readonly static ILogger _logger = Internal.Logging.Log.GetLogger<WebSocketTransport>();

    private readonly ClientWebSocket _webSocket = webSocket;
    private readonly SemaphoreSlim _socketSendSemaphoreSlim = new(1, 1);
    private readonly MemoryStream _sharedMemoryStream = new();

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

    public async Task<byte[]> ReceiveAsync(CancellationToken cancellationToken)
    {
        var receiveBuffer = ArrayPool<byte>.Shared.Rent(1024 * 8);

        try
        {
            _sharedMemoryStream.SetLength(0);

            ArraySegment<byte> segment = new(receiveBuffer);

            WebSocketReceiveResult result;

            do
            {
                result = await _webSocket.ReceiveAsync(segment, cancellationToken).ConfigureAwait(false);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await _webSocket.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None).ConfigureAwait(false);

                    throw new WebSocketException(WebSocketError.ConnectionClosedPrematurely,
                        $"The remote end closed the WebSocket connection. Status: {result.CloseStatus}, Description: {result.CloseStatusDescription}");
                }

                _sharedMemoryStream.Write(receiveBuffer, 0, result.Count);
            }
            while (!result.EndOfMessage);

            byte[] data = _sharedMemoryStream.ToArray();

            if (_logger.IsEnabled(LogEventLevel.Trace))
            {
                _logger.Trace($"BiDi RCV <-- {Encoding.UTF8.GetString(data)}");
            }

            return data;
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(receiveBuffer);
        }
    }

    public async ValueTask SendAsync(ReadOnlyMemory<byte> data, CancellationToken cancellationToken)
    {
        await _socketSendSemaphoreSlim.WaitAsync(cancellationToken).ConfigureAwait(false);

        try
        {
#if NET8_0_OR_GREATER
            if (_logger.IsEnabled(LogEventLevel.Trace))
            {
                _logger.Trace($"BiDi SND --> {Encoding.UTF8.GetString(data.Span)}");
            }

            await _webSocket.SendAsync(data, WebSocketMessageType.Text, true, cancellationToken).ConfigureAwait(false);
#else
            if (!System.Runtime.InteropServices.MemoryMarshal.TryGetArray(data, out ArraySegment<byte> segment))
            {
                segment = new ArraySegment<byte>(data.ToArray());
            }

            if (_logger.IsEnabled(LogEventLevel.Trace))
            {
                _logger.Trace($"BiDi SND --> {Encoding.UTF8.GetString(segment.Array!, segment.Offset, segment.Count)}");
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
        _sharedMemoryStream.Dispose();
        _socketSendSemaphoreSlim.Dispose();

        _disposed = true;

        GC.SuppressFinalize(this);
    }
}

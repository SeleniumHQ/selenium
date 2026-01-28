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

using System;
using System.Buffers;
using System.IO;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

sealed class WebSocketTransport(Uri _uri) : ITransport, IDisposable
{
    private readonly static ILogger _logger = Internal.Logging.Log.GetLogger<WebSocketTransport>();

    private readonly ClientWebSocket _webSocket = new();
    private readonly SemaphoreSlim _socketSendSemaphoreSlim = new(1, 1);
    private readonly MemoryStream _sharedMemoryStream = new();

    public async Task ConnectAsync(CancellationToken cancellationToken)
    {
        await _webSocket.ConnectAsync(_uri, cancellationToken).ConfigureAwait(false);
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

    public async Task SendAsync(byte[] data, CancellationToken cancellationToken)
    {
        await _socketSendSemaphoreSlim.WaitAsync(cancellationToken).ConfigureAwait(false);

        try
        {
            if (_logger.IsEnabled(LogEventLevel.Trace))
            {
                _logger.Trace($"BiDi SND --> {Encoding.UTF8.GetString(data)}");
            }

            await _webSocket.SendAsync(new ArraySegment<byte>(data), WebSocketMessageType.Text, true, cancellationToken).ConfigureAwait(false);
        }
        finally
        {
            _socketSendSemaphoreSlim.Release();
        }
    }

    private bool _disposed;

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    private void Dispose(bool disposing)
    {
        if (_disposed)
        {
            return;
        }

        if (disposing)
        {
            _webSocket.Dispose();
            _sharedMemoryStream.Dispose();
            _socketSendSemaphoreSlim.Dispose();
        }

        _disposed = true;
    }
}

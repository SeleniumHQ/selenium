// <copyright file="BiDiOptionsBuilder.cs" company="Selenium Committers">
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

using System.Net.WebSockets;

namespace OpenQA.Selenium.BiDi;

/// <summary>
/// Provides a fluent API for configuring BiDi connection options,
/// such as the underlying transport mechanism.
/// </summary>
public sealed class BiDiOptionsBuilder
{
    private Func<CancellationToken, Task<ITransport>>? _transportFactory;

    /// <summary>
    /// Configures the BiDi connection to use a WebSocket transport with the specified URL.
    /// </summary>
    /// <param name="url">The WebSocket URL to connect to.</param>
    /// <param name="configure">An optional action to configure the <see cref="ClientWebSocketOptions"/> before connecting.</param>
    /// <returns>The current <see cref="BiDiOptionsBuilder"/> instance for chaining.</returns>
    public BiDiOptionsBuilder UseWebSocket(string url, Action<ClientWebSocketOptions>? configure = null)
    {
        var uri = new Uri(url);
        _transportFactory = ct => WebSocketTransport.ConnectAsync(uri, configure, ct);
        return this;
    }

    internal Func<CancellationToken, Task<ITransport>> TransportFactory
        => _transportFactory ?? throw new BiDiException("Transport is not configured. Call UseWebSocket(url) on BiDiOptionsBuilder.");
}

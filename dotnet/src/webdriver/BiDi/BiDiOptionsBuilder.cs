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
    internal Func<Uri, CancellationToken, Task<ITransport>> TransportFactory { get; private set; }
        = (uri, ct) => WebSocketTransport.ConnectAsync(uri, null, ct);

    /// <summary>
    /// Configures the BiDi connection to use a WebSocket transport.
    /// </summary>
    /// <remarks>
    /// WebSocket is the default transport; calling this method is only necessary
    /// when you need to customize the underlying <see cref="ClientWebSocketOptions"/>
    /// (e.g., to set headers, proxy, or certificates).
    /// </remarks>
    /// <param name="configure">An optional action to configure the <see cref="ClientWebSocketOptions"/> before connecting.</param>
    /// <returns>The current <see cref="BiDiOptionsBuilder"/> instance for chaining.</returns>
    public BiDiOptionsBuilder UseWebSocket(Action<ClientWebSocketOptions>? configure = null)
    {
        TransportFactory = (uri, ct) => WebSocketTransport.ConnectAsync(uri, configure, ct);
        return this;
    }
}

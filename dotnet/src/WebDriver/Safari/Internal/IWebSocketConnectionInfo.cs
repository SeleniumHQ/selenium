// <copyright file="IWebSocketConnectionInfo.cs" company="WebDriver Committers">
// Copyright 2007-2012 WebDriver committers
// Copyright 2007-2012 Google Inc.
// Portions copyright 2012 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System.Collections.Generic;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides an interface describing information about the WebSocket connection.
    /// </summary>
    public interface IWebSocketConnectionInfo
    {
        /// <summary>
        /// Gets the subprotocol of the connection.
        /// </summary>
        string SubProtocol { get; }

        /// <summary>
        /// Gets the origin of the connection.
        /// </summary>
        string Origin { get; }

        /// <summary>
        /// Gets the host for the connection.
        /// </summary>
        string Host { get; }

        /// <summary>
        /// Gets the path for the connection.
        /// </summary>
        string Path { get; }

        /// <summary>
        /// Gets the IP address of the client for the connection.
        /// </summary>
        string ClientIPAddress { get; }

        /// <summary>
        /// Gets the collection of cookies for the connection.
        /// </summary>
        IDictionary<string, string> Cookies { get; }
    }
}

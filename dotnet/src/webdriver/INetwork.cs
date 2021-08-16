// <copyright file="INetwork.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
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

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines an interface allowing the user to manage network communication by the browser.
    /// </summary>
    public interface INetwork
    {
        /// <summary>
        /// Occurs when a browser sends a network request.
        /// </summary>
        event EventHandler<NetworkRequestSentEventArgs> NetworkRequestSent;

        /// <summary>
        /// Occurs when a browser receives a network response.
        /// </summary>
        event EventHandler<NetworkResponseReceivedEventArgs> NetworkResponseReceived;

        /// <summary>
        /// Adds a <see cref="NetworkRequestHandler"/> to examine incoming network requests,
        /// and optionally modify the request or provide a response. 
        /// </summary>
        /// <param name="handler">The <see cref="NetworkRequestHandler"/> to add.</param>
        void AddRequestHandler(NetworkRequestHandler handler);

        /// <summary>
        /// Clears all added <see cref="NetworkRequestHandler"/> instances.
        /// </summary>
        void ClearRequestHandlers();

        /// <summary>
        /// Adds a <see cref="NetworkAuthenticationHandler"/> to supply authentication
        /// credentials for network requests.
        /// </summary>
        /// <param name="handler">The <see cref="NetworkAuthenticationHandler"/> to add.</param>
        void AddAuthenticationHandler(NetworkAuthenticationHandler handler);

        /// <summary>
        /// Clears all added <see cref="NetworkAuthenticationHandler"/> instances.
        /// </summary>
        void ClearAuthenticationHandlers();

        /// <summary>
        /// Asynchronously starts monitoring for network traffic.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task StartMonitoring();

        /// <summary>
        /// Asynchronously stops monitoring for network traffic.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task StopMonitoring();
    }
}

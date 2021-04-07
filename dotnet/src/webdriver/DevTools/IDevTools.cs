// <copyright file="IDevTools.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Interface indicating the driver supports the Chrome DevTools Protocol.
    /// </summary>
    public interface IDevTools
    {
        /// <summary>
        /// Creates a session to communicate with a browser using a Developer Tools debugging protocol.
        /// </summary>
        /// <returns>The active session to use to communicate with the Developer Tools debugging protocol.</returns>
        DevToolsSession GetDevToolsSession();

        /// <summary>
        /// Creates a session to communicate with a browser using a specific version of the Developer Tools debugging protocol.
        /// </summary>
        /// <param name="protocolVersion">The specific version of the Developer Tools debugging protocol to use.</param>
        /// <returns>The active session to use to communicate with the Developer Tools debugging protocol.</returns>
        DevToolsSession GetDevToolsSession(int protocolVersion);
    }
}

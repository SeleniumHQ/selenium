// <copyright file="ConnectionDataReceivedEventArgs.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Object containing event data for events raised when data is received from a WebDriver Bidi connection.
    /// </summary>
    public class WebSocketConnectionDataReceivedEventArgs : EventArgs
    {
        private readonly string data;

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketConnectionDataReceivedEventArgs" /> class.
        /// </summary>
        /// <param name="data">The data received from the connection.</param>
        public WebSocketConnectionDataReceivedEventArgs(string data)
        {
            this.data = data;
        }

        /// <summary>
        /// Gets the data received from the connection.
        /// </summary>
        public string Data => this.data;
    }
}

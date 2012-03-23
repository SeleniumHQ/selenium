// <copyright file="StandardHttpRequestReceivedEventArgs.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides arguments for handling events associated with connections to the server.
    /// </summary>
    public class StandardHttpRequestReceivedEventArgs : EventArgs
    {
        private IWebSocketConnection connection;
        private bool handled;

        /// <summary>
        /// Initializes a new instance of the <see cref="StandardHttpRequestReceivedEventArgs"/> class.
        /// </summary>
        /// <param name="connection">The <see cref="IWebSocketConnection"/> representing the 
        /// connection to the client.</param>
        public StandardHttpRequestReceivedEventArgs(IWebSocketConnection connection)
        {
            this.connection = connection;
        }

        /// <summary>
        /// Gets the connection to the client.
        /// </summary>
        public IWebSocketConnection Connection
        {
            get { return this.connection; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to the event was processed.
        /// </summary>
        public bool Handled
        {
            get { return this.handled; }
            set { this.handled = value; }
        }
    }
}

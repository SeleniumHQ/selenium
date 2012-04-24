// <copyright file="SafariDriverServer.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
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
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Safari.Internal;

namespace OpenQA.Selenium.Safari
{
    /// <summary>
    /// Provides the WebSockets server for communicating with the Safari extension.
    /// </summary>
    public class SafariDriverServer : IDisposable
    {
        private WebSocketServer server;
        private Queue<SafariDriverConnection> connections = new Queue<SafariDriverConnection>();
        private Uri serverUri;

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariDriverServer"/> class.
        /// </summary>
        public SafariDriverServer()
            : this(0)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariDriverServer"/> class using a specific port for communication.
        /// </summary>
        /// <param name="port">The port to use to communicate.</param>
        public SafariDriverServer(int port)
        {
            if (port == 0)
            {
                port = PortUtilities.FindFreePort();
            }

            this.server = new WebSocketServer(port, "ws://localhost/wd");
            this.server.Opened += new EventHandler<ConnectionEventArgs>(this.ServerOpenedEventHandler);
            this.server.Closed += new EventHandler<ConnectionEventArgs>(this.ServerClosedEventHandler);
            this.server.StandardHttpRequestReceived += new EventHandler<StandardHttpRequestReceivedEventArgs>(this.ServerStandardHttpRequestReceivedEventHandler);
            this.serverUri = new Uri(string.Format(CultureInfo.InvariantCulture, "http://localhost:{0}/", port.ToString(CultureInfo.InvariantCulture)));
        }

        /// <summary>
        /// Gets the URI of the server.
        /// </summary>
        public Uri ServerUri
        {
            get { return this.serverUri; }
        }
        
        /// <summary>
        /// Starts the server.
        /// </summary>
        public void Start()
        {
            this.server.Start();
        }

        /// <summary>
        /// Stops the server.
        /// </summary>
        public void Stop()
        {
            this.Dispose();
        }

        /// <summary>
        /// Waits for a connection to be established with the server by the Safari browser extension.
        /// </summary>
        /// <param name="timeout">A <see cref="TimeSpan"/> containing the amount of time to wait for the connection.</param>
        /// <returns>A <see cref="SafariDriverConnection"/> representing the connection to the browser.</returns>
        public SafariDriverConnection WaitForConnection(TimeSpan timeout)
        {
            SafariDriverConnection connection = null;
            DateTime end = DateTime.Now.Add(timeout);
            while (this.connections.Count == 0 && DateTime.Now < end)
            {
                Thread.Sleep(250);
            }

            if (this.connections.Count > 0)
            {
                connection = this.connections.Dequeue();
            }

            return connection;
        }

        /// <summary>
        /// Releases all resources used by the <see cref="SafariDriverServer"/>.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="SocketWrapper"/> and optionally 
        /// releases the managed resources.
        /// </summary>
        /// <param name="disposing"><see langword="true"/> to release managed and resources; 
        /// <see langword="false"/> to only release unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                this.server.Dispose();
            }
        }

        private void ServerOpenedEventHandler(object sender, ConnectionEventArgs e)
        {
            this.connections.Enqueue(new SafariDriverConnection(e.Connection));
        }

        private void ServerClosedEventHandler(object sender, ConnectionEventArgs e)
        {
        }

        private void ServerStandardHttpRequestReceivedEventHandler(object sender, StandardHttpRequestReceivedEventArgs e)
        {
            const string PageSource = @"<!DOCTYPE html>
  <script>
    window.onload = function() {{
      window.postMessage({{
        'type': 'connect',
        'origin': 'webdriver',
        'url': 'ws://localhost:{0}/wd'
        }}, '*');
    }};
  </script>";

            string redirectPage = string.Format(CultureInfo.InvariantCulture, PageSource, this.server.Port.ToString(CultureInfo.InvariantCulture));
            StringBuilder builder = new StringBuilder();
            builder.AppendLine("HTTP/1.1 200");
            builder.AppendLine("Content-Length: " + redirectPage.Length.ToString(CultureInfo.InvariantCulture));
            builder.AppendLine("Connection:close");
            builder.AppendLine();
            builder.AppendLine(redirectPage);
            e.Connection.SendRaw(builder.ToString());
        }
    }
}

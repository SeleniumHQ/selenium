// <copyright file="WebSocketServer.cs" company="WebDriver Committers">
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
using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography.X509Certificates;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides an implementation of a WebSocket server.
    /// </summary>
    public class WebSocketServer : IWebSocketServer
    {
        private readonly string scheme;
        private X509Certificate2 authenticationX509Certificate;

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketServer"/> class.
        /// </summary>
        /// <param name="location">The location at which to listen for connections.</param>
        public WebSocketServer(string location)
            : this(8181, location)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketServer"/> class.
        /// </summary>
        /// <param name="port">The port on which to listen for connections.</param>
        /// <param name="location">The location at which to listen for connections.</param>
        public WebSocketServer(int port, string location)
        {
            var uri = new Uri(location);
            this.Port = uri.Port > 0 ? uri.Port : port;
            this.Location = location;
            this.scheme = uri.Scheme;
            var socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.IP);
            this.ListenerSocket = new SocketWrapper(socket);
            this.ListenerSocket.Accepted += new EventHandler<AcceptEventArgs>(this.ListenerSocketAcceptedEventHandler);
        }

        /// <summary>
        /// Event raised when a message is received from the WebSocket.
        /// </summary>
        public event EventHandler<TextMessageHandledEventArgs> MessageReceived;

        /// <summary>
        /// Event raised when a connection is opened.
        /// </summary>
        public event EventHandler<ConnectionEventArgs> Opened;

        /// <summary>
        /// Event raised when a connection is closed.
        /// </summary>
        public event EventHandler<ConnectionEventArgs> Closed;

        /// <summary>
        /// Event raised when an error occurs.
        /// </summary>
        public event EventHandler<ErrorEventArgs> ErrorOccurred;

        /// <summary>
        /// Event raised when a non-WebSocket message is received.
        /// </summary>
        public event EventHandler<StandardHttpRequestReceivedEventArgs> StandardHttpRequestReceived;

        /// <summary>
        /// Gets or sets the <see cref="ISocket"/> on which communication occurs.
        /// </summary>
        public ISocket ListenerSocket { get; set; }

        /// <summary>
        /// Gets the location the server is listening on for connections.
        /// </summary>
        public string Location { get; private set; }

        /// <summary>
        /// Gets the port the server is listening on for connections.
        /// </summary>
        public int Port { get; private set; }

        /// <summary>
        /// Gets or sets the certificate used for authentication.
        /// </summary>
        public string Certificate { get; set; }

        /// <summary>
        /// Gets a value indicating whether the connection is secure.
        /// </summary>
        public bool IsSecure
        {
            get { return this.scheme == "wss" && this.Certificate != null; }
        }

        /// <summary>
        /// Starts the server.
        /// </summary>
        public void Start()
        {
            var localIPAddress = new IPEndPoint(IPAddress.Any, this.Port);
            this.ListenerSocket.Bind(localIPAddress);
            this.ListenerSocket.Listen(100);
            if (this.scheme == "wss")
            {
                if (this.Certificate == null)
                {
                    return;
                }

                this.authenticationX509Certificate = new X509Certificate2(this.Certificate);
            }

            this.ListenForClients();
        }

        /// <summary>
        /// Releases all resources used by the <see cref="WebSocketServer"/>.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Raises the ConnectionOpened event.
        /// </summary>
        /// <param name="e">A <see cref="ConnectionEventArgs"/> that contains the event data.</param>
        protected void OnConnectionOpened(ConnectionEventArgs e)
        {
            if (this.Opened != null)
            {
                this.Opened(this, e);
            }
        }

        /// <summary>
        /// Raises the ConnectionClosed event.
        /// </summary>
        /// <param name="e">A <see cref="ConnectionEventArgs"/> that contains the event data.</param>
        protected void OnConnectionClosed(ConnectionEventArgs e)
        {
            if (this.Closed != null)
            {
                this.Closed(this, e);
            }
        }

        /// <summary>
        /// Raises the StandardHttpRequestReceived event.
        /// </summary>
        /// <param name="e">A <see cref="StandardHttpRequestReceivedEventArgs"/> that contains the event data.</param>
        protected void OnStandardHttpRequestReceived(StandardHttpRequestReceivedEventArgs e)
        {
            if (this.StandardHttpRequestReceived != null)
            {
                this.StandardHttpRequestReceived(this, e);
            }
        }

        /// <summary>
        /// Raises the MessageReceived event.
        /// </summary>
        /// <param name="e">A <see cref="TextMessageHandledEventArgs"/> that contains the event data.</param>
        protected void OnMessageReceived(TextMessageHandledEventArgs e)
        {
            if (this.MessageReceived != null)
            {
                this.MessageReceived(this, e);
            }
        }

        /// <summary>
        /// Raises the ErrorOccurred event.
        /// </summary>
        /// <param name="e">An <see cref="ErrorEventArgs"/> that contains the event data.</param>
        protected void OnErrorOccurred(ErrorEventArgs e)
        {
            if (this.ErrorOccurred != null)
            {
                this.ErrorOccurred(this, e);
            }
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
                this.ListenerSocket.Dispose();
            }
        }

        private void ListenForClients()
        {
            this.ListenerSocket.Accept();
        }

        private void OnClientConnect(ISocket clientSocket)
        {
            this.ListenForClients();

            WebSocketConnection connection = null;
            connection = new WebSocketConnection(clientSocket, this.scheme);
            connection.MessageReceived += new EventHandler<TextMessageHandledEventArgs>(this.ConnectionMessageReceivedEventHandler);
            connection.BinaryMessageReceived += new EventHandler<BinaryMessageHandledEventArgs>(this.ConnectionBinaryMessageReceivedEventHandler);
            connection.Opened += new EventHandler<ConnectionEventArgs>(this.ConnectionOpenedEventHandler);
            connection.Closed += new EventHandler<ConnectionEventArgs>(this.ConnectionClosedEventHandler);
            connection.ErrorReceived += new EventHandler<ErrorEventArgs>(this.ConnectionErrorEventHandler);
            connection.StandardHttpRequestReceived += new EventHandler<StandardHttpRequestReceivedEventArgs>(this.ConnectionStandardHttpRequestReceivedEventHandler);

            if (this.IsSecure)
            {
                clientSocket.Authenticated += new EventHandler(this.SocketAuthenticatedEventHandler);
                clientSocket.Authenticate(this.authenticationX509Certificate);
            }
            else
            {
                connection.StartReceiving();
            }
        }

        private void ListenerSocketAcceptedEventHandler(object sender, AcceptEventArgs e)
        {
            this.OnClientConnect(e.Socket);
        }

        private void ConnectionClosedEventHandler(object sender, ConnectionEventArgs e)
        {
            this.OnConnectionClosed(new ConnectionEventArgs(e.Connection));
        }

        private void ConnectionOpenedEventHandler(object sender, ConnectionEventArgs e)
        {
            this.OnConnectionOpened(new ConnectionEventArgs(e.Connection));
        }

        private void ConnectionBinaryMessageReceivedEventHandler(object sender, BinaryMessageHandledEventArgs e)
        {
            throw new NotImplementedException();
        }

        private void ConnectionMessageReceivedEventHandler(object sender, TextMessageHandledEventArgs e)
        {
            this.OnMessageReceived(e);
        }

        private void ConnectionStandardHttpRequestReceivedEventHandler(object sender, StandardHttpRequestReceivedEventArgs e)
        {
            this.OnStandardHttpRequestReceived(e);
        }

        private void ConnectionErrorEventHandler(object sender, ErrorEventArgs e)
        {
            this.OnErrorOccurred(e);
        }

        private void SocketAuthenticatedEventHandler(object sender, EventArgs e)
        {
            throw new NotImplementedException();
        }
    }
}

// <copyright file="WebSocketConnection.cs" company="WebDriver Committers">
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
    /// Represents a connection to a WebSocket.
    /// </summary>
    public class WebSocketConnection : IWebSocketConnection
    {
        private const int ReadSize = 1024 * 4;
        private string scheme;
        private bool closed;
        private bool closeAfterSend;
        private IRequestParser parser = new RequestParser();
        private List<byte> data = new List<byte>(ReadSize);

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketConnection"/> class.
        /// </summary>
        /// <param name="socket">The <see cref="ISocket"/> used in the connection.</param>
        /// <param name="parseScheme">The scheme used to parse requests.</param>
        public WebSocketConnection(ISocket socket, string parseScheme)
        {
            this.Socket = socket;
            this.scheme = parseScheme;
            this.Socket.Sent += new EventHandler(this.Socket_Sent);
            this.Socket.SendError += new EventHandler<ErrorEventArgs>(this.Socket_SendError);
            this.Socket.Received += new EventHandler<ReceivedEventArgs>(this.Socket_Received);
            this.Socket.ReceiveError += new EventHandler<ErrorEventArgs>(this.Socket_ReceiveError);
        }

        /// <summary>
        /// Event raised when a connection is opened.
        /// </summary>
        public event EventHandler<ConnectionEventArgs> Opened;

        /// <summary>
        /// Event raised when a connection is closed.
        /// </summary>
        public event EventHandler<ConnectionEventArgs> Closed;

        /// <summary>
        /// Event raised when a text message is received via the connection.
        /// </summary>
        public event EventHandler<TextMessageHandledEventArgs> MessageReceived;

        /// <summary>
        /// Event raised when a binary message is received via the connection.
        /// </summary>
        public event EventHandler<BinaryMessageHandledEventArgs> BinaryMessageReceived;

        /// <summary>
        /// Event raised when a non-WebSocket message is received.
        /// </summary>
        public event EventHandler<StandardHttpRequestReceivedEventArgs> StandardHttpRequestReceived;

        /// <summary>
        /// Event raised when an error occurs via the connection.
        /// </summary>
        public event EventHandler<ErrorEventArgs> ErrorReceived;

        /// <summary>
        /// Event raised when data is sent via the connection.
        /// </summary>
        public event EventHandler Sent;

        /// <summary>
        /// Gets or sets the <see cref="ISocket"/> implementation used for communication.
        /// </summary>
        public ISocket Socket { get; set; }

        /// <summary>
        /// Gets or sets the <see cref="IHandler"/> implementation used for parsing and handling requests.
        /// </summary>
        public IHandler Handler { get; set; }

        /// <summary>
        /// Gets an <see cref="IWebSocketConnectionInfo"/> object describing the connection.
        /// </summary>
        public IWebSocketConnectionInfo ConnectionInfo { get; private set; }

        /// <summary>
        /// Sends a text message over the connection.
        /// </summary>
        /// <param name="message">The text message to send.</param>
        public void Send(string message)
        {
            if (this.Handler == null)
            {
                throw new InvalidOperationException("Cannot send before handshake");
            }

            if (this.closed || !this.Socket.Connected)
            {
                return;
            }

            var bytes = this.Handler.CreateTextFrame(message);
            this.SendBytes(bytes);
        }

        /// <summary>
        /// Sends a binary message over the connection.
        /// </summary>
        /// <param name="message">The binary message to send.</param>
        public void Send(byte[] message)
        {
            if (this.Handler == null)
            {
                throw new InvalidOperationException("Cannot send before handshake");
            }

            if (this.closed || !this.Socket.Connected)
            {
                return;
            }

            var bytes = this.Handler.CreateBinaryFrame(message);
            this.SendBytes(bytes);
        }

        /// <summary>
        /// Sends raw text over the connection, without passing through a handler.
        /// </summary>
        /// <param name="message">The message to send.</param>
        public void SendRaw(string message)
        {
            var bytes = Encoding.UTF8.GetBytes(message);
            this.SendBytes(bytes);
        }

        /// <summary>
        /// Closes the connection.
        /// </summary>
        public void Close()
        {
            this.Close(WebSocketStatusCodes.NormalClosure);
        }

        /// <summary>
        /// Starts the connection receiving requests.
        /// </summary>
        public void StartReceiving()
        {
            var buffer = new byte[ReadSize];
            this.Read(buffer);
        }

        /// <summary>
        /// Fires the MessageReceived event.
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
        /// Fires the BinaryMessageReceived event.
        /// </summary>
        /// <param name="e">A <see cref="BinaryMessageHandledEventArgs"/> that contains the event data.</param>
        protected void OnBinaryMessageReceived(BinaryMessageHandledEventArgs e)
        {
            if (this.BinaryMessageReceived != null)
            {
                this.BinaryMessageReceived(this, e);
            }
        }

        /// <summary>
        /// Fires the Opened event.
        /// </summary>
        /// <param name="e">A <see cref="ConnectionEventArgs"/> that contains the event data.</param>
        protected void OnOpen(ConnectionEventArgs e)
        {
            if (this.Opened != null)
            {
                this.Opened(this, e);
            }
        }

        /// <summary>
        /// Fires the Closed event.
        /// </summary>
        /// <param name="e">A <see cref="ConnectionEventArgs"/> that contains the event data.</param>
        protected void OnClose(ConnectionEventArgs e)
        {
            if (this.Closed != null)
            {
                this.Closed(this, e);
            }
        }

        /// <summary>
        /// Fires the StandardHttpRequestReceived event.
        /// </summary>
        /// <param name="e">A <see cref="StandardHttpRequestReceivedEventArgs"/> that contains the event data.</param>
        protected void OnStandardHttpRequestReceived(StandardHttpRequestReceivedEventArgs e)
        {
            if (this.StandardHttpRequestReceived != null)
            {
                // The event handler is to be fired, so set the Handled
                // property to true. If the user decides to let the non-handled
                // case happen, he can set the property to false in the event
                // handler.
                e.Handled = true;
                this.StandardHttpRequestReceived(this, e);
            }
        }

        /// <summary>
        /// Fires the Sent event.
        /// </summary>
        /// <param name="e">An <see cref="EventArgs"/> that contains the event data.</param>
        protected void OnSend(EventArgs e)
        {
            if (this.Sent != null)
            {
                this.Sent(this, e);
            }
        }

        /// <summary>
        /// Fires the ErrorReceived event.
        /// </summary>
        /// <param name="e">An <see cref="ErrorEventArgs"/> that contains the event data.</param>
        protected void OnError(ErrorEventArgs e)
        {
            if (this.ErrorReceived != null)
            {
                this.ErrorReceived(this, e);
            }
        }

        private void Read(byte[] buffer)
        {
            if (this.closed || !this.Socket.Connected)
            {
                return;
            }

            this.Socket.Receive(buffer, 0);
        }

        private void CreateHandler(IEnumerable<byte> data)
        {
            var request = this.parser.Parse(data.ToArray(), this.scheme);
            if (request == null)
            {
                return;
            }

            try
            {
                this.Handler = HandlerFactory.BuildHandler(request);
            }
            catch (WebSocketException)
            {
                StandardHttpRequestReceivedEventArgs e = new StandardHttpRequestReceivedEventArgs(this);
                this.OnStandardHttpRequestReceived(e);
                if (!e.Handled)
                {
                    throw;
                }
            }

            if (this.Handler == null)
            {
                return;
            }

            this.Handler.TextMessageHandled += new EventHandler<TextMessageHandledEventArgs>(this.Handler_TextMessageHandled);
            this.Handler.BinaryMessageHandled += new EventHandler<BinaryMessageHandledEventArgs>(this.Handler_BinaryMessageHandled);
            this.Handler.CloseHandled += new EventHandler(this.Handler_CloseHandled);
            this.ConnectionInfo = WebSocketConnectionInfo.Create(request, this.Socket.RemoteIPAddress);

            var handshake = this.Handler.CreateHandshake();
            this.SendBytes(handshake);
            this.OnOpen(new ConnectionEventArgs(this));
        }
        
        private void HandleReadError(Exception e)
        {
            if (e.InnerException != null)
            {
                this.HandleReadError(e.InnerException);
                return;
            }
            else if (e is ObjectDisposedException)
            {
                return;
            }

            this.OnError(new ErrorEventArgs(e));

            WebSocketException webSocketException = e as WebSocketException;

            if (e is HandshakeException)
            {
            }
            else if (webSocketException != null)
            {
                this.Close(webSocketException.StatusCode);
            }
            else
            {
                this.Close(WebSocketStatusCodes.InternalServerError);
            }
        }

        private void SendBytes(byte[] bytes)
        {
            this.Socket.Send(bytes);
            if (this.Sent != null)
            {
                this.OnSend(new EventArgs());
            }
        }

        private void Close(int code)
        {
            if (this.Handler == null)
            {
                this.CloseSocket();
                return;
            }

            var bytes = this.Handler.CreateCloseFrame(code);
            if (bytes.Length == 0)
            {
                this.CloseSocket();
            }
            else
            {
                this.closeAfterSend = true;
                this.SendBytes(bytes);
            }
        }

        private void CloseSocket()
        {
            this.OnClose(new ConnectionEventArgs(this));
            this.closed = true;
            this.Socket.Close();
            this.Socket.Dispose();
        }

        private void Socket_Sent(object sender, EventArgs e)
        {
            if (this.Sent != null)
            {
                this.Sent(this, e);
            }

            if (this.closeAfterSend)
            {
                this.CloseSocket();
                this.closeAfterSend = false;
            }
        }

        private void Socket_SendError(object sender, ErrorEventArgs e)
        {
            this.CloseSocket();
        }

        private void Socket_Received(object sender, ReceivedEventArgs e)
        {
            if (e.BytesRead <= 0)
            {
                if (this.Handler != null)
                {
                    this.CloseSocket();
                }

                return;
            }

            var readBytes = e.Buffer.Take(e.BytesRead);
            if (this.Handler != null)
            {
                this.Handler.ProcessData(readBytes);
            }
            else
            {
                this.data.AddRange(readBytes);
                this.CreateHandler(this.data);
            }

            this.Read(e.Buffer);
        }

        private void Socket_ReceiveError(object sender, ErrorEventArgs e)
        {
            this.HandleReadError(e.Exception);
        }

        private void Handler_TextMessageHandled(object sender, TextMessageHandledEventArgs e)
        {
            this.OnMessageReceived(e);
        }

        private void Handler_BinaryMessageHandled(object sender, BinaryMessageHandledEventArgs e)
        {
            this.OnBinaryMessageReceived(e);
        }

        private void Handler_CloseHandled(object sender, EventArgs e)
        {
            this.OnClose(new ConnectionEventArgs(this));
        }
    }
}

// <copyright file="SocketWrapper.cs" company="WebDriver Committers">
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
using System.IO;
using System.Net;
using System.Net.Security;
using System.Net.Sockets;
using System.Runtime.Remoting.Messaging;
using System.Security.Authentication;
using System.Security.Cryptography.X509Certificates;
using System.Threading;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides a wrapper around a <see cref="System.Net.Sockets.Socket"/>.
    /// </summary>
    public class SocketWrapper : ISocket
    {
        private readonly Socket underlyingSocket;
        private bool disposed;
        private Stream stream;
        
        /// <summary>
        /// Initializes a new instance of the <see cref="SocketWrapper"/> class.
        /// </summary>
        /// <param name="socket">The <see cref="Socket"/> to wrap.</param>
        public SocketWrapper(Socket socket)
        {
            this.underlyingSocket = socket;
            if (this.underlyingSocket.Connected)
            {
                this.stream = new NetworkStream(this.underlyingSocket);
            }
        }

        /// <summary>
        /// Event raised when a connection is accepted by the socket.
        /// </summary>
        public event EventHandler<AcceptEventArgs> Accepted;

        /// <summary>
        /// Event raised when an error occurs accepting a connection.
        /// </summary>
        public event EventHandler<ErrorEventArgs> AcceptError;

        /// <summary>
        /// Event raised when data is sent through the socket.
        /// </summary>
        public event EventHandler Sent;

        /// <summary>
        /// Event raised when there is an error sending data.
        /// </summary>
        public event EventHandler<ErrorEventArgs> SendError;

        /// <summary>
        /// Event raised when data is received by the socket.
        /// </summary>
        public event EventHandler<ReceivedEventArgs> Received;

        /// <summary>
        /// Event raised when there is an error receiving data.
        /// </summary>
        public event EventHandler<ErrorEventArgs> ReceiveError;

        /// <summary>
        /// Event raised when authentication is completed over the socket.
        /// </summary>
        public event EventHandler Authenticated;

        /// <summary>
        /// Event raised when there is an error authenticating over the socket.
        /// </summary>
        public event EventHandler<ErrorEventArgs> AuthenticateError;

        /// <summary>
        /// Gets a value indicating whether the socket is connected.
        /// </summary>
        public bool Connected
        {
            get { return this.underlyingSocket.Connected; }
        }

        /// <summary>
        /// Gets the remote IP address of the socket connection.
        /// </summary>
        public string RemoteIPAddress
        {
            get
            {
                var endpoint = this.underlyingSocket.RemoteEndPoint as IPEndPoint;
                return endpoint != null ? endpoint.Address.ToString() : null;
            }
        }

        /// <summary>
        /// Gets a stream for reading and writing data.
        /// </summary>
        public Stream Stream
        {
            get { return this.stream; }
        }

        /// <summary>
        /// Accepts a connection for the socket.
        /// </summary>
        public void Accept()
        {
            this.underlyingSocket.BeginAccept(this.OnClientConnect, null);
        }

        /// <summary>
        /// Sends data over the socket.
        /// </summary>
        /// <param name="buffer">The data to be sent.</param>
        public void Send(byte[] buffer)
        {
            this.stream.BeginWrite(buffer, 0, buffer.Length, this.OnDataSend, null);
        }

        /// <summary>
        /// Receives data over the socket.
        /// </summary>
        /// <param name="buffer">The buffer into which the data will be read.</param>
        /// <param name="offset">The offset into the buffer at which the data will be read.</param>
        public void Receive(byte[] buffer, int offset)
        {
            this.stream.BeginRead(buffer, offset, buffer.Length, this.OnDataReceive, buffer);
        }

        /// <summary>
        /// Authenticates over the socket.
        /// </summary>
        /// <param name="certificate">An <see cref="X509Certificate2"/> that specifies authentication information.</param>
        public void Authenticate(X509Certificate2 certificate)
        {
            var ssl = new SslStream(this.stream, false);
            this.stream = ssl;
            ssl.BeginAuthenticateAsServer(certificate, false, SslProtocols.Tls, false, this.OnAuthenticate, ssl);
        }

        /// <summary>
        /// Closes the socket connection.
        /// </summary>
        public void Close()
        {
            if (this.stream != null)
            {
                this.stream.Close();
            }

            if (this.underlyingSocket != null)
            {
                this.underlyingSocket.Close();
            }
        }

        /// <summary>
        /// Binds the socket to a local end point.
        /// </summary>
        /// <param name="localEndPoint">The local end point to which to bind the socket.</param>
        public void Bind(EndPoint localEndPoint)
        {
            this.underlyingSocket.Bind(localEndPoint);
        }

        /// <summary>
        /// Starts listening to data received over the socket.
        /// </summary>
        /// <param name="backlog">The number of pending connections to process.</param>
        public void Listen(int backlog)
        {
            this.underlyingSocket.Listen(backlog);
        }

        /// <summary>
        /// Releases all resources used by the <see cref="SocketWrapper"/>.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Raises the Accepted event.
        /// </summary>
        /// <param name="e">An <see cref="AcceptEventArgs"/> that contains the event data.</param>
        protected void OnAccepted(AcceptEventArgs e)
        {
            if (this.Accepted != null)
            {
                this.Accepted(this, e);
            }
        }

        /// <summary>
        /// Raises the AcceptError event.
        /// </summary>
        /// <param name="e">An <see cref="ErrorEventArgs"/> that contains the event data.</param>
        protected void OnAcceptError(ErrorEventArgs e)
        {
            if (this.AcceptError != null)
            {
                this.AcceptError(this, e);
            }
        }

        /// <summary>
        /// Raises the Sent event.
        /// </summary>
        /// <param name="e">An <see cref="EventArgs"/> that contains the event data.</param>
        protected void OnSent(EventArgs e)
        {
            if (this.Sent != null)
            {
                this.Sent(this, e);
            }
        }

        /// <summary>
        /// Raises the SendError event.
        /// </summary>
        /// <param name="e">An <see cref="ErrorEventArgs"/> that contains the event data.</param>
        protected void OnSendError(ErrorEventArgs e)
        {
            if (this.SendError != null)
            {
                this.SendError(this, e);
            }
        }

        /// <summary>
        /// Raises the Received event.
        /// </summary>
        /// <param name="e">A <see cref="ReceivedEventArgs"/> that contains the event data.</param>
        protected void OnReceived(ReceivedEventArgs e)
        {
            if (this.Received != null)
            {
                this.Received(this, e);
            }
        }

        /// <summary>
        /// Raises the ReceiveError event.
        /// </summary>
        /// <param name="e">An <see cref="ErrorEventArgs"/> that contains the event data.</param>
        protected void OnReceiveError(ErrorEventArgs e)
        {
            if (this.ReceiveError != null)
            {
                this.ReceiveError(this, e);
            }
        }

        /// <summary>
        /// Raises the Authenticated event.
        /// </summary>
        /// <param name="e">An <see cref="EventArgs"/> that contains the event data.</param>
        protected void OnAuthenticated(EventArgs e)
        {
            if (this.Authenticated != null)
            {
                this.Authenticated(this, e);
            }
        }

        /// <summary>
        /// Raises the AuthenticateError event.
        /// </summary>
        /// <param name="e">An <see cref="ErrorEventArgs"/> that contains the event data.</param>
        protected void OnAuthenticateError(ErrorEventArgs e)
        {
            if (this.AuthenticateError != null)
            {
                this.AuthenticateError(this, e);
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
            if (disposing && !this.disposed)
            {
                this.disposed = true;
                if (this.stream != null)
                {
                    this.stream.Dispose();
                }

                if (this.underlyingSocket != null)
                {
                    this.underlyingSocket.Close();
                }
            }
        }

        private void OnAuthenticate(IAsyncResult asyncResult)
        {
            SslStream sslStream = asyncResult.AsyncState as SslStream;
            sslStream.EndAuthenticateAsServer(asyncResult);
            try
            {
                this.OnAuthenticated(new EventArgs());
            }
            catch (Exception ex)
            {
                this.OnAuthenticateError(new ErrorEventArgs(ex));
            }
        }

        private void OnDataReceive(IAsyncResult asyncResult)
        {
            try
            {
                int bytesRead = this.stream.EndRead(asyncResult);
                byte[] buffer = asyncResult.AsyncState as byte[];
                this.OnReceived(new ReceivedEventArgs(bytesRead, buffer));
            }
            catch (Exception ex)
            {
                this.OnReceiveError(new ErrorEventArgs(ex));
            }
        }

        private void OnClientConnect(IAsyncResult asyncResult)
        {
            // This logic is mildly convoluted, and requires some explanation.
            // The socket can be closed (disposed) while there is still a
            // pending accept. This will cause an exception if we try to reference
            // the disposed socket. To mitigate this, we set a flag when Dispose()
            // is called so that we don't try to access a disposed socket.
            if (!this.disposed)
            {
                SocketWrapper actual = new SocketWrapper(this.underlyingSocket.EndAccept(asyncResult));
                try
                {
                    this.OnAccepted(new AcceptEventArgs(actual));
                }
                catch (Exception ex)
                {
                    this.OnAcceptError(new ErrorEventArgs(ex));
                }
            }
        }

        private void OnDataSend(IAsyncResult asyncResult)
        {
            this.stream.EndWrite(asyncResult);
            try
            {
                this.OnSent(new EventArgs());
            }
            catch (Exception ex)
            {
                this.OnSendError(new ErrorEventArgs(ex));
            }
        }
    }
}

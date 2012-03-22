// <copyright file="ISocket.cs" company="WebDriver Committers">
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
using System.Security.Cryptography.X509Certificates;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides an interface simplifying the use of asynchronous communication using a socket.
    /// </summary>
    public interface ISocket : IDisposable
    {
        /// <summary>
        /// Event raised when a connection is accepted by the socket.
        /// </summary>
        event EventHandler<AcceptEventArgs> Accepted;

        /// <summary>
        /// Event raised when an error occurs accepting a connection.
        /// </summary>
        event EventHandler<ErrorEventArgs> AcceptError;

        /// <summary>
        /// Event raised when data is sent through the socket.
        /// </summary>
        event EventHandler Sent;

        /// <summary>
        /// Event raised when there is an error sending data.
        /// </summary>
        event EventHandler<ErrorEventArgs> SendError;

        /// <summary>
        /// Event raised when data is received by the socket.
        /// </summary>
        event EventHandler<ReceivedEventArgs> Received;

        /// <summary>
        /// Event raised when there is an error receiving data.
        /// </summary>
        event EventHandler<ErrorEventArgs> ReceiveError;

        /// <summary>
        /// Event raised when authentication is completed over the socket.
        /// </summary>
        event EventHandler Authenticated;

        /// <summary>
        /// Event raised when there is an error authenticating over the socket.
        /// </summary>
        event EventHandler<ErrorEventArgs> AuthenticateError;

        /// <summary>
        /// Gets a value indicating whether the socket is connected.
        /// </summary>
        bool Connected { get; }

        /// <summary>
        /// Gets the remote IP address of the socket connection.
        /// </summary>
        string RemoteIPAddress { get; }

        /// <summary>
        /// Gets a stream for reading and writing data.
        /// </summary>
        Stream Stream { get; }

        /// <summary>
        /// Accepts a connection for the socket.
        /// </summary>
        void Accept();

        /// <summary>
        /// Sends data over the socket.
        /// </summary>
        /// <param name="buffer">The data to be sent.</param>
        void Send(byte[] buffer);

        /// <summary>
        /// Receives data over the socket.
        /// </summary>
        /// <param name="buffer">The buffer into which the data will be read.</param>
        /// <param name="offset">The offset into the buffer at which the data will be read.</param>
        void Receive(byte[] buffer, int offset);

        /// <summary>
        /// Authenticates over the socket.
        /// </summary>
        /// <param name="certificate">An <see cref="X509Certificate2"/> that specifies authentication information.</param>
        void Authenticate(X509Certificate2 certificate);

        /// <summary>
        /// Closes the socket connection.
        /// </summary>
        void Close();

        /// <summary>
        /// Binds the socket to a local end point.
        /// </summary>
        /// <param name="localEndPoint">The local end point to which to bind the socket.</param>
        void Bind(EndPoint localEndPoint);

        /// <summary>
        /// Starts listening to data received over the socket.
        /// </summary>
        /// <param name="backlog">The number of pending connections to process.</param>
        void Listen(int backlog);
    }
}

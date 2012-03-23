// <copyright file="IWebSocketConnection.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides an interface describing a connection to a WebSocket.
    /// </summary>
    public interface IWebSocketConnection
    {
        /// <summary>
        /// Event raised when a connection is opened.
        /// </summary>
        event EventHandler<ConnectionEventArgs> Opened;

        /// <summary>
        /// Event raised when a connection is closed.
        /// </summary>
        event EventHandler<ConnectionEventArgs> Closed;

        /// <summary>
        /// Event raised when a text message is received via the connection.
        /// </summary>
        event EventHandler<TextMessageHandledEventArgs> MessageReceived;

        /// <summary>
        /// Event raised when a binary message is received via the connection.
        /// </summary>
        event EventHandler<BinaryMessageHandledEventArgs> BinaryMessageReceived;

        /// <summary>
        /// Event raised when a non-WebSocket message is received.
        /// </summary>
        event EventHandler<StandardHttpRequestReceivedEventArgs> StandardHttpRequestReceived;

        /// <summary>
        /// Event raised when an error occurs via the connection.
        /// </summary>
        event EventHandler<ErrorEventArgs> ErrorReceived;

        /// <summary>
        /// Event raised when data is sent via the connection.
        /// </summary>
        event EventHandler Sent;

        /// <summary>
        /// Gets an <see cref="IWebSocketConnectionInfo"/> object describing the connection.
        /// </summary>
        IWebSocketConnectionInfo ConnectionInfo { get; }

        /// <summary>
        /// Sends a text message over the connection.
        /// </summary>
        /// <param name="message">The text message to send.</param>
        void Send(string message);

        /// <summary>
        /// Sends a binary message over the connection.
        /// </summary>
        /// <param name="message">The binary message to send.</param>
        void Send(byte[] message);

        /// <summary>
        /// Sends raw text over the connection, without passing through a handler.
        /// </summary>
        /// <param name="message">The message to send.</param>
        void SendRaw(string message);

        /// <summary>
        /// Closes the connection.
        /// </summary>
        void Close();
    }
}

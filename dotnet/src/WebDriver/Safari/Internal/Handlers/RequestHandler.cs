// <copyright file="RequestHandler.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Safari.Internal.Handlers
{
    /// <summary>
    /// Provides the base class for handling WebSocket protocol requests.
    /// </summary>
    internal abstract class RequestHandler : IHandler
    {
        private readonly List<byte> data = new List<byte>();

        /// <summary>
        /// Event raised when a text message is processed by the handler.
        /// </summary>
        public event EventHandler<TextMessageHandledEventArgs> TextMessageHandled;

        /// <summary>
        /// Event raised when a binary message is processed by the handler.
        /// </summary>
        public event EventHandler<BinaryMessageHandledEventArgs> BinaryMessageHandled;

        /// <summary>
        /// Event raised when a close message is processed by the handler.
        /// </summary>
        public event EventHandler CloseHandled;

        /// <summary>
        /// Gets the data to be handled by this handler.
        /// </summary>
        protected List<byte> Data
        {
            get { return this.data; }
        }

        /// <summary>
        /// Processes data received by the connection.
        /// </summary>
        /// <param name="data">The data to be processed.</param>
        public void ProcessData(IEnumerable<byte> data)
        {
            this.data.AddRange(data);

            this.ProcessReceivedData();
        }

        /// <summary>
        /// Creates a handshake message for initiating connections.
        /// </summary>
        /// <returns>A byte array containing the handshake message.</returns>
        public byte[] CreateHandshake()
        {
            return this.GetHandshake();
        }

        /// <summary>
        /// Creates a frame for text messages in the WebSocket protocol.
        /// </summary>
        /// <param name="text">The text of the message.</param>
        /// <returns>A byte array containing the message frame.</returns>
        public byte[] CreateTextFrame(string text)
        {
            return this.GetTextFrame(text);
        }

        /// <summary>
        /// Creates a frame for binary messages in the WebSocket protocol.
        /// </summary>
        /// <param name="frameData">The binary data of the message.</param>
        /// <returns>A byte array containing the message frame.</returns>
        public byte[] CreateBinaryFrame(byte[] frameData)
        {
            return this.GetBinaryFrame(frameData);
        }

        /// <summary>
        /// Creates a frame for close messages in the WebSocket protocol.
        /// </summary>
        /// <param name="code">The connection close code of the message.</param>
        /// <returns>A byte array containing the message frame.</returns>
        public byte[] CreateCloseFrame(int code)
        {
            return this.GetCloseFrame(code);
        }

        /// <summary>
        /// Receives the data from the protocol.
        /// </summary>
        protected abstract void ProcessReceivedData();

        /// <summary>
        /// Gets the handshake for WebSocket protocol.
        /// </summary>
        /// <returns>A byte array representing the handshake in the WebSocket protocol.</returns>
        protected virtual byte[] GetHandshake()
        {
            return new byte[0];
        }

        /// <summary>
        /// Prepares a text frame for the given text.
        /// </summary>
        /// <param name="text">The text for which to prepare the frame</param>
        /// <returns>A byte array representing the frame in the WebSocket protocol.</returns>
        protected virtual byte[] GetTextFrame(string text)
        {
            return new byte[0];
        }

        /// <summary>
        /// Prepares a binary frame for the given binary data.
        /// </summary>
        /// <param name="frameData">The binary data for which to prepare the frame.</param>
        /// <returns>A byte array representing the frame in the WebSocket protocol.</returns>
        protected virtual byte[] GetBinaryFrame(byte[] frameData)
        {
            return new byte[0];
        }

        /// <summary>
        /// Prepares a close frame for the given connection.
        /// </summary>
        /// <param name="code">The code to use in closing the connection.</param>
        /// <returns>A byte array representing the frame in the WebSocket protocol.</returns>
        protected virtual byte[] GetCloseFrame(int code)
        {
            return new byte[0];
        }

        /// <summary>
        /// Raises the TextMessageHandled event.
        /// </summary>
        /// <param name="e">A <see cref="TextMessageHandledEventArgs"/> that contains the event data.</param>
        protected void OnTextMessageHandled(TextMessageHandledEventArgs e)
        {
            if (this.TextMessageHandled != null)
            {
                this.TextMessageHandled(this, e);
            }
        }

        /// <summary>
        /// Raises the BinaryMessageHandled event.
        /// </summary>
        /// <param name="e">A <see cref="BinaryMessageHandledEventArgs"/> that contains the event data.</param>
        protected void OnBinaryMessageHandled(BinaryMessageHandledEventArgs e)
        {
            if (this.BinaryMessageHandled != null)
            {
                this.BinaryMessageHandled(this, e);
            }
        }

        /// <summary>
        /// Raises the CloseHandled event.
        /// </summary>
        /// <param name="e">An <see cref="EventArgs"/> that contains the event data.</param>
        protected void OnCloseHandled(EventArgs e)
        {
            if (this.CloseHandled != null)
            {
                this.CloseHandled(this, e);
            }
        }
    }
}

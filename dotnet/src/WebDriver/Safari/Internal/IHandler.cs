// <copyright file="IHandler.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides an interface for handling communication over the WebSocket connection.
    /// </summary>
    public interface IHandler
    {
        /// <summary>
        /// Event raised when a text message is processed by the handler.
        /// </summary>
        event EventHandler<TextMessageHandledEventArgs> TextMessageHandled;

        /// <summary>
        /// Event raised when a binary message is processed by the handler.
        /// </summary>
        event EventHandler<BinaryMessageHandledEventArgs> BinaryMessageHandled;

        /// <summary>
        /// Event raised when a close message is processed by the handler.
        /// </summary>
        event EventHandler CloseHandled;

        /// <summary>
        /// Processes data received by the connection.
        /// </summary>
        /// <param name="data">The data to be processed.</param>
        void ProcessData(IEnumerable<byte> data);

        /// <summary>
        /// Creates a handshake message for initiating connections.
        /// </summary>
        /// <returns>A byte array containing the handshake message.</returns>
        byte[] CreateHandshake();

        /// <summary>
        /// Creates a frame for text messages in the WebSocket protocol.
        /// </summary>
        /// <param name="text">The text of the message.</param>
        /// <returns>A byte array containing the message frame.</returns>
        byte[] CreateTextFrame(string text);

        /// <summary>
        /// Creates a frame for binary messages in the WebSocket protocol.
        /// </summary>
        /// <param name="frameData">The binary data of the message.</param>
        /// <returns>A byte array containing the message frame.</returns>
        byte[] CreateBinaryFrame(byte[] frameData);

        /// <summary>
        /// Creates a frame for close messages in the WebSocket protocol.
        /// </summary>
        /// <param name="code">The connection close code of the message.</param>
        /// <returns>A byte array containing the message frame.</returns>
        byte[] CreateCloseFrame(int code);
    }
}

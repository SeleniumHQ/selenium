// <copyright file="WebSocketStatusCodes.cs" company="WebDriver Committers">
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
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides status codes for the WebSocket protocol
    /// </summary>
    internal static class WebSocketStatusCodes
    {
        /// <summary>
        /// Indicates a normal closure status.
        /// </summary>
        public const ushort NormalClosure = 1000;

        /// <summary>
        /// Indicates a notification that the socket is closing.
        /// </summary>
        public const ushort GoingAway = 1001;

        /// <summary>
        /// Indicates an error in the protocol.
        /// </summary>
        public const ushort ProtocolError = 1002;

        /// <summary>
        /// Indicates an attempt to transmit an unsupported data type.
        /// </summary>
        public const ushort UnsupportedDataType = 1003;

        /// <summary>
        /// Indicates no status information received.
        /// </summary>
        public const ushort NoStatusReceived = 1005;

        /// <summary>
        /// Represents an abnormal closure of the socket.
        /// </summary>
        public const ushort AbnormalClosure = 1006;

        /// <summary>
        /// Indicates invalid data in the frame.
        /// </summary>
        public const ushort InvalidFramePayloadData = 1007;

        /// <summary>
        /// Indicates a policy violation.
        /// </summary>
        public const ushort PolicyViolation = 1008;

        /// <summary>
        /// Indicates that the message is too big.
        /// </summary>
        public const ushort MessageTooBig = 1009;

        /// <summary>
        /// Indicates a mandatory extension.
        /// </summary>
        public const ushort MandatoryExt = 1010;

        /// <summary>
        /// Indicates an internal server error.
        /// </summary>
        public const ushort InternalServerError = 1011;

        /// <summary>
        /// Indicates a TLS handshake.
        /// </summary>
        public const ushort TlsHandshake = 1015;
        
        /// <summary>
        /// Indicates an application error.
        /// </summary>
        public const ushort ApplicationError = 3000;
        
        /// <summary>
        /// A collection of all of the status codes indicating a valid closing of the connection.
        /// </summary>
        public static readonly ReadOnlyCollection<ushort> ValidCloseCodes = new ReadOnlyCollection<ushort>(new[]
        {
            NormalClosure, GoingAway, ProtocolError, UnsupportedDataType,
            InvalidFramePayloadData, PolicyViolation, MessageTooBig,
            MandatoryExt, InternalServerError
        });
    }
}

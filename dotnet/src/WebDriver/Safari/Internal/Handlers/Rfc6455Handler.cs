// <copyright file="Rfc6455Handler.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace OpenQA.Selenium.Safari.Internal.Handlers
{
    /// <summary>
    /// Provides a handler for the RFC 6455 version of the WebSocket protocol.
    /// </summary>
    internal class Rfc6455Handler : RequestHandler
    {
        private const string WebSocketResponseGuid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
        private WebSocketHttpRequest request;
        private ReadState readState = new ReadState();

        /// <summary>
        /// Initializes a new instance of the <see cref="Rfc6455Handler"/> class.
        /// </summary>
        /// <param name="request">The <see cref="WebSocketHttpRequest"/> to handle.</param>
        private Rfc6455Handler(WebSocketHttpRequest request)
        {
            this.request = request;
        }

        /// <summary>
        /// Creates a new instance of the handler.
        /// </summary>
        /// <param name="request">The request to handle.</param>
        /// <returns>A <see cref="IHandler"/> to perform handling of subsequent requests.</returns>
        public static IHandler Create(WebSocketHttpRequest request)
        {
            return new Rfc6455Handler(request);
        }

        /// <summary>
        /// Receives data from the protocol.
        /// </summary>
        protected override void ProcessReceivedData()
        {
            while (Data.Count >= 2)
            {
                var isFinal = (Data[0] & 128) != 0;
                var reservedBits = Data[0] & 112;
                var frameType = (FrameType)(Data[0] & 15);
                var isMasked = (Data[1] & 128) != 0;
                var length = Data[1] & 127;

                if (!isMasked
                    || !Enum.IsDefined(typeof(FrameType), frameType)
                    || reservedBits != 0 // Must be zero per spec 5.2
                    || (frameType == FrameType.Continuation && !this.readState.FrameType.HasValue))
                {
                    throw new WebSocketException(WebSocketStatusCodes.ProtocolError);
                }

                var index = 2;
                int payloadLength;

                if (length == 127)
                {
                    if (Data.Count < index + 8)
                    {
                        // Not complete
                        return;
                    }
                    
                    payloadLength = Data.Skip(index).Take(8).ToArray().ToLittleEndianInt32();
                    index += 8;
                }
                else if (length == 126)
                {
                    if (Data.Count < index + 2)
                    {
                        // Not complete
                        return;
                    }

                    payloadLength = Data.Skip(index).Take(2).ToArray().ToLittleEndianInt32();
                    index += 2;
                }
                else
                {
                    payloadLength = length;
                }

                if (Data.Count < index + 4)
                {
                    // Not complete
                    return;
                }

                var maskBytes = Data.Skip(index).Take(4).ToArray();

                index += 4;
                if (Data.Count < index + payloadLength)
                {
                    // Not complete
                    return;
                }

                var payload = Data
                                .Skip(index)
                                .Take(payloadLength)
                                .Select((x, i) => (byte)(x ^ maskBytes[i % 4]));

                this.readState.Data.AddRange(payload);
                Data.RemoveRange(0, index + payloadLength);

                if (frameType != FrameType.Continuation)
                {
                    this.readState.FrameType = frameType;
                }

                if (isFinal && this.readState.FrameType.HasValue)
                {
                    var stateData = this.readState.Data.ToArray();
                    var stateFrameType = this.readState.FrameType;
                    this.readState.Clear();

                    this.ProcessFrame(stateFrameType.Value, stateData);
                }
            }
        }

        /// <summary>
        /// Prepares a text frame for the given text.
        /// </summary>
        /// <param name="text">The text for which to prepare the frame.</param>
        /// <returns>A byte array representing the frame in the WebSocket protocol.</returns>
        protected override byte[] GetTextFrame(string text)
        {
            return ConstructFrame(Encoding.UTF8.GetBytes(text), FrameType.Text);
        }

        /// <summary>
        /// Prepares a close frame for the given connection.
        /// </summary>
        /// <param name="code">The code to use in closing the connection.</param>
        /// <returns>A byte array representing the frame in the WebSocket protocol.</returns>
        protected override byte[] GetCloseFrame(int code)
        {
            return ConstructFrame(Convert.ToUInt16(code).ToBigEndianByteArray(), FrameType.Close);
        }

        /// <summary>
        /// Gets the handshake for WebSocket protocol.
        /// </summary>
        /// <returns>A byte array representing the handshake in the WebSocket protocol.</returns>
        protected override byte[] GetHandshake()
        {
            var builder = new StringBuilder();

            builder.Append("HTTP/1.1 101 Switching Protocols\r\n");
            builder.Append("Upgrade: websocket\r\n");
            builder.Append("Connection: Upgrade\r\n");

            var responseKey = CreateResponseKey(this.request["Sec-WebSocket-Key"]);
            builder.AppendFormat("Sec-WebSocket-Accept: {0}\r\n", responseKey);
            builder.Append("\r\n");

            return Encoding.ASCII.GetBytes(builder.ToString());
        }

        /// <summary>
        /// Prepares a binary frame for the given binary data.
        /// </summary>
        /// <param name="frameData">The binary data for which to prepare the frame.</param>
        /// <returns>A byte array representing the frame in the WebSocket protocol.</returns>
        protected override byte[] GetBinaryFrame(byte[] frameData)
        {
            return ConstructFrame(frameData, FrameType.Binary);
        }

        private static byte[] ConstructFrame(byte[] payload, FrameType frameType)
        {
            var memoryStream = new MemoryStream();
            byte op = Convert.ToByte(Convert.ToByte(frameType, CultureInfo.InvariantCulture) + 128, CultureInfo.InvariantCulture);

            memoryStream.WriteByte(op);

            if (payload.Length > ushort.MaxValue)
            {
                memoryStream.WriteByte(127);
                var lengthBytes = Convert.ToUInt64(payload.Length).ToBigEndianByteArray();
                memoryStream.Write(lengthBytes, 0, lengthBytes.Length);
            }
            else if (payload.Length > 125)
            {
                memoryStream.WriteByte(126);
                var lengthBytes = Convert.ToUInt16(payload.Length).ToBigEndianByteArray();
                memoryStream.Write(lengthBytes, 0, lengthBytes.Length);
            }
            else
            {
                memoryStream.WriteByte(Convert.ToByte(payload.Length, CultureInfo.InvariantCulture));
            }

            memoryStream.Write(payload, 0, payload.Length);

            return memoryStream.ToArray();
        }

        private static string CreateResponseKey(string requestKey)
        {
            var combined = requestKey + WebSocketResponseGuid;

            var bytes = SHA1.Create().ComputeHash(Encoding.ASCII.GetBytes(combined));

            return Convert.ToBase64String(bytes);
        }

        private static string ReadUTF8PayloadData(byte[] bytes)
        {
            var encoding = new UTF8Encoding(false, true);
            try
            {
                return encoding.GetString(bytes);
            }
            catch (ArgumentException)
            {
                throw new WebSocketException(WebSocketStatusCodes.InvalidFramePayloadData);
            }
        }

        private void ProcessFrame(FrameType frameType, byte[] data)
        {
            switch (frameType)
            {
                case FrameType.Close:
                    if (data.Length == 1 || data.Length > 125)
                    {
                        throw new WebSocketException(WebSocketStatusCodes.ProtocolError);
                    }

                    if (data.Length >= 2)
                    {
                        var closeCode = Convert.ToUInt16(data.Take(2).ToArray().ToLittleEndianInt32(), CultureInfo.InvariantCulture);
                        if (!WebSocketStatusCodes.ValidCloseCodes.Contains(closeCode) && (closeCode < 3000 || closeCode > 4999))
                        {
                            throw new WebSocketException(WebSocketStatusCodes.ProtocolError);
                        }
                    }

                    if (data.Length > 2)
                    {
                        ReadUTF8PayloadData(data.Skip(2).ToArray());
                    }

                    this.OnCloseHandled(new EventArgs());
                    break;
                case FrameType.Binary:
                    this.OnBinaryMessageHandled(new BinaryMessageHandledEventArgs(data));
                    break;
                case FrameType.Text:
                    this.OnTextMessageHandled(new TextMessageHandledEventArgs(ReadUTF8PayloadData(data)));
                    break;
                default:
                    break;
            }
        }
    }
}

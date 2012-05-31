// <copyright file="Hybi00Handler.cs" company="WebDriver Committers">
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
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace OpenQA.Selenium.Safari.Internal.Handlers
{
    /// <summary>
    /// Provides a request handler for the Hixie76 or Hybi00 version of the WebSocket protocol.
    /// </summary>
    internal class Hybi00Handler : RequestHandler
    {
        private const byte End = 255;
        private const byte Start = 0;
        private const int MaxSize = 1024 * 1024 * 5;

        private WebSocketHttpRequest request;

        /// <summary>
        /// Initializes a new instance of the <see cref="Hybi00Handler"/> class.
        /// </summary>
        /// <param name="request">The <see cref="WebSocketHttpRequest"/> to handle.</param>
        private Hybi00Handler(WebSocketHttpRequest request)
        {
            this.request = request;
        }

        /// <summary>
        /// Creates a new instance of the <see cref="Hybi00Handler"/>.
        /// </summary>
        /// <param name="request">The <see cref="WebSocketHttpRequest"/> to handle.</param>
        /// <returns>A <see cref="IHandler"/> to perform handling of subsequent requests.</returns>
        public static IHandler Create(WebSocketHttpRequest request)
        {
            return new Hybi00Handler(request);
        }

        /// <summary>
        /// Gets the handshake for WebSocket protocol.
        /// </summary>
        /// <returns>A byte array representing the handshake in the WebSocket protocol.</returns>
        protected override byte[] GetHandshake()
        {
            var builder = new StringBuilder();
            builder.Append("HTTP/1.1 101 WebSocket Protocol Handshake\r\n");
            builder.Append("Upgrade: WebSocket\r\n");
            builder.Append("Connection: Upgrade\r\n");
            builder.AppendFormat("Sec-WebSocket-Origin: {0}\r\n", this.request["Origin"]);
            builder.AppendFormat("Sec-WebSocket-Location: {0}://{1}{2}\r\n", this.request.Scheme, this.request["Host"], this.request.Path);

            if (this.request.Headers.ContainsKey("Sec-WebSocket-Protocol"))
            {
                builder.AppendFormat("Sec-WebSocket-Protocol: {0}\r\n", this.request["Sec-WebSocket-Protocol"]);
            }

            builder.Append("\r\n");

            var key1 = this.request["Sec-WebSocket-Key1"];
            var key2 = this.request["Sec-WebSocket-Key2"];
            var challenge = new ArraySegment<byte>(this.request.Payload, this.request.Payload.Length - 8, 8);

            var answerBytes = CalculateAnswerBytes(key1, key2, challenge);

            string handshakeString = builder.ToString();
            int responseLength = Encoding.ASCII.GetByteCount(handshakeString) + answerBytes.Length;
            byte[] byteResponse = new byte[responseLength];
            int copiedBytes = Encoding.ASCII.GetBytes(handshakeString, 0, handshakeString.Length, byteResponse, 0);
            Array.Copy(answerBytes, 0, byteResponse, copiedBytes, answerBytes.Length);

            return byteResponse;
        }

        /// <summary>
        /// Prepares a text frame for the given text.
        /// </summary>
        /// <param name="text">The text for which to prepare the frame.</param>
        /// <returns>A byte array representing the frame in the WebSocket protocol.</returns>
        protected override byte[] GetTextFrame(string text)
        {
            int byteCount = Encoding.UTF8.GetByteCount(text);
            byte[] byteArray = new byte[byteCount + 2];
            byteArray[0] = Start;
            byteArray[byteArray.Length - 1] = End;
            Encoding.UTF8.GetBytes(text, 0, text.Length, byteArray, 1);
            return byteArray;
        }

        /// <summary>
        /// Receives the data from the protocol.
        /// </summary>
        protected override void ProcessReceivedData()
        {
            while (this.Data.Count > 0)
            {
                if (this.Data[0] != Start)
                {
                    throw new WebSocketException(WebSocketStatusCodes.InvalidFramePayloadData);
                }

                var endIndex = this.Data.IndexOf(End);
                if (endIndex < 0)
                {
                    return;
                }

                if (endIndex > MaxSize)
                {
                    throw new WebSocketException(WebSocketStatusCodes.MessageTooBig);
                }

                var bytesArray = this.Data.Skip(1).Take(endIndex - 1).ToArray();

                this.Data.RemoveRange(0, endIndex + 1);

                var message = Encoding.UTF8.GetString(bytesArray);

                this.OnTextMessageHandled(new TextMessageHandledEventArgs(message));
            }
        }

        private static byte[] CalculateAnswerBytes(string key1, string key2, ArraySegment<byte> challenge)
        {
            byte[] result1Bytes = ParseKey(key1);
            byte[] result2Bytes = ParseKey(key2);

            var rawAnswer = new byte[16];
            Array.Copy(result1Bytes, 0, rawAnswer, 0, 4);
            Array.Copy(result2Bytes, 0, rawAnswer, 4, 4);
            Array.Copy(challenge.Array, challenge.Offset, rawAnswer, 8, 8);

            return MD5.Create().ComputeHash(rawAnswer);
        }

        private static byte[] ParseKey(string key)
        {
            int spaces = key.Count(x => x == ' ');
            var digits = new string(key.Where(char.IsDigit).ToArray());

            var value = (int)(long.Parse(digits, CultureInfo.InvariantCulture) / spaces);

            byte[] result = BitConverter.GetBytes(value);
            if (BitConverter.IsLittleEndian)
            {
                Array.Reverse(result);
            }
            
            return result;
        }
    }
}

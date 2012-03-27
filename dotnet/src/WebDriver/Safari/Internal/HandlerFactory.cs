// <copyright file="HandlerFactory.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Safari.Internal.Handlers;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides a factory for creating handlers for the different versions of the WebSocket protocol.
    /// </summary>
    internal sealed class HandlerFactory
    {
        /// <summary>
        /// Prevents a default instance of the <see cref="HandlerFactory"/> class from being created.
        /// </summary>
        private HandlerFactory()
        {
        }

        /// <summary>
        /// Creates a handler to handle a <see cref="WebSocketHttpRequest"/>.
        /// </summary>
        /// <param name="request">The <see cref="WebSocketHttpRequest"/> to create the handler for.</param>
        /// <returns>An <see cref="IHandler"/> object that can handle the specific protocol version
        /// of the request.</returns>
        public static IHandler BuildHandler(WebSocketHttpRequest request)
        {
            var version = GetVersion(request);

            switch (version)
            {
                case "76":
                    return Hybi00Handler.Create(request);
                case "7":
                case "8":
                case "13":
                    return Rfc6455Handler.Create(request);
            }

            throw new WebSocketException(WebSocketStatusCodes.UnsupportedDataType, "Unsupported protocol version.");
        }
        
        /// <summary>
        /// Gets the version of an <see cref="WebSocketHttpRequest"/>.
        /// </summary>
        /// <param name="request">The <see cref="WebSocketHttpRequest"/> to get the protocol version of.</param>
        /// <returns>A string containing the version of the protocol of the request.</returns>
        public static string GetVersion(WebSocketHttpRequest request) 
        {
            string version;
            if (request.Headers.TryGetValue("Sec-WebSocket-Version", out version))
            {
                return version;
            }

            if (request.Headers.TryGetValue("Sec-WebSocket-Draft", out version))
            {
                return version;
            }

            if (request.Headers.ContainsKey("Sec-WebSocket-Key1"))
            {
                return "76";
            }

            return "75";
        }
    }
}

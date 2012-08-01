// <copyright file="WebSocketConnectionInfo.cs" company="WebDriver Committers">
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

using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides information about a WebSocket connection.
    /// </summary>
    public class WebSocketConnectionInfo : IWebSocketConnectionInfo
    {
        private const string CookiePattern = @"((;\s)*(?<cookie_name>[^=]+)=(?<cookie_value>[^\;]+))+";
        private static readonly Regex CookieRegex = new Regex(CookiePattern, RegexOptions.Compiled);

        /// <summary>
        /// Prevents a default instance of the <see cref="WebSocketConnectionInfo"/> class from being created.
        /// </summary>
        private WebSocketConnectionInfo()
        {
            this.Cookies = new Dictionary<string, string>();
        }

        /// <summary>
        /// Gets the subprotocol of the connection.
        /// </summary>
        public string SubProtocol { get; private set; }

        /// <summary>
        /// Gets the origin of the connection.
        /// </summary>
        public string Origin { get; private set; }

        /// <summary>
        /// Gets the host for the connection.
        /// </summary>
        public string Host { get; private set; }

        /// <summary>
        /// Gets the path for the connection.
        /// </summary>
        public string Path { get; private set; }

        /// <summary>
        /// Gets the IP address of the client for the connection.
        /// </summary>
        public string ClientIPAddress { get; private set; }

        /// <summary>
        /// Gets the collection of cookies for the connection.
        /// </summary>
        public IDictionary<string, string> Cookies { get; private set; }

        /// <summary>
        /// Creates a <see cref="WebSocketConnectionInfo"/> for a given request and IP address.
        /// </summary>
        /// <param name="request">The <see cref="WebSocketHttpRequest"/> to get the connection information for.</param>
        /// <param name="clientIPAddress">The IP address of the client connection.</param>
        /// <returns>The created <see cref="WebSocketConnectionInfo"/>.</returns>
        public static WebSocketConnectionInfo Create(WebSocketHttpRequest request, string clientIPAddress)
        {
            var info = new WebSocketConnectionInfo
            {
                Origin = request["Origin"] ?? request["Sec-WebSocket-Origin"],
                Host = request["Host"],
                SubProtocol = request["Sec-WebSocket-Protocol"],
                Path = request.Path,
                ClientIPAddress = clientIPAddress
            };

            var cookieHeader = request["Cookie"];

            if (cookieHeader != null)
            {
                var match = CookieRegex.Match(cookieHeader);
                var fields = match.Groups["cookie_name"].Captures;
                var values = match.Groups["cookie_value"].Captures;
                for (var i = 0; i < fields.Count; i++)
                {
                    var name = fields[i].ToString();
                    var value = values[i].ToString();
                    info.Cookies[name] = value;
                }
            }

            return info;
        }
    }
}

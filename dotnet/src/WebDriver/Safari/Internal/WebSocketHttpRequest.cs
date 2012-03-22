// <copyright file="WebSocketHttpRequest.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Defines an HTTP request via the WebSocket protocol.
    /// </summary>
    public class WebSocketHttpRequest
    {
        private readonly IDictionary<string, string> headers = new Dictionary<string, string>();

        /// <summary>
        /// Gets or sets the HTTP method of the request.
        /// </summary>
        public string Method { get; set; }

        /// <summary>
        /// Gets or sets the path of the request.
        /// </summary>
        public string Path { get; set; }

        /// <summary>
        /// Gets or sets the body of the request
        /// </summary>
        public string Body { get; set; }

        /// <summary>
        /// Gets or sets the scheme of the request.
        /// </summary>
        public string Scheme { get; set; }

        /// <summary>
        /// Gets or sets the WebSocket payload of the request.
        /// </summary>
        public byte[] Payload { get; set; }

        /// <summary>
        /// Gets the headers for the request.
        /// </summary>
        public IDictionary<string, string> Headers
        {
            get { return this.headers; }
        }

        /// <summary>
        /// Gets or sets the value associated with the specified header.
        /// </summary>
        /// <param name="name">The name of the header.</param>
        /// <returns>The value of the header, if it exists. If it does not exist, returns an empty string.</returns>
        public string this[string name]
        {
            get
            {
                string value;
                return this.headers.TryGetValue(name, out value) ? value : default(string);
            }
        }
    }
}

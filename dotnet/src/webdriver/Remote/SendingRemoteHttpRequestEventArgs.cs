// <copyright file="SendingRemoteHttpRequestEventArgs.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
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
using System.Net;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides data for the SendingRemoteHttpRequest event of a <see cref="HttpCommandExecutor"/> object.
    /// </summary>
    public class SendingRemoteHttpRequestEventArgs : EventArgs
    {
        private string method;
        private string fullUrl;
        private string requestBody;
        private Dictionary<string, string> headers = new Dictionary<string, string>();

        /// <summary>
        /// Initializes a new instance of the <see cref="SendingRemoteHttpRequestEventArgs"/> class.
        /// </summary>
        /// <param name="method">The HTTP method of the request being sent.</param>
        /// <param name="fullUrl">The full URL of the request being sent.</param>
        /// <param name="requestBody">The body of the request.</param>
        public SendingRemoteHttpRequestEventArgs(string method, string fullUrl, string requestBody)
        {
            this.method = method;
            this.fullUrl = fullUrl;
            this.requestBody = requestBody;
        }

        /// <summary>
        /// Gets the HTTP method for the HTTP request.
        /// </summary>
        public string Method
        {
            get { return this.method; }
        }

        /// <summary>
        /// Gets the full URL of the HTTP request.
        /// </summary>
        public string FullUrl
        {
            get { return this.fullUrl; }
        }

        /// <summary>
        /// Gets the body of the HTTP request as a string.
        /// </summary>
        public string RequestBody
        {
            get { return this.requestBody; }
        }

        /// <summary>
        /// Gets a read-only dictionary of the headers of the HTTP request.
        /// Does not include default headers of the web client making the request.
        /// </summary>
        public IReadOnlyDictionary<string, string> Headers
        {
            get { return this.headers; }
        }

        /// <summary>
        /// Adds a header to the HTTP request.
        /// </summary>
        /// <param name="headerName">The name of the header to add.</param>
        /// <param name="headerValue">The value of the header to add.</param>
        /// <remarks>
        /// Adding headers here will attempt to add them to the headers for the
        /// HTTP request being sent; however, be aware they may be overwritten by
        /// the client raising the event.
        /// </remarks>
        public void AddHeader(string headerName, string headerValue)
        {
            if (string.IsNullOrEmpty(headerName))
            {
                throw new ArgumentException("Header name may not be null or the empty string.", nameof(headerName));
            }

            if (headerValue == null)
            {
                throw new ArgumentNullException(nameof(headerValue), "Header value may not be null.");
            }

            this.headers[headerName] = headerValue;
        }
    }
}

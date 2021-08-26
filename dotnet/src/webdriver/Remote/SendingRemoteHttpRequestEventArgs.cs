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
        /// Gets the <see cref="HttpWebRequest"/> object representing the HTTP request being sent.
        /// </summary>
        [Obsolete("Bindings no longer use HttpWebRequest. This property will return null, and will be removed in a future release.")]
        public HttpWebRequest Request
        {
            get { return null; }
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
    }
}

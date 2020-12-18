// <copyright file="NetworkRequestSentEventArgs.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides data for the NetworkRequestSent event of an object implementing the <see cref="INetwork"/> interface.
    /// </summary>
    public class NetworkRequestSentEventArgs : EventArgs
    {
        private readonly string requestId;
        private readonly string requestUrl;
        private readonly string requestMethod;
        private readonly string requestPostData;
        private readonly Dictionary<string, string> requestHeaders = new Dictionary<string, string>();

        /// <summary>
        /// Initializes a new instance of the <see cref="NetworkRequestSentEventArgs"/> class.
        /// </summary>
        /// <param name="requestData">The <see cref="HttpRequestData"/> that describes the network request.</param>
        public NetworkRequestSentEventArgs(HttpRequestData requestData)
        {
            this.requestId = requestData.RequestId;
            this.requestUrl = requestData.Url;
            this.requestMethod = requestData.Method;
            this.requestPostData = requestData.PostData;
            foreach (KeyValuePair<string, string> header in requestData.Headers)
            {
                this.requestHeaders[header.Key] = header.Value;
            }
        }

        /// <summary>
        /// Gets the internal request ID of the network request.
        /// </summary>
        public string RequestId => requestId;
        
        /// <summary>
        /// Gets the URL of the network request.
        /// </summary>
        public string RequestUrl => requestUrl;

        /// <summary>
        /// Gets the HTTP method of the network request.
        /// </summary>
        public string RequestMethod => requestMethod;

        /// <summary>
        /// Gets the post data of the network request, if any.
        /// </summary>
        public string RequestPostData => requestPostData;

        /// <summary>
        /// Gets the collection of headers associated with the network request.
        /// </summary>
        public IReadOnlyDictionary<string, string> RequestHeaders => requestHeaders;
    }
}

// <copyright file="HttpResponseData.cs" company="WebDriver Committers">
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
using System.Data.Common;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents the response data for an intercepted HTTP call.
    /// </summary>
    public class HttpResponseData
    {
        private Dictionary<string, string> headers = new Dictionary<string, string>();
        private List<string> cookies = new List<string>();

        /// <summary>
        /// Gets or sets the ID of the request that generated this response.
        /// </summary>
        public string RequestId { get; set; }

        /// <summary>
        /// Gets or sets the URL of the HTTP response.
        /// </summary>
        public string Url { get; set; }

        /// <summary>
        /// Gets or sets the numeric status code of the HTTP response.
        /// </summary>
        public long StatusCode { get; set; }

        /// <summary>
        /// Gets or sets the body of the HTTP response.
        /// </summary>
        public string Body { get; set; }

        /// <summary>
        /// Gets or sets the type of resource for this response.
        /// </summary>
        public string ResourceType { get; set; }

        /// <summary>
        /// Gets or sets the reason for an error response.
        /// </summary>
        public string ErrorReason { get; set; }

        /// <summary>
        /// Gets the headers of the HTTP response.
        /// </summary>
        public Dictionary<string, string> Headers => this.headers;

        /// <summary>
        /// Gets the cookie headers of the HTTP response.
        /// </summary>
        public List<string> CookieHeaders => this.cookies;
    }
}

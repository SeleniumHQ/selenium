// <copyright file="HttpRequestData.cs" company="WebDriver Committers">
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
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents the response data for an intercepted HTTP call.
    /// </summary>
    public class HttpRequestData
    {
        /// <summary>
        /// Gets the method of the HTTP request.
        /// </summary>
        public string Method { get; set; }

        /// <summary>
        /// Gets the URL of the HTTP request.
        /// </summary>
        public string Url { get; set; }

        /// <summary>
        /// Gets the POST data of the HTTP request.
        /// </summary>
        public string PostData { get; set; }

        /// <summary>
        /// Gets the headers of the HTTP request.
        /// </summary>
        public Dictionary<string, string> Headers { get; set; }

        /// <summary>
        /// Gets the ID of the HTTP request.
        /// </summary>
        public string RequestId { get; internal set; }
    }
}

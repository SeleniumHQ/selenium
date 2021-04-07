// <copyright file="NetworkRequestHandler.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Allows a user to handle a network request, potentially modifying the request or providing a known response.
    /// </summary>
    public class NetworkRequestHandler
    {
        /// <summary>
        /// Gets or sets a function that evaluates request data in an <see cref="HttpRequestData"/> object,
        /// and returns a value indicating whether the data matches the specified criteria.
        /// </summary>
        public Func<HttpRequestData, bool> RequestMatcher { get; set; }

        /// <summary>
        /// Gets or sets a function that accepts an <see cref="HttpRequestData"/> object describing a network
        /// request to be sent, and returns a modified <see cref="HttpRequestData"/> object to use in the actual
        /// network request.
        /// </summary>
        public Func<HttpRequestData, HttpRequestData> RequestTransformer { get; set; }

        /// <summary>
        /// Gets or sets a function that accepts an <see cref="HttpRequestData"/> object describing a network
        /// request to be sent, and returns an <see cref="HttpResponseData"/> object as the response for the
        /// request, bypassing the actual network request.
        /// </summary>
        public Func<HttpRequestData, HttpResponseData> ResponseSupplier { get; set; }
    }
}

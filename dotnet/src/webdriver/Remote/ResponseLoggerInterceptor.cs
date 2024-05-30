// <copyright file="ResponseLoggerInterceptor.cs" company="WebDriver Committers">
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

using System.Net.Http;
using System.Threading.Tasks;
using OpenQA.Selenium.Internal.Logging;
using System;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Interceptor for logging HTTP responses.
    /// </summary>
    public class ResponseLoggerInterceptor : IHttpInterceptor
    {
        private static readonly ILogger _logger = Log.GetLogger<ResponseLoggerInterceptor>();

        /// <summary>
        /// Initializes a new instance of the ResponseLoggerInterceptor with logger.
        /// </summary>
        /// <param name="logger">Internal logger to be used for logging responses.</param>
        public ResponseLoggerInterceptor()
        {
        }

        /// <summary>
        /// Intercepts an HTTP response and logs the response body if the status code is not between 2xx = 3xx.
        /// </summary>
        /// <param name="response">The HTTP response message to intercept.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        public async Task InterceptAsync(HttpResponseMessage response)
        {
            var responseBodyStr = await response.Content.ReadAsStringAsync();

            if ((int)response.StatusCode < 200 || (int)response.StatusCode > 399)
            {
                _logger.Debug($"Response Body:{Environment.NewLine}{responseBodyStr}{Environment.NewLine}");
            }
        }
    }

    public interface IHttpInterceptor
    {
        Task InterceptAsync(HttpResponseMessage response);
    }
}

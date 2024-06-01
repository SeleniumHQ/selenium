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
    public class ResponseLoggerInterceptor : DelegatingHandler
    {
        private static readonly ILogger _logger = Log.GetLogger<ResponseLoggerInterceptor>();

        public ResponseLoggerInterceptor(HttpMessageHandler innerHandler)
            : base(innerHandler)
        {
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (request.Content != null)
            {
                string requestContent = await request.Content.ReadAsStringAsync();
                _logger.Trace($">> Body: {requestContent}");
            }

            HttpResponseMessage response = await base.SendAsync(request, cancellationToken);

            if (response.Content != null)
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                _logger.Trace($"<< Body: {responseContent}");
            }

            return response;
        }
    }

}

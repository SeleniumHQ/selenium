// <copyright file="INetwork.cs" company="WebDriver Committers">
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
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Class providing functionality for manipulating network calls using DevTools Protocol commands
    /// </summary>
    public abstract class Network
    {
        /// <summary>
        /// Occurs when a network request requires authorization.
        /// </summary>
        public event EventHandler<AuthRequiredEventArgs> AuthRequired;

        /// <summary>
        /// Occurs when a network request is intercepted.
        /// </summary>
        public event EventHandler<RequestPausedEventArgs> RequestPaused;

        /// <summary>
        /// Asynchronously disables network caching.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task DisableNetworkCaching();

        /// <summary>
        /// Asynchronously enables network caching.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task EnableNetworkCaching();

        /// <summary>
        /// Asynchronously enables the fetch domain for all URL patterns.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task EnableFetchForAllPatterns();

        /// <summary>
        /// Asynchronously diables the fetch domain.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task DisableFetch();

        /// <summary>
        /// Asynchronously continues an intercepted network request.
        /// </summary>
        /// <param name="requestData">The <see cref="HttpRequestData"/> of the request.</param>
        /// <param name="responseData">The <see cref="HttpResponseData"/> with which to respond to the request</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task ContinueRequest(HttpRequestData requestData, HttpResponseData responseData);

        /// <summary>
        /// Asynchronously contines an intercepted network call without modification.
        /// </summary>
        /// <param name="requestData">The <see cref="HttpRequestData"/> of the network request.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task ContinueWithoutModification(HttpRequestData requestData);

        /// <summary>
        /// Asynchronously continues an intercepted network call using authentication.
        /// </summary>
        /// <param name="requestData">The <see cref="HttpRequestData"/> of the network request.</param>
        /// <param name="userName">The user name with which to authenticate.</param>
        /// <param name="password">The password with which to authenticate.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task ContinueWithAuth(HttpRequestData requestData, string userName, string password);

        /// <summary>
        /// Asynchronously cancels authorization of an intercepted network request.
        /// </summary>
        /// <param name="requestData">The <see cref="HttpRequestData"/> of the network request.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task CancelAuth(HttpRequestData requestData);

        /// <summary>
        /// Raises the AuthRequired event.
        /// </summary>
        /// <param name="e">An <see cref="AuthRequiredEventArgs"/> that contains the event data.</param>
        protected virtual void OnAuthRequired(AuthRequiredEventArgs e)
        {
            if (this.AuthRequired != null)
            {
                this.AuthRequired(this, e);
            }
        }

        /// <summary>
        /// Raises the RequestPaused event.
        /// </summary>
        /// <param name="e">An <see cref="RequestPausedEventArgs"/> that contains the event data.</param>
        protected virtual void OnRequestPaused(RequestPausedEventArgs e)
        {
            if (this.RequestPaused != null)
            {
                this.RequestPaused(this, e);
            }
        }
    }
}

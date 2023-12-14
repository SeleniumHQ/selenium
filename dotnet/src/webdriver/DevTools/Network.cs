// <copyright file="Network.cs" company="WebDriver Committers">
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

using System.Linq;
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
        public event AsyncEventHandler<AuthRequiredEventArgs> AuthRequired;

        /// <summary>
        /// Occurs when a network request is intercepted.
        /// </summary>
        public event AsyncEventHandler<RequestPausedEventArgs> RequestPaused;

        /// <summary>
        /// Occurs when a network response is received.
        /// </summary>
        public event AsyncEventHandler<ResponsePausedEventArgs> ResponsePaused;

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
        /// Asynchronously enables the network domain.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task EnableNetwork();

        /// <summary>
        /// Asynchronously diables the fetch domain.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task DisableNetwork();

        /// <summary>
        /// Asynchronously enables the fetch domain for all URL patterns.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task EnableFetchForAllPatterns();

        /// <summary>
        /// Asynchronously sets the override of the user agent string.
        /// </summary>
        /// <param name="userAgent">The user agent string to set.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task SetUserAgentOverride(string userAgent)
        {
            await SetUserAgentOverride(new UserAgent() { UserAgentString = userAgent }).ConfigureAwait(false);
        }

        /// <summary>
        /// Asynchronously sets the override of the user agent settings.
        /// </summary>
        /// <param name="userAgent">A <see cref="UserAgent"/> object containing the user agent values to override.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task SetUserAgentOverride(UserAgent userAgent);

        /// <summary>
        /// Asynchronously diables the fetch domain.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task DisableFetch();

        /// <summary>
        /// Asynchronously continues an intercepted network request.
        /// </summary>
        /// <param name="requestData">The <see cref="HttpRequestData"/> of the request.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task ContinueRequest(HttpRequestData requestData);

        /// <summary>
        /// Asynchronously continues an intercepted network request and returns the specified response.
        /// </summary>
        /// <param name="requestData">The <see cref="HttpRequestData"/> of the request.</param>
        /// <param name="responseData">The <see cref="HttpResponseData"/> with which to respond to the request</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task ContinueRequestWithResponse(HttpRequestData requestData, HttpResponseData responseData);

        /// <summary>
        /// Asynchronously contines an intercepted network request without modification.
        /// </summary>
        /// <param name="requestData">The <see cref="HttpRequestData"/> of the network request.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task ContinueRequestWithoutModification(HttpRequestData requestData);

        /// <summary>
        /// Asynchronously continues an intercepted network call using authentication.
        /// </summary>
        /// <param name="requestId">The ID of the network request for which to continue with authentication.</param>
        /// <param name="userName">The user name with which to authenticate.</param>
        /// <param name="password">The password with which to authenticate.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task ContinueWithAuth(string requestId, string userName, string password);

        /// <summary>
        /// Asynchronously cancels authorization of an intercepted network request.
        /// </summary>
        /// <param name="requestId">The ID of the network request for which to cancel authentication.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task CancelAuth(string requestId);

        /// <summary>
        /// Asynchronously adds the response body to the provided <see cref="HttpResponseData"/> object.
        /// </summary>
        /// <param name="responseData">The <see cref="HttpResponseData"/> object to which to add the response body.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task AddResponseBody(HttpResponseData responseData);

        /// <summary>
        /// Asynchronously continues an intercepted network response without modification.
        /// </summary>
        /// <param name="responseData">The <see cref="HttpResponseData"/> of the network response.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task ContinueResponseWithoutModification(HttpResponseData responseData);

        /// <summary>
        /// Raises the AuthRequired event.
        /// </summary>
        /// <param name="e">An <see cref="AuthRequiredEventArgs"/> that contains the event data.</param>
        protected virtual void OnAuthRequired(AuthRequiredEventArgs e)
        {
            var delegates = AuthRequired?.GetInvocationList();

            if (delegates != null)
            {
                foreach (var d in delegates.Cast<AsyncEventHandler<AuthRequiredEventArgs>>())
                {
                    Task.Run(async () => await d.Invoke(this, e)).GetAwaiter().GetResult();
                }
            }
        }

        /// <summary>
        /// Raises the RequestPaused event.
        /// </summary>
        /// <param name="e">An <see cref="RequestPausedEventArgs"/> that contains the event data.</param>
        protected virtual void OnRequestPaused(RequestPausedEventArgs e)
        {
            var delegates = RequestPaused?.GetInvocationList();

            if (delegates != null)
            {
                foreach (var d in delegates.Cast<AsyncEventHandler<RequestPausedEventArgs>>())
                {
                    Task.Run(async () => await d.Invoke(this, e)).GetAwaiter().GetResult();
                }
            }
        }

        /// <summary>
        /// Raises the ResponseReceived event.
        /// </summary>
        /// <param name="e">An <see cref="ResponsePausedEventArgs"/> that contains the event data.</param>
        protected virtual void OnResponsePaused(ResponsePausedEventArgs e)
        {
            var delegates = ResponsePaused?.GetInvocationList();

            if (delegates != null)
            {
                foreach (var d in delegates.Cast<AsyncEventHandler<ResponsePausedEventArgs>>())
                {
                    Task.Run(async () => await d.Invoke(this, e)).GetAwaiter().GetResult();
                }
            }
        }

        /// <returns>A task that represents the asynchronous operation.</returns>
        /// <summary>
        /// Am asynchrounous delegate for handling network events.
        /// </summary>
        /// <typeparam name="TEventArgs">The type of event args the event raises.</typeparam>
        /// <param name="sender">The sender of the event.</param>
        /// <param name="e">An object containing information about the event.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public delegate Task AsyncEventHandler<TEventArgs>(object sender, TEventArgs e);
    }
}

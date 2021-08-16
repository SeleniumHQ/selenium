// <copyright file="NetworkManager.cs" company="WebDriver Committers">
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
using System.Threading.Tasks;
using OpenQA.Selenium.DevTools;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides methods for monitoring, intercepting, and modifying network requests and responses.
    /// </summary>
    public class NetworkManager : INetwork
    {
        private Lazy<DevToolsSession> session;
        private List<NetworkRequestHandler> requestHandlers = new List<NetworkRequestHandler>();
        private List<NetworkAuthenticationHandler> authenticationHandlers = new List<NetworkAuthenticationHandler>();

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteNetwork"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> instance on which the network should be monitored.</param>
        public NetworkManager(IWebDriver driver)
        {
            // Use of Lazy<T> means this exception won't be thrown until the user first
            // attempts to access the DevTools session, probably on the first call to
            // StartMonitoring().
            this.session = new Lazy<DevToolsSession>(() =>
            {
                IDevTools devToolsDriver = driver as IDevTools;
                if (session == null)
                {
                    throw new WebDriverException("Driver must implement IDevTools to use these features");
                }

                return devToolsDriver.GetDevToolsSession();
            });
        }

        /// <summary>
        /// Occurs when a browser sends a network request.
        /// </summary>
        public event EventHandler<NetworkRequestSentEventArgs> NetworkRequestSent;

        /// <summary>
        /// Occurs when a browser receives a network response.
        /// </summary>
        public event EventHandler<NetworkResponseReceivedEventArgs> NetworkResponseReceived;

        /// <summary>
        /// Asynchronously starts monitoring for network traffic.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task StartMonitoring()
        {
            this.session.Value.Domains.Network.RequestPaused += OnRequestPaused;
            this.session.Value.Domains.Network.AuthRequired += OnAuthRequired;
            this.session.Value.Domains.Network.ResponsePaused += OnResponsePaused;
            await this.session.Value.Domains.Network.EnableFetchForAllPatterns();
            await this.session.Value.Domains.Network.EnableNetwork();
            await this.session.Value.Domains.Network.DisableNetworkCaching();
        }

        /// <summary>
        /// Asynchronously stops monitoring for network traffic.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task StopMonitoring()
        {
            this.session.Value.Domains.Network.ResponsePaused -= OnResponsePaused;
            this.session.Value.Domains.Network.AuthRequired -= OnAuthRequired;
            this.session.Value.Domains.Network.RequestPaused -= OnRequestPaused;
            await this.session.Value.Domains.Network.EnableNetworkCaching();
        }

        /// <summary>
        /// Adds a <see cref="NetworkRequestHandler"/> to examine incoming network requests,
        /// and optionally modify the request or provide a response. 
        /// </summary>
        /// <param name="handler">The <see cref="NetworkRequestHandler"/> to add.</param>
        public void AddRequestHandler(NetworkRequestHandler handler)
        {
            if (handler == null)
            {
                throw new ArgumentNullException("handler", "Request handler cannot be null");
            }

            if (handler.RequestMatcher == null)
            {
                throw new ArgumentException("Matcher for request cannot be null", "handler");
            }

            if (handler.RequestTransformer == null && handler.ResponseSupplier == null)
            {
                throw new ArgumentException("Request transformer and response supplier cannot both be null", "handler");
            }

            this.requestHandlers.Add(handler);
        }

        /// <summary>
        /// Clears all added <see cref="NetworkRequestHandler"/> instances.
        /// </summary>
        public void ClearRequestHandlers()
        {
            this.requestHandlers.Clear();
        }

        /// <summary>
        /// Adds a <see cref="NetworkAuthenticationHandler"/> to supply authentication
        /// credentials for network requests.
        /// </summary>
        /// <param name="handler">The <see cref="NetworkAuthenticationHandler"/> to add.</param>
        public void AddAuthenticationHandler(NetworkAuthenticationHandler handler)
        {
            if (handler == null)
            {
                throw new ArgumentNullException("handler", "Authentication handler cannot be null");
            }

            if (handler.UriMatcher == null)
            {
                throw new ArgumentException("Matcher for delegate for URL cannot be null", "handler");
            }

            if (handler.Credentials == null)
            {
                throw new ArgumentException("Credentials to use for authentication cannot be null", "handler");
            }

            var passwordCredentials = handler.Credentials as PasswordCredentials;
            if (passwordCredentials == null)
            {
                throw new ArgumentException("Credentials must contain user name and password (PasswordCredentials)", "handler");
            }

            this.authenticationHandlers.Add(handler);
        }

        /// <summary>
        /// Clears all added <see cref="NetworkAuthenticationHandler"/> instances.
        /// </summary>
        public void ClearAuthenticationHandlers()
        {
            this.authenticationHandlers.Clear();
        }

        private async void OnAuthRequired(object sender, AuthRequiredEventArgs e)
        {
            string requestId = e.RequestId;
            Uri uri = new Uri(e.Uri);
            bool successfullyAuthenticated = false;
            foreach (var authenticationHandler in this.authenticationHandlers)
            {
                if (authenticationHandler.UriMatcher.Invoke(uri))
                {
                    PasswordCredentials credentials = authenticationHandler.Credentials as PasswordCredentials;
                    await this.session.Value.Domains.Network.ContinueWithAuth(e.RequestId, credentials.UserName, credentials.Password);
                    successfullyAuthenticated = true;
                    break;
                }
            }

            if (!successfullyAuthenticated)
            {
                await this.session.Value.Domains.Network.CancelAuth(e.RequestId);
            }
        }

        private async void OnRequestPaused(object sender, RequestPausedEventArgs e)
        {
            if (this.NetworkRequestSent != null)
            {
                this.NetworkRequestSent(this, new NetworkRequestSentEventArgs(e.RequestData));
            }

            foreach (var handler in this.requestHandlers)
            {
                if (handler.RequestMatcher.Invoke(e.RequestData))
                {
                    if (handler.RequestTransformer != null)
                    {
                        await this.session.Value.Domains.Network.ContinueRequest(handler.RequestTransformer(e.RequestData));
                        return;
                    }

                    if (handler.ResponseSupplier != null)
                    {
                        await this.session.Value.Domains.Network.ContinueRequestWithResponse(e.RequestData, handler.ResponseSupplier(e.RequestData));
                        return;
                    }
                }
            }

            await this.session.Value.Domains.Network.ContinueRequestWithoutModification(e.RequestData);
        }

        private async void OnResponsePaused(object sender, ResponsePausedEventArgs e)
        {
            await this.session.Value.Domains.Network.AddResponseBody(e.ResponseData);
            await this.session.Value.Domains.Network.ContinueResponseWithoutModification(e.ResponseData);
            if (this.NetworkResponseReceived != null)
            {
                this.NetworkResponseReceived(this, new NetworkResponseReceivedEventArgs(e.ResponseData));
            }
        }
    }
}

// <copyright file="V115Network.cs" company="WebDriver Committers">
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
using System.Threading.Tasks;
using OpenQA.Selenium.DevTools.V115.Fetch;
using OpenQA.Selenium.DevTools.V115.Network;

namespace OpenQA.Selenium.DevTools.V115
{
    /// <summary>
    /// Class providing functionality for manipulating network calls using version 115 of the DevTools Protocol
    /// </summary>
    public class V115Network : DevTools.Network
    {
        private FetchAdapter fetch;
        private NetworkAdapter network;

        /// <summary>
        /// Initializes a new instance of the <see cref="V115Network"/> class.
        /// </summary>
        /// <param name="network">The adapter for the Network domain.</param>
        /// <param name="fetch">The adapter for the Fetch domain.</param>
        public V115Network(NetworkAdapter network, FetchAdapter fetch)
        {
            this.network = network;
            this.fetch = fetch;
            fetch.AuthRequired += OnFetchAuthRequired;
            fetch.RequestPaused += OnFetchRequestPaused;
        }

        /// <summary>
        /// Asynchronously disables network caching.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task DisableNetworkCaching()
        {
            await network.SetCacheDisabled(new SetCacheDisabledCommandSettings() { CacheDisabled = true });
        }

        /// <summary>
        /// Asynchronously enables network caching.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task EnableNetworkCaching()
        {
            await network.SetCacheDisabled(new SetCacheDisabledCommandSettings() { CacheDisabled = false });
        }

        public override async Task EnableNetwork()
        {
            await network.Enable(new Network.EnableCommandSettings());
        }

        public override async Task DisableNetwork()
        {
            await network.Disable();
        }

        /// <summary>
        /// Asynchronously enables the fetch domain for all URL patterns.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task EnableFetchForAllPatterns()
        {
            await fetch.Enable(new OpenQA.Selenium.DevTools.V115.Fetch.EnableCommandSettings()
            {
                Patterns = new OpenQA.Selenium.DevTools.V115.Fetch.RequestPattern[]
                {
                    new OpenQA.Selenium.DevTools.V115.Fetch.RequestPattern() { UrlPattern = "*", RequestStage = RequestStage.Request },
                    new OpenQA.Selenium.DevTools.V115.Fetch.RequestPattern() { UrlPattern = "*", RequestStage = RequestStage.Response }
                },
                HandleAuthRequests = true
            });
        }

        /// <summary>
        /// Asynchronously diables the fetch domain.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task DisableFetch()
        {
            await fetch.Disable();
        }

        /// <summary>
        /// Asynchronously sets the override of the user agent settings.
        /// </summary>
        /// <param name="userAgent">A <see cref="UserAgent"/> object containing the user agent values to override.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task SetUserAgentOverride(UserAgent userAgent)
        {
            await network.SetUserAgentOverride(new SetUserAgentOverrideCommandSettings()
            {
                UserAgent = userAgent.UserAgentString,
                AcceptLanguage = userAgent.AcceptLanguage,
                Platform = userAgent.Platform
            });
        }

        /// <summary>
        /// Asynchronously continues an intercepted network request.
        /// </summary>
        /// <param name="requestData">The <see cref="HttpRequestData"/> of the request.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task ContinueRequest(HttpRequestData requestData)
        {
            var commandSettings = new ContinueRequestCommandSettings()
            {
                RequestId = requestData.RequestId,
                Method = requestData.Method,
                Url = requestData.Url,
            };

            if (requestData.Headers.Count > 0)
            {
                List<HeaderEntry> headers = new List<HeaderEntry>();
                foreach (KeyValuePair<string, string> headerPair in requestData.Headers)
                {
                    headers.Add(new HeaderEntry() { Name = headerPair.Key, Value = headerPair.Value });
                }

                commandSettings.Headers = headers.ToArray();
            }

            if (!string.IsNullOrEmpty(requestData.PostData))
            {
                commandSettings.PostData = requestData.PostData;
            }

            await fetch.ContinueRequest(commandSettings);
        }

        /// <summary>
        /// Asynchronously continues an intercepted network request.
        /// </summary>
        /// <param name="requestData">The <see cref="HttpRequestData"/> of the request.</param>
        /// <param name="responseData">The <see cref="HttpResponseData"/> with which to respond to the request</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task ContinueRequestWithResponse(HttpRequestData requestData, HttpResponseData responseData)
        {
            var commandSettings = new FulfillRequestCommandSettings()
            {
                RequestId = requestData.RequestId,
                ResponseCode = responseData.StatusCode,
            };

            if (responseData.Headers.Count > 0 || responseData.CookieHeaders.Count > 0)
            {
                List<HeaderEntry> headers = new List<HeaderEntry>();
                foreach (KeyValuePair<string, string> headerPair in responseData.Headers)
                {
                    headers.Add(new HeaderEntry() { Name = headerPair.Key, Value = headerPair.Value });
                }

                foreach (string cookieHeader in responseData.CookieHeaders)
                {
                    headers.Add(new HeaderEntry() { Name = "Set-Cookie", Value = cookieHeader });
                }

                commandSettings.ResponseHeaders = headers.ToArray();
            }

            if (!string.IsNullOrEmpty(responseData.Body))
            {
                commandSettings.Body = Convert.ToBase64String(Encoding.UTF8.GetBytes(responseData.Body));
            }

            await fetch.FulfillRequest(commandSettings);
        }

        /// <summary>
        /// Asynchronously contines an intercepted network call without modification.
        /// </summary>
        /// <param name="requestData">The <see cref="HttpRequestData"/> of the network call.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task ContinueRequestWithoutModification(HttpRequestData requestData)
        {
            await fetch.ContinueRequest(new ContinueRequestCommandSettings() { RequestId = requestData.RequestId });
        }

        /// <summary>
        /// Asynchronously continues an intercepted network call using authentication.
        /// </summary>
        /// <param name="requestId">The ID of the network request for which to continue with authentication.</param>
        /// <param name="userName">The user name with which to authenticate.</param>
        /// <param name="password">The password with which to authenticate.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task ContinueWithAuth(string requestId, string userName, string password)
        {
            await fetch.ContinueWithAuth(new ContinueWithAuthCommandSettings()
            {
                RequestId = requestId,
                AuthChallengeResponse = new V115.Fetch.AuthChallengeResponse()
                {
                    Response = V115.Fetch.AuthChallengeResponseResponseValues.ProvideCredentials,
                    Username = userName,
                    Password = password
                }
            });
        }

        /// <summary>
        /// Asynchronously cancels authorization of an intercepted network request.
        /// </summary>
        /// <param name="requestId">The ID of the network request for which to cancel authentication.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task CancelAuth(string requestId)
        {
            await fetch.ContinueWithAuth(new ContinueWithAuthCommandSettings()
            {
                RequestId = requestId,
                AuthChallengeResponse = new OpenQA.Selenium.DevTools.V115.Fetch.AuthChallengeResponse()
                {
                    Response = V115.Fetch.AuthChallengeResponseResponseValues.CancelAuth
                }
            });
        }

        /// <summary>
        /// Asynchronously adds the response body to the provided <see cref="HttpResponseData"/> object.
        /// </summary>
        /// <param name="responseData">The <see cref="HttpResponseData"/> object to which to add the response body.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task AddResponseBody(HttpResponseData responseData)
        {
            // If the response is a redirect, retrieving the body will throw an error in CDP.
            if (responseData.StatusCode < 300 || responseData.StatusCode > 399)
            {
                var bodyResponse = await fetch.GetResponseBody(new Fetch.GetResponseBodyCommandSettings() { RequestId = responseData.RequestId });
                if (bodyResponse.Base64Encoded)
                {
                    responseData.Body = Encoding.UTF8.GetString(Convert.FromBase64String(bodyResponse.Body));
                }
                else
                {
                    responseData.Body = bodyResponse.Body;
                }
            }
        }

        /// <summary>
        /// Asynchronously contines an intercepted network response without modification.
        /// </summary>
        /// <param name="responseData">The <see cref="HttpResponseData"/> of the network response.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task ContinueResponseWithoutModification(HttpResponseData responseData)
        {
            await fetch.ContinueRequest(new ContinueRequestCommandSettings() { RequestId = responseData.RequestId });
        }

        private void OnFetchAuthRequired(object sender, Fetch.AuthRequiredEventArgs e)
        {
            AuthRequiredEventArgs wrapped = new AuthRequiredEventArgs()
            {
                RequestId = e.RequestId,
                Uri = e.Request.Url
            };

            this.OnAuthRequired(wrapped);
        }

        private void OnFetchRequestPaused(object sender, Fetch.RequestPausedEventArgs e)
        {
            if (e.ResponseErrorReason == null && e.ResponseStatusCode == null)
            {
                RequestPausedEventArgs wrapped = new RequestPausedEventArgs();
                wrapped.RequestData = new HttpRequestData()
                {
                    RequestId = e.RequestId,
                    Method = e.Request.Method,
                    Url = e.Request.Url,
                    PostData = e.Request.PostData,
                    Headers = new Dictionary<string, string>(e.Request.Headers)
                };

                this.OnRequestPaused(wrapped);
            }
            else
            {
                ResponsePausedEventArgs wrappedResponse = new ResponsePausedEventArgs();
                wrappedResponse.ResponseData = new HttpResponseData()
                {
                    RequestId = e.RequestId,
                    Url = e.Request.Url,
                    ResourceType = e.ResourceType.ToString()
                };

                if (e.ResponseStatusCode.HasValue)
                {
                    wrappedResponse.ResponseData.StatusCode = e.ResponseStatusCode.Value;
                }

                if (e.ResponseHeaders != null)
                {
                    foreach (var header in e.ResponseHeaders)
                    {
                        if (header.Name.ToLowerInvariant() == "set-cookie")
                        {
                            wrappedResponse.ResponseData.CookieHeaders.Add(header.Value);
                        }
                        else
                        {
                            if (wrappedResponse.ResponseData.Headers.ContainsKey(header.Name))
                            {
                                string currentHeaderValue = wrappedResponse.ResponseData.Headers[header.Name];
                                wrappedResponse.ResponseData.Headers[header.Name] = currentHeaderValue + ", " + header.Value;
                            }
                            else
                            {
                                wrappedResponse.ResponseData.Headers.Add(header.Name, header.Value);
                            }
                        }
                    }
                }

                this.OnResponsePaused(wrappedResponse);
            }
        }
    }
}

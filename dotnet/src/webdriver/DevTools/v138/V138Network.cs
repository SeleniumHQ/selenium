// <copyright file="V138Network.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using OpenQA.Selenium.DevTools.V138.Fetch;
using OpenQA.Selenium.DevTools.V138.Network;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools.V138;

/// <summary>
/// Class providing functionality for manipulating network calls using version 138 of the DevTools Protocol
/// </summary>
public class V138Network : DevTools.Network
{
    private FetchAdapter fetch;
    private NetworkAdapter network;

    /// <summary>
    /// Initializes a new instance of the <see cref="V138Network"/> class.
    /// </summary>
    /// <param name="network">The adapter for the Network domain.</param>
    /// <param name="fetch">The adapter for the Fetch domain.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="network"/> or <paramref name="fetch"/> are <see langword="null"/>.</exception>
    public V138Network(NetworkAdapter network, FetchAdapter fetch)
    {
        this.network = network ?? throw new ArgumentNullException(nameof(network));
        this.fetch = fetch ?? throw new ArgumentNullException(nameof(fetch));
        fetch.AuthRequired += OnFetchAuthRequired;
        fetch.RequestPaused += OnFetchRequestPaused;
    }

    /// <summary>
    /// Asynchronously disables network caching.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public override async Task DisableNetworkCaching()
    {
        await network.SetCacheDisabled(new SetCacheDisabledCommandSettings() { CacheDisabled = true }).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously enables network caching.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public override async Task EnableNetworkCaching()
    {
        await network.SetCacheDisabled(new SetCacheDisabledCommandSettings() { CacheDisabled = false }).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously enables the Network domain..
    /// </summary>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public override async Task EnableNetwork()
    {
        await network.Enable(new Network.EnableCommandSettings()).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously disables the Network domain..
    /// </summary>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public override async Task DisableNetwork()
    {
        await network.Disable().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously enables the fetch domain for all URL patterns.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public override async Task EnableFetchForAllPatterns()
    {
        await fetch.Enable(new Fetch.EnableCommandSettings()
        {
            Patterns = new Fetch.RequestPattern[]
            {
                new Fetch.RequestPattern() { UrlPattern = "*", RequestStage = RequestStage.Request },
                new Fetch.RequestPattern() { UrlPattern = "*", RequestStage = RequestStage.Response }
            },
            HandleAuthRequests = true
        }).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously disables the fetch domain.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public override async Task DisableFetch()
    {
        await fetch.Disable().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously sets the override of the user agent settings.
    /// </summary>
    /// <param name="userAgent">A <see cref="UserAgent"/> object containing the user agent values to override.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="userAgent"/> is null.</exception>
    public override async Task SetUserAgentOverride(UserAgent userAgent)
    {
        if (userAgent is null)
        {
            throw new ArgumentNullException(nameof(userAgent));
        }

        await network.SetUserAgentOverride(new SetUserAgentOverrideCommandSettings()
        {
            UserAgent = userAgent.UserAgentString,
            AcceptLanguage = userAgent.AcceptLanguage,
            Platform = userAgent.Platform
        }).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously continues an intercepted network request.
    /// </summary>
    /// <param name="requestData">The <see cref="HttpRequestData"/> of the request.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="requestData"/> is <see langword="null"/>.</exception>
    public override async Task ContinueRequest(HttpRequestData requestData)
    {
        if (requestData is null)
        {
            throw new ArgumentNullException(nameof(requestData));
        }

        var commandSettings = new ContinueRequestCommandSettings()
        {
            RequestId = requestData.RequestId,
            Method = requestData.Method,
            Url = requestData.Url,
        };

        if (requestData.Headers?.Count > 0)
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
            commandSettings.PostData = Convert.ToBase64String(Encoding.UTF8.GetBytes(requestData.PostData));
        }

        await fetch.ContinueRequest(commandSettings).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously continues an intercepted network request.
    /// </summary>
    /// <param name="requestData">The <see cref="HttpRequestData"/> of the request.</param>
    /// <param name="responseData">The <see cref="HttpResponseData"/> with which to respond to the request</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="requestData"/> or <paramref name="responseData"/> are <see langword="null"/>.</exception>
    public override async Task ContinueRequestWithResponse(HttpRequestData requestData, HttpResponseData responseData)
    {
        if (requestData is null)
        {
            throw new ArgumentNullException(nameof(requestData));
        }

        if (responseData is null)
        {
            throw new ArgumentNullException(nameof(responseData));
        }

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

        await fetch.FulfillRequest(commandSettings).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously continues an intercepted network call without modification.
    /// </summary>
    /// <param name="requestData">The <see cref="HttpRequestData"/> of the network call.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="requestData"/> is <see langword="null"/>.</exception>
    public override async Task ContinueRequestWithoutModification(HttpRequestData requestData)
    {
        if (requestData is null)
        {
            throw new ArgumentNullException(nameof(requestData));
        }

        await fetch.ContinueRequest(new ContinueRequestCommandSettings() { RequestId = requestData.RequestId }).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously continues an intercepted network call using authentication.
    /// </summary>
    /// <param name="requestId">The ID of the network request for which to continue with authentication.</param>
    /// <param name="userName">The user name with which to authenticate.</param>
    /// <param name="password">The password with which to authenticate.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public override async Task ContinueWithAuth(string requestId, string? userName, string? password)
    {
        await fetch.ContinueWithAuth(new ContinueWithAuthCommandSettings()
        {
            RequestId = requestId,
            AuthChallengeResponse = new V138.Fetch.AuthChallengeResponse()
            {
                Response = V138.Fetch.AuthChallengeResponseResponseValues.ProvideCredentials,
                Username = userName,
                Password = password
            }
        }).ConfigureAwait(false);
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
            AuthChallengeResponse = new OpenQA.Selenium.DevTools.V138.Fetch.AuthChallengeResponse()
            {
                Response = V138.Fetch.AuthChallengeResponseResponseValues.CancelAuth
            }
        }).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously adds the response body to the provided <see cref="HttpResponseData"/> object.
    /// </summary>
    /// <param name="responseData">The <see cref="HttpResponseData"/> object to which to add the response body.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="responseData"/> is <see langword="null"/>.</exception>
    public override async Task AddResponseBody(HttpResponseData responseData)
    {
        if (responseData is null)
        {
            throw new ArgumentNullException(nameof(responseData));
        }

        // If the response is a redirect, retrieving the body will throw an error in CDP.
        if (responseData.StatusCode < 300 || responseData.StatusCode > 399)
        {
            var bodyResponse = await fetch.GetResponseBody(new Fetch.GetResponseBodyCommandSettings() { RequestId = responseData.RequestId }).ConfigureAwait(false);
            if (bodyResponse != null)
            {
                if (bodyResponse.Base64Encoded)
                {
                    responseData.Content = new HttpResponseContent(Convert.FromBase64String(bodyResponse.Body));
                }
                else
                {
                    responseData.Content = new HttpResponseContent(bodyResponse.Body);
                }
            }
        }
    }

    /// <summary>
    /// Asynchronously continues an intercepted network response without modification.
    /// </summary>
    /// <param name="responseData">The <see cref="HttpResponseData"/> of the network response.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="responseData"/> is <see langword="null"/>.</exception>
    public override async Task ContinueResponseWithoutModification(HttpResponseData responseData)
    {
        if (responseData is null)
        {
            throw new ArgumentNullException(nameof(responseData));
        }

        await fetch.ContinueResponse(new ContinueResponseCommandSettings() { RequestId = responseData.RequestId }).ConfigureAwait(false);
    }

    private void OnFetchAuthRequired(object? sender, Fetch.AuthRequiredEventArgs e)
    {
        AuthRequiredEventArgs wrapped = new AuthRequiredEventArgs
        (
            requestId: e.RequestId,
            uri: e.Request.Url
        );

        this.OnAuthRequired(wrapped);
    }

    private void OnFetchRequestPaused(object? sender, Fetch.RequestPausedEventArgs e)
    {
        if (e.ResponseErrorReason == null && e.ResponseStatusCode == null)
        {
            var requestData = new HttpRequestData
            {
                RequestId = e.RequestId,
                Method = e.Request.Method,
                Url = e.Request.Url,
                PostData = e.Request.PostData,
                Headers = new Dictionary<string, string>(e.Request.Headers)
            };

            RequestPausedEventArgs wrapped = new RequestPausedEventArgs(null, requestData);
            this.OnRequestPaused(wrapped);
        }
        else
        {
            var responseData = new HttpResponseData()
            {
                RequestId = e.RequestId,
                Url = e.Request.Url,
                ResourceType = e.ResourceType.ToString(),
                StatusCode = e.ResponseStatusCode.GetValueOrDefault(),
                ErrorReason = e.ResponseErrorReason?.ToString()
            };

            if (e.ResponseHeaders != null)
            {
                foreach (var header in e.ResponseHeaders)
                {
                    if (header.Name.Equals("set-cookie", StringComparison.InvariantCultureIgnoreCase))
                    {
                        responseData.CookieHeaders.Add(header.Value);
                    }
                    else
                    {
                        if (responseData.Headers.TryGetValue(header.Name, out string? currentHeaderValue))
                        {
                            responseData.Headers[header.Name] = currentHeaderValue + ", " + header.Value;
                        }
                        else
                        {
                            responseData.Headers.Add(header.Name, header.Value);
                        }
                    }
                }
            }

            this.OnResponsePaused(new ResponsePausedEventArgs(responseData));
        }
    }
}

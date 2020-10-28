using OpenQA.Selenium.DevTools.V84.Fetch;
using OpenQA.Selenium.DevTools.V84.Network;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools.V84
{
    public class V84Network : INetwork
    {
        private FetchAdapter fetch;
        private NetworkAdapter network;

        public V84Network(NetworkAdapter network, FetchAdapter fetch)
        {
            this.network = network;
            this.fetch = fetch;
            fetch.AuthRequired += OnFetchAuthRequired;
            fetch.RequestPaused += OnFetchRequestPaused;
        }

        public event EventHandler<AuthRequiredEventArgs> AuthRequired;
        public event EventHandler<RequestPausedEventArgs> RequestPaused;

        public async Task DisableNetworkCaching()
        {
            await network.SetCacheDisabled(new SetCacheDisabledCommandSettings() { CacheDisabled = true });
        }

        public async Task EnableNetworkCaching()
        {
            await network.SetCacheDisabled(new SetCacheDisabledCommandSettings() { CacheDisabled = false });
        }

        public async Task EnableFetchForAllPatterns()
        {
            await fetch.Enable(new OpenQA.Selenium.DevTools.V84.Fetch.EnableCommandSettings()
            {
                Patterns = new OpenQA.Selenium.DevTools.V84.Fetch.RequestPattern[]
                {
                    new OpenQA.Selenium.DevTools.V84.Fetch.RequestPattern() { UrlPattern = "*" }
                },
                HandleAuthRequests = true
            });
        }

        public async Task DisableFetch()
        {
            await fetch.Disable();
        }

        public async Task ContinueRequest(HttpRequestData requestData, HttpResponseData responseData)
        {
            var commandSettings = new FulfillRequestCommandSettings()
            {
                RequestId = requestData.RequestId,
                ResponseCode = responseData.StatusCode,
            };

            if (responseData.Headers.Count > 0)
            {
                List<HeaderEntry> headers = new List<HeaderEntry>();
                foreach(KeyValuePair<string, string> headerPair in responseData.Headers)
                {
                    headers.Add(new HeaderEntry() { Name = headerPair.Key, Value = headerPair.Value });
                }

                commandSettings.ResponseHeaders = headers.ToArray();
            }

            if (!string.IsNullOrEmpty(responseData.Body))
            {
                // TODO: base64 encode?
                commandSettings.Body = responseData.Body;
            }

            await fetch.FulfillRequest(commandSettings);
        }

        public async Task ContinueWithoutModification(HttpRequestData requestData)
        {
            await fetch.ContinueRequest(new ContinueRequestCommandSettings() { RequestId = requestData.RequestId });
        }

        public async Task ContinueWithAuth(HttpRequestData requestData, string userName, string password)
        {
            await fetch.ContinueWithAuth(new ContinueWithAuthCommandSettings()
            {
                AuthChallengeResponse = new OpenQA.Selenium.DevTools.V84.Fetch.AuthChallengeResponse()
                {
                    Response = OpenQA.Selenium.DevTools.V84.Fetch.AuthChallengeResponseResponseValues.ProvideCredentials,
                    Username = userName,
                    Password = password
                }
            });
        }

        public async Task CancelAuth(HttpRequestData requestData)
        {
            await fetch.ContinueWithAuth(new ContinueWithAuthCommandSettings()
            {
                AuthChallengeResponse = new OpenQA.Selenium.DevTools.V84.Fetch.AuthChallengeResponse()
                {
                    Response = OpenQA.Selenium.DevTools.V84.Fetch.AuthChallengeResponseResponseValues.CancelAuth
                }
            });
        }

        private void OnFetchAuthRequired(object sender, Fetch.AuthRequiredEventArgs e)
        {
            if (this.AuthRequired != null)
            {
                AuthRequiredEventArgs wrapped = new AuthRequiredEventArgs()
                {
                    RequestId = e.RequestId,
                    Uri = e.AuthChallenge.Origin
                };
                this.AuthRequired(this, wrapped);
            }
        }

        private void OnFetchRequestPaused(object sender, Fetch.RequestPausedEventArgs e)
        {
            if (this.RequestPaused != null)
            {
                RequestPausedEventArgs wrapped = new RequestPausedEventArgs();
                if (e.ResponseErrorReason == null && e.ResponseStatusCode == null)
                {
                    wrapped.RequestData = new HttpRequestData()
                    {
                        RequestId = e.RequestId,
                        Method = e.Request.Method,
                        Url = e.Request.Url,
                        PostData = e.Request.PostData,
                        Headers = new Dictionary<string, string>(e.Request.Headers)
                    };
                }
                this.RequestPaused(this, wrapped);
            }
        }
    }
}
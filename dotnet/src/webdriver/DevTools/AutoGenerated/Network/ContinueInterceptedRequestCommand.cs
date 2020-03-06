namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Response to Network.requestIntercepted which either modifies the request to continue with any
    /// modifications, or blocks it, or completes it with the provided response bytes. If a network
    /// fetch occurs as a result which encounters a redirect an additional Network.requestIntercepted
    /// event will be sent with the same InterceptionId.
    /// </summary>
    public sealed class ContinueInterceptedRequestCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.continueInterceptedRequest";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the interceptionId
        /// </summary>
        [JsonProperty("interceptionId")]
        public string InterceptionId
        {
            get;
            set;
        }
        /// <summary>
        /// If set this causes the request to fail with the given reason. Passing `Aborted` for requests
        /// marked with `isNavigationRequest` also cancels the navigation. Must not be set in response
        /// to an authChallenge.
        /// </summary>
        [JsonProperty("errorReason", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ErrorReason? ErrorReason
        {
            get;
            set;
        }
        /// <summary>
        /// If set the requests completes using with the provided base64 encoded raw response, including
        /// HTTP status line and headers etc... Must not be set in response to an authChallenge.
        /// </summary>
        [JsonProperty("rawResponse", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public byte[] RawResponse
        {
            get;
            set;
        }
        /// <summary>
        /// If set the request url will be modified in a way that's not observable by page. Must not be
        /// set in response to an authChallenge.
        /// </summary>
        [JsonProperty("url", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// If set this allows the request method to be overridden. Must not be set in response to an
        /// authChallenge.
        /// </summary>
        [JsonProperty("method", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Method
        {
            get;
            set;
        }
        /// <summary>
        /// If set this allows postData to be set. Must not be set in response to an authChallenge.
        /// </summary>
        [JsonProperty("postData", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string PostData
        {
            get;
            set;
        }
        /// <summary>
        /// If set this allows the request headers to be changed. Must not be set in response to an
        /// authChallenge.
        /// </summary>
        [JsonProperty("headers", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Headers Headers
        {
            get;
            set;
        }
        /// <summary>
        /// Response to a requestIntercepted with an authChallenge. Must not be set otherwise.
        /// </summary>
        [JsonProperty("authChallengeResponse", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public AuthChallengeResponse AuthChallengeResponse
        {
            get;
            set;
        }
    }

    public sealed class ContinueInterceptedRequestCommandResponse : ICommandResponse<ContinueInterceptedRequestCommandSettings>
    {
    }
}
namespace OpenQA.Selenium.DevTools.Network
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Details of an intercepted HTTP request, which must be either allowed, blocked, modified or
    /// mocked.
    /// </summary>
    public sealed class RequestInterceptedEventArgs : EventArgs
    {
        /// <summary>
        /// Each request the page makes will have a unique id, however if any redirects are encountered
        /// while processing that fetch, they will be reported with the same id as the original fetch.
        /// Likewise if HTTP authentication is needed then the same fetch id will be used.
        /// </summary>
        [JsonProperty("interceptionId")]
        public string InterceptionId
        {
            get;
            set;
        }
        /// <summary>
        /// Gets or sets the request
        /// </summary>
        [JsonProperty("request")]
        public Request Request
        {
            get;
            set;
        }
        /// <summary>
        /// The id of the frame that initiated the request.
        /// </summary>
        [JsonProperty("frameId")]
        public string FrameId
        {
            get;
            set;
        }
        /// <summary>
        /// How the requested resource will be used.
        /// </summary>
        [JsonProperty("resourceType")]
        public ResourceType ResourceType
        {
            get;
            set;
        }
        /// <summary>
        /// Whether this is a navigation request, which can abort the navigation completely.
        /// </summary>
        [JsonProperty("isNavigationRequest")]
        public bool IsNavigationRequest
        {
            get;
            set;
        }
        /// <summary>
        /// Set if the request is a navigation that will result in a download.
        /// Only present after response is received from the server (i.e. HeadersReceived stage).
        /// </summary>
        [JsonProperty("isDownload", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsDownload
        {
            get;
            set;
        }
        /// <summary>
        /// Redirect location, only sent if a redirect was intercepted.
        /// </summary>
        [JsonProperty("redirectUrl", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string RedirectUrl
        {
            get;
            set;
        }
        /// <summary>
        /// Details of the Authorization Challenge encountered. If this is set then
        /// continueInterceptedRequest must contain an authChallengeResponse.
        /// </summary>
        [JsonProperty("authChallenge", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public AuthChallenge AuthChallenge
        {
            get;
            set;
        }
        /// <summary>
        /// Response error if intercepted at response stage or if redirect occurred while intercepting
        /// request.
        /// </summary>
        [JsonProperty("responseErrorReason", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ErrorReason? ResponseErrorReason
        {
            get;
            set;
        }
        /// <summary>
        /// Response code if intercepted at response stage or if redirect occurred while intercepting
        /// request or auth retry occurred.
        /// </summary>
        [JsonProperty("responseStatusCode", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? ResponseStatusCode
        {
            get;
            set;
        }
        /// <summary>
        /// Response headers if intercepted at the response stage or if redirect occurred while
        /// intercepting request or auth retry occurred.
        /// </summary>
        [JsonProperty("responseHeaders", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Headers ResponseHeaders
        {
            get;
            set;
        }
        /// <summary>
        /// If the intercepted request had a corresponding requestWillBeSent event fired for it, then
        /// this requestId will be the same as the requestId present in the requestWillBeSent event.
        /// </summary>
        [JsonProperty("requestId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string RequestId
        {
            get;
            set;
        }
    }
}
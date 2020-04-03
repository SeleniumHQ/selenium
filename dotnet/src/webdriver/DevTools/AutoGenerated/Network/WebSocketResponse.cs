namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// WebSocket response data.
    /// </summary>
    public sealed class WebSocketResponse
    {
        /// <summary>
        /// HTTP response status code.
        ///</summary>
        [JsonProperty("status")]
        public long Status
        {
            get;
            set;
        }
        /// <summary>
        /// HTTP response status text.
        ///</summary>
        [JsonProperty("statusText")]
        public string StatusText
        {
            get;
            set;
        }
        /// <summary>
        /// HTTP response headers.
        ///</summary>
        [JsonProperty("headers")]
        public Headers Headers
        {
            get;
            set;
        }
        /// <summary>
        /// HTTP response headers text.
        ///</summary>
        [JsonProperty("headersText", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string HeadersText
        {
            get;
            set;
        }
        /// <summary>
        /// HTTP request headers.
        ///</summary>
        [JsonProperty("requestHeaders", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Headers RequestHeaders
        {
            get;
            set;
        }
        /// <summary>
        /// HTTP request headers text.
        ///</summary>
        [JsonProperty("requestHeadersText", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string RequestHeadersText
        {
            get;
            set;
        }
    }
}